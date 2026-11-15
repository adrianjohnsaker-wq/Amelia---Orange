"""Replay every confirmation branch and verify first contact and host outcomes."""
import copy
import json
import random
from collections import Counter
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path
from audit_trial import inspect_ledger
from encounter_trial import ARMS,balanced_schedule,find_encounter,finish_delivery
from strict_trial import create_strict_root
from reactor import digest

class ContactAuditSet(set):
    def __init__(self,values):super().__init__(values);self.lookups=[]
    def __contains__(self,item):
        result=super().__contains__(item);self.lookups.append((item,result));return result

def audit_seed(seed):
    record=json.loads(Path(f"strict_fresh_33001/seed_{seed}.json").read_text())
    w=create_strict_root(seed);assert digest(w.snapshot())==record["root_hash"]
    w.contacted_packets=ContactAuditSet(w.contacted_packets)
    seen=set();excluded=Counter();schedule=balanced_schedule(seed,8);order_rng=random.Random(seed ^ 0xFC7111)
    checked=0;contacts=0
    for phase,limit in (("before",90.),("after",198.)):
        if phase=="after":w.advance(until_time=126.)
        phase_trials=[t for t in record["trials"] if t["phase"]==phase]
        for trial in phase_trials:
            start=len(w.contacted_packets.lookups)
            e=find_encounter(w,seen,w.contacted_packets,limit,excluded);assert e is not None
            checked_contact=[known for packet,known in w.contacted_packets.lookups[start:] if packet==e.packet]
            assert checked_contact==[False]
            assert not any(ev["event"]=="vector_infection" and ev.get("packet")==e.packet for ev in w.log)
            b=trial["before"];assert e.packet==b["packet"] and e.recipient==b["agent"] and e.time==b["time"]
            assert e.zone==b["zone"] and e.source==b["donor"] and digest(w.snapshot())==b["digest"]
            assert w.packets[e.packet]["alternatives"]==b["alternatives"]
            assert w.packets[e.packet]["candidate_info"]==b["candidate_info"]
            index=trial["index"];order=list(ARMS);order_rng.shuffle(order)
            assert order==trial["execution_order"] and schedule[index]==trial["continuation_assignment"]
            seen.add(e.recipient);future=None;contacts+=1
            for arm in ARMS:
                clone=copy.deepcopy(w);finish_delivery(clone,e.packet,e.recipient,arm,trial=True)
                clone.advance(until_time=e.time+12.);result=trial["outcomes"][arm]
                assert digest(clone.log)==result["event_sha256"] and digest(clone.snapshot())==result["state_sha256"]
                inspect_ledger(seed,trial,arm,clone.log)
                if future is None:future=result["environment_future"]
                else:assert result["environment_future"]==future
                checked+=1
            finish_delivery(w,e.packet,e.recipient,schedule[index],trial=True)
        if len(phase_trials)<4:
            assert find_encounter(w,seen,w.contacted_packets,limit,excluded) is None
    assert dict(excluded)==record["exclusions"]
    return {"seed":seed,"encounters":contacts,"branches_verified":checked,"first_contact_checks":contacts}

def main():
    rows=[]
    with ProcessPoolExecutor(max_workers=6) as pool:
        for i,f in enumerate(as_completed([pool.submit(audit_seed,s) for s in range(33001,33061)]),1):
            rows.append(f.result())
            if i%10==0:print(f"audited {i}/60 fresh confirmation populations",flush=True)
    rows.sort(key=lambda x:x["seed"]);result={"populations":len(rows),"encounters":sum(r["encounters"] for r in rows),
        "branches":sum(r["branches_verified"] for r in rows),"first_contact_checks":sum(r["first_contact_checks"] for r in rows),"results":rows}
    Path("strict_fresh_33001/full_audit.json").write_text(json.dumps(result,indent=2,sort_keys=True)+"\n")
    print(json.dumps({k:result[k] for k in ("populations","encounters","branches","first_contact_checks")}))

if __name__=="__main__":main()
