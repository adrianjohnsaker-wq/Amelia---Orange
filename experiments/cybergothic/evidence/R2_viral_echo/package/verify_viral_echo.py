"""Check all recorded outcomes and regenerate all fresh-seed trajectories."""
import json
import math
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path
from viral_echo_study import ARMS, HORIZONS, ECHO_COST, run_seed

DIRECTORY = Path('fresh_echo_34001')


def close(a,b):
    return math.isclose(a,b,rel_tol=1e-10,abs_tol=1e-9)


def check_seed(row):
    original = json.loads(json.dumps(row,sort_keys=True))
    for trial in row['trials']:
        outputs=trial['outcomes']
        assert set(outputs)==set(ARMS)
        assert len({json.dumps(outputs[a]['environment_future']) for a in ARMS}) == 1
        experienced=trial['alternatives']['experienced']['code']
        shuffled=trial['alternatives']['shuffled']['code']
        assert sorted(experienced)==sorted(shuffled)
        for arm in ARMS:
            r=outputs[arm]
            assert r['arm']==arm
            if arm=='natural':
                assert not r['echoes']
            for e in r['echoes']:
                assert e['action']>=4 and (e['action']-4)%3==0
                assert e['variant']==('experienced' if arm=='experienced_echo' else 'shuffled')
                if e['reason'] is None:
                    assert e['code']==(experienced if arm=='experienced_echo' else shuffled)
                    assert close(e['energy_cost'],ECHO_COST)
            for h in HORIZONS:
                s=r['timepoints'][str(h)]
                actions=[a for a in r['actions'] if a['time']<=h]
                echoes=[e for e in r['echoes'] if e['time']<=h]
                assert s['actions']==len(actions)
                assert close(s['uptake'],sum(a['intake'] for a in actions))
                assert s['tagged_executions']==sum(a['matches_tagged_digit'] for a in actions)
                assert s['echo_delivered']==sum(e['reason'] is None for e in echoes)
                assert s['echo_skipped']==sum(e['reason'] is not None for e in echoes)
                assert close(s['echo_energy_cost'],sum(e.get('energy_cost',0) for e in echoes))
                assert not s['original_intact'] or s['intact']
                if arm=='natural':
                    assert s['intact']==s['original_intact']
                if r['first_death'] is not None:
                    assert s['alive']==(r['first_death']['time']>h)
    regenerated=json.loads(json.dumps(run_seed(row['seed']),sort_keys=True))
    assert regenerated==original, row['seed']
    return {'seed':row['seed'],'encounters':len(row['trials']),'branches':3*len(row['trials'])}


def main():
    rows=[json.loads(p.read_text()) for p in sorted(DIRECTORY.glob('seed_*.json'))]
    assert len(rows)==60 and {r['seed'] for r in rows}==set(range(34001,34061))
    verified=[]
    with ProcessPoolExecutor(max_workers=4) as pool:
        for i,f in enumerate(as_completed([pool.submit(check_seed,r) for r in rows]),1):
            verified.append(f.result())
            if i%10==0: print(f'regenerated and checked {i}/60 populations',flush=True)
    report={'status':'pass','populations':len(verified),'encounters':sum(x['encounters'] for x in verified),
            'branches':sum(x['branches'] for x in verified),'seed_results':sorted(verified,key=lambda x:x['seed'])}
    (DIRECTORY/'replay_audit.json').write_text(json.dumps(report,sort_keys=True,indent=2)+'\n')
    print(json.dumps({k:report[k] for k in ('status','populations','encounters','branches')}))


if __name__=='__main__':main()
