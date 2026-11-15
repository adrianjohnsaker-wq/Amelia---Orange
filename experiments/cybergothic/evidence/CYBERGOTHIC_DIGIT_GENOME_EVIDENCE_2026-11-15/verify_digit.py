"""Regenerate both digit-genome studies and check natural-formation records."""
import json
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path

from digit_study import run_seed
from digit_world import MODES,parse_genome


def check_seed(row):
    assert set(row['results'])==set(MODES)
    assert len({json.dumps(row['results'][m]['environment_future']) for m in MODES})==1
    for mode in MODES:
        x=row['results'][mode]
        assert len(x['mutation_created_records'])==x['mutation_created_intron_spans']
        for record in x['mutation_created_records']:
            before,after=record['before'],record['after']
            assert len(before)==len(after)
            changed=[i for i,(a,b) in enumerate(zip(before,after)) if a!=b]
            assert changed==[record['position']]
            old={(s[1],s[4]) for s in parse_genome(before) if s[0]=='intron'}
            new={(s[1],s[4]) for s in parse_genome(after) if s[0]=='intron'}
            assert (record['start'],record['end']) in new-old
            assert after[record['start']:record['end']]==record['sequence']
    rerun=run_seed(row['seed'],row['follow_time'])
    assert json.loads(json.dumps(rerun,sort_keys=True))==row,row['seed']
    return {'seed':row['seed'],'branches':len(MODES),'mutation_spans':sum(
            row['results'][m]['mutation_created_intron_spans'] for m in MODES)}


def main():
    directories=[('fresh_digit_39001',39001),('fresh_grammar_40001',40001)]
    entries=[]
    for name,start in directories:
        rows=[json.loads(p.read_text()) for p in sorted(Path(name).glob('seed_*.json'))]
        assert len(rows)==60 and {r['seed'] for r in rows}==set(range(start,start+60))
        entries.extend((name,r) for r in rows)
    checked=[]
    with ProcessPoolExecutor(max_workers=4) as pool:
        jobs={pool.submit(check_seed,row):name for name,row in entries}
        for i,f in enumerate(as_completed(jobs),1):
            checked.append({'study':jobs[f],**f.result()})
            if i%20==0:print(f'checked {i}/120 populations',flush=True)
    out={'status':'pass','populations':len(checked),'branches':sum(x['branches'] for x in checked),
         'mutation_spans':sum(x['mutation_spans'] for x in checked),'seeds':sorted(checked,key=lambda x:(x['study'],x['seed']))}
    Path('digit_full_replay_audit.json').write_text(json.dumps(out,indent=2,sort_keys=True)+'\n')
    print(json.dumps({k:out[k] for k in ('status','populations','branches','mutation_spans')}))


if __name__=='__main__':main()
