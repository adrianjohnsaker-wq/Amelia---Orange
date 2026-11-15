"""Conditional viral promoters in the isolated cybergothic research ecology.

A five-digit cassette is an encoded zone header followed by four instruction
digits. Per-digit ancestry tags identify the cassette; the actual header digit
is read at runtime and can mutate. These tags therefore have an operational role
in this extension (not merely an observational role). All code remains virtual.
"""
from __future__ import annotations

import argparse
import copy
import json
import random
from collections import Counter
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

from encounter_trial import balanced_schedule, find_encounter, finish_delivery
from reactor import digest
from strict_trial import create_strict_root

ARMS=('open','zone','rotated','zone_shuffled','syzygy')
HORIZONS=(3,6,12,24,36)
ECHO_COST=.05
TAG_BASE=-1000000
TAG_STRIDE=100


def allele_allowed(mode, header, zone):
    if mode=='open':return True
    if mode in ('zone','zone_shuffled'):return zone==header
    if mode=='rotated':return zone==(header+1)%10
    if mode=='syzygy':return zone in (header,9-header)
    raise ValueError('unknown promoter mode')


def label_group(tag, groups):
    """Return registered cassette base and position; unrelated tags stay normal."""
    if not isinstance(tag,int) or tag>TAG_BASE:return None
    ordinal,offset=divmod(TAG_BASE-tag,TAG_STRIDE)
    base=TAG_BASE-TAG_STRIDE*ordinal
    return (base,offset) if base in groups and 0<=offset<=4 else None


def choose_instruction(agent, mode, groups):
    """Find the next executable position. Return None if the genome is silent.

    Headers are regulatory, not opcodes. Tagged payload fragments with a lost
    or interrupted header are fail-closed. A valid cassette is five contiguous
    labels: header then four payload digits. Decoding uses the *current* digit
    at the header, so header mutation changes its matching zone.
    """
    n=len(agent.genome)
    if not n or len(agent.origins)!=n:raise AssertionError('invalid genome/label length')
    skipped=[]
    for distance in range(n):
        index=(agent.ip+distance)%n
        label=label_group(agent.origins[index],groups)
        if label is None:
            return {'ip':index,'kind':'ordinary','skipped':skipped}
        base,offset=label
        if offset==0:
            skipped.append({'ip':index,'kind':'header'})
            continue
        head=index-offset
        valid=head>=0 and head+5<=n and agent.origins[head:head+5]==[base-i for i in range(5)]
        if not valid:
            skipped.append({'ip':index,'kind':'fragmented','offset':offset})
            continue
        header=int(agent.genome[head])
        allowed=allele_allowed(mode,header,agent.zone)
        entry={'ip':index,'kind':'payload','header':header,'zone':agent.zone,
               'offset':offset,'allowed':allowed}
        if allowed:
            return {**entry,'skipped':skipped}
        skipped.append(entry)
    return {'ip':None,'kind':'quiescent','skipped':skipped}


