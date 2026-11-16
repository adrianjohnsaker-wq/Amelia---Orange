"""Trace a specific focal adjacency without using digit matches as ancestry."""
from collections import Counter
from math import ceil

from digit_world import parse_genome


def chain(nodes,occurrence):
    seen=set();out=[]
    while occurrence is not None:
        if occurrence in seen:raise ValueError('cycle in shadow occurrence graph')
        seen.add(occurrence);out.append(occurrence)
        occurrence=nodes[occurrence]['parent']
    return out


def path_to(nodes,occurrence,ancestor):
    out=[]
    for item in chain(nodes,occurrence):
        if item==ancestor:return out
        out.append(nodes[item]['route'])
    return None


def kin(parents,host,founder):
    seen=set()
    while host is not None and host not in seen:
        if host==founder:return True
        seen.add(host);host=parents.get(host)
    return False


def inherited_fraction(nodes,original,current):
    """One-to-one monotone alignment of descendants of t0 occurrences."""
    ancestries=[set(chain(nodes,x)) for x in current]
    previous=[0]*(len(current)+1)
    for ancestor in original:
        row=[0]
        for j,history in enumerate(ancestries,1):
            row.append(max(previous[j],row[j-1],previous[j-1]+int(ancestor in history)))
        previous=row
    return previous[-1],len(original)


def classify(observer,world,graft):
    nodes=observer.nodes;founder=graft['founder'];edge_root=graft['graft_edge']
    focal=graft['focal_occurrences'];occ0=graft['graft_occurrence'];seq0=graft['event_seq']
    categories=Counter();carriers=[];matches=[]
    for ident,tape in observer.agents.items():
        if ident==founder:continue
        genome=observer.digits(tape);host_matches=[];host_carriers=[]
        for span in parse_genome(genome):
            if span[0]!='intron':continue
            start,stop,end=span[1],span[3],span[4]
            occurrence=tape.edges[stop];edge=nodes[occurrence]
            overlap,total=inherited_fraction(nodes,focal,tape.atoms[start:end])
            if genome[start:end]==graft['sequence']:
                relation=('G_DESCENDANT' if edge['root']==edge_root and path_to(nodes,occurrence,occ0) is not None
                          else 'ZERO_FOCAL' if overlap==0 else 'PARTIAL_OR_REASSEMBLED')
                prior_ancestry=any(path_to(nodes,occurrence,prior) is not None
                                   for prior in graft['baseline_lookalike_edges'])
                host_matches.append({'host':ident,'relation':relation,'focal_overlap':overlap,
                    'focal_total':total,'preexisting_lookalike':ident in graft['baseline_lookalike_hosts'],
                    'preexisting_lookalike_ancestry':prior_ancestry})
            if edge['root']!=edge_root:
                start_path=path_to(nodes,tape.edges[start],graft['focal_start_occurrence'])
                records=[d for d in observer.drift_records
                         if d['new_edge_root']==edge['root'] and
                         path_to(nodes,occurrence,d['new_edge_occurrence']) is not None]
                if start_path is not None and records:
                    host_carriers.append({'host':ident,'category':'DRIFT_REPAIR',
                        'drift_events':sorted({d['event_seq'] for d in records}),
                        'focal_overlap':overlap,'focal_total':total,
                        'strict_80_percent':overlap>=ceil(.8*total)})
                continue
            path=path_to(nodes,occurrence,occ0)
            if path is None:
                host_carriers.append({'host':ident,'category':'UNKNOWN'});continue
            family=kin(observer.parents,ident,founder);viral=any(r in ('viral_direct','viral_vector') for r in path)
            necro=any(r.startswith('corpse_') or r in ('archive_store','reconstitute','necrotic_reinject','scavenge') for r in path)
            temporal=any(r in ('replay','chrono_recall') for r in path)
            spliced='time_splice' in path
            if necro:category='NECROTIC'
            elif spliced:category='TIME_SPLICE'
            elif temporal:category='CHRONO_RECALL'
            elif viral:category='MIXED_VERTICAL_HORIZONTAL' if family else 'TRUE_HORIZ_NONKIN'
            elif family and overlap>=ceil(.8*total):category='TRUE_VERT_ONLY'
            elif family:category='VERTICAL_JUNCTION_ONLY'
            else:category='OTHER'
            host_carriers.append({'host':ident,'category':category,'routes':path,
                'family':family,'viral_path':viral,'focal_overlap':overlap,'focal_total':total,
                'strict_80_percent':overlap>=ceil(.8*total)})
        if host_carriers:
            priority={'MIXED_VERTICAL_HORIZONTAL':0,'TRUE_HORIZ_NONKIN':1,'TRUE_VERT_ONLY':2,
                      'VERTICAL_JUNCTION_ONLY':3,'DRIFT_REPAIR':4,'NECROTIC':5,'TIME_SPLICE':6,
                      'CHRONO_RECALL':7,'OTHER':8,'UNKNOWN':9}
            best=min(host_carriers,key=lambda x:(priority[x['category']],-x.get('focal_overlap',0)))
            best={**best,'carrier_occurrences':len(host_carriers),
                  'all_occurrence_categories':sorted({x['category'] for x in host_carriers})}
            categories[best['category']]+=1;carriers.append(best)
        if host_matches:
            order={'G_DESCENDANT':0,'PARTIAL_OR_REASSEMBLED':1,'ZERO_FOCAL':2}
            matches.append(min(host_matches,key=lambda x:order[x['relation']]))
    relevant=[d for d in observer.viral_deliveries if d['edge_root']==edge_root and d['event_seq']>seq0]
    deliveries=list({(d['event_seq'],d['recipient'],d['mechanism']):d for d in relevant}.values())
    nonkin=[d for d in deliveries if d['recipient']!=founder and not kin(observer.parents,d['recipient'],founder)]
    return {'graft_edge':edge_root,'founder':founder,'alive_founder':founder in world.agents,
            'categories':dict(categories),'carriers':carriers,'exact_matches':matches,
            'verified_viral_delivery_events':len(deliveries),
            'unique_viral_recipients':len({d['recipient'] for d in deliveries}),
            'verified_nonkin_viral_events':len(nonkin),
            'unique_nonkin_viral_recipients':len({d['recipient'] for d in nonkin}),
            'deliveries':deliveries}


def homologous_edge_carriers(observer,edge_root,edge_occurrence,founder):
    """A G or edited G* marker, irrespective of the parser's stop status."""
    found=[]
    for host,tape in observer.agents.items():
        if host==founder:continue
        paths=[]
        for occurrence in tape.edges:
            if observer.nodes[occurrence]['root']!=edge_root:continue
            path=path_to(observer.nodes,occurrence,edge_occurrence)
            if path is None:continue
            viral=any(x in ('viral_direct','viral_vector') for x in path)
            vertical=kin(observer.parents,host,founder) and 'fission' in path
            if viral or vertical:paths.append({'viral':viral,'vertical':vertical,'routes':path})
        if paths:found.append({'host':host,'paths':paths})
    return found
