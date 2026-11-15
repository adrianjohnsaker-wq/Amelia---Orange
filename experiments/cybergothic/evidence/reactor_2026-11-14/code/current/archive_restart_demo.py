"""Persist a population crash, restart in another process, and verify replay."""
import json
import subprocess
import sys
from pathlib import Path
from legacy_engine import Config,Entropy
from reactor import Reactor,digest
from storage import SQLiteJournal

def main():
    path=Path("persistent_recovery_demo.sqlite")
    if path.exists():raise SystemExit("Refusing to replace an existing demo database")
    w=Reactor(Config(seed=22001,max_genome=512),Entropy("seeded",22001))
    w.steering_mode="target";w.advance(until_time=15.0)
    for a in list(w.agents.values()):w.kill(a,"demonstration_extinction")
    before={"living":len(w.agents),"archive":len(w.archive),"digest":digest(w.snapshot())}
    j=SQLiteJournal(path);j.save(w);j.close()
    subprocess.run([sys.executable,"cli.py","advance","--db",str(path),"--duration","60"],check=True,capture_output=True,text=True)
    w.advance(until_time=75.0)
    j=SQLiteJournal(path);r=j.load();j.close()
    assert w.log==r.log and digest(w.snapshot())==digest(r.snapshot())
    report={"before":before,"after":{"living":len(r.agents),"archive":len(r.archive),
            "reconstitutions":r.count["reconstitute"],"actions":r.actions,
            "energy_spent":r.reactor_spent,"state_sha256":digest(r.snapshot())},
            "new_process_identical":True,"checkpoint_file":str(path)}
    Path("persistent_recovery_demo.json").write_text(json.dumps(report,indent=2,sort_keys=True)+"\n")
    print(json.dumps(report,sort_keys=True))

if __name__=="__main__":main()
