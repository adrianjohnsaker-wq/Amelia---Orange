"""Regenerate every screened population and compare every stored branch record."""
import argparse
import json
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path

from stop_trial import run_seed,ARMS

OUT=Path('fresh_viral_stop_42001')


def check(row):
    result=run_seed(row['seed'])
    assert json.loads(json.dumps(result,sort_keys=True))==row, row['seed']
    return {'seed':row['seed'],'eligible':row['eligible'],
            'branches':len(ARMS) if row['eligible'] else 0}


def main():
    p=argparse.ArgumentParser();p.add_argument('--directory',type=Path,default=OUT)
    p.add_argument('--start',type=int,default=42001);p.add_argument('--seeds',type=int,default=120)
    args=p.parse_args();directory=args.directory
    rows=[json.loads(p.read_text()) for p in sorted(directory.glob('seed_*.json'))]
    assert len(rows)==args.seeds and {r['seed'] for r in rows}==set(range(args.start,args.start+args.seeds))
    checked=[]
    with ProcessPoolExecutor(max_workers=4) as pool:
        for i,f in enumerate(as_completed([pool.submit(check,r) for r in rows]),1):
            checked.append(f.result())
            if i%20==0:print('replayed',i,'of',len(rows),'populations',flush=True)
    out={'status':'pass','populations':len(checked),'branches':sum(r['branches'] for r in checked),
         'eligible_populations':sum(r['eligible'] for r in checked),
         'seeds':sorted(checked,key=lambda r:r['seed'])}
    (directory/'full_replay_audit.json').write_text(json.dumps(out,indent=2,sort_keys=True)+'\n')
    print(json.dumps({k:out[k] for k in ('status','populations','eligible_populations','branches')}))


if __name__=='__main__':main()