class PromoterRuntime:
    """Own the new interpreter hook and its serializable runtime state."""
    def __init__(self, world, target, alternatives, header, mode, start, state=None):
        self.world=world
        self.target=target
        self.alternatives=copy.deepcopy(alternatives)
        self.header=header
        self.mode=mode
        self.start=start
        self.groups={TAG_BASE}
        self.echoes=[]
        self.actions=[]
        self.decisions=[]
        self.environment=[]
        self.death=None
        self.target_action_count=0
        self._selected={}
        if state is not None:
            for k in ('target','alternatives','header','mode','start','echoes','actions',
                      'decisions','environment','death','target_action_count'):
                setattr(self,k,copy.deepcopy(state[k]))
            self.groups=set(state['groups'])
        self._emit=world.emit
        self._act=world.act
        world.emit=self.emit
        world.act=self.act

    def snapshot(self):
        return {k:copy.deepcopy(getattr(self,k)) for k in (
            'target','alternatives','header','mode','start','echoes','actions','decisions',
            'environment','death','target_action_count')}|{'groups':sorted(self.groups)}

    def emit(self,event,**fields):
        self._emit(event,**fields)
        if event=='environment':self.environment.append(fields['signals'])
        elif event=='death' and fields.get('agent')==self.target and self.death is None:
            self.death={'time':self.world.now-self.start,'cause':fields.get('cause')}
        elif event=='field_harvest' and fields.get('agent')==self.target:
            selected=self._selected.get(self.target,{})
            self.actions.append({'time':self.world.now-self.start,'zone':fields['zone'],
                'intake':fields['intake'],'focus':fields['focus'],'digit':fields['digit'],
                'selection':copy.deepcopy(selected),'quiescent':False})

    def echo(self,agent):
        variant='shuffled' if self.mode=='zone_shuffled' else 'experienced'
        body=self.alternatives[variant]['code']
        cassette=str(self.header)+body
        reason=None
        if agent.energy<=ECHO_COST:reason='insufficient_energy'
        elif len(agent.genome)+len(cassette)>self.world.cfg.max_genome:reason='genome_cap'
        row={'time':self.world.now-self.start,'action':self.target_action_count,
             'variant':variant,'reason':reason}
        if reason is None:
            count=1+sum(e['reason'] is None for e in self.echoes)
            base=TAG_BASE-TAG_STRIDE*count
            self.groups.add(base)
            labels=[base-i for i in range(5)]
            ip=agent.ip
            agent.genome=agent.genome[:ip]+cassette+agent.genome[ip:]
            agent.origins=agent.origins[:ip]+labels+agent.origins[ip:]
            agent.energy-=ECHO_COST
            row.update({'code':cassette,'ip':ip,'cost':ECHO_COST,'base':base})
            self.echoes.append(row)
            self.world.emit('promoter_echo',agent=agent.ident,zone=agent.zone,code=cassette,
                            ip=ip,cost=ECHO_COST,base=base)
        else:self.echoes.append(row)

    def quiesce(self,agent):
        """If all instructions are blocked, pay basal metabolism and reschedule."""
        w=self.world;z=agent.zone
        w.actions+=1;w.zone_actions[z]+=1;agent.age+=1
        agent.energy-=.24+(.04 if z>=7 else 0.)+.012*agent.heat
        agent.heat=max(0.,agent.heat-(.08 if z>=7 else .22))
        if agent.ident==self.target:
            self.actions.append({'time':w.now-self.start,'zone':z,'intake':0.,
                'focus':None,'digit':None,'selection':copy.deepcopy(self._selected[agent.ident]),
                'quiescent':True})
        w.emit('promoter_quiescent',agent=agent.ident,zone=z,energy=round(agent.energy,6))
        if agent.energy<=0 or agent.age>=120:
            w.kill(agent,'starvation' if agent.energy<=0 else 'senescence')
        else:
            agent.history.append((agent.genome,agent.ip));agent.history=agent.history[-8:]
            agent.origin_history.append(agent.origins.copy());agent.origin_history=agent.origin_history[-8:]
            w.schedule_agent(agent)
        w.resolve_forecasts(z)
        w.emit('action_end',agent=agent.ident,alive=agent.ident in w.agents)

    def act(self,agent):
        if agent.ident==self.target:
            self.target_action_count+=1
            if self.target_action_count>=4 and (self.target_action_count-4)%3==0:self.echo(agent)
        before=agent.ip
        choice=choose_instruction(agent,self.mode,self.groups)
        self._selected[agent.ident]={'before_ip':before,**choice}
        if choice['kind']=='payload' or choice['skipped']:
            entry={'elapsed':self.world.now-self.start,'agent':agent.ident,'zone':agent.zone,
                   'mode':self.mode,'before_ip':before,'choice':copy.deepcopy(choice)}
            self.decisions.append(entry)
            self.world.emit('promoter_decision',**entry)
        if choice['ip'] is None:
            self.quiesce(agent)
        else:
            agent.ip=choice['ip']
            self._act(agent)
        self._selected.pop(agent.ident,None)


def prepare_branch(world,encounter,alternatives,mode):
    clone=copy.deepcopy(world)
    header=encounter.zone
    variant='shuffled' if mode=='zone_shuffled' else 'experienced'
    packet=clone.packets[encounter.packet]
    body=alternatives[variant]['code']
    packet['alternatives'][variant]={'code':str(header)+body,'origins':[TAG_BASE-i for i in range(5)]}
    finish_delivery(clone,encounter.packet,encounter.recipient,variant,trial=True)
    monitor=PromoterRuntime(clone,encounter.recipient,alternatives,header,mode,encounter.time)
    return clone,monitor


