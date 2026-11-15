"""Compare experienced vectors, anticipatory orientation and archival portfolios."""
import argparse
import copy
import json
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path
from reactor import digest
from experiment import initialise,summarise

ARMS={
 "advanced":      ("portfolio","learned","intact",True,"experienced",3),
 "pointer_cargo": ("portfolio","learned","intact",True,"pointer",3),
 "shuffled_cargo":("portfolio","learned","shuffled",True,"experienced",3),
 "last_signal":   ("portfolio","persistence","intact",True,"experienced",3),
 "no_orientation":("portfolio","learned","intact",True,"experienced",0),
 "no_salvage":    ("portfolio","learned","intact",False,"experienced",3),
 "earlier_policy":("random","persistence","off",False,"pointer",0),
}

def config(w, values):
    w.cfg.max_genome=512
    (w.archive_mode,w.forecast_mode,w.vector_mode,w.salvage_feedback,w.cargo_policy,w.temporal_hold)=values

def run_seed(seed,horizon=180.):
    root=initialise(seed);root_hash=digest(root.snapshot());nroot=len(root.agents)
    for ident in sorted(root.agents)[::2]:root.kill(root.agents[ident],"shared_ecological_shock")
    disturbed=digest(root.snapshot());arms={}
    for name,values in ARMS.items():
        w=copy.deepcopy(root);config(w,values)
        i=len(w.log);n=len(w.agents);spent=w.reactor_spent;ext=w.external_nourishment;ri=w.reactor_input
        w.advance(until_time=30.+horizon)
        arms[name]=summarise(w,i,30.,30.+horizon,n,spent,ext,ri)
    crash=initialise(seed);assert digest(crash.snapshot())==root_hash
    recovery={}
    for mode in ("portfolio","random","guided","portfolio_shuffled","empty"):
        w=copy.deepcopy(crash);config(w,ARMS["advanced"])
        w.archive_mode="portfolio" if mode=="empty" else mode
        i=len(w.log);n=len(w.agents);spent=w.reactor_spent;ext=w.external_nourishment;ri=w.reactor_input
        for ident in sorted(list(w.agents)):w.kill(w.agents[ident],"complete_shock")
        if mode=="empty":w.archive.clear();w.corpses.clear();w.waiting_corpses.clear();w.emit("experimental_archive_clear")
        w.advance(until_time=30.+horizon)
        recovery[mode]=summarise(w,i,30.,30.+horizon,n,spent,ext,ri)
    return {"seed":seed,"initial_root_hash":root_hash,"initial_living":nroot,
            "disturbed_root_hash":disturbed,"arms":arms,"recovery":recovery}

def main():
    p=argparse.ArgumentParser();p.add_argument("--start",type=int,required=True);p.add_argument("--seeds",type=int,required=True)
    p.add_argument("--workers",type=int,default=6);p.add_argument("--horizon",type=float,default=180.)
    p.add_argument("--output",type=Path,required=True);a=p.parse_args();a.output.mkdir(parents=True,exist_ok=False)
    with ProcessPoolExecutor(max_workers=a.workers) as pool:
        for i,f in enumerate(as_completed([pool.submit(run_seed,s,a.horizon) for s in range(a.start,a.start+a.seeds)]),1):
            row=f.result();(a.output/f"seed_{row['seed']}.json").write_text(json.dumps(row,indent=2,sort_keys=True)+"\n")
            print(f"completed seed {row['seed']} ({i}/{a.seeds})",flush=True)

if __name__=="__main__":main()
