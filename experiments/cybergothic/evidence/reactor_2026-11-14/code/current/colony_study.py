"""Energy-accounted, matched recolonization after a complete die-off."""
import argparse
import copy
import json
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path
from legacy_engine import Config,Entropy
from reactor import Reactor,digest
from study import metrics

ARMS=("one_host","four_hosts","empty_archive")

def run_seed(seed):
    root=Reactor(Config(seed=seed,initial_agents=36,max_agents=180,max_genome=1000000),Entropy("seeded",seed))
    root.advance(until_time=15.0)
    lengths=([len(a.genome) for a in root.agents.values()]+[len(g) for a in root.agents.values() for g,_ in a.history]+
             [len(c["genome"]) for c in root.archive.values()]+[0])
    if not root.agents or max(lengths)>512:raise RuntimeError("invalid root or genome cap")
    fork=digest(root.snapshot());arms={}
    for name in ARMS:
        w=copy.deepcopy(root);w.cfg.max_genome=512;w.pulse_renewal=.6
        w.recovery_floor=1 if name=="one_host" else 4;w.steering_mode="target"
        i=len(w.log);n=len(w.agents);spent=w.reactor_spent;energy_in=w.reactor_input
        for a in list(w.agents.values()):w.kill(a,"controlled_extinction")
        if name=="empty_archive":
            w.archive.clear();w.corpses.clear();w.waiting_corpses.clear();w.emit("experimental_clear_necrotic_bank")
        w.advance(until_time=255.0)
        m=metrics(w,i,15.0,255.0,n,spent)
        m["external_reactor_energy"]=w.reactor_input-energy_in
        m["source_corpses"]=len({e["source_corpse"] for e in w.log[i:] if e["event"]=="reconstitute"})
        m["recovery_births"]=m["counts"].get("reconstitute",0)
        m["fission_births"]=m["counts"].get("fission",0)
        arms[name]=m
    return {"seed":seed,"fork_hash":fork,"fork_max_genome":max(lengths),"arms":arms}

def main():
    p=argparse.ArgumentParser();p.add_argument("--seeds",type=int,default=30);p.add_argument("--start",type=int,default=23001)
    p.add_argument("--workers",type=int,default=6);p.add_argument("--output",type=Path,required=True);a=p.parse_args()
    a.output.mkdir(parents=True,exist_ok=False)
    with ProcessPoolExecutor(max_workers=a.workers) as pool:
        for i,f in enumerate(as_completed([pool.submit(run_seed,s) for s in range(a.start,a.start+a.seeds)]),1):
            row=f.result();(a.output/f"seed_{row['seed']}.json").write_text(json.dumps(row,sort_keys=True,indent=2)+"\n")
            print(f"completed seed {row['seed']} ({i}/{a.seeds})",flush=True)

if __name__=="__main__":main()
