"""Regenerate selected branches and verify their ecological event invariants."""
import copy
import gzip
import json
import random
from collections import Counter
from pathlib import Path
from reactor import canonical,digest
from experiment import initialise,ARMS,summarise

def inspect(seed,w):
    rng=random.Random(seed ^ 0x2AC811);regime=[rng.randrange(3) for _ in range(10)]
    counts=[[[0]*3 for _ in range(3)] for _ in range(10)]
    commits={}; pending_reveals=[]; archive={};packets={};num=Counter()
    for e in w.log:
        kind=e["event"];num[kind]+=1
        if kind=="fate_commit":
            z=e["zone"];cur=regime[z];c=counts[z][cur];best=max(c)
            expected=cur if c[cur]==best else c.index(best)
            assert e["learned"]==expected and e["persistence"]==cur
            assert e["chosen"]==(expected if e["mode"]=="learned" else cur)
            commits[(z,e["epoch"])]=e
        elif kind=="fate_reveal":
            committed=commits[(e["zone"],e["epoch"])]
            assert committed["time"]<e["time"] and committed["chosen"]==e["chosen"]
            pending_reveals.append((e["zone"],e["actual"]))
        elif kind=="environment":
            signals=e["signals"]
            for z,actual in pending_reveals: assert signals[z]==actual
            pending_reveals=[]
            for z,new in enumerate(signals): counts[z][regime[z]][new]+=1
            regime=signals
        elif kind=="archive_store":archive[e["corpse"]]=e
        elif kind=="experimental_archive_clear":archive.clear()
        elif kind=="reconstitute":
            source=archive[e["source_corpse"]]
            assert source["genome"]==e["archived"] and e["energy_debit"]==4
            assert sorted(e["pre_mutation"])==sorted(e["archived"])
            assert sum(a!=b for a,b in zip(e["pre_mutation"],e["genome"]))==1
        elif kind=="vector_shed":
            packets[e["packet"]]=e;assert e["energy_debit"]==.12
        elif kind=="vector_infection":
            assert packets[e["packet"]]["cargo"]==e["code"]
            before=e["before"];expected=before[:e["ip"]]+e["code"]+before[e["ip"]:]
            assert e["after"]==expected[:len(e["after"])]
    harvested=sum(e["intake"] for e in w.log if e["event"]=="field_harvest")
    reward=sum(e["reward"] for e in w.log if e["event"]=="fate_reveal")
    assert abs(sum(map(sum,w.field))-(30+w.external_nourishment-harvested-reward))<.0001
    salvage=sum(e["energy_to_vault"] for e in w.log if e["event"]=="ampy_salvage")
    release=sum(e["energy_to_cthell"] for e in w.log if e["event"]=="ampy_release")
    assert abs(salvage-release-w.ampy_vault)<.0001
    return {"events":len(w.log),"field_balance_residual":sum(map(sum,w.field))-(30+w.external_nourishment-harvested-reward),
            "salvage_balance_residual":salvage-release-w.ampy_vault,"counts":dict(num)}

def run():
    out=Path("audit_ledgers");out.mkdir(exist_ok=False);report=[]
    for seed,kind,arm in ((25001,"arms","full"),(25015,"arms","no_salvage"),(25030,"recovery","guided")):
        record=json.loads(Path(f"fresh_25001/seed_{seed}.json").read_text());w=initialise(seed)
        assert digest(w.snapshot())==record["initial_root_hash"]
        if kind=="arms":
            for ident in sorted(w.agents)[::2]:w.kill(w.agents[ident],"shared_ecological_shock")
            assert digest(w.snapshot())==record["disturbed_root_hash"]
            w.cfg.max_genome=512;w.archive_mode,w.forecast_mode,w.vector_mode,w.salvage_feedback=ARMS[arm]
            start=len(w.log);n=len(w.agents);spent=w.reactor_spent;ext=w.external_nourishment;ri=w.reactor_input
        else:
            w.cfg.max_genome=512;w.archive_mode="guided";w.forecast_mode="learned";w.vector_mode="intact";w.salvage_feedback=True
            start=len(w.log);n=len(w.agents);spent=w.reactor_spent;ext=w.external_nourishment;ri=w.reactor_input
            for ident in sorted(list(w.agents)):w.kill(w.agents[ident],"complete_shock")
        w.advance(until_time=210.0);m=summarise(w,start,30.,210.,n,spent,ext,ri)
        assert m["log_sha256"]==record[kind][arm]["log_sha256"]
        assert m["state_sha256"]==record[kind][arm]["state_sha256"]
        checked=inspect(seed,w)
        with gzip.open(out/f"seed_{seed}_{arm}.jsonl.gz","wb") as f:
            for e in w.log:f.write(canonical(e)+b"\n")
        report.append({"seed":seed,"arm":arm,"digest":m["log_sha256"],**checked})
    (out/"audit.json").write_text(json.dumps(report,sort_keys=True,indent=2)+"\n")
    print(json.dumps([{"seed":r["seed"],"arm":r["arm"],"events":r["events"]} for r in report]))

if __name__=="__main__":run()
