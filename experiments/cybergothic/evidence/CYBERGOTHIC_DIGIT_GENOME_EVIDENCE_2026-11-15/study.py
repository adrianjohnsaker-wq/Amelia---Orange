"""Matched-fork ecological, catastrophic-recovery and telemetry trials."""
import argparse
import copy
import gzip
import json
import math
import random
import statistics
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

from legacy_engine import Config, Entropy
from reactor import FAMILY, Reactor, canonical, digest

ARMS = ("full", "no_infection", "no_splice", "no_recycling", "no_meltdown",
        "no_bets", "no_opcode_mutation", "uniform_clock", "no_reconstitution")


def configure(w, arm):
    w.cfg.max_genome = 512
    if arm == "no_infection": w.cfg.infection = False
    elif arm == "no_splice": w.cfg.timesplice = False
    elif arm == "no_recycling": w.cfg.recycling = False
    elif arm == "no_meltdown": w.cfg.meltdown = False
    elif arm == "no_bets": w.cfg.prophecy = False
    elif arm == "no_opcode_mutation": w.cfg.opcode_mutation_probability = 0.
    elif arm == "uniform_clock": w.cfg.local_clocks = False
    elif arm == "no_reconstitution": w.reconstitution = False
    elif arm != "full": raise ValueError(arm)


def effective_diversity(genomes):
    from collections import Counter
    if not genomes: return 0.
    c = Counter(genomes); n = len(genomes)
    return math.exp(-sum((v/n)*math.log(v/n) for v in c.values()))


def metrics(w, start_index, start_time, end_time, initial_agents, initial_reactor_spent):
    events = w.log[start_index:]
    counts = {}
    for e in events: counts[e["event"]] = counts.get(e["event"], 0) + 1
    executed = [e for e in events if e["event"] == "execute"]
    pop = initial_agents; area = occupied = 0.; last = start_time; extinctions = 0
    for e in events:
        time = min(end_time, max(start_time, e["time"]))
        dt = max(0., time - last); area += dt * pop; occupied += dt * (pop > 0); last = time
        if e["event"] == "birth": pop += 1
        elif e["event"] == "death":
            pop -= 1
            if pop == 0: extinctions += 1
        if pop < 0: raise AssertionError("impossible population reconstruction")
    area += max(0., end_time-last)*pop; occupied += max(0., end_time-last)*(pop > 0)
    if pop != len(w.agents): raise AssertionError("population ledger mismatch")
    transmissions, executed_payloads, pending = 0, 0, {}
    for e in events:
        if e["event"] == "infection":
            pending[e["target"]] = e["payload"][0]
        elif e["event"] == "death":
            pending.pop(e["agent"], None)
        elif e["event"] == "execute" and e["agent"] in pending:
            transmissions += 1
            executed_payloads += int(str(e["operand"]) == pending.pop(e["agent"] ))
    agents = list(w.agents.values())
    traces = [e for e in events if e["event"] == "bet_audit"]
    actual = sum(int(e["seen"][e["target"]]) for e in traces)
    null_expected = sum((sum(e["seen"]) - int(e["seen"][e["target"]]))/8 for e in traces)
    return {"actions": len(executed), "agent_time": area,
            "occupied_fraction": occupied / (end_time-start_time),
            "extinction_episodes": extinctions, "final_living": len(agents),
            "final_extinct": not agents, "archive_count": len(w.archive),
            "reactor_energy_spent": w.reactor_spent-initial_reactor_spent,
            "diversity": effective_diversity([a.genome for a in agents]),
            "mean_genome_length": statistics.mean(len(a.genome) for a in agents) if agents else 0.,
            "genome_cap_action_fraction": sum(len(e["genome"]) >= 512 for e in executed)/len(executed) if executed else 0.,
            "furnace_fraction": sum(e["zone"] in (7,8,9) for e in executed)/len(executed) if executed else 0.,
            "counts": counts, "infection_hosts": len({e["target"] for e in events if e["event"] == "infection"}),
            "infection_energy": sum(e["energy_transferred"] for e in events if e["event"] == "infection"),
            "next_host_executions": transmissions, "next_payload_matches": executed_payloads,
            "executed_cells": len({e["address"] for e in executed}),
            "mutated_cells": len({e["address"] for e in events if e["event"] == "opcode_mutation"}),
            "executed_families": {family: sum(FAMILY[e["opcode"]] == family for e in executed)
                                  for family in ("chrono", "zino", "ampy")},
            "completed_bet_windows": len(traces), "bet_actual": actual,
            "bet_shadow_expected": null_expected,
            "bet_observations": sum(e["opportunities"] for e in traces),
            "log_sha256": digest(w.log), "state_sha256": digest(w.snapshot())}


def branch(root, arm, end_time):
    w = copy.deepcopy(root); configure(w, arm)
    start = len(w.log); t0 = w.now; n0 = len(w.agents); spent = w.reactor_spent
    w.advance(until_time=end_time)
    return w, metrics(w, start, t0, end_time, n0, spent)


