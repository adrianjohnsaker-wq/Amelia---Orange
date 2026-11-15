"""Audit every saved branch's outcomes and regenerate all seeded simulations."""
import json
import math
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path

from promoter_study import ARMS,HORIZONS,ECHO_COST,allele_allowed,run_seed

DIRECTORY=Path('fresh_promoter_35001')


def close(a,b):return math.isclose(a,b,rel_tol=1e-10,abs_tol=1e-9)


def check_seed(row):
    violations=0
    for t in row['trials']:
        out=t['outcomes'];assert set(out)==set(ARMS)
        assert len({json.dumps(out[a]['environment_future']) for a in ARMS})==1
        experienced=t['alternatives']['experienced']['code'];shuffled=t['alternatives']['shuffled']['code']
        assert sorted(experienced)==sorted(shuffled)
        for arm in ARMS:
            x=out[arm];assert x['header']==t['zone'] and x['mode']==arm
            for d in x['decisions']:
                choice=d['choice']
                if choice['kind']=='payload':
                    violations+=not allele_allowed(arm,choice['header'],d['zone'])
                for s in choice['skipped']:
                    if s['kind']=='payload':
                        violations+=allele_allowed(arm,s['header'],d['zone'])
            for echo in x['echoes']:
                assert echo['action']>=4 and (echo['action']-4)%3==0
                assert echo['variant']==('shuffled' if arm=='zone_shuffled' else 'experienced')
                if echo['reason'] is None:
                    assert echo['code']==str(t['zone'])+(shuffled if arm=='zone_shuffled' else experienced)
                    assert close(echo['cost'],ECHO_COST)
            for h in HORIZONS:
                s=x['timepoints'][str(h)]
                actions=[a for a in x['actions'] if a['time']<=h]
                echoes=[e for e in x['echoes'] if e['time']<=h]
                ds=[d for d in x['decisions'] if d['elapsed']<=h and d['agent']==t['host']]
                assert s['actions']==len(actions)
                assert close(s['uptake'],sum(a['intake'] for a in actions))
                assert s['quiescent_actions']==sum(a['quiescent'] for a in actions)
                assert s['payload_actions']==sum(a['selection'].get('kind')=='payload' for a in actions)
                assert s['suppressed_actions']==sum(any(v.get('kind')=='payload' and not v.get('allowed') for v in d['choice']['skipped']) for d in ds)
                assert s['fragmented_skips']==sum(sum(v.get('kind')=='fragmented' for v in d['choice']['skipped']) for d in ds)
                assert s['echo_delivered']==sum(e['reason'] is None for e in echoes)
                assert s['echo_skipped']==sum(e['reason'] is not None for e in echoes)
                assert close(s['echo_energy_cost'],sum(e.get('cost',0) for e in echoes))
                if x['death'] is not None:assert s['alive']==(x['death']['time']>h)
    assert violations==0
    regen=run_seed(row['seed'])
    assert json.loads(json.dumps(regen,sort_keys=True))==row, row['seed']
    return {'seed':row['seed'],'encounters':len(row['trials']),'branches':len(ARMS)*len(row['trials']),
            'violations':violations}


def main():
    rows=[json.loads(p.read_text()) for p in sorted(DIRECTORY.glob('seed_*.json'))]
    assert len(rows)==60 and {r['seed'] for r in rows}==set(range(35001,35061))
    checked=[]
    with ProcessPoolExecutor(max_workers=4) as pool:
        for i,f in enumerate(as_completed([pool.submit(check_seed,row) for row in rows]),1):
            checked.append(f.result())
            if i%10==0:print(f'checked {i}/60 populations',flush=True)
    out={'status':'pass','populations':len(checked),'encounters':sum(x['encounters'] for x in checked),
         'branches':sum(x['branches'] for x in checked),'violations':sum(x['violations'] for x in checked),
         'seeds':sorted(checked,key=lambda x:x['seed'])}
    (DIRECTORY/'full_replay_audit.json').write_text(json.dumps(out,indent=2,sort_keys=True)+'\n')
    print(json.dumps({k:out[k] for k in ('status','populations','encounters','branches','violations')}))


if __name__=='__main__':main()
