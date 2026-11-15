import argparse
import json
from collections import Counter
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path
from strict_trial import run_seed

def main():
    p=argparse.ArgumentParser();p.add_argument("--start",type=int,required=True);p.add_argument("--seeds",type=int,required=True)
    p.add_argument("--workers",type=int,default=6);p.add_argument("--output",type=Path,required=True);a=p.parse_args()
    a.output.mkdir(parents=True,exist_ok=False)
    with ProcessPoolExecutor(max_workers=a.workers) as pool:
        for i,f in enumerate(as_completed([pool.submit(run_seed,s) for s in range(a.start,a.start+a.seeds)]),1):
            row=f.result();(a.output/f"seed_{row['seed']}.json").write_text(json.dumps(row,indent=2,sort_keys=True)+"\n")
            n=Counter(x["phase"] for x in row["trials"])
            print(f"completed population {row['seed']} ({i}/{a.seeds}): {n['before']} before, {n['after']} after",flush=True)

if __name__=="__main__":main()
