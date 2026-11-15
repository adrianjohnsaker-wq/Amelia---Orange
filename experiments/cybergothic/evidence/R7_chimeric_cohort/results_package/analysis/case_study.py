"""Post-hoc exact provenance path for a selected surviving recipient."""
import argparse
import base64
import gzip
import json
import sys
import zlib
from pathlib import Path


def main():
    p=argparse.ArgumentParser();p.add_argument('--lab',type=Path,required=True)
    p.add_argument('--run-dir',type=Path,required=True);p.add_argument('--seed',type=int,required=True)
    p.add_argument('--host',type=int,required=True);p.add_argument('--output',type=Path,required=True);a=p.parse_args()
    sys.path.insert(0,str(a.lab.resolve()));from digit_world import parse_genome
    from observer import ShadowObserver
    with gzip.open(a.run_dir/f'seed_{a.seed}.json.gz','rt') as f:row=json.load(f)
    branch=row['branches']['natural'];g=row['graft']
    shadow=json.loads(zlib.decompress(base64.b64decode(branch['shadow_zlib_base64'])))
    observer=ShadowObserver.restore(shadow);tape=observer.agents[a.host];genome=observer.digits(tape)
    spans=[s for s in parse_genome(genome) if s[0]=='intron' and
           observer.nodes[tape.edges[s[3]]]['root']==g['graft_edge']]
    if len(spans)!=1:raise ValueError('expected exactly one recognised focal stop in the selected host')
    span=spans[0];node=tape.edges[span[3]];path=[];seen=set()
    while node!=g['graft_occurrence']:
        if node is None or node in seen:raise ValueError('cannot trace selected occurrence')
        seen.add(node);x=observer.nodes[node]
        path.append({'event_seq':x.get('event'),'model_time':x.get('time'),'route':x['route'],
                     'source':x.get('source'),'target':x.get('target')})
        node=x['parent']
    path.reverse();deliveries=[d for d in branch['classification']['deliveries'] if d['recipient']==a.host]
    if not deliveries:raise ValueError('no verified delivery to selected host')
    horizon=g['dispatch'][0]+48.
    result={'status':'audited','selection':'Post-hoc: the only natural-branch living non-descendant carrier with viral ancestry at the horizon.',
        'seed':a.seed,'host':a.host,'founder':g['founder'],'graft_time':g['dispatch'][0],
        'horizon':horizon,'original_focal_sequence':g['sequence'],
        'recipient_recognised_intron':genome[span[1]:span[4]],'verified_deliveries':deliveries,
        'time_from_last_delivery_to_horizon':horizon-max(x['time'] for x in deliveries),
        'causal_path_from_graft':path,'saved_classification':next(x for x in branch['classification']['carriers'] if x['host']==a.host)}
    a.output.write_text(json.dumps(result,sort_keys=True,indent=2)+'\n')
    print(json.dumps({'status':'audited','seed':a.seed,'host':a.host,
                      'time_from_last_delivery_to_horizon':result['time_from_last_delivery_to_horizon']}))


if __name__=='__main__':main()
