"""Persist a strict first-contact fork and verify a fresh-process branch."""
import json
import subprocess
import sys
import tempfile
from collections import Counter
from pathlib import Path
from encounter_trial import find_encounter
from reactor import digest
from strict_trial import StrictJournal,create_strict_root

def main():
    path=Path("strict_paused_example.sqlite")
    if path.exists():raise SystemExit("Refusing to overwrite the example checkpoint")
    saved=json.loads(Path("strict_fresh_33001/seed_33001.json").read_text());trial=saved["trials"][0]
    w=create_strict_root(33001);e=find_encounter(w,set(),w.contacted_packets,90.,Counter())
    assert e is not None and digest(w.snapshot())==trial["before"]["digest"]
    j=StrictJournal(path);j.save(w);j.close()
    with tempfile.TemporaryDirectory() as d:
        branch=Path(d)/"branch.sqlite"
        r=subprocess.run([sys.executable,"strict_cli.py","branch","--db",str(path),"--output",str(branch),
                          "--condition","experienced","--duration","12"],check=True,capture_output=True,text=True)
        result=json.loads(r.stdout);assert result["state_sha256"]==trial["outcomes"]["experienced"]["state_sha256"]
        j=StrictJournal(branch);restored=j.load();j.close()
        assert digest(restored.log)==trial["outcomes"]["experienced"]["event_sha256"]
    report={"seed":33001,"recipient":e.recipient,"packet":e.packet,"time":e.time,
            "fork_sha256":trial["before"]["digest"],"new_process_continuation_identical":True,
            "experienced_event_sha256":trial["outcomes"]["experienced"]["event_sha256"]}
    Path("strict_paused_example.json").write_text(json.dumps(report,indent=2,sort_keys=True)+"\n")
    print(json.dumps(report,sort_keys=True))

if __name__=="__main__":main()
