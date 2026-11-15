"""Persist a complete population crash and prove exact continuation after restart."""
import json
import subprocess
import sys
from pathlib import Path
from legacy_engine import Config,Entropy
from reactor import digest
from portable import PortableAssemblage,PortableJournal

def main():
    path=Path("portable_recovery_demo.sqlite")
    if path.exists():raise SystemExit("Refusing to overwrite checkpoint")
    w=PortableAssemblage(Config(seed=31001,max_genome=512),Entropy("seeded",31001))
    w.recovery_floor=8;w.pulse_renewal=.6;w.feedback_gain=1.8;w.steering_mode="target"
    w.archive_mode="random";w.vector_mode="intact";w.cargo_policy="experienced";w.salvage_feedback=True
    w.forecast_mode="learned";w.temporal_hold=3;w.temporal_retention=.85;w.portable_bets=True
    w.advance(until_time=30.)
    for a in list(w.agents.values()):w.kill(a,"demonstration_extinction")
    before={"time":w.now,"living":len(w.agents),"archive":len(w.archive),"sha256":digest(w.snapshot())}
    j=PortableJournal(path);j.save(w);j.close()
    subprocess.run([sys.executable,"portable_cli.py","advance","--db",str(path),"--duration","90"],
                   check=True,capture_output=True,text=True)
    w.advance(until_time=120.);j=PortableJournal(path);r=j.load();j.close()
    assert w.log==r.log and digest(w.snapshot())==digest(r.snapshot())
    report={"before":before,"after":{"time":r.now,"living":len(r.agents),"archive":len(r.archive),
       "reconstitutions":r.count["reconstitute"],"vector_infections":r.count["vector_infection"],
       "temporal_retention":r.temporal_retention,"portable_bets":r.portable_bets,
       "sha256":digest(r.snapshot())},"new_process_identical":True}
    Path("portable_recovery_demo.json").write_text(json.dumps(report,indent=2,sort_keys=True)+"\n")
    print(json.dumps(report,sort_keys=True))

if __name__=="__main__":main()
