"""Descriptive reanalysis of already-inspected populations, not a cohort run.

Locate hybrid stop junctions via exact insertion coordinates only. This is not
ancestry tracking, and makes no claim about downstream spread or fitness.
"""
import json
from collections import Counter
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path

from digit_world import parse_genome
from pilot_stop_screen import create_world

RANGES=((42001,42121),(43001,43121),(44001,44301))


def candidates(e):
    if e['event'] not in ('infection','vector_infection'):return []
    before,after=e['before'],e['after']
    p=e['target_ip'] if e['event']=='infection' else e['ip']
    cargo=e['payload'] if e['event']=='infection' else e['code']
    # The design feasibility estimate counts only full, untruncated transfers.
    if after != before[:p]+cargo+before[p:]:return []
    old=parse_genome(before);new=parse_genome(after);q=p+len(cargo)
    output=[]
    for ns in new:
        if ns[0]!='intron' or ns[4]-ns[1]<6 or ns[1]>=p:continue
        stop=ns[3];left_viral=p<=stop<q;right_viral=p<=stop+1<q
        if left_viral==right_viral:continue
        # A mixed closure must comprise one inserted and one pre-existing digit.
        for j,isviral in ((stop,left_viral),(stop+1,right_viral)):
            if isviral:assert after[j]==cargo[j-p]
            else:
                original=j if j<p else j-len(cargo)
                assert after[j]==before[original]
        old_spans=[s for s in old if s[0]=='intron' and s[1]==ns[1]]
        if old_spans and p==old_spans[0][3]+1:
            form='split_existing_stop'
        else:
            s=ns[1]
            # A visible, unclosed 60 start has no following 09 in the original
            # genome and is not within an earlier parsed region.
            covered=any(t[1]<=s<t[4] for t in old)
            if (before[s:s+2]=='60' and before.find('09',s+2)<0 and not covered and p>s+1):
                form='close_open_frame'
            else:continue
        output.append({'kind':e['event'],'form':form,'time':e['time'],'action':e['action'],
                       'target':e['target'],'intron_length':ns[4]-ns[1],
                       'graft_start':ns[1],'graft_stop':ns[3],
                       'boundary_origins':['viral' if left_viral else 'recipient',
                                           'viral' if right_viral else 'recipient']})
    return output


def scan(seed):
    w=create_world(seed);w.advance(until_time=180.)
    out=[]
    for seq,event in enumerate(w.log,1):
        matches=candidates(event)
        for match in matches:match['event_seq']=seq
        out.extend(matches)
    return {'seed':seed,'eligible':bool(out),'count':len(out),'first':out[0] if out else None,
            'events_by_form':dict(Counter(x['form'] for x in out)),
            'events_by_mechanism':dict(Counter(x['kind'] for x in out))}


def main():
    seeds=[n for start,end in RANGES for n in range(start,end)]
    rows=[]
    with ProcessPoolExecutor(max_workers=4) as pool:
        for i,f in enumerate(as_completed([pool.submit(scan,s) for s in seeds]),1):
            rows.append(f.result())
            if i%90==0:print(f'scanned {i}/{len(seeds)} previously inspected populations',flush=True)
    rows.sort(key=lambda r:r['seed']);assert len(rows)==540
    hits=[r for r in rows if r['eligible']];events=sum(r['count'] for r in hits)
    forms=Counter();mechanisms=Counter()
    for r in rows:forms.update(r['events_by_form']);mechanisms.update(r['events_by_mechanism'])
    times=sorted(r['first']['time'] for r in hits)
    lengths=sorted(r['first']['intron_length'] for r in hits)
    quant=lambda a,q: a[min(len(a)-1,int(q*(len(a)-1)))] if a else None
    out={'status':'descriptive_previously_inspected_not_preregistered',
         'populations':len(rows),'eligible_populations':len(hits),'eligible_events':events,
         'eligibility_fraction':len(hits)/len(rows),'events_by_form':dict(forms),
         'events_by_mechanism':dict(mechanisms),
         'earliest_time_quantiles':{str(q):quant(times,q) for q in (.25,.5,.75,.9)},
         'first_span_length_quantiles':{str(q):quant(lengths,q) for q in (.25,.5,.75,.9)},
         'rows':rows}
    Path('historical_feasibility_540.json').write_text(json.dumps(out,indent=2,sort_keys=True)+'\n')
    print(json.dumps({k:v for k,v in out.items() if k!='rows'},indent=2,sort_keys=True))


if __name__=='__main__':main()
