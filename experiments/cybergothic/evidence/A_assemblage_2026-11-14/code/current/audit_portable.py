import copy
import gzip
import json
from pathlib import Path
from reactor import canonical,digest
from portable_study import initial
from experiment import summarise

def main():
    out=Path("audit_portable_ledgers");out.mkdir(exist_ok=False);report=[]
    for seed,arm in ((30001,"local"),(30015,"portable"),(30030,"portable")):
        saved=json.loads(Path(f"portable_fresh_30001/seed_{seed}.json").read_text());root=initial(seed)
        assert digest(root.snapshot())==saved["root_hash"]
        w=copy.deepcopy(root);w.cfg.max_genome=512;w.portable_bets=(arm=="portable")
        i=len(w.log);n=len(w.agents);spent=w.reactor_spent;ext=w.external_nourishment;ri=w.reactor_input
        w.advance(until_time=210.);m=summarise(w,i,30.,210.,n,spent,ext,ri)
        assert m["log_sha256"]==saved["arms"][arm]["log_sha256"]
        assert m["state_sha256"]==saved["arms"][arm]["state_sha256"]
        commits={};ledger_levies=0.
        for e in w.log:
            if e["event"]=="fate_commit":commits[e["zone"],e["epoch"]]=e
            elif e["event"]=="fate_reveal":
                c=commits[e["zone"],e["epoch"]]
                assert c["time"]<e["time"] and c["chosen"]==e["chosen"]
                assert abs(e["reward"]-e["field_reward"]-e["predatory_levy"])<1e-8
            elif e["event"]=="fate_levy":
                assert abs(sum(x[1] for x in e["donors"])-e["total"])<1e-7
                assert all(0<x[1]<=.1 for x in e["donors"]);ledger_levies+=e["total"]
            elif e["event"]=="remote_fate_reward":assert e["source_zone"]!=e["destination_zone"]
        harvest=sum(e["intake"] for e in w.log if e["event"]=="field_harvest")
        field_reward=sum(e["field_reward"] for e in w.log if e["event"]=="fate_reveal")
        assert abs(sum(map(sum,w.field))-(30+w.external_nourishment-harvest-field_reward))<.0001
        assert abs(ledger_levies-sum(e["predatory_levy"] for e in w.log if e["event"]=="fate_reveal"))<.0001
        with gzip.open(out/f"seed_{seed}_{arm}.jsonl.gz","wb") as f:
            for e in w.log:f.write(canonical(e)+b"\n")
        report.append({"seed":seed,"arm":arm,"events":len(w.log),"levies":ledger_levies,"event_sha256":m["log_sha256"]})
    (out/"audit.json").write_text(json.dumps(report,indent=2,sort_keys=True)+"\n");print(json.dumps(report))

if __name__=="__main__":main()
