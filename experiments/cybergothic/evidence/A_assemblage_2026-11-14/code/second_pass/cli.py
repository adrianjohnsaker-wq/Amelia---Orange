"""Start, continue and inspect an isolated persistent assemblage."""
import argparse
import json
from pathlib import Path
from legacy_engine import Config,Entropy
from reactor import digest
from assemblage import Assemblage,AssemblageJournal

def status(w):
    return {"model_time":w.now,"actions":w.actions,"living":len(w.agents),
            "archived_corpses":len(w.archive),"travelling_vectors":len(w.packets),
            "environment_epochs":w.environment_epoch,"external_field_energy":w.external_nourishment,
            "cthell_external_energy":w.reactor_input,"salvage_vault":w.ampy_vault,
            "archive_policy":w.archive_mode,"cargo_policy":w.cargo_policy,
            "forecast_policy":w.forecast_mode,"temporal_hold":w.temporal_hold,
            "reconstitutions":w.count["reconstitute"],"vector_infections":w.count["vector_infection"],
            "events":len(w.log),"event_sha256":digest(w.log)}

def main():
    p=argparse.ArgumentParser(description=__doc__);sub=p.add_subparsers(dest="command",required=True)
    ini=sub.add_parser("init");ini.add_argument("--db",type=Path,required=True);ini.add_argument("--seed",type=int,default=20261114)
    go=sub.add_parser("advance");go.add_argument("--db",type=Path,required=True);go.add_argument("--duration",type=float,required=True)
    show=sub.add_parser("status");show.add_argument("--db",type=Path,required=True)
    a=p.parse_args()
    if a.command=="init":
        if a.db.exists():raise SystemExit("Refusing to overwrite an existing checkpoint")
        a.db.parent.mkdir(parents=True,exist_ok=True)
        w=Assemblage(Config(seed=a.seed,max_genome=512),Entropy("seeded",a.seed))
        w.recovery_floor=8;w.pulse_renewal=.6;w.feedback_gain=1.8;w.steering_mode="target"
        w.archive_mode="portfolio";w.vector_mode="intact";w.cargo_policy="experienced"
        w.forecast_mode="learned";w.temporal_hold=3;w.salvage_feedback=True
        j=AssemblageJournal(a.db);j.save(w);j.close()
    else:
        if not a.db.is_file():raise SystemExit("No existing checkpoint")
        j=AssemblageJournal(a.db);w=j.load()
        if a.command=="advance":
            if not 0<a.duration<=100000:raise SystemExit("Duration must be between 0 and 100000")
            w.advance(until_time=float(w.now)+a.duration);j.save(w)
        j.close()
    print(json.dumps(status(w),indent=2,sort_keys=True))

if __name__=="__main__":main()