def recovery(root, variant, end_time):
    w = copy.deepcopy(root); configure(w, "full")
    start = len(w.log); t0 = w.now; n0 = len(w.agents); spent = w.reactor_spent
    for a in list(w.agents.values()): w.kill(a, "controlled_extinction")
    if variant == "empty_bank":
        w.archive.clear(); w.corpses.clear(); w.waiting_corpses.clear()
        w.emit("experimental_clear_necrotic_bank")
    elif variant == "disabled": w.reconstitution = False
    elif variant != "archive": raise ValueError(variant)
    w.advance(until_time=end_time)
    m = metrics(w, start, t0, end_time, n0, spent)
    m["archived_sources_used"] = len({e["source_corpse"] for e in w.log[start:] if e["event"] == "reconstitute"})
    return w, m


def telemetry(root, end_time, seed):
    offset = len(root.entropy.used)
    live = copy.deepcopy(root); configure(live, "full"); live.entropy.mode = "live"
    t0, i0, n0, spent = live.now, len(live.log), len(live.agents), live.reactor_spent
    live.advance(until_time=end_time)
    trace = list(live.entropy.used)
    observed = [x % 14 for x in trace[offset:]]
    if not observed: raise RuntimeError("no timing samples")
    replay = copy.deepcopy(root); configure(replay, "full"); replay.entropy.mode = "replay"
    replay.entropy.input = trace; replay.advance(until_time=end_time)
    if replay.log != live.log: raise AssertionError("live entropy did not replay exactly")
    matched = copy.deepcopy(root); configure(matched, "full"); matched.entropy.mode = "replay"
    sampler = random.Random(seed ^ 0x661122)
    matched.entropy.input = list(root.entropy.used) + [sampler.choice(observed) for _ in range(10000)]
    matched.advance(until_time=end_time)
    return {"live": metrics(live, i0, t0, end_time, n0, spent),
            "matched": metrics(matched, i0, t0, end_time, n0, spent),
            "live_sample_count": len(observed),
            "live_histogram": [observed.count(k) for k in range(14)],
            "matched_histogram": [sum(x % 14 == k for x in matched.entropy.used[offset:]) for k in range(14)],
            "replay_exact": True, "recorded_live_samples": trace[offset:]}


def run_seed(args):
    seed, warmup, horizon, do_entropy = args
    root = Reactor(Config(seed=seed, initial_agents=36, max_agents=180, max_genome=1000000),
                   Entropy("seeded", seed))
    root.advance(until_time=warmup)
    if not root.agents: raise RuntimeError(f"root {seed} extinct at fork")
    root_hash = digest(root.snapshot())
    initial = {"agents": len(root.agents), "archive": len(root.archive),
               "max_length": max([len(a.genome) for a in root.agents.values()] +
                                 [len(g) for a in root.agents.values() for g, _ in a.history] +
                                 [len(c.genome) for c in root.corpses.values()] +
                                 [len(c["genome"]) for c in root.archive.values()] + [0]),
               "hash": root_hash}
    if initial["max_length"] > 512:
        raise RuntimeError(f"seed {seed}: forked material exceeds the post-fork cap")
    outcomes = {}; hashes = {}
    for arm in ARMS:
        w, m = branch(root, arm, warmup + horizon)
        outcomes[arm] = m
        hashes[arm] = m["log_sha256"]
    crash = {}
    for arm in ("archive", "disabled", "empty_bank"):
        _, m = recovery(root, arm, warmup + horizon)
        crash[arm] = m
    timing = telemetry(root, warmup + horizon, seed) if do_entropy else None
    return {"seed": seed, "root": initial, "arms": outcomes, "shock": crash, "telemetry": timing}


def main():
    p = argparse.ArgumentParser(); p.add_argument("--seeds", type=int, default=30)
    p.add_argument("--start", type=int, default=20001); p.add_argument("--warmup", type=float, default=15)
    p.add_argument("--horizon", type=float, default=120); p.add_argument("--workers", type=int, default=4)
    p.add_argument("--no-entropy", action="store_true"); p.add_argument("--output", type=Path, required=True)
    args = p.parse_args(); args.output.mkdir(parents=True, exist_ok=False)
    jobs = [(s, args.warmup, args.horizon, not args.no_entropy) for s in range(args.start,args.start+args.seeds)]
    rows = []
    with ProcessPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(run_seed, job): job[0] for job in jobs}
        for f in as_completed(futures):
            row = f.result(); rows.append(row)
            print(f"completed seed {row['seed']} ({len(rows)}/{args.seeds})", flush=True)
            (args.output / f"seed_{row['seed']}.json").write_text(json.dumps(row, sort_keys=True, indent=2)+"\n")
    rows.sort(key=lambda r:r["seed"])
    with gzip.open(args.output / "trials.json.gz", "wt", encoding="utf-8") as handle:
        json.dump(rows, handle, sort_keys=True, separators=(",", ":"))
    (args.output / "parameters.json").write_text(json.dumps(vars(args), default=str, indent=2, sort_keys=True)+"\n")


if __name__ == "__main__": main()
