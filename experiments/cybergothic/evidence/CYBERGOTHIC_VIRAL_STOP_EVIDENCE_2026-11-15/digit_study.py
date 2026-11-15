"""Matched population experiments for a self-parsing digit-only ecology."""
from __future__ import annotations

import argparse
import copy
import json
import math
import statistics
from collections import Counter
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path

from digit_world import DigitWorld,MODES,parse_genome
from legacy_engine import Config,Entropy
from reactor import digest


def make_root(seed):
    w=DigitWorld(Config(seed=seed,initial_agents=36,max_agents=180,max_genome=1000000),Entropy('seeded',seed))
    w.parser_mode='literal'
    w.recovery_floor=8;w.pulse_renewal=.6;w.steering_mode='target';w.feedback_gain=1.8
    w.archive_mode='random';w.forecast_mode='learned';w.vector_mode='intact';w.cargo_policy='experienced'
    w.temporal_hold=3;w.salvage_feedback=True;w.temporal_retention=.85;w.portable_bets=True
    w.advance(until_time=30.)
    retained=[len(a.genome) for a in w.agents.values()]+[len(g) for a in w.agents.values() for g,_ in a.history]
    retained += [len(c['genome']) for c in w.archive.values()]
    if not w.agents or max(retained,default=0)>512:raise RuntimeError('invalid warm-up root')
    for ident in sorted(w.agents)[::2]:w.kill(w.agents[ident],'shared_ecological_shock')
    w.cfg.max_genome=512
    return w


def span_counts(genome):
    c=Counter(s[0] for s in parse_genome(genome))
    return {'gene':c['gene'],'intron':c['intron']}


def mutation_created_introns(event):
    before,after=event['before'],event['after']
    if len(before)!=len(after) or before==after:return []
    old={(s[1],s[4]) for s in parse_genome(before) if s[0]=='intron'}
    return [{'start':s[1],'end':s[4],'sequence':after[s[1]:s[4]]}
            for s in parse_genome(after) if s[0]=='intron' and (s[1],s[4]) not in old]


def intron_sequences(genome):
    return Counter(genome[s[1]:s[4]] for s in parse_genome(genome) if s[0]=='intron')


def changed_genomes(e):
    kind=e['event']
    if kind in ('infection','vector_infection','scavenge'):
        return [(e['before'],e['after'])]
    if kind=='reinject':return [(e['host_before'],e['host_after'])]
    if kind=='timesplice':return [(e['before_agent'],e['after_agent']),(e['before_target'],e['after_target'])]
    return []


def effective_diversity(genomes):
    if not genomes:return 0.
    counts=Counter(genomes);n=len(genomes)
    return math.exp(-sum((v/n)*math.log(v/n) for v in counts.values()))


