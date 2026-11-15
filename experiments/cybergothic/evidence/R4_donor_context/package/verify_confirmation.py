"""Regenerate and check every fresh survival-confirmation branch."""
import json
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path
from verify_donor_context import check_seed

DIRECTORY=Path('fresh_survival_37001')


def main():
    rows=[json.loads(p.read_text()) for p in sorted(DIRECTORY.glob('seed_*.json'))]
    assert len(rows)==60 and {r['seed'] for r in rows}==set(range(37001,37061))
    checked=[]
    with ProcessPoolExecutor(max_workers=4) as pool:
        for i,f in enumerate(as_completed([pool.submit(check_seed,row) for row in rows]),1):
            checked.append(f.result())
            if i%10==0:print(f'checked {i}/60 confirmation populations',flush=True)
    out={'status':'pass','populations':len(checked),'encounters':sum(x['encounters'] for x in checked),
         'branches':sum(x['branches'] for x in checked),'violations':sum(x['violations'] for x in checked),
         'seeds':sorted(checked,key=lambda x:x['seed'])}
    (DIRECTORY/'full_replay_audit.json').write_text(json.dumps(out,indent=2,sort_keys=True)+'\n')
    print(json.dumps({k:out[k] for k in ('status','populations','encounters','branches','violations')}))


if __name__=='__main__':main()
