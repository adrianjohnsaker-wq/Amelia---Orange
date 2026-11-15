"""Save a real pre-insertion fork and verify a new-process continuation."""
import json
import subprocess
import sys
import tempfile
from collections import Counter
from pathlib import Path
from encounter_trial import EncounterJournal,create_root,find_encounter
from reactor import digest

def main():
    path=Path("paused_encounter_example.sqlite")
    if path.exists():raise SystemExit("Refusing to overwrite the example checkpoint")
    saved=json.loads(Path("fresh_32001/seed_32001.json").read_text());trial=saved["trials"][0]
    w=create_root(32001);e=find_encounter(w,set(),set(),198.,Counter())
    assert e is not None and digest(w.snapshot())==trial["before"]["digest"]
    j=EncounterJournal(path);j.save(w);j.close()
    with tempfile.TemporaryDirectory() as d:
        branch=Path(d)/"branch.sqlite"
        p=subprocess.run([sys.executable,"encounter_cli.py","branch","--db",str(path),"--output",str(branch),
                          "--condition","experienced","--duration","12"],check=True,capture_output=True,text=True)
        result=json.loads(p.stdout)
        assert result["state_sha256"]==trial["outcomes"]["experienced"]["state_sha256"]
        j=EncounterJournal(branch);restored=j.load();j.close()
        assert digest(restored.log)==trial["outcomes"]["experienced"]["event_sha256"]
    summary={"seed":32001,"recipient":e.recipient,"packet":e.packet,"time":e.time,
             "fork_sha256":trial["before"]["digest"],"new_process_continuation_identical":True,
             "experienced_event_sha256":trial["outcomes"]["experienced"]["event_sha256"]}
    Path("paused_encounter_example.json").write_text(json.dumps(summary,indent=2,sort_keys=True)+"\n")
    print(json.dumps(summary,sort_keys=True))

if __name__=="__main__":main()
