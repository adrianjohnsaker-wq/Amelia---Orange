"""Reproduce and check all from-birth digit-genome branches."""
import json
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path
from digit_world import MODES,parse_genome
from from_birth_study import run_seed

DIRECTORY=Path('fresh_birth_41001')


def check(row):
    assert set(row['results'])==set(MODES)
    assert len({json.dumps(row['results'][m]['environment_future']) for m in MODES})==1
    for mode in MODES:
        x=row['results'][mode]
        assert len(x['mutation_created_records'])==x['mutation_created_intron_spans']
        for r in x['mutation_created_records']:
            before,after=r['before'],r['after']
            assert len(before)==len(after)
            assert [i for i,(a,b) in enumerate(zip(before,after)) if a!=b]==[r['position']]
            a={(s[1],s[4]) for s in parse_genome(before) if s[0]=='intron'}
            b={(s[1],s[4]) for s in parse_genome(after) if s[0]=='intron'}
            assert (r['start'],r['end']) in b-a and after[r['start']:r['end']]==r['sequence']
    rerun=run_seed(row['seed'],row['horizon'])
    assert json.loads(json.dumps(rerun,sort_keys=True))==row,row['seed']
    return {'seed':row['seed'],'branches':len(MODES)}


def main():
    rows=[json.loads(p.read_text()) for p in sorted(DIRECTORY.glob('seed_*.json'))]
    assert len(rows)==30 and {r['seed'] for r in rows}==set(range(41001,41031))
    checked=[]
    with ProcessPoolExecutor(max_workers=4) as pool:
        for i,f in enumerate(as_completed([pool.submit(check,r) for r in rows]),1):
            checked.append(f.result())
            if i%10==0:print(f'checked {i}/30 from-birth populations',flush=True)
    out={'status':'pass','populations':len(checked),'branches':sum(x['branches'] for x in checked),
         'seeds':sorted(checked,key=lambda x:x['seed'])}
    (DIRECTORY/'full_replay_audit.json').write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
    print(json.dumps({k:out[k] for k in ('status','populations','branches')}))


if __name__=='__main__':main()
