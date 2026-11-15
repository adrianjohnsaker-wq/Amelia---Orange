"""Recompute selected outcomes and actual promoter expression from raw ledgers."""
import collections
import copy
import gzip
import json
import math
from pathlib import Path

from encounter_trial import find_encounter,finish_delivery
from promoter_study import ARMS,HORIZONS,allele_allowed,run_branch
from reactor import digest
from strict_trial import create_strict_root

DIRECTORY=Path('fresh_promoter_35001')


def selected(seed):
    row=json.loads((DIRECTORY/f'seed_{seed}.json').read_text())
    w=create_strict_root(seed);assert digest(w.snapshot())==row['root_hash']
    seen=set();excluded=collections.Counter();checked=0;verified_payload=0;verified_blocked=0;items=[]
    for phase,limit in (('before',90.),('after',198.)):
        if phase=='after':w.advance(until_time=126.)
        for t in [t for t in row['trials'] if t['phase']==phase]:
            while True:
                e=find_encounter(w,seen,w.contacted_packets,limit,excluded);assert e is not None
                p=w.packets[e.packet];alts=copy.deepcopy(p['alternatives'])
                if not p['candidate_info']['selection_had_experience']:
                    excluded['no_donor_experience']+=1;finish_delivery(w,e.packet,e.recipient);continue
                n=len(alts['experienced']['code'])
                if n!=4:
                    excluded['non_four_digit_payload']+=1;finish_delivery(w,e.packet,e.recipient);continue
                if len(w.agents[e.recipient].genome)+n+1>w.cfg.max_genome:
                    excluded['promoter_cap_would_truncate']+=1;finish_delivery(w,e.packet,e.recipient);continue
                break
            assert (e.packet,e.recipient,e.zone,e.source,e.time)==(t['packet'],t['host'],t['zone'],t['donor'],t['time'])
            assert digest(w.snapshot())==t['fork_digest'] and alts==t['alternatives']
            for arm in ARMS:
                result,clone,monitor=run_branch(w,e,alts,arm,return_world=True)
                assert json.loads(json.dumps(result,sort_keys=True))==t['outcomes'][arm]
                indices=[i for i,v in enumerate(clone.log) if v['event']=='trial_payload' and v['packet']==e.packet and v['target']==e.recipient]
                assert len(indices)==1
                events=clone.log[indices[0]+1:]
                raw_actions=[v for v in events if v['event']=='field_harvest' and v['agent']==e.recipient]
                recorded=[v for v in result['actions'] if not v['quiescent']]
                assert len(raw_actions)==len(recorded)
                for raw,s in zip(raw_actions,recorded):
                    assert math.isclose(raw['time'],e.time+s['time'],rel_tol=0,abs_tol=1e-8)
                    assert (raw['digit'],raw['focus'],raw['intake'])==(s['digit'],s['focus'],s['intake'])
                pending={};chosen=blocked=0
                for event in events:
                    kind=event['event'];ident=event.get('agent')
                    if kind=='promoter_decision':
                        assert ident not in pending;pending[ident]=event
                        for s in event['choice']['skipped']:
                            if s['kind']=='payload':
                                assert not allele_allowed(arm,s['header'],event['zone']);blocked+=1
                    elif kind=='execute' and ident in pending:
                        p=pending.pop(ident);choice=p['choice']
                        assert choice['ip']==event['ip']
                        if choice['kind']=='payload':
                            assert int(event['genome'][event['ip']-choice['offset']])==choice['header']
                            assert allele_allowed(arm,choice['header'],event['zone'])
                            assert int(event['genome'][event['ip']])==event['operand'];chosen+=1
                    elif kind=='promoter_quiescent' and ident in pending:
                        assert pending.pop(ident)['choice']['kind']=='quiescent'
                assert not pending
                delivered=[v for v in events if v['event']=='promoter_echo' and v['agent']==e.recipient]
                planned=[v for v in result['echoes'] if v['reason'] is None]
                assert len(delivered)==len(planned)
                for a,b in zip(delivered,planned):
                    assert math.isclose(a['time'],e.time+b['time'],rel_tol=0,abs_tol=1e-8)
                    assert (a['code'],a['ip'],a['cost'])==(b['code'],b['ip'],b['cost'])
                for h in HORIZONS:
                    raw=[v for v in raw_actions if v['time']<=round(e.time+h,9)]
                    assert math.isclose(sum(v['intake'] for v in raw),result['timepoints'][str(h)]['uptake'],abs_tol=1e-8)
                if seed==35001 and t['index']==0:
                    with gzip.open(DIRECTORY/f'ledger_{seed}_{arm}.jsonl.gz','wt') as f:
                        for event in clone.log:f.write(json.dumps(event,sort_keys=True)+'\n')
                items.append({'seed':seed,'phase':phase,'host':e.recipient,'arm':arm,
                              'event_sha256':result['event_sha256'],'host_forages':len(raw_actions),
                              'payload_expressions_verified':chosen,'blocked_positions_verified':blocked})
                verified_payload+=chosen;verified_blocked+=blocked;checked+=1
            finish_delivery(w,e.packet,e.recipient,t['continuation_assignment'],trial=True)
            seen.add(e.recipient)
    return {'seed':seed,'branches':checked,'payload_expressions':verified_payload,
            'blocked_positions':verified_blocked,'items':items}


def main():
    rows=[selected(s) for s in (35001,35030,35060)]
    out={'status':'pass','seeds':len(rows),'branches':sum(x['branches'] for x in rows),
         'payload_expressions':sum(x['payload_expressions'] for x in rows),
         'blocked_positions':sum(x['blocked_positions'] for x in rows),'results':rows}
    (DIRECTORY/'ledger_audit.json').write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
    print(json.dumps({k:out[k] for k in ('status','seeds','branches','payload_expressions','blocked_positions')}))


if __name__=='__main__':main()
