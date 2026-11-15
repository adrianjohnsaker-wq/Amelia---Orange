"""Independently inspect selected digit parsing and population ledgers."""
import collections
import gzip
import json
import math
from pathlib import Path

from digit_study import make_root,run_seed
from digit_world import MODES


def scan_independently(genome):
    spans=[];i=0
    while i+1<len(genome):
        m=genome[i:i+2]
        if m not in ('80','60') or (m=='80' and i+2>=len(genome)):
            i+=1;continue
        body=i+(3 if m=='80' else 2);j=body
        while j+1<len(genome) and genome[j:j+2]!='09':j+=1
        if j+1>=len(genome):i+=1;continue
        spans.append(('gene' if m=='80' else 'intron',i,body,j,j+2,int(genome[i+2]) if m=='80' else None))
        i=j+2
    return spans


def independent_decode(genome,ip,zone,mode):
    if mode=='literal':return {'kind':'ordinary','nop':False}
    for kind,start,body,stop,end,header in scan_independently(genome):
        if start<=ip<end:
            if kind=='intron':return {'kind':'intron','nop':mode!='intron_active','start':start,'end':end}
            if not body<=ip<stop:return {'kind':'gene_regulatory','nop':True,'start':start,'end':end,'header':header}
            return {'kind':'gene_body','nop':not(mode=='promoter_open' or zone==header),'start':start,'end':end,'header':header}
    return {'kind':'ordinary','nop':False}


def intron_sequences(genome):
    return collections.Counter(genome[s[1]:s[4]] for s in scan_independently(genome) if s[0]=='intron')


def audit_seed(directory,seed):
    expected=json.loads((Path(directory)/f'seed_{seed}.json').read_text())
    root=make_root(seed);start=len(root.log);n0=len(root.agents);t0=root.now
    replay=run_seed(seed,expected['follow_time'],retain_logs=True)
    assert replay['baseline']==expected['baseline'] and replay['results']==expected['results']
    checks=[]
    for mode in MODES:
        log=replay['logs'][mode];events=log[start:];r=expected['results'][mode]
        assert not any('origins' in e or 'origin_history' in e for e in log)
        nutrient=sum(e['intake'] for e in events if e['event']=='field_harvest')
        assert math.isclose(nutrient,r['total_field_uptake'],abs_tol=1e-8)
        pop=n0;last=t0;area=0.
        for e in events:
            if e['event'] not in ('birth','death'):continue
            t=min(t0+expected['follow_time'],max(t0,e['time']))
            area+=max(0.,t-last)*pop;last=t
            pop+=1 if e['event']=='birth' else -1
        area+=max(0.,t0+expected['follow_time']-last)*pop
        assert math.isclose(area,r['agent_time'],rel_tol=1e-10,abs_tol=1e-7)
        assert pop==r['final_living']
        created=0;decodes=0;noops=0;transfer=collections.Counter()
        for i,e in enumerate(events):
            if e['event']=='genome_mutation':
                old={(s[1],s[4]) for s in scan_independently(e['before']) if s[0]=='intron'}
                new={(s[1],s[4]) for s in scan_independently(e['after']) if s[0]=='intron'}
                if e['before']!=e['after']:created+=len(new-old)
            if e['event'] in ('infection','vector_infection','scavenge'):
                pairs=[(e['before'],e['after'])]
            elif e['event']=='reinject':pairs=[(e['host_before'],e['host_after'])]
            elif e['event']=='timesplice':pairs=[(e['before_agent'],e['after_agent']),(e['before_target'],e['after_target'])]
            else:pairs=[]
            for before,after in pairs:
                transfer[e['event']]+=sum((intron_sequences(after)-intron_sequences(before)).values())
            if e['event']=='digit_decode':
                # In a single agent action the next harvest and execute events
                # are synchronous; verify the actual genome and suppression.
                assert i+2<len(events)
                forage,execute=events[i+1],events[i+2]
                assert forage['event']=='field_harvest' and execute['event']=='execute'
                assert forage['agent']==e['agent']==execute['agent']
                d=independent_decode(execute['genome'],execute['ip'],execute['zone'],mode)
                assert d==e['decision']
                if d['nop']:
                    assert forage.get('neutralized') is True
                    assert i+3<len(events) and events[i+3]['event']=='digit_nop' and events[i+3]['agent']==e['agent']
                    noops+=1
                decodes+=1
        assert created==r['mutation_created_intron_spans']
        assert dict(transfer)==r['transfer_added_intron_sequences']
        for record in r['mutation_created_records']:
            source=log[record['event_index']]
            assert source['event']=='genome_mutation'
            assert all(source[k]==record[k] for k in ('time','agent','zone','position','reason','before','after'))
            old={(s[1],s[4]) for s in scan_independently(source['before']) if s[0]=='intron'}
            new={(s[1],s[4]) for s in scan_independently(source['after']) if s[0]=='intron'}
            assert (record['start'],record['end']) in new-old
        if directory=='fresh_digit_39001' and (seed==39001 or (seed==39042 and mode=='self')):
            with gzip.open(Path(directory)/f'ledger_{seed}_{mode}.jsonl.gz','wt') as f:
                for e in log:f.write(json.dumps(e,sort_keys=True)+'\n')
        checks.append({'mode':mode,'events':len(log),'decodes_verified':decodes,'noops_verified':noops,
                       'mutation_new_spans':created,'agent_time':area,'field_uptake':nutrient})
    return {'study':directory,'seed':seed,'branches':len(MODES),'checks':checks}


def main():
    runs=[(d,s) for d,ss in (('fresh_digit_39001',(39001,39030,39042,39060)),
                              ('fresh_grammar_40001',(40001,40030,40060))) for s in ss]
    rows=[audit_seed(d,s) for d,s in runs]
    out={'status':'pass','seeds':len(rows),'branches':sum(r['branches'] for r in rows),
         'decodes_verified':sum(c['decodes_verified'] for r in rows for c in r['checks']),
         'noops_verified':sum(c['noops_verified'] for r in rows for c in r['checks']),'runs':rows}
    Path('digit_ledger_audit.json').write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
    print(json.dumps({k:out[k] for k in ('status','seeds','branches','decodes_verified','noops_verified')}))


if __name__=='__main__':main()
