"""Exploratory audit of multi-hop G ancestry, using saved occurrence nodes."""
import argparse
import base64
import gzip
import json
import sys
import zlib
from collections import Counter
from pathlib import Path


def recorded_root(births,host):
    """Follow fission parent or the recorded archive source to an initial host."""
    seen=set();current=int(host)
    while current is not None:
        if current in seen or current not in births:return None
        seen.add(current);birth=births[current];parent=birth['parent']
        if parent is None:
            lineage=birth.get('lineage',current)
            if lineage is None or lineage==current:return current
            parent=lineage
        current=parent
    return None


def trace(nodes,occurrence,founder_occurrence,event_zero):
    seen=set();hops={};necrotic=[];splices=[];current=occurrence
    while current!=founder_occurrence:
        if current is None or current in seen:raise ValueError('occurrence path does not reach the focal graft')
        seen.add(current);node=nodes[current];route=node['route'];event=node.get('event',-1)
        if event>event_zero and route in ('viral_direct','viral_vector'):
            hops[(event,str(node['target']))]={'event_seq':event,'recipient':str(node['target']),'route':route}
        if event>event_zero and (route.startswith('corpse_') or route in ('archive_store','reconstitute','necrotic_reinject','scavenge')):
            necrotic.append({'event_seq':event,'route':route})
        if event>event_zero and route=='time_splice':splices.append(event)
        current=node['parent']
    return {'viral_hops':sorted(hops.values(),key=lambda x:(x['event_seq'],x['recipient'])),
            'necrotic_path':necrotic,'time_splice_events':sorted(set(splices))}


def main():
    p=argparse.ArgumentParser();p.add_argument('--lab',type=Path,required=True)
    p.add_argument('--run-dir',type=Path,required=True);p.add_argument('--output',type=Path,required=True)
    a=p.parse_args();sys.path.insert(0,str(a.lab.resolve()));from cohort_analysis import wilson
    from classify import kin,path_to
    from digit_world import parse_genome
    from observer import ShadowObserver
    m=json.loads((a.run_dir/'cohort_manifest.json').read_text());audit=json.loads((a.run_dir/'archive_audit.json').read_text())
    seeds=m['selected_seeds'];n=len(seeds)
    if audit['status']!='pass' or audit['populations']!=n or audit['branches']!=5*n:raise ValueError('full archive audit required')
    rows=[];horizon_records=[];mechanisms=Counter();relations=Counter();multihop=0;necro=0;different_roots=0;checked_events=0
    for seed in seeds:
        with gzip.open(a.run_dir/f'seed_{seed}.json.gz','rt') as f:row=json.load(f)
        branch=row['branches']['natural'];deliveries=branch['classification']['deliveries']
        if not deliveries and not branch['classification']['carriers']:continue
        shadow=json.loads(zlib.decompress(base64.b64decode(branch['shadow_zlib_base64'])))
        observer=ShadowObserver.restore(shadow);g=row['graft'];nodes=shadow['nodes'];chains=[];carriers=[]
        for host,tape in observer.agents.items():
            if host==g['founder']:continue
            paths=[]
            for span in parse_genome(observer.digits(tape)):
                if span[0]!='intron':continue
                edge=tape.edges[span[3]]
                if nodes[edge]['root']!=g['graft_edge']:continue
                path=path_to(nodes,edge,g['graft_occurrence'])
                if path is None:continue
                paths.append({'routes':path,'viral':any(x in ('viral_direct','viral_vector') for x in path)})
            if paths:
                carriers.append({'host':host,'descendant_of_founder':kin(observer.parents,host,g['founder']),
                                 'paths':paths})
        if carriers:horizon_records.append({'seed':seed,'carriers':carriers})
        if not deliveries:continue
        events=json.loads(zlib.decompress(base64.b64decode(branch['primary_events_zlib_base64'])))
        births={e['agent']:e for e in events if e['event']=='birth'}
        founder_root=recorded_root(births,g['founder'])
        for delivery in deliveries:
            lineage=trace(nodes,delivery['occurrence'],g['graft_occurrence'],g['event_seq'])
            if not any(h['event_seq']==delivery['event_seq'] for h in lineage['viral_hops']):
                raise AssertionError((seed,delivery['event_seq'],'delivery absent from ancestry'))
            recipients={x['recipient'] for x in lineage['viral_hops'] if x['recipient']!=str(g['founder'])}
            lineage['two_or_more_distinct_secondary_recipients']=len(recipients)>=2
            lineage['delivery_event_seq']=delivery['event_seq'];lineage['delivery_recipient']=delivery['recipient']
            recipient_root=recorded_root(births,delivery['recipient'])
            relation=('unknown' if founder_root is None or recipient_root is None else
                      'different_recorded_roots' if founder_root!=recipient_root else 'same_recorded_root')
            lineage['founder_recorded_root']=founder_root;lineage['recipient_recorded_root']=recipient_root
            lineage['recorded_root_relation']=relation;relations[relation]+=1
            chains.append(lineage);mechanisms[delivery['mechanism']]+=1;checked_events+=1
        two=any(x['two_or_more_distinct_secondary_recipients'] for x in chains)
        via_necro=any(x['necrotic_path'] for x in chains);multihop+=two;necro+=via_necro
        different_roots+=any(x['recorded_root_relation']=='different_recorded_roots' for x in chains)
        rows.append({'seed':seed,'delivery_events':len(deliveries),'multi_hop':two,
                     'a_delivery_ancestry_includes_necrotic_route':via_necro,'chains':chains})
    inclusive_viral=[r for r in horizon_records if any(not c['descendant_of_founder'] and any(p['viral'] for p in c['paths']) for c in r['carriers'])]
    out={'status':'analysed','populations':n,'delivery_events_checked':checked_events,
         'delivery_mechanisms':dict(mechanisms),'multihop_distinct_secondary_recipients':wilson(multihop,n),
         'viral_delivery_with_necrotic_ancestry':wilson(necro,n),'populations_with_events':len(rows),'records':rows,
         'recorded_root_relations':dict(relations),
         'viral_delivery_to_different_recorded_root':wilson(different_roots,n),
         'horizon_original_recognised_any_route':wilson(len(horizon_records),n),
         'horizon_nondescendant_carrier_with_viral_ancestry':wilson(len(inclusive_viral),n),
         'horizon_records':horizon_records,
         'interpretation':'Exploratory lineage description; transfer paths depend on host ecology and do not alone establish autonomous or advantageous replication.'}
    a.output.write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
    print(json.dumps({'status':'analysed','populations':n,'delivery_events_checked':checked_events,
                      'multi_hop_populations':multihop,'necrotic_ancestry_populations':necro}))


if __name__=='__main__':main()
