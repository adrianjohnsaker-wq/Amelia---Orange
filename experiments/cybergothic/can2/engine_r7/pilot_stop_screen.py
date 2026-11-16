"""Exploratory screening of natural viral encounters; not an outcome test."""
import json
from collections import Counter

from digit_world import DigitWorld, parse_genome, decode
from legacy_engine import Config, Entropy, signature


def create_world(seed,cls=DigitWorld):
    w=cls(Config(seed=seed,initial_agents=36,max_agents=180,max_genome=512),Entropy('seeded',seed))
    w.recovery_floor=8;w.pulse_renewal=.6;w.steering_mode='target';w.feedback_gain=1.8
    w.archive_mode='random';w.forecast_mode='learned';w.vector_mode='intact';w.cargo_policy='experienced'
    w.temporal_hold=3;w.salvage_feedback=True;w.temporal_retention=.85;w.portable_bets=True
    return w


def candidates(e):
    """Return unambiguous signature-preserving stop edits at real direct infections."""
    if e['event']!='infection':return []
    before=e['before']; payload=e['payload']; ip=e['target_ip']; zone=e['zone']
    if len(e['after'])!=len(before)+len(payload):return []
    out=[]
    for kind,start,body,stop,end,header in parse_genome(before):
        if kind!='intron' or stop<=body or ip==stop+1:continue
        assert before[stop:stop+2]=='09'
        broken=before[:stop]+'00'+before[stop+2:]
        assert signature(before)==signature(broken)
        # Do not accept edits which leave all pre-existing body digits silent.
        before_exposed=sum(not decode(broken,j,zone,'self')['nop'] for j in range(body,stop))
        intact_after=before[:ip]+payload+before[ip:]
        broken_after=broken[:ip]+payload+broken[ip:]
        mapped=[j if j<ip else j+len(payload) for j in range(body,stop)]
        after_exposed=sum(decode(intact_after,j,zone,'self')['nop'] and
                          not decode(broken_after,j,zone,'self')['nop'] for j in mapped)
        if before_exposed and after_exposed:
            out.append({'start':start,'body':body,'stop':stop,'end':end,
                        'before_exposed':before_exposed,'after_exposed':after_exposed})
    return out


def summarize(seed,horizon=180):
    w=create_world(seed);w.advance(until_time=horizon)
    c=Counter(); examples=[]
    for e in w.log:
        if e['event'] not in ('infection','vector_infection'):continue
        c[e['event']]+=1
        before=e['before'];after=e['after'];ip=e.get('target_ip',e.get('ip'))
        b=[s for s in parse_genome(before) if s[0]=='intron']
        a=[s for s in parse_genome(after) if s[0]=='intron']
        if b:
            c[e['event']+'_host_with_intron']+=1
            for span in b:
                if ip==span[3]+1:c[e['event']+'_insertion_splits_stop']+=1
        if len(a)>len(b):c[e['event']+'_intron_count_increase']+=1
        if len(a)<len(b):c[e['event']+'_intron_count_decrease']+=1
        ca=candidates(e)
        if ca:
            c['eligible_events']+=1
            if len(examples)<3:examples.append({'action':e['action'],'time':e['time'],
                'target':e['target'],'attacker':e['attacker'],'ip':ip,'payload':e['payload'],
                'before':before,'after':after,'spans':ca})
    return {'seed':seed,'counts':dict(c),'examples':examples}


if __name__=='__main__':
    from concurrent.futures import ProcessPoolExecutor
    with ProcessPoolExecutor(max_workers=4) as pool:
        out=list(pool.map(summarize,range(41101,41109)))
    print(json.dumps(out,indent=2,sort_keys=True))
