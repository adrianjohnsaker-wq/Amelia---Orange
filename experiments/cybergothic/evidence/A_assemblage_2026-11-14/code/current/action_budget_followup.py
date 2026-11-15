"""Post-outcome sensitivity: uptake over the first 1,500 actions per branch."""
import json
import statistics
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path
from experiment import initialise
from performance import ARMS,config
from reactor import digest
from analyse_performance import interval

def run(seed):
    saved=json.loads(Path(f"fresh_27001/seed_{seed}.json").read_text());out={"seed":seed}
    root=initialise(seed)
    for ident in sorted(root.agents)[::2]:root.kill(root.agents[ident],"shared_ecological_shock")
    assert digest(root.snapshot())==saved["disturbed_root_hash"]
    import copy
    for arm in ("advanced","pointer_cargo","shuffled_cargo"):
        w=copy.deepcopy(root);config(w,ARMS[arm]);start=len(w.log);w.advance(until_time=210.)
        assert digest(w.log)==saved["arms"][arm]["log_sha256"]
        actions=0;uptake=0.
        for e in w.log[start:]:
            if e["event"]=="field_harvest" and actions<1500:uptake+=e["intake"]
            elif e["event"]=="execute":
                actions+=1
                if actions==1500:break
        out[arm]={"uptake":uptake,"actions":actions,"reached":actions>=1500}
    return out

def main():
    rows=[]
    with ProcessPoolExecutor(max_workers=6) as pool:
        for f in as_completed([pool.submit(run,s) for s in range(27001,27031)]):rows.append(f.result())
    rows.sort(key=lambda r:r["seed"]);summary={}
    for b in ("pointer_cargo","shuffled_cargo"):
        diff=[r["advanced"]["uptake"]-r[b]["uptake"] for r in rows]
        summary[b]={"advanced_mean":statistics.mean(r["advanced"]["uptake"] for r in rows),
          "control_mean":statistics.mean(r[b]["uptake"] for r in rows),"mean_difference":statistics.mean(diff),
          "interval95":interval(diff,.95),"reached_advanced":sum(r["advanced"]["reached"] for r in rows),
          "reached_control":sum(r[b]["reached"] for r in rows)}
    Path("fresh_27001/action_budget_followup.json").write_text(json.dumps({"summary":summary,"seeds":rows},indent=2,sort_keys=True)+"\n")
    print(json.dumps(summary,sort_keys=True))

if __name__=="__main__":main()
