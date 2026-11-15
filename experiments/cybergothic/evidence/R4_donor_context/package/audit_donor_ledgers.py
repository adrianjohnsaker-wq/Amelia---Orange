"""Independently inspect selected donor histories and raw branch ledgers."""
import collections
import copy
import gzip
import json
import math
from pathlib import Path

from donor_context_study import ARMS,context_allowed,donor_provenance,run_branch
from encounter_trial import find_encounter,finish_delivery
from reactor import digest
from strict_trial import create_strict_root

DIRECTORY=Path('fresh_donor_36001')


def independent_history(w,packet,record):
    motif=packet['alternatives']['experienced']['code'];donor=packet['donor']
    shed=[i for i,e in enumerate(w.log) if e['event']=='vector_shed' and e.get('packet')==packet['id']]
    assert len(shed)==1 and shed[0]==record['shed_event']
    history=[];harvest=None
    for i,e in enumerate(w.log[:shed[0]]):
        if e.get('agent')!=donor:continue
        if e['event']=='field_harvest':harvest=(i,e)
        elif e['event']=='execute':
            assert harvest is not None
            hi,h=harvest;harvest=None
            if (e['genome']+e['genome'])[e['ip']:e['ip']+len(motif)]==motif:
                history.append({'forage_event':hi,'execute_event':i,'time':e['time'],
                    'zone':e['zone'],'syzygy':9-e['zone'],'intake':h['intake'],'ip':e['ip'],'code':motif})
    assert history==record['samples']
    assert all(x['execute_event']<shed[0] for x in history)
    assert len(history)==packet['candidate_info']['experienced_observations'][0]
    assert math.isclose(sum(x['intake'] for x in history),packet['candidate_info']['experienced_observations'][1],abs_tol=1e-7*len(history))


def selected(seed):
    row=json.loads((DIRECTORY/f'seed_{seed}.json').read_text())
    w=create_strict_root(seed);assert digest(w.snapshot())==row['root_hash']
    seen=set();excluded=collections.Counter();checked=chosen=noops=jumped=0;items=[]
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
                prov=donor_provenance(w,p)
                if prov['peak_intake']<=0:
                    excluded['no_positive_donor_uptake']+=1;finish_delivery(w,e.packet,e.recipient);continue
                break
            assert (e.packet,e.recipient,e.zone,e.source,e.time)==(t['packet'],t['host'],t['zone'],t['donor'],t['time'])
            assert digest(w.snapshot())==t['fork_digest'] and alts==t['alternatives'] and prov==t['provenance']
            independent_history(w,p,prov)
            for arm in ARMS:
                result,clone,_=run_branch(w,e,alts,prov['productive_zone'],arm,return_world=True)
                assert json.loads(json.dumps(result,sort_keys=True))==t['outcomes'][arm]
                starts=[i for i,v in enumerate(clone.log) if v['event']=='trial_payload' and v['packet']==e.packet and v['target']==e.recipient]
                assert len(starts)==1
                events=clone.log[starts[0]+1:]
                raw=[v for v in events if v['event']=='field_harvest' and v['agent']==e.recipient]
                recorded=[v for v in result['actions'] if not v['quiescent']]
                assert len(raw)==len(recorded)
                for a,b in zip(raw,recorded):
                    assert math.isclose(a['time'],e.time+b['time'],rel_tol=0,abs_tol=1e-8)
                    assert (a['digit'],a['focus'],a['intake'])==(b['digit'],b['focus'],b['intake'])
                    assert bool(a.get('neutralized',False))==(b['selection']['kind']=='nop')
                pending={};c_count=n_count=j_count=0
                for i,event in enumerate(events):
                    kind=event['event'];ident=event.get('agent')
                    if kind=='context_decision':
                        assert ident not in pending;pending[ident]=event
                        for s in event['choice']['skipped']:
                            if s['kind']=='payload':
                                assert not context_allowed(result['mode'],s['header'],event['zone'],result['offset']);j_count+=1
                    elif kind=='execute' and ident in pending:
                        decision=pending.pop(ident);c=decision['choice'];assert c['ip']==event['ip']
                        if c['kind'] in ('payload','nop') and c.get('header') is not None:
                            assert int(event['genome'][event['ip']-c['offset']])==c['header']
                            allowed=context_allowed(result['mode'],c['header'],event['zone'],result['offset'])
                            assert allowed==(c['kind']=='payload')
                        if c['kind']=='payload':c_count+=1
                        elif c['kind']=='nop':
                            assert i+1<len(events) and events[i+1]['event']=='promoter_nop'
                            assert events[i+1]['agent']==ident and events[i+1]['ip']==event['ip'];n_count+=1
                    elif kind=='promoter_quiescent' and ident in pending:
                        assert pending.pop(ident)['choice']['kind']=='quiescent'
                assert not pending
                echoes=[v for v in events if v['event']=='promoter_echo' and v['agent']==e.recipient]
                records=[v for v in result['echoes'] if v['reason'] is None]
                assert len(echoes)==len(records)
                for a,b in zip(echoes,records):assert (a['code'],a['ip'],a['cost'])==(b['code'],b['ip'],b['cost'])
                for h in (3,6,12,24,36):
                    total=sum(v['intake'] for v in raw if v['time']<=round(e.time+h,9))
                    assert math.isclose(total,result['timepoints'][str(h)]['uptake'],abs_tol=1e-8)
                if seed==36001 and t['index']==0:
                    with gzip.open(DIRECTORY/f'ledger_{seed}_{arm}.jsonl.gz','wt') as f:
                        for event in clone.log:f.write(json.dumps(event,sort_keys=True)+'\n')
                items.append({'seed':seed,'phase':phase,'host':e.recipient,'arm':arm,
                              'event_sha256':result['event_sha256'],'forages':len(raw),
                              'payload_expressions':c_count,'neutral_noops':n_count,'jumped_positions':j_count})
                chosen+=c_count;noops+=n_count;jumped+=j_count;checked+=1
            finish_delivery(w,e.packet,e.recipient,t['continuation_assignment'],trial=True);seen.add(e.recipient)
    return {'seed':seed,'branches':checked,'payload_expressions':chosen,'neutral_noops':noops,
            'jumped_positions':jumped,'items':items}


def main():
    rows=[selected(s) for s in (36001,36030,36060)]
    out={'status':'pass','seeds':len(rows),'branches':sum(r['branches'] for r in rows),
         'payload_expressions':sum(r['payload_expressions'] for r in rows),
         'neutral_noops':sum(r['neutral_noops'] for r in rows),
         'jumped_positions':sum(r['jumped_positions'] for r in rows),'results':rows}
    (DIRECTORY/'ledger_audit.json').write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
    print(json.dumps({k:out[k] for k in ('status','seeds','branches','payload_expressions','neutral_noops','jumped_positions')}))


if __name__=='__main__':main()
