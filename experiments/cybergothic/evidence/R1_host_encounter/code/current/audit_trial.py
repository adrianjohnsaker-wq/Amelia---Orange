"""Regenerate selected roots and independently check host outcomes in their ledgers."""
import gzip
import json
from pathlib import Path
from reactor import canonical
from encounter_trial import ARMS,balanced_schedule,run_seed

def inspect_ledger(seed,trial,arm,events):
    b=trial["before"];wanted=b["alternatives"][arm]
    matches=[(i,e) for i,e in enumerate(events) if e["event"]=="trial_payload" and
             e["packet"]==b["packet"] and e["target"]==b["agent"] and e["condition"]==arm]
    if len(matches)!=1:raise AssertionError("ambiguous experimental insertion")
    idx,delivery=matches[0]
    assert delivery["code"]==wanted["code"] and delivery["origins"]==wanted["origins"]
    assert delivery["ip"]==b["ip"] and delivery["zone"]==b["zone"]
    infection=next(e for e in events[idx+1:] if e["event"]=="vector_infection" and
                   e["packet"]==b["packet"] and e["target"]==b["agent"])
    expected=b["genome"][:b["ip"]]+wanted["code"]+b["genome"][b["ip"]:]
    assert infection["before"]==b["genome"] and infection["after"]==expected
    assert infection["energy_transferred"]==min(.1,max(0.,round(b["energy"],6))) or abs(infection["energy_transferred"]-min(.1,max(0.,b["energy"])))<1e-8
    tail=events[idx+1:];host=b["agent"]
    harvest=[e for e in tail if e["event"]=="field_harvest" and e["agent"]==host]
    actions=[e for e in tail if e["event"]=="execute" and e["agent"]==host]
    death=next((e for e in tail if e["event"]=="death" and e["agent"]==host),None)
    result=trial["outcomes"][arm]
    assert abs(sum(e["intake"] for e in harvest)-result["nutrient"])<1e-7
    assert len(actions)==result["actions"] and (death is None)==result["survived"]
    assert (death["cause"] if death else None)==result["death_cause"]
    if harvest:
        assert harvest[0]["digit"]==result["first_digit"] and harvest[0]["focus"]==result["first_focus"]
        assert harvest[0]["intake"]==result["first_intake"]
    else:assert result["first_intake"] is None
    env=[e["signals"] for e in tail if e["event"]=="environment"]
    assert env==result["environment_future"]
    return {"host":host,"packet":b["packet"],"events":len(events),"actions":len(actions),
            "nutrient":result["nutrient"],"survived":result["survived"]}

def main():
    out=Path("audit_ledgers");out.mkdir(exist_ok=False);reports=[]
    for seed in (32001,32015,32030,32045,32060):
        expected=json.loads(Path(f"fresh_32001/seed_{seed}.json").read_text())
        actual=run_seed(seed,8,12.,retain_logs=True);logs=actual.pop("logs")
        expected.pop("logs");assert actual==expected
        assert [t["continuation_assignment"] for t in actual["trials"]]==balanced_schedule(seed,8)[:len(actual["trials"])]
        first=actual["trials"][0]
        for arm in ARMS:
            info=inspect_ledger(seed,first,arm,logs[arm])
            with gzip.open(out/f"seed_{seed}_encounter0_{arm}.jsonl.gz","wb") as f:
                for e in logs[arm]:f.write(canonical(e)+b"\n")
            reports.append({"seed":seed,"arm":arm,**info})
    (out/"audit.json").write_text(json.dumps(reports,indent=2,sort_keys=True)+"\n")
    print(json.dumps({"replayed_populations":5,"matched_branch_summaries":5*8*3,
                      "full_ledgers_independently_checked":len(reports)}))

if __name__=="__main__":main()
