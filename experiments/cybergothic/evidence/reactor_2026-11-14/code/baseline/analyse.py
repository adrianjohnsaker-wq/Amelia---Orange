"""Paired, seed-level analysis for the locally fixed pilot protocol."""
import json
import math
import random
import statistics
from pathlib import Path

from study import ARMS


def interval(values, confidence=.95, n_boot=10000):
    rng = random.Random(20261114)
    n = len(values)
    boot = sorted(sum(values[rng.randrange(n)] for _ in range(n))/n for _ in range(n_boot))
    alpha = (1-confidence)/2
    def q(p):
        x = p*(n_boot-1); i = int(x); f = x-i
        return boot[i]*(1-f)+boot[min(i+1,n_boot-1)]*f
    return [q(alpha), q(1-alpha)]


def mean(values): return statistics.mean(values) if values else None
def paired(rows, group, arm, baseline, key, confidence=.95):
    values = [r[group][arm][key]-r[group][baseline][key] for r in rows]
    return {"mean_difference": mean(values), "interval": interval(values, confidence),
            "positive": sum(v>0 for v in values), "negative": sum(v<0 for v in values),
            "ties": sum(v==0 for v in values)}


def total_counts(rows, group, arm):
    out = {}
    for row in rows:
        for k,v in row[group][arm]["counts"].items(): out[k] = out.get(k, 0)+v
    return out


def run(directory):
    rows = [json.loads(p.read_text()) for p in sorted(directory.glob("seed_*.json"))]
    if len(rows) != 30: raise ValueError("expected exactly 30 planned seeds")
    if [r["seed"] for r in rows] != list(range(20001,20031)): raise ValueError("unexpected seeds")
    full = [r["arms"]["full"] for r in rows]
    outcomes = {}
    for arm in ARMS:
        v = [r["arms"][arm] for r in rows]
        outcomes[arm] = {
            "agent_time": mean([x["agent_time"] for x in v]),
            "agent_time_vs_full": None if arm == "full" else paired(rows,"arms",arm,"full","agent_time",.99375),
            "actions": mean([x["actions"] for x in v]),
            "occupied_fraction": mean([x["occupied_fraction"] for x in v]),
            "final_living": mean([x["final_living"] for x in v]),
            "final_extinct": sum(x["final_extinct"] for x in v),
            "any_extinction": sum(x["extinction_episodes"]>0 for x in v),
            "extinction_episodes": sum(x["extinction_episodes"] for x in v),
            "reconstitutions": sum(x["counts"].get("reconstitute",0) for x in v),
            "final_diversity": mean([x["diversity"] for x in v]),
            "mean_ancestry": mean([x["mean_ancestry"] for x in v]),
            "chimera_fraction": mean([x["chimera_fraction"] for x in v]),
            "mean_length": mean([x["mean_genome_length"] for x in v]),
            "cap_actions": sum(x["genome_cap_action_fraction"]*x["actions"] for x in v)/sum(x["actions"] for x in v),
            "events": total_counts(rows,"arms",arm)}
    shocks = {}
    for arm in ("archive","disabled","empty_bank"):
        v = [r["shock"][arm] for r in rows]
        shocks[arm] = {"agent_time": mean([x["agent_time"] for x in v]),
                       "occupied_fraction": mean([x["occupied_fraction"] for x in v]),
                       "final_living": mean([x["final_living"] for x in v]),
                       "final_extinct": sum(x["final_extinct"] for x in v),
                       "restarted": sum(x["counts"].get("reconstitute",0)>0 for x in v),
                       "reconstitutions": sum(x["counts"].get("reconstitute",0) for x in v),
                       "reactor_energy_spent": sum(x["reactor_energy_spent"] for x in v),
                       "archived_sources_used": sum(x["archived_sources_used"] for x in v),
                       "actions": sum(x["actions"] for x in v)}
    timing_rows = [r["telemetry"] for r in rows]
    timing_diff = [x["live"]["agent_time"]-x["matched"]["agent_time"] for x in timing_rows]
    tv = []
    for x in timing_rows:
        a,b=x["live_histogram"],x["matched_histogram"]
        if sum(a) and sum(b): tv.append(sum(abs(i/sum(a)-j/sum(b)) for i,j in zip(a,b))/2)
    telemetry = {"live_agent_time": mean([x["live"]["agent_time"] for x in timing_rows]),
                 "matched_agent_time": mean([x["matched"]["agent_time"] for x in timing_rows]),
                 "difference": mean(timing_diff), "interval95": interval(timing_diff),
                 "all_exact_replays": all(x["replay_exact"] for x in timing_rows),
                 "mean_empirical_tv": mean(tv),
                 "live_samples": sum(x["live_sample_count"] for x in timing_rows)}
    bet_n = sum(x["completed_bet_windows"] for x in full)
    target = sum(x["bet_actual"] for x in full)
    shadow = sum(x["bet_shadow_expected"] for x in full)
    bet_diffs = [(x["bet_actual"]-x["bet_shadow_expected"])/x["completed_bet_windows"]
                 for x in full if x["completed_bet_windows"]]
    bets = {"windows": bet_n, "actual_hits": target, "shadow_expected_hits": shadow,
            "target_hit_fraction": target/bet_n if bet_n else None,
            "shadow_hit_fraction": shadow/bet_n if bet_n else None,
            "mean_seed_difference": mean(bet_diffs),
            "interval95": interval(bet_diffs) if bet_diffs else None,
            "observations": sum(x["bet_observations"] for x in full)}
    result = {"seeds": len(rows), "max_fork_genome": max(r["root"]["max_length"] for r in rows),
              "arms": outcomes, "shock": shocks, "telemetry": telemetry, "bets": bets,
              "full_metrics": {"total_actions":sum(x["actions"] for x in full),
                 "infection_hosts":sum(x["infection_hosts"] for x in full),
                 "infection_energy":sum(x["infection_energy"] for x in full),
                 "next_host_executions":sum(x["next_host_executions"] for x in full),
                 "next_payload_matches":sum(x["next_payload_matches"] for x in full),
                 "mean_executed_cells":mean([x["executed_cells"] for x in full]),
                 "mean_mutated_cells":mean([x["mutated_cells"] for x in full]),
                 "executed_family_totals":{f:sum(x["executed_families"][f] for x in full) for f in ("chrono","zino","ampy")}}}
    (directory / "analysis.json").write_text(json.dumps(result, indent=2,sort_keys=True)+"\n")
    print(json.dumps(result,indent=2,sort_keys=True))


if __name__ == "__main__": run(Path("results_30"))
