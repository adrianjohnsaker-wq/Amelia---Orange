"""Replay every branch and recompute recipient outcomes directly from events."""
import copy
import json
import random
from collections import Counter
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path
from audit_trial import inspect_ledger
from encounter_trial import ARMS,balanced_schedule,create_root,find_encounter,finish_delivery
from reactor import digest

def audit_seed(seed):
    record=json.loads(Path(f"fresh_32001/seed_{seed}.json").read_text())
    w=create_root(seed);assert digest(w.snapshot())==record["root_hash"]
    hosts=set();packets=set();excluded=Counter();order_rng=random.Random(seed ^ 0xFEE117)
    schedule=balanced_schedule(seed,8);checked=0;prior_infections=0;affected_encounters=0
    for index,trial in enumerate(record["trials"]):
        e=find_encounter(w,hosts,packets,198.,excluded);assert e is not None
        b=trial["before"];assert e.recipient==b["agent"] and e.packet==b["packet"] and e.time==b["time"]
        assert e.zone==b["zone"] and e.source==b["donor"] and digest(w.snapshot())==b["digest"]
        assert w.packets[e.packet]["alternatives"]==b["alternatives"]
        assert w.packets[e.packet]["candidate_info"]==b["candidate_info"]
        prior=sum(ev["event"]=="vector_infection" and ev.get("packet")==e.packet for ev in w.log)
        prior_infections+=prior;affected_encounters+=int(prior>0)
        order=list(ARMS);order_rng.shuffle(order)
        assert order==trial["execution_order"] and schedule[index]==trial["continuation_assignment"]
        hosts.add(e.recipient);future=None
        for arm in ARMS:
            clone=copy.deepcopy(w);finish_delivery(clone,e.packet,e.recipient,arm,trial=True)
            clone.advance(until_time=e.time+12.);result=trial["outcomes"][arm]
            assert digest(clone.log)==result["event_sha256"] and digest(clone.snapshot())==result["state_sha256"]
            inspect_ledger(seed,trial,arm,clone.log)
            if future is None:future=result["environment_future"]
            else:assert result["environment_future"]==future
            checked+=1
        finish_delivery(w,e.packet,e.recipient,schedule[index],trial=True)
    # If a root yielded fewer than the fixed maximum, reproduce the final search.
    if len(record["trials"])<8:
        assert find_encounter(w,hosts,packets,198.,excluded) is None
    assert dict(excluded)==record["exclusions"]
    return {"seed":seed,"encounters":len(record["trials"]),"branches_verified":checked,
            "prior_packet_infections":prior_infections,"encounters_with_prior_packet_infection":affected_encounters}

def main():
    rows=[]
    with ProcessPoolExecutor(max_workers=6) as pool:
        for i,f in enumerate(as_completed([pool.submit(audit_seed,s) for s in range(32001,32061)]),1):
            rows.append(f.result())
            if i%10==0:print(f"audited {i}/60 populations",flush=True)
    rows.sort(key=lambda x:x["seed"])
    result={"populations":len(rows),"encounters":sum(r["encounters"] for r in rows),
            "branches":sum(r["branches_verified"] for r in rows),
            "prior_packet_infections":sum(r["prior_packet_infections"] for r in rows),
            "encounters_with_prior_packet_infection":sum(r["encounters_with_prior_packet_infection"] for r in rows),
            "results":rows}
    Path("fresh_32001/full_audit.json").write_text(json.dumps(result,indent=2,sort_keys=True)+"\n")
    print(json.dumps({k:result[k] for k in ("populations","encounters","branches","prior_packet_infections","encounters_with_prior_packet_infection")}))

if __name__=="__main__":main()