def measure(world,start,initial_population,initial_genomes,t0,end,input0,spent0,nourishment0):
    events=world.log[start:];pop=initial_population;last=t0;area=0.;zero_episodes=0
    counters=Counter();mutation_records=[];transfer_new=Counter();before_cap=0
    for j,e in enumerate(events):
        when=min(end,max(t0,e['time']));area+=max(0.,when-last)*pop;last=when
        if e['event']=='birth':pop+=1
        elif e['event']=='death':
            pop-=1
            if pop==0:zero_episodes+=1
        if pop<0:raise AssertionError('negative population in event ledger')
        counters[e['event']]+=1
        if e['event']=='digit_decode':
            d=e['decision'];counters['decode_'+d['kind']]+=1
            if d['nop']:counters['noop_'+d['kind']]+=1
        if e['event']=='execute' and len(e['genome'])>=world.cfg.max_genome:before_cap+=1
        if e['event']=='genome_mutation':
            for item in mutation_created_introns(e):
                mutation_records.append({'event_index':start+j,'time':e['time'],'agent':e['agent'],
                    'zone':e['zone'],'position':e['position'],'reason':e['reason'],
                    'before':e['before'],'after':e['after'],**item})
        for before,after in changed_genomes(e):
            transfer_new[e['event']]+=sum((intron_sequences(after)-intron_sequences(before)).values())
    area+=max(0.,end-last)*pop
    if pop!=len(world.agents):raise AssertionError('population ledger mismatch')
    genomes=[a.genome for a in world.agents.values()]
    final_genes=sum(span_counts(g)['gene'] for g in genomes)
    final_introns=sum(span_counts(g)['intron'] for g in genomes)
    executed=[e for e in events if e['event']=='execute']
    novel={e['genome'] for e in executed if e['genome'] not in initial_genomes}
    mutations=[e for e in events if e['event']=='genome_mutation']
    return {'agent_time':area,'final_living':pop,'empty_at_horizon':not pop,
            'zero_population_episodes':zero_episodes,'total_field_uptake':sum(e['intake'] for e in events if e['event']=='field_harvest'),
            'external_nourishment':world.external_nourishment-nourishment0,
            'reactor_input':world.reactor_input-input0,'reactor_spent':world.reactor_spent-spent0,
            'archive_births':counters['reconstitute'],'births':counters['birth'],'deaths':counters['death'],
            'meltdowns':counters['meltdown'],'mutation_events':len(mutations),
            'mutation_created_intron_spans':len(mutation_records),'mutation_created_records':mutation_records,
            'transfer_added_intron_sequences':dict(transfer_new),
            'final_gene_spans':final_genes,'final_intron_spans':final_introns,
            'hosts_with_intron':sum(span_counts(g)['intron']>0 for g in genomes),
            'hosts_with_gene':sum(span_counts(g)['gene']>0 for g in genomes),
            'genome_diversity':effective_diversity(genomes),'novel_executed_genomes':len(novel),
            'distinct_executed_genomes':len({e['genome'] for e in executed}),
            'actions':len(executed),'cap_action_fraction':before_cap/len(executed) if executed else 0.,
            'decode_counts':dict(counters),'death_causes':dict(Counter(e['cause'] for e in events if e['event']=='death')),
            'environment_future':[e['signals'] for e in events if e['event']=='environment'],
            'event_sha256':digest(world.log),'state_sha256':digest(world.snapshot()),
            'log_length':len(world.log)}


def run_seed(seed,follow_time=120.,retain_logs=False):
    root=make_root(seed);common=digest(root.snapshot());start=len(root.log);n0=len(root.agents);t0=root.now
    initial={a.genome for a in root.agents.values()}
    baseline={'living':n0,'gene_spans':sum(span_counts(g)['gene'] for g in (a.genome for a in root.agents.values())),
              'intron_spans':sum(span_counts(g)['intron'] for g in (a.genome for a in root.agents.values())),
              'hosts_with_intron':sum(span_counts(a.genome)['intron']>0 for a in root.agents.values()),
              'initial_unique_genomes':len(initial),'state_sha256':common}
    results={};logs={}
    for mode in MODES:
        w=copy.deepcopy(root)
        assert digest(w.snapshot())==common
        w.parser_mode=mode
        w.advance(until_time=t0+follow_time)
        results[mode]=measure(w,start,n0,initial,t0,t0+follow_time,root.reactor_input,root.reactor_spent,root.external_nourishment)
        if retain_logs:logs[mode]=w.log
    assert all(results[m]['environment_future']==results[MODES[0]]['environment_future'] for m in MODES)
    return {'seed':seed,'baseline':baseline,'follow_time':follow_time,'results':results,'logs':logs}


def main():
    p=argparse.ArgumentParser();p.add_argument('--start',type=int,required=True);p.add_argument('--seeds',type=int,required=True)
    p.add_argument('--follow',type=float,default=120.);p.add_argument('--workers',type=int,default=4);p.add_argument('--output',type=Path,required=True)
    a=p.parse_args();a.output.mkdir(parents=True,exist_ok=False)
    with ProcessPoolExecutor(max_workers=a.workers) as pool:
        jobs=[pool.submit(run_seed,s,a.follow) for s in range(a.start,a.start+a.seeds)]
        for i,f in enumerate(as_completed(jobs),1):
            row=f.result();(a.output/f"seed_{row['seed']}.json").write_text(json.dumps(row,sort_keys=True,indent=2)+'\n')
            print(f"completed population {row['seed']} ({i}/{a.seeds})",flush=True)
    (a.output/'parameters.json').write_text(json.dumps(vars(a),default=str,sort_keys=True,indent=2)+'\n')


if __name__=='__main__':main()
