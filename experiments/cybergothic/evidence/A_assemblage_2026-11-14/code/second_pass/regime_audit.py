"""Reproduce all advanced branches and inspect forecasts across the regime reversal."""
import json
import statistics
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path
from experiment import initialise
from performance import ARMS,config
from reactor import digest
from analyse_performance import interval

def one(seed):
    expected=json.loads(Path(f"fresh_27001/seed_{seed}.json").read_text())
    w=initialise(seed)
    for ident in sorted(w.agents)[::2]:w.kill(w.agents[ident],"shared_ecological_shock")
    assert digest(w.snapshot())==expected["disturbed_root_hash"]
    config(w,ARMS["advanced"]);start=len(w.log);w.advance(until_time=210.0)
    assert digest(w.log)==expected["arms"]["advanced"]["log_sha256"]
    events=[e for e in w.log[start:] if e["event"]=="fate_reveal"]
    out={"seed":seed}
    for name,subset in (("before",[e for e in events if e["epoch"]<20]),
                        ("after",[e for e in events if e["epoch"]>=20])):
        out[name]={"windows":len(subset),"learned":sum(e["learned"]==e["actual"] for e in subset),
                   "last":sum(e["persistence"]==e["actual"] for e in subset)}
    return out

def main():
    rows=[]
    with ProcessPoolExecutor(max_workers=6) as pool:
        for f in as_completed([pool.submit(one,s) for s in range(27001,27031)]):rows.append(f.result())
    rows.sort(key=lambda x:x["seed"]);out={}
    for name in ("before","after"):
        subset=[r[name] for r in rows if r[name]["windows"]]
        diffs=[(x["learned"]-x["last"])/x["windows"] for x in subset]
        out[name]={"seeds":len(subset),"windows":sum(x["windows"] for x in subset),
                   "learned":sum(x["learned"] for x in subset),"last":sum(x["last"] for x in subset),
                   "mean_seed_advantage":statistics.mean(diffs),"interval95":interval(diffs,.95)}
    Path("fresh_27001/regime_audit.json").write_text(json.dumps({"summary":out,"seeds":rows},sort_keys=True,indent=2)+"\n")
    print(json.dumps(out,sort_keys=True))

if __name__=="__main__":main()
