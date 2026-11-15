import copy
import gzip
import json
from pathlib import Path
from reactor import canonical,digest
from temporal_study import initial,RETENTIONS
from experiment import summarise

def main():
    out=Path("audit_temporal_ledgers");out.mkdir(exist_ok=False);reports=[]
    for seed,arm in ((28001,"accumulating"),(28015,"moderate"),(28030,"rapid")):
        saved=json.loads(Path(f"temporal_fresh_28001/seed_{seed}.json").read_text())
        w=initial(seed);assert digest(w.snapshot())==saved["root_hash"]
        w.cfg.max_genome=512;w.temporal_retention=RETENTIONS[arm]
        i=len(w.log);n=len(w.agents);spent=w.reactor_spent;ext=w.external_nourishment;ri=w.reactor_input
        w.advance(until_time=210.0);m=summarise(w,i,30.,210.,n,spent,ext,ri)
        assert m["log_sha256"]==saved["arms"][arm]["ecology"]["log_sha256"]
        assert m["state_sha256"]==saved["arms"][arm]["ecology"]["state_sha256"]
        commits={};archive={};vectors={}
        for e in w.log:
            if e["event"]=="fate_commit":commits[(e["zone"],e["epoch"])]=e
            elif e["event"]=="fate_reveal":
                c=commits[(e["zone"],e["epoch"])]
                assert c["time"]<e["time"] and c["chosen"]==e["chosen"]
            elif e["event"]=="archive_store":archive[e["corpse"]]=e
            elif e["event"]=="reconstitute":
                assert archive[e["source_corpse"]]["genome"]==e["archived"] and e["energy_debit"]==4
            elif e["event"]=="vector_shed":vectors[e["packet"]]=e
            elif e["event"]=="vector_infection":
                assert e["code"]==vectors[e["packet"]]["cargo"]
                before=e["before"];new=before[:e["ip"]]+e["code"]+before[e["ip"]:]
                assert new[:len(e["after"])]==e["after"]
        harvest=sum(e["intake"] for e in w.log if e["event"]=="field_harvest")
        reward=sum(e["reward"] for e in w.log if e["event"]=="fate_reveal")
        assert abs(sum(map(sum,w.field))-(30+w.external_nourishment-harvest-reward))<.0001
        salvage=sum(e["energy_to_vault"] for e in w.log if e["event"]=="ampy_salvage")
        release=sum(e["energy_to_cthell"] for e in w.log if e["event"]=="ampy_release")
        assert abs(salvage-release-w.ampy_vault)<.0001
        with gzip.open(out/f"seed_{seed}_{arm}.jsonl.gz","wb") as f:
            for e in w.log:f.write(canonical(e)+b"\n")
        reports.append({"seed":seed,"arm":arm,"events":len(w.log),"event_sha256":m["log_sha256"]})
    (out/"audit.json").write_text(json.dumps(reports,indent=2,sort_keys=True)+"\n");print(json.dumps(reports))

if __name__=="__main__":main()
