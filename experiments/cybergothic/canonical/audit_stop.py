"""Independently reconstruct selected trial effects from raw event ledgers."""
import argparse
import gzip
import json
from pathlib import Path

from stop_trial import ARMS,run_seed

OUT=Path('fresh_viral_stop_42001')


def intron_silent_indices(s):
    # Separate scan from the prototype's parser and trial eligibility functions.
    silent=set();i=0
    while i<len(s)-1:
        pair=s[i:i+2]
        if pair=='60':
            end=s.find('09',i+2)
            if end>=0:
                silent.update(range(i,end+2));i=end+2;continue
        elif pair=='80' and i+2<len(s):
            end=s.find('09',i+3)
            if end>=0:i=end+2;continue
        i+=1
    return silent


def verify_one(row,arm,ledger):
    p=row['selection'];target=p['target'];t0=row['fork']['time']
    markers=[(i,e) for i,e in enumerate(ledger) if e['event']=='trial_contact']
    assert len(markers)==1
    start,m=markers[0];assert m['arm']==arm and m['target']==target
    assert m['before']==p['before'] and m['payload']==p['payload']
    stop=p['span']['stop'];ip=p['target_ip']
    expected=m['before'][:stop]+'00'+m['before'][stop+2:] if arm.startswith('ruptured_') else m['before']
    assert m['edited']==expected
    assert sum(map(int,m['edited']))%9==sum(map(int,m['before']))%9
    assert m['transmitted']==expected[:ip]+m['payload']+expected[ip:]
    assert m['after']==(expected if arm.endswith('exposure') else m['transmitted'])
    silence=intron_silent_indices(m['transmitted'])
    if arm.startswith('ruptured_'):assert not any(i in silence for i in range(ip,ip+3))
    else:assert all(i in silence for i in range(ip,ip+3))
    nearest=[e for e in ledger[:start] if e['event']=='infection'][-1]
    assert nearest['attacker']==p['attacker'] and nearest['target']==target
    results={}
    for window,label in ((6,'short'),(24,'long')):
        events=[e for e in ledger[start+1:] if e['time']<=t0+window+0.0000000005]
        descendants={target};n_birth=n_direct=n_vector=n_shed=0
        for e in events:
            if e['event']=='birth' and e['parent'] in descendants:
                descendants.add(e['agent']);n_birth+=1
            elif e['event']=='infection' and e['attacker'] in descendants:n_direct+=1
            elif e['event']=='vector_infection' and e['donor'] in descendants:n_vector+=1
            elif e['event']=='vector_shed' and e['donor'] in descendants:n_shed+=1
        fields=[e for e in events if e['event']=='field_harvest' and e['agent']==target]
        executes=[e for e in events if e['event']=='execute' and e['agent']==target]
        first=executes[0] if executes else None
        no_op=bool(first and any(e['event']=='digit_nop' and e['agent']==target and e['action']==first['action'] for e in events))
        payload_first=bool(first and first['ip']==ip and first['genome'][ip:ip+3]==p['payload'])
        survived=int(not any(e['event']=='death' and e['agent']==target for e in events))
        observed={'survived':survived,'first_action_nutrient':fields[0]['intake'] if fields else 0.,
                  'first_action_performed':int(bool(first)),'first_action_nop':int(no_op),
                  'first_action_reads_payload':int(payload_first),'target_actions':len(executes),
                  'total_target_nutrient':round(sum(e['intake'] for e in fields),9),
                  'descendant_births':n_birth,'lineage_direct_transmissions':n_direct,
                  'lineage_vector_deliveries':n_vector,'lineage_vector_sheds':n_shed}
        saved=row['outputs'][arm][label]
        for k,v in observed.items():assert abs(saved[k]-v)<1e-8,(p['action'],arm,label,k,saved[k],v)
        results[label]={'events':len(events),'target_actions':len(executes)}
    return results


def main():
    p=argparse.ArgumentParser();p.add_argument('--directory',type=Path,default=OUT)
    p.add_argument('--populations',type=int,default=10);p.add_argument('--retain',type=int,default=2)
    args=p.parse_args();directory=args.directory
    rows=[json.loads(p.read_text()) for p in sorted(directory.glob('seed_*.json'))]
    chosen=[r for r in rows if r['eligible']][:args.populations]
    results=[]
    for j,row in enumerate(chosen):
        rerun=run_seed(row['seed'],retain=True);ledgers=rerun.pop('ledgers')
        assert json.loads(json.dumps({**rerun,'ledgers':{}},sort_keys=True))==row
        check={}
        for arm in ARMS:
            check[arm]=verify_one(row,arm,ledgers[arm])
            if j<args.retain:
                with open(directory/f"ledger_{row['seed']}_{arm}.jsonl.gz",'wb') as raw:
                    with gzip.GzipFile(fileobj=raw,mode='wb',mtime=0) as stream:
                        for event in ledgers[arm]:
                            stream.write((json.dumps(event,sort_keys=True,separators=(',',':'))+'\n').encode())
        results.append({'seed':row['seed'],'branches':check})
        print('audited population',row['seed'],flush=True)
    out={'status':'pass','populations':len(chosen),'branches':len(chosen)*len(ARMS),'results':results}
    (directory/'ledger_audit.json').write_text(json.dumps(out,indent=2,sort_keys=True)+'\n')
    print(json.dumps({k:out[k] for k in ('status','populations','branches')}))


if __name__=='__main__':main()
