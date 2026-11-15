"""Post-hoc descriptive classification of natural viral stop-boundary changes."""
import argparse
import json
from collections import Counter
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path

from digit_world import decode,parse_genome
from pilot_stop_screen import create_world


def scan(seed):
    w=create_world(seed);w.advance(until_time=180.)
    counts=Counter();examples=[]
    for e in w.log:
        kind=e['event']
        if kind not in ('infection','vector_infection'):continue
        before=e['before'];after=e['after'];ip=e['target_ip'] if kind=='infection' else e['ip']
        for s in parse_genome(before):
            if s[0]!='intron' or ip!=s[3]+1:continue
            counts[kind+'_stop_split']+=1
            following=[x for x in parse_genome(after) if x[0]=='intron' and x[1]==s[1]]
            if following and following[0][3]==s[3]:cat='reclosed_at_original_boundary'
            elif following and following[0][3]>s[3]:cat='closed_at_later_boundary'
            else:cat='original_start_unrecognised'
            counts[kind+'_'+cat]+=1
            released=sum(not decode(after,j,e['zone'],'self')['nop'] for j in range(s[2],s[3]))
            if released:counts[kind+'_released_original_body']+=1
            if len(examples)<30:
                examples.append({'seed':seed,'action':e['action'],'time':e['time'],'kind':kind,
                    'zone':e['zone'],'before':before,'after':after,'insertion_ip':ip,
                    'cargo':e['payload'] if kind=='infection' else e['code'],
                    'original_span':list(s),'later_span':list(following[0]) if following else None,
                    'category':cat,'original_body_digits_exposed':released})
    return {'seed':seed,'counts':dict(counts),'examples':examples}


def main():
    p=argparse.ArgumentParser();p.add_argument('--start',type=int,required=True)
    p.add_argument('--seeds',type=int,required=True);p.add_argument('--output',type=Path,required=True)
    a=p.parse_args();results=[]
    with ProcessPoolExecutor(max_workers=4) as pool:
        for i,f in enumerate(as_completed([pool.submit(scan,s) for s in range(a.start,a.start+a.seeds)]),1):
            results.append(f.result())
            if i%30==0:print(f'natural stop inventory: {i}/{a.seeds}',flush=True)
    counts=Counter();examples={}
    for r in sorted(results,key=lambda x:x['seed']):
        counts.update(r['counts'])
        for e in r['examples']:
            key=e['kind']+'_'+e['category']
            examples.setdefault(key,[])
            if len(examples[key])<3:examples[key].append(e)
    out={'status':'pass','populations':len(results),'start':a.start,
         'counts':dict(counts),'examples':examples}
    a.output.write_text(json.dumps(out,indent=2,sort_keys=True)+'\n')
    print(json.dumps({'populations':len(results),'counts':dict(counts)},sort_keys=True))


if __name__=='__main__':main()
