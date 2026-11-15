"""Do decaying temporal traces adapt to an unseen reversal?"""
import argparse
import copy
import json
import random
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path
from legacy_engine import Config,Entropy
from reactor import digest
from adaptive import AdaptiveAssemblage
from experiment import summarise

RETENTIONS={"accumulating":1.,"moderate":.85,"rapid":.7}

def initial(seed):
    w=AdaptiveAssemblage(Config(seed=seed,initial_agents=36,max_agents=180,max_genome=1000000),Entropy("seeded",seed))
    w.recovery_floor=8;w.pulse_renewal=.6;w.steering_mode="target";w.feedback_gain=1.8
    w.archive_mode="random";w.forecast_mode="learned";w.vector_mode="intact";w.cargo_policy="experienced"
    w.temporal_hold=3;w.salvage_feedback=True;w.advance(until_time=30.)
    retained=[len(a.genome) for a in w.agents.values()]+[len(g) for a in w.agents.values() for g,_ in a.history]
    retained +=[len(c["genome"]) for c in w.archive.values()]
    if not w.agents or max(retained,default=0)>512:raise RuntimeError("invalid fork")
    for ident in sorted(w.agents)[::2]:w.kill(w.agents[ident],"shared_ecological_shock")
    return w

def shadow(seed,signals,retention):
    rng=random.Random(seed ^ 0x2AC811);last=[rng.randrange(3) for _ in range(10)]
    table=[[[0. for _ in range(3)] for _ in range(3)] for _ in range(10)]
    out={"before":{"correct":0,"last":0,"total":0},"after":{"correct":0,"last":0,"total":0}}
    predictions={}
    for epoch,signals_now in signals:
        if epoch>5:
            phase="before" if epoch<=20 else "after"
            for z,new in enumerate(signals_now):
                row=table[z][last[z]];best=max(row)
                prediction=last[z] if row[last[z]]==best else row.index(best)
                predictions[(z,epoch)]=prediction
                out[phase]["correct"]+=prediction==new;out[phase]["last"]+=last[z]==new;out[phase]["total"]+=1
        if epoch>5 and retention<1:
            for zone in table:
                for row in zone:
                    for i in range(3):row[i]*=retention
        for z,new in enumerate(signals_now):table[z][last[z]][new]+=1
        last=signals_now
    return out,predictions

def run_seed(seed):
    root=initial(seed);root_hash=digest(root.snapshot());arms={};tape=None
    for label,retention in RETENTIONS.items():
        w=copy.deepcopy(root);w.cfg.max_genome=512;w.temporal_retention=retention
        start=len(w.log);n=len(w.agents);spent=w.reactor_spent;ext=w.external_nourishment;ri=w.reactor_input
        w.advance(until_time=210.)
        observed=[(e["epoch"],e["signals"]) for e in w.log if e["event"]=="environment"]
        if tape is None:tape=observed
        else:assert observed==tape
        score,predictions=shadow(seed,observed,retention)
        for e in w.log[start:]:
            if e["event"]=="fate_reveal":assert e["learned"]==predictions[(e["zone"],e["epoch"]+1)]
        arms[label]={"shadow":score,"ecology":summarise(w,start,30.,210.,n,spent,ext,ri)}
    return {"seed":seed,"root_hash":root_hash,"environment":tape,"arms":arms}

def main():
    p=argparse.ArgumentParser();p.add_argument("--start",type=int,required=True);p.add_argument("--seeds",type=int,required=True)
    p.add_argument("--workers",type=int,default=6);p.add_argument("--output",type=Path,required=True);a=p.parse_args()
    a.output.mkdir(parents=True,exist_ok=False)
    with ProcessPoolExecutor(max_workers=a.workers) as pool:
        for i,f in enumerate(as_completed([pool.submit(run_seed,s) for s in range(a.start,a.start+a.seeds)]),1):
            row=f.result();(a.output/f"seed_{row['seed']}.json").write_text(json.dumps(row,indent=2,sort_keys=True)+"\n")
            print(f"completed seed {row['seed']} ({i}/{a.seeds})",flush=True)

if __name__=="__main__":main()
