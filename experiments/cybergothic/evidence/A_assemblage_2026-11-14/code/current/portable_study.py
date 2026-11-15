"""Compare retained, portable environmental bets to the original local bets."""
import argparse
import copy
import json
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path
from legacy_engine import Config,Entropy
from reactor import digest
from portable import PortableAssemblage
from experiment import summarise

def initial(seed):
    w=PortableAssemblage(Config(seed=seed,initial_agents=36,max_agents=180,max_genome=1000000),Entropy("seeded",seed))
    w.recovery_floor=8;w.pulse_renewal=.6;w.steering_mode="target";w.feedback_gain=1.8
    w.archive_mode="random";w.forecast_mode="learned";w.vector_mode="intact";w.cargo_policy="experienced"
    w.temporal_hold=3;w.salvage_feedback=True;w.temporal_retention=.85;w.advance(until_time=30.)
    lengths=[len(a.genome) for a in w.agents.values()]+[len(g) for a in w.agents.values() for g,_ in a.history]
    lengths += [len(c["genome"]) for c in w.archive.values()]
    if not w.agents or max(lengths,default=0)>512:raise RuntimeError("invalid fork")
    for ident in sorted(w.agents)[::2]:w.kill(w.agents[ident],"shared_ecological_shock")
    return w

def run_seed(seed):
    root=initial(seed);arms={}
    for name,enabled in (("local",False),("portable",True)):
        w=copy.deepcopy(root);w.cfg.max_genome=512;w.portable_bets=enabled
        start=len(w.log);n=len(w.agents);spent=w.reactor_spent;ext=w.external_nourishment;ri=w.reactor_input
        w.advance(until_time=210.);m=summarise(w,start,30.,210.,n,spent,ext,ri)
        es=w.log[start:];m["remote_rewards"]=sum(e["amount"] for e in es if e["event"]=="remote_fate_reward")
        m["remote_payments"]=sum(e["event"]=="remote_fate_reward" for e in es)
        m["levy_total"]=sum(e["total"] for e in es if e["event"]=="fate_levy")
        m["levy_events"]=sum(e["event"]=="fate_levy" for e in es)
        m["levied_hosts"]=len({host for e in es if e["event"]=="fate_levy" for host,_ in e["donors"]})
        m["net_bet_energy"]=m["forecast_reward"]-m["forecast_cost"]
        arms[name]=m
    return {"seed":seed,"root_hash":digest(root.snapshot()),"arms":arms}

def main():
    p=argparse.ArgumentParser();p.add_argument("--start",type=int,required=True);p.add_argument("--seeds",type=int,required=True)
    p.add_argument("--workers",type=int,default=6);p.add_argument("--output",type=Path,required=True);a=p.parse_args()
    a.output.mkdir(parents=True,exist_ok=False)
    with ProcessPoolExecutor(max_workers=a.workers) as pool:
        for i,f in enumerate(as_completed([pool.submit(run_seed,s) for s in range(a.start,a.start+a.seeds)]),1):
            row=f.result();(a.output/f"seed_{row['seed']}.json").write_text(json.dumps(row,indent=2,sort_keys=True)+"\n")
            print(f"completed seed {row['seed']} ({i}/{a.seeds})",flush=True)

if __name__=="__main__":main()
