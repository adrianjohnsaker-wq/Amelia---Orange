"""Matched tests of target-specific attractors and heat-feedback dose."""
import argparse
import copy
import json
import statistics
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path
from legacy_engine import Config, Entropy
from reactor import Reactor, digest
from study import metrics

ARMS = {"sham": ("sham",1.35), "target": ("target",1.35),
        "wrong_target": ("wrong_target",1.35), "weak_feedback": ("sham",.8),
        "strong_feedback": ("sham",1.8)}


def run_seed(seed, warmup=15., horizon=120.):
    root=Reactor(Config(seed=seed, initial_agents=36,max_agents=180,max_genome=1000000),Entropy("seeded",seed))
    root.advance(until_time=warmup)
    lengths=([len(a.genome) for a in root.agents.values()] +
             [len(g) for a in root.agents.values() for g,_ in a.history] +
             [len(c["genome"]) for c in root.archive.values()] + [0])
    if not root.agents or max(lengths)>512: raise RuntimeError("invalid common root")
    root_hash=digest(root.snapshot()); outcomes={}
    for name,(steering,gain) in ARMS.items():
        w=copy.deepcopy(root);w.cfg.max_genome=512;w.steering_mode=steering;w.feedback_gain=gain
        i=len(w.log);n=len(w.agents);spent=w.reactor_spent
        w.advance(until_time=warmup+horizon)
        m=metrics(w,i,warmup,warmup+horizon,n,spent)
        hits=m["bet_actual"];shadow=m["bet_shadow_expected"]; windows=m["completed_bet_windows"]
        engagements=[e for e in w.log[i:] if e["event"]=="attractor_engage"]
        heat=[e["heat"] for e in w.log[i:] if e["event"]=="execute"]
        m["bet_target_advantage"]=(hits-shadow)/windows if windows else None
        m["bet_hit_fraction"]=hits/windows if windows else None
        m["attractor_attempts"]=len(engagements)
        m["attractor_changed_candidate"]=sum(e["candidate"]!=e["selected"] for e in engagements)
        m["attractor_target_after"]=sum(e["collective_after"]==e["target"] for e in engagements)
        m["attractor_aimed_after"]=sum(e["collective_after"]==e["aimed"] for e in engagements)
        m["attractor_cost"]=sum(e["cost"] for e in engagements)
        m["mean_action_heat"]=statistics.mean(heat) if heat else 0
        m["meltdown_per_1000_actions"]=1000*m["counts"].get("meltdown",0)/m["actions"] if m["actions"] else 0
        outcomes[name]=m
    return {"seed":seed,"fork_hash":root_hash,"fork_max_genome":max(lengths),"arms":outcomes}


def main():
    p=argparse.ArgumentParser();p.add_argument("--seeds",type=int,default=30);p.add_argument("--start",type=int,default=21001)
    p.add_argument("--workers",type=int,default=6);p.add_argument("--output",type=Path,required=True)
    a=p.parse_args();a.output.mkdir(exist_ok=False,parents=True)
    with ProcessPoolExecutor(max_workers=a.workers) as pool:
        jobs=[pool.submit(run_seed,s) for s in range(a.start,a.start+a.seeds)]
        for index,f in enumerate(as_completed(jobs),1):
            row=f.result();(a.output/f"seed_{row['seed']}.json").write_text(json.dumps(row,sort_keys=True,indent=2)+"\n")
            print(f"completed seed {row['seed']} ({index}/{a.seeds})",flush=True)


if __name__=="__main__":main()
