"""Independently recompute selected recipient outcomes from complete event logs."""
import collections
import copy
import gzip
import json
import math
from pathlib import Path

from encounter_trial import find_encounter, finish_delivery
from reactor import digest
from strict_trial import create_strict_root
from viral_echo_study import ARMS, HORIZONS, run_branch

DIRECTORY=Path('fresh_echo_34001')


def selected(seed):
    row=json.loads((DIRECTORY/f'seed_{seed}.json').read_text())
    w=create_strict_root(seed)
    assert digest(w.snapshot())==row['root_hash']
    seen=set();excluded=collections.Counter();checked=0;audited=[]
    for phase,limit in (('before',90.),('after',198.)):
        if phase=='after':w.advance(until_time=126.)
        for t in [t for t in row['trials'] if t['phase']==phase]:
            while True:
                e=find_encounter(w,seen,w.contacted_packets,limit,excluded)
                assert e is not None
                if w.packets[e.packet]['candidate_info']['selection_had_experience']:break
                excluded['no_donor_experience']+=1
                finish_delivery(w,e.packet,e.recipient)
            assert (e.packet,e.recipient,e.zone,e.source,e.time)==(t['packet'],t['host'],t['zone'],t['donor'],t['time'])
            assert digest(w.snapshot())==t['fork_digest']
            alts=copy.deepcopy(w.packets[e.packet]['alternatives']);assert alts==t['alternatives']
            for arm in ARMS:
                result,clone=run_branch(w,e,alts,arm,return_world=True)
                assert json.loads(json.dumps(result,sort_keys=True))==t['outcomes'][arm]
                indices=[i for i,v in enumerate(clone.log) if v['event']=='trial_payload'
                         and v['packet']==e.packet and v['target']==e.recipient]
                assert len(indices)==1
                events=clone.log[indices[0]+1:]
                host_actions=[v for v in events if v['event']=='field_harvest' and v['agent']==e.recipient]
                assert len(host_actions)==len(result['actions'])
                for raw,s in zip(host_actions,result['actions']):
                    assert math.isclose(raw['time'],e.time+s['time'],rel_tol=0,abs_tol=1e-8)
                    assert (raw['digit'],raw['focus'],raw['intake'])==(s['digit'],s['focus'],s['intake'])
                delivered=[v for v in events if v['event']=='viral_echo' and v['agent']==e.recipient]
                recorded=[v for v in result['echoes'] if v['reason'] is None]
                assert len(delivered)==len(recorded)
                for raw,s in zip(delivered,recorded):
                    assert math.isclose(raw['time'],e.time+s['time'],rel_tol=0,abs_tol=1e-8)
                    assert (raw['code'],raw['ip'],raw['energy_cost'])==(s['code'],s['ip'],s['energy_cost'])
                for h in HORIZONS:
                    raw=[v for v in host_actions if v['time']<=round(e.time+h,9)]
                    assert math.isclose(sum(v['intake'] for v in raw),result['timepoints'][str(h)]['uptake'],abs_tol=1e-8)
                audited.append({'host':e.recipient,'packet':e.packet,'phase':phase,'arm':arm,
                                'event_sha256':result['event_sha256'],'host_actions':len(host_actions),
                                'echoes':len(delivered)})
                if seed==34001 and t['index']==0:
                    with gzip.open(DIRECTORY/f'selected_ledger_{seed}_{arm}.jsonl.gz','wt') as f:
                        for event in clone.log:f.write(json.dumps(event,sort_keys=True)+'\n')
                checked+=1
            finish_delivery(w,e.packet,e.recipient,t['continuation_assignment'],trial=True)
            seen.add(e.recipient)
    return {'seed':seed,'branches':checked,'checks':audited}


def main():
    rows=[selected(s) for s in (34001,34030,34060)]
    out={'status':'pass','seeds':len(rows),'branches':sum(r['branches'] for r in rows),'results':rows}
    (DIRECTORY/'selected_ledger_audit.json').write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
    print(json.dumps({k:out[k] for k in ('status','seeds','branches')}))


if __name__=='__main__':main()
