import gzip
import json
from pathlib import Path
from reactor import canonical,digest
from experiment import initialise,summarise
from performance import ARMS,config
from audit_shared import inspect

def main():
    output=Path("audit_ledgers");output.mkdir(exist_ok=False);reports=[]
    for seed,kind,arm in ((27001,"arms","advanced"),(27015,"arms","pointer_cargo"),(27030,"recovery","portfolio")):
        saved=json.loads(Path(f"fresh_27001/seed_{seed}.json").read_text());w=initialise(seed)
        assert digest(w.snapshot())==saved["initial_root_hash"]
        if kind=="arms":
            for ident in sorted(w.agents)[::2]:w.kill(w.agents[ident],"shared_ecological_shock")
            assert digest(w.snapshot())==saved["disturbed_root_hash"]
            config(w,ARMS[arm]);start=len(w.log);n=len(w.agents);spent=w.reactor_spent;ext=w.external_nourishment;ri=w.reactor_input
        else:
            config(w,ARMS["advanced"]);w.archive_mode="portfolio"
            start=len(w.log);n=len(w.agents);spent=w.reactor_spent;ext=w.external_nourishment;ri=w.reactor_input
            for ident in sorted(list(w.agents)):w.kill(w.agents[ident],"complete_shock")
        w.advance(until_time=210.0);m=summarise(w,start,30.,210.,n,spent,ext,ri)
        assert m["log_sha256"]==saved[kind][arm]["log_sha256"]
        assert m["state_sha256"]==saved[kind][arm]["state_sha256"]
        checked=inspect(seed,w)
        with gzip.open(output/f"seed_{seed}_{arm}.jsonl.gz","wb") as f:
            for e in w.log:f.write(canonical(e)+b"\n")
        reports.append({"seed":seed,"arm":arm,"digest":m["log_sha256"],**checked})
    (output/"audit.json").write_text(json.dumps(reports,indent=2,sort_keys=True)+"\n")
    print(json.dumps([{"seed":r["seed"],"arm":r["arm"],"events":r["events"]} for r in reports]))

if __name__=="__main__":main()
