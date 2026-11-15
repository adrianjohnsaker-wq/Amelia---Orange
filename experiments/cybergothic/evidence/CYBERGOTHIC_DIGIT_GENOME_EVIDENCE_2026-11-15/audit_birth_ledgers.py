"""Independently inspect selected from-birth parser and population ledgers."""
import collections
import copy
import gzip
import json
import math
from pathlib import Path

from audit_digit_ledgers import independent_decode,scan_independently
from digit_world import DigitWorld,MODES
from legacy_engine import Config,Entropy
from reactor import digest

DIRECTORY=Path('fresh_birth_41001')


def inspect(seed):
    row=json.loads((DIRECTORY/f'seed_{seed}.json').read_text())
    root=DigitWorld(Config(seed=seed,initial_agents=36,max_agents=180,max_genome=512),Entropy('seeded',seed))
    root.recovery_floor=8;root.pulse_renewal=.6;root.steering_mode='target';root.feedback_gain=1.8
    root.archive_mode='random';root.forecast_mode='learned';root.vector_mode='intact';root.cargo_policy='experienced'
    root.temporal_hold=3;root.salvage_feedback=True;root.temporal_retention=.85;root.portable_bets=True
    assert not root.archive and not root.corpses and digest(root.snapshot())==row['baseline']['state_sha256']
    start=len(root.log);n0=len(root.agents);checks=[]
    for mode in MODES:
        w=copy.deepcopy(root);w.parser_mode=mode;w.advance(until_time=row['horizon'])
        r=row['results'][mode];assert digest(w.snapshot())==r['state_sha256'] and digest(w.log)==r['event_sha256']
        events=w.log[start:];pop=n0;last=0.;area=0.;count=collections.Counter()
        for e in events:
            if e['event'] in ('birth','death'):
                t=min(row['horizon'],max(0.,e['time']));area+=max(0.,t-last)*pop;last=t
                pop+=1 if e['event']=='birth' else -1
        area+=max(0.,row['horizon']-last)*pop
        assert math.isclose(area,r['agent_time'],rel_tol=1e-10,abs_tol=1e-7) and pop==r['final_living']
        assert math.isclose(sum(e['intake'] for e in events if e['event']=='field_harvest'),r['total_field_uptake'],abs_tol=1e-8)
        for i,e in enumerate(events):
            if e['event']!='digit_decode':continue
            assert i+2<len(events);forage,execute=events[i+1],events[i+2]
            assert forage['event']=='field_harvest' and execute['event']=='execute' and forage['agent']==execute['agent']==e['agent']
            decision=independent_decode(execute['genome'],execute['ip'],execute['zone'],mode)
            assert decision==e['decision'];count['decodes']+=1
            if decision['nop']:
                assert forage.get('neutralized') and events[i+3]['event']=='digit_nop' and events[i+3]['agent']==e['agent']
                count['noops']+=1
        for item in r['mutation_created_records']:
            event=w.log[item['event_index']];assert event['event']=='genome_mutation'
            assert all(event[k]==item[k] for k in ('time','agent','zone','position','reason','before','after'))
            old={(s[1],s[4]) for s in scan_independently(event['before']) if s[0]=='intron'}
            new={(s[1],s[4]) for s in scan_independently(event['after']) if s[0]=='intron'}
            assert (item['start'],item['end']) in new-old
        assert not any('origins' in e or 'origin_history' in e for e in w.log)
        if seed==41001 and mode=='self':
            with gzip.open(DIRECTORY/f'ledger_{seed}_{mode}.jsonl.gz','wt') as f:
                for event in w.log:f.write(json.dumps(event,sort_keys=True)+'\n')
        checks.append({'mode':mode,'events':len(w.log),'decodes_verified':count['decodes'],
                       'noops_verified':count['noops'],'mutation_spans':r['mutation_created_intron_spans']})
    return {'seed':seed,'branches':len(MODES),'checks':checks}


def main():
    rows=[inspect(s) for s in (41001,41015,41030)]
    out={'status':'pass','seeds':len(rows),'branches':sum(r['branches'] for r in rows),
         'decodes_verified':sum(c['decodes_verified'] for r in rows for c in r['checks']),
         'noops_verified':sum(c['noops_verified'] for r in rows for c in r['checks']),'runs':rows}
    (DIRECTORY/'ledger_audit.json').write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
    print(json.dumps({k:out[k] for k in ('status','seeds','branches','decodes_verified','noops_verified')}))


if __name__=='__main__':main()
