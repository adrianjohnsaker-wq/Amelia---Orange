"""Execute randomized, matched encounter branches for independent populations."""
import argparse
import json
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path
from encounter_trial import run_seed

def main():
    p=argparse.ArgumentParser();p.add_argument("--start",type=int,required=True);p.add_argument("--seeds",type=int,required=True)
    p.add_argument("--encounters",type=int,default=8);p.add_argument("--follow",type=float,default=12.)
    p.add_argument("--workers",type=int,default=4);p.add_argument("--output",type=Path,required=True)
    a=p.parse_args();a.output.mkdir(parents=True,exist_ok=False)
    rows=[]
    with ProcessPoolExecutor(max_workers=a.workers) as pool:
        futures=[pool.submit(run_seed,seed,a.encounters,a.follow) for seed in range(a.start,a.start+a.seeds)]
        for i,f in enumerate(as_completed(futures),1):
            row=f.result();rows.append(row)
            (a.output/f"seed_{row['seed']}.json").write_text(json.dumps(row,sort_keys=True,indent=2)+"\n")
            print(f"completed population {row['seed']} ({i}/{a.seeds}), {len(row['trials'])} recipients",flush=True)
    (a.output/"parameters.json").write_text(json.dumps(vars(a),indent=2,sort_keys=True,default=str)+"\n")

if __name__=="__main__":main()
