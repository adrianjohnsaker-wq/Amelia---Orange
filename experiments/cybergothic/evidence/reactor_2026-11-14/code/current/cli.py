"""Operate a persistent, isolated local reactor with Python's standard library."""
import argparse
import json
from pathlib import Path
from legacy_engine import Config, Entropy
from reactor import Reactor, digest
from storage import SQLiteJournal


def status(w):
    return {"model_time":w.now,"actions":w.actions,"living_agents":len(w.agents),
            "active_corpses":len(w.corpses),"archived_code_records":len(w.archive),
            "extinction_reconstitutions":w.count["reconstitute"],
            "energy_spent_on_reconstitution":round(w.reactor_spent,6),
            "reactor_external_energy":round(w.reactor_input,6),
            "steering_mode":w.steering_mode,"feedback_gain":w.feedback_gain,
            "recovery_floor":w.recovery_floor,"pulse_renewal":w.pulse_renewal,
            "events":len(w.log),"event_sha256":digest(w.log)}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    sub=p.add_subparsers(dest="command",required=True)
    init=sub.add_parser("init");init.add_argument("--db",type=Path,required=True)
    init.add_argument("--seed",type=int,default=20261114)
    init.add_argument("--steering",choices=("off","sham","target","wrong_target"),default="off")
    init.add_argument("--feedback-gain",type=float,default=1.35)
    init.add_argument("--recovery-floor",type=int,default=1)
    init.add_argument("--pulse-renewal",type=float,default=.18)
    advance=sub.add_parser("advance");advance.add_argument("--db",type=Path,required=True)
    advance.add_argument("--duration",type=float,required=True)
    show=sub.add_parser("status");show.add_argument("--db",type=Path,required=True)
    a=p.parse_args()
    if a.command == "init":
        if a.db.exists(): raise SystemExit("Refusing to replace an existing database.")
        if not 0 <= a.feedback_gain <= 4: raise SystemExit("Feedback gain must be between 0 and 4.")
        if not 1 <= a.recovery_floor <= 36: raise SystemExit("Recovery floor must be between 1 and 36.")
        if not 0 <= a.pulse_renewal <= 8: raise SystemExit("Pulse renewal must be between 0 and 8.")
        a.db.parent.mkdir(parents=True,exist_ok=True)
        w=Reactor(Config(seed=a.seed,max_genome=512),Entropy("seeded",a.seed))
        w.steering_mode=a.steering;w.feedback_gain=a.feedback_gain
        w.recovery_floor=a.recovery_floor;w.pulse_renewal=a.pulse_renewal
        j=SQLiteJournal(a.db);j.save(w);j.close()
    else:
        if not a.db.is_file(): raise SystemExit("No existing database at that path.")
        j=SQLiteJournal(a.db);w=j.load()
        if a.command == "advance":
            if not 0 < a.duration <= 100000: raise SystemExit("Duration must be positive and at most 100000.")
            w.advance(until_time=float(w.now)+a.duration);j.save(w)
        j.close()
    print(json.dumps(status(w),indent=2,sort_keys=True))

if __name__=="__main__": main()
