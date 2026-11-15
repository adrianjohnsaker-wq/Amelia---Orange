import gzip
import json
from pathlib import Path
from audit_trial import inspect_ledger
from encounter_trial import ARMS
from reactor import canonical
from strict_trial import run_seed

def main():
    out=Path("strict_audit_ledgers");out.mkdir(exist_ok=False);reports=[]
    for seed in (33001,33030,33060):
        recorded=json.loads(Path(f"strict_fresh_33001/seed_{seed}.json").read_text())
        actual=run_seed(seed,retain_logs=True);logs=actual.pop("logs");recorded.pop("logs")
        assert actual==recorded
        for phase in ("before","after"):
            first=next(t for t in actual["trials"] if t["phase"]==phase)
            for arm in ARMS:
                info=inspect_ledger(seed,first,arm,logs[phase][arm])
                with gzip.open(out/f"seed_{seed}_{phase}_{arm}.jsonl.gz","wb") as f:
                    for e in logs[phase][arm]:f.write(canonical(e)+b"\n")
                reports.append({"seed":seed,"phase":phase,"arm":arm,**info})
    (out/"audit.json").write_text(json.dumps(reports,indent=2,sort_keys=True)+"\n")
    print(json.dumps({"populations":3,"complete_ledgers":len(reports)}))

if __name__=="__main__":main()
