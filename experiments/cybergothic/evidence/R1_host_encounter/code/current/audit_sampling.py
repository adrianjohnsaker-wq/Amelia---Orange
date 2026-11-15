"""Reconstruct pre-encounter packet histories and check the protocol deviation."""
import json
import statistics
from collections import Counter
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path
from encounter_trial import balanced_schedule,create_root,find_encounter,finish_delivery
from reactor import digest
from analyse import bootstrap

def audit_seed(seed):
    recorded=json.loads(Path(f"fresh_32001/seed_{seed}.json").read_text())
    w=create_root(seed);seen=set();used=set();excluded=Counter();out=[]
    for index,t in enumerate(recorded["trials"]):
        e=find_encounter(w,seen,used,198.,excluded);assert e is not None
        assert e.packet==t["before"]["packet"] and e.recipient==t["before"]["agent"]
        assert digest(w.snapshot())==t["before"]["digest"]
        prior=[x for x in w.log if x["event"]=="vector_infection" and x.get("packet")==e.packet]
        out.append({"index":index,"packet":e.packet,"recipient":e.recipient,
                    "previous_logged_infections":len(prior),
                    "previous_same_recipient":sum(x["target"]==e.recipient for x in prior)})
        seen.add(e.recipient);finish_delivery(w,e.packet,e.recipient,balanced_schedule(seed,8)[index],trial=True)
    return {"seed":seed,"encounters":out}

def main():
    records=[]
    with ProcessPoolExecutor(max_workers=6) as pool:
        for f in as_completed([pool.submit(audit_seed,s) for s in range(32001,32061)]):records.append(f.result())
    records.sort(key=lambda r:r["seed"]);byseed={r["seed"]:r for r in records}
    total=sum(x["previous_logged_infections"]>0 for r in records for x in r["encounters"])
    same=sum(x["previous_same_recipient"]>0 for r in records for x in r["encounters"])
    comparisons={}
    for other in ("pointer","shuffled"):
        for metric in ("nutrient","survived"):
            means=[];encounters=0
            for seed in range(32001,32061):
                row=json.loads(Path(f"fresh_32001/seed_{seed}.json").read_text())
                excluded={a["index"] for a in byseed[seed]["encounters"] if a["previous_logged_infections"]>0}
                eligible=[t for t in row["trials"] if t["index"] not in excluded]
                if not eligible:continue
                encounters+=len(eligible)
                means.append(statistics.mean(float(t["outcomes"]["experienced"][metric])-
                                             float(t["outcomes"][other][metric]) for t in eligible))
            comparisons[f"experienced_minus_{other}_{metric}"]={"mean":statistics.mean(means),
                "interval9875":bootstrap(means,.9875),"seeds":len(means),"encounters":encounters}
    report={"encounters_with_previous_logged_packet_infection":total,
            "encounters_with_previous_infection_of_same_host":same,
            "sensitivity_excluding_previous_logged_infection":comparisons,"details":records}
    Path("fresh_32001/sampling_audit.json").write_text(json.dumps(report,indent=2,sort_keys=True)+"\n")
    print(json.dumps({k:report[k] for k in report if k!="details"},indent=2,sort_keys=True))

if __name__=="__main__":main()