def run_branch(world,encounter,alternatives,mode,return_world=False):
    clone,monitor=prepare_branch(world,encounter,alternatives,mode)
    header=encounter.zone
    points={}
    for horizon in HORIZONS:
        clone.advance(until_time=encounter.time+horizon)
        actions=[a for a in monitor.actions if a['time']<=horizon]
        echoes=[x for x in monitor.echoes if x['time']<=horizon]
        decisions=[d for d in monitor.decisions if d['elapsed']<=horizon and d['agent']==encounter.recipient]
        target=clone.agents.get(encounter.recipient)
        points[str(horizon)]={'alive':target is not None,'uptake':sum(a['intake'] for a in actions),
             'actions':len(actions),'quiescent_actions':sum(a['quiescent'] for a in actions),
             'payload_actions':sum(a['selection'].get('kind')=='payload' for a in actions),
             'suppressed_actions':sum(any(s.get('kind')=='payload' and not s.get('allowed')
                                          for s in d['choice']['skipped']) for d in decisions),
             'fragmented_skips':sum(sum(s.get('kind')=='fragmented' for s in d['choice']['skipped'])
                                     for d in decisions),
             'echo_delivered':sum(x['reason'] is None for x in echoes),
             'echo_skipped':sum(x['reason'] is not None for x in echoes),
             'echo_energy_cost':sum(x.get('cost',0.) for x in echoes),
             'end_energy':target.energy if target else None,'end_genome_length':len(target.genome) if target else None}
    result={'mode':mode,'header':header,'timepoints':points,'actions':monitor.actions,
            'echoes':monitor.echoes,'decisions':monitor.decisions,'death':monitor.death,
            'environment_future':monitor.environment,'state_sha256':digest(clone.snapshot()),
            'event_sha256':digest(clone.log)}
    return (result,clone,monitor) if return_world else result


def run_seed(seed,per_phase=2):
    w=create_strict_root(seed);root=digest(w.snapshot());seen=set();exclusions=Counter();trials=[]
    schedule=balanced_schedule(seed^0x198A31,per_phase*2);order_rng=random.Random(seed^0x81D5C1)
    for phase,limit in (('before',90.),('after',198.)):
        if phase=='after':w.advance(until_time=126.)
        count=0
        while count<per_phase:
            e=find_encounter(w,seen,w.contacted_packets,limit,exclusions)
            if e is None:break
            p=w.packets[e.packet]
            if not p['candidate_info']['selection_had_experience']:
                exclusions['no_donor_experience']+=1;finish_delivery(w,e.packet,e.recipient);continue
            alts=copy.deepcopy(p['alternatives']);n=len(alts['experienced']['code'])
            if n!=4:exclusions['non_four_digit_payload']+=1;finish_delivery(w,e.packet,e.recipient);continue
            if len(w.agents[e.recipient].genome)+n+1>w.cfg.max_genome:
                exclusions['promoter_cap_would_truncate']+=1;finish_delivery(w,e.packet,e.recipient);continue
            common=digest(w.snapshot());order=list(ARMS);order_rng.shuffle(order);out={}
            for arm in order:
                assert digest(w.snapshot())==common
                out[arm]=run_branch(w,e,alts,arm)
            assert all(out[a]['environment_future']==out[ARMS[0]]['environment_future'] for a in ARMS)
            assignment=schedule[len(trials)]
            finish_delivery(w,e.packet,e.recipient,assignment,trial=True);seen.add(e.recipient)
            trials.append({'index':len(trials),'phase':phase,'time':e.time,'host':e.recipient,
              'packet':e.packet,'zone':e.zone,'donor':e.source,'fork_digest':common,
              'alternatives':alts,'continuation_assignment':assignment,'execution_order':order,'outcomes':out})
            count+=1
    return {'seed':seed,'root_hash':root,'trials':trials,'exclusions':dict(exclusions)}


def main():
    p=argparse.ArgumentParser();p.add_argument('--start',type=int,required=True)
    p.add_argument('--seeds',type=int,required=True);p.add_argument('--per-phase',type=int,default=2)
    p.add_argument('--workers',type=int,default=4);p.add_argument('--output',type=Path,required=True)
    a=p.parse_args();a.output.mkdir(parents=True,exist_ok=False)
    with ProcessPoolExecutor(max_workers=a.workers) as pool:
        jobs=[pool.submit(run_seed,s,a.per_phase) for s in range(a.start,a.start+a.seeds)]
        for i,f in enumerate(as_completed(jobs),1):
            row=f.result();(a.output/f"seed_{row['seed']}.json").write_text(json.dumps(row,sort_keys=True,indent=2)+'\n')
            print(f"completed {row['seed']} ({i}/{a.seeds}): {len(row['trials'])} encounters",flush=True)
    (a.output/'parameters.json').write_text(json.dumps(vars(a),default=str,sort_keys=True,indent=2)+'\n')


if __name__=='__main__':main()
