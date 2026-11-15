"""Matched ecological disturbance and archive-recovery studies."""
import argparse
import copy
import json
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path
from legacy_engine import Config,Entropy
from reactor import digest
from assemblage import Assemblage
from study import metrics

ARMS={
 "full":          ("guided","learned","intact",True),
 "no_vector":     ("guided","learned","off",True),
 "no_salvage":    ("guided","learned","intact",False),
 "neither":       ("guided","learned","off",False),
 "shuffled_vector":("guided","learned","shuffled",True),
 "last_signal":   ("guided","persistence","intact",True),
 "earlier_policy":("random","persistence","off",False),
}


def initialise(seed):
    w=Assemblage(Config(seed=seed,initial_agents=36,max_agents=180,max_genome=1000000),Entropy("seeded",seed))
    w.recovery_floor=8;w.pulse_renewal=.6;w.steering_mode="target";w.feedback_gain=1.8
    w.advance(until_time=30.0)
    if not w.agents:raise RuntimeError("root extinct before fork")
    lengths=[len(a.genome) for a in w.agents.values()]+[len(g) for a in w.agents.values() for g,_ in a.history]
    lengths += [len(c["genome"]) for c in w.archive.values()]
    if max(lengths,default=0)>512:raise RuntimeError("postfork cap would clip retained material")
    return w


def summarise(w,start,t0,end,n0,spent,external_start,reactor_input_start):
    m=metrics(w,start,t0,end,n0,spent);es=w.log[start:]
    harvest=[e for e in es if e["event"]=="field_harvest"]
    reveal=[e for e in es if e["event"]=="fate_reveal"]
    vectors=[e for e in es if e["event"]=="vector_infection"]
    last={};pending={};nexts=matches=0;changes=[]
    for e in es:
        if e["event"]=="field_harvest":
            a=e["agent"]
            if a in pending:
                entry=pending.pop(a);nexts+=1;matches+=int(str(e["digit"])==entry["digit"])
                if entry["last"] is not None:changes.append(e["intake"]-entry["last"])
            last[a]=e["intake"]
        elif e["event"]=="vector_infection":
            pending[e["target"]]={"digit":e["code"][0],"last":last.get(e["target"])}
        elif e["event"]=="death":pending.pop(e["agent"],None)
    m.update({"field_harvest":sum(e["intake"] for e in harvest),
              "harvest_per_action":sum(e["intake"] for e in harvest)/len(harvest) if harvest else 0,
              "zones_harvested":len({e["zone"] for e in harvest if e["intake"]>0}),
              "external_food_accepted":w.external_nourishment-external_start,
              "fate_windows":len(reveal),
              "learned_hits":sum(e["learned"]==e["actual"] for e in reveal),
              "persistence_hits":sum(e["persistence"]==e["actual"] for e in reveal),
              "committed_hits":sum(e["chosen"]==e["actual"] for e in reveal),
              "forecast_reward":sum(e["reward"] for e in reveal),
              "forecast_cost":sum(e["cost"] for e in es if e["event"]=="fate_commit"),
              "vector_hosts":len({e["target"] for e in vectors}),
              "vector_next_observed":nexts,"vector_next_payload":matches,
              "mean_intake_change_after_vector":sum(changes)/len(changes) if changes else None,
              "vector_cost":sum(e["energy_debit"] for e in es if e["event"]=="vector_shed"),
              "salvaged":sum(e["energy_to_vault"] for e in es if e["event"]=="ampy_salvage"),
              "salvage_released":sum(e["energy_to_cthell"] for e in es if e["event"]=="ampy_release"),
              "vault_at_end":w.ampy_vault,"external_reactor_input":w.reactor_input-reactor_input_start,
              "recovery_births":sum(e["event"]=="reconstitute" for e in es)})
    return m


def run_seed(seed,horizon=180.):
    root=initialise(seed);fork0=digest(root.snapshot());nroot=len(root.agents)
    # A single shock is applied before the ordinary ecology fork.
    for ident in sorted(root.agents)[::2]:root.kill(root.agents[ident],"shared_ecological_shock")
    root_hash=digest(root.snapshot());groups={}
    for name,(arch,fore,vec,salvage) in ARMS.items():
        w=copy.deepcopy(root);w.cfg.max_genome=512;w.archive_mode=arch;w.forecast_mode=fore
        w.vector_mode=vec;w.salvage_feedback=salvage
        start=len(w.log);n0=len(w.agents);spent=w.reactor_spent;ext=w.external_nourishment;reactor_in=w.reactor_input
        w.advance(until_time=30.+horizon)
        groups[name]=summarise(w,start,30.,30.+horizon,n0,spent,ext,reactor_in)
    # Complete population loss is a distinct, matched archive intervention.
    crash=initialise(seed);crash_hash=digest(crash.snapshot());recovery={}
    for policy in ("random","guided","shuffled","empty"):
        w=copy.deepcopy(crash);w.cfg.max_genome=512;w.archive_mode="guided" if policy=="empty" else policy
        w.forecast_mode="learned";w.vector_mode="intact";w.salvage_feedback=True
        start=len(w.log);n0=len(w.agents);spent=w.reactor_spent;ext=w.external_nourishment;reactor_in=w.reactor_input
        for ident in sorted(list(w.agents)):w.kill(w.agents[ident],"complete_shock")
        if policy=="empty":
            w.archive.clear();w.corpses.clear();w.waiting_corpses.clear();w.emit("experimental_archive_clear")
        w.advance(until_time=30.+horizon)
        recovery[policy]=summarise(w,start,30.,30.+horizon,n0,spent,ext,reactor_in)
    return {"seed":seed,"initial_root_hash":fork0,"initial_living":nroot,
            "disturbed_root_hash":root_hash,"recovery_root_hash":crash_hash,
            "arms":groups,"recovery":recovery}


def main():
    p=argparse.ArgumentParser();p.add_argument("--start",type=int,required=True);p.add_argument("--seeds",type=int,required=True)
    p.add_argument("--workers",type=int,default=6);p.add_argument("--horizon",type=float,default=180.)
    p.add_argument("--output",type=Path,required=True);a=p.parse_args();a.output.mkdir(parents=True,exist_ok=False)
    with ProcessPoolExecutor(max_workers=a.workers) as pool:
        jobs=[pool.submit(run_seed,s,a.horizon) for s in range(a.start,a.start+a.seeds)]
        for i,f in enumerate(as_completed(jobs),1):
            row=f.result();(a.output/f"seed_{row['seed']}.json").write_text(json.dumps(row,indent=2,sort_keys=True)+"\n")
            print(f"completed seed {row['seed']} ({i}/{a.seeds})",flush=True)

if __name__=="__main__":main()
