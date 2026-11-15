"""Donor-productive provenance and pointer-phase controls in virtual ALife.

The existing research reactor is isolated from Amelia Orange. A promoter's
single header digit and four virtual code digits are marked using the inherited
ancestry metadata, as in the preceding promoter study.
"""
from __future__ import annotations

import argparse
import copy
import json
import math
import random
from collections import Counter
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path

from encounter_trial import balanced_schedule,find_encounter,finish_delivery
from promoter_study import (ECHO_COST, HORIZONS, TAG_BASE, PromoterRuntime,
                            allele_allowed, choose_instruction, label_group)
from reactor import digest
from strict_trial import create_strict_root

ARMS=('open_slide','productive_jump','productive_slide','rotated_slide',
      'encounter_slide','shuffled_slide','syzygy_slide')


def donor_provenance(world,packet):
    """Rebuild the selected fragment's prior productive acts before shedding.

    A field_harvest belongs to the donor's immediately following execute
    event. The exact circular four-digit program is reconstructed from that
    execute event's genome and pointer, not from the later host state.
    """
    donor=packet['donor'];packet_id=packet['id']
    motif=packet['alternatives']['experienced']['code']
    sheddings=[i for i,e in enumerate(world.log) if e['event']=='vector_shed' and e.get('packet')==packet_id]
    if len(sheddings)!=1:raise AssertionError('missing or ambiguous packet shedding')
    end=sheddings[0];shed=world.log[end]
    if shed['donor']!=donor:raise AssertionError('wrong donor')
    pending=None;samples=[]
    for i,event in enumerate(world.log[:end]):
        if event.get('agent')!=donor:continue
        if event['event']=='field_harvest':pending=(i,event)
        elif event['event']=='execute':
            if pending is None:raise AssertionError('donor execution missing forage')
            hi,harvest=pending;pending=None
            if harvest['time']!=event['time'] or harvest['zone']!=event['zone']:
                raise AssertionError('donor forage/execution mismatch')
            genome=event['genome'];ip=event['ip']
            active=(genome+genome)[ip:ip+len(motif)]
            if active==motif:
                samples.append({'forage_event':hi,'execute_event':i,'time':event['time'],
                                'zone':event['zone'],'syzygy':9-event['zone'],
                                'intake':harvest['intake'],'ip':ip,'code':active})
    observation=packet['candidate_info']['experienced_observations']
    if not samples or observation is None:
        raise AssertionError('no observed productivity for selected code')
    if len(samples)!=observation[0] or not math.isclose(sum(s['intake'] for s in samples),observation[1],abs_tol=1e-7*len(samples)):
        raise AssertionError('recorded experience does not match donor history')
    maximum=max(s['intake'] for s in samples)
    ties=[s for s in samples if math.isclose(s['intake'],maximum,abs_tol=1e-9)]
    winner=ties[0]  # First occurrence among equal peaks; ties remain recorded.
    return {'packet':packet_id,'donor':donor,'code':motif,'shed_event':end,
            'shed_time':shed['time'],'samples':samples,'sample_count':len(samples),
            'peak_intake':maximum,'peak_ties':len(ties),'peak_tie_zones':sorted({s['zone'] for s in ties}),
            'productive_zone':winner['zone'],'productive_syzygy':winner['syzygy'],
            'selected_forage_event':winner['forage_event'],'selected_execute_event':winner['execute_event'],
            'selected_time':winner['time']}


def context_allowed(mode,header,zone,offset=0):
    if mode=='offset':return zone==(header+offset)%10
    return allele_allowed(mode,header,zone)


def choose_slide(agent,mode,groups,gate_offset=0):
    """Skip headers, but consume one future action per blocked payload digit."""
    n=len(agent.genome)
    if not n or len(agent.origins)!=n:raise AssertionError('invalid genome')
    skipped=[]
    for distance in range(n):
        i=(agent.ip+distance)%n
        lab=label_group(agent.origins[i],groups)
        if lab is None:return {'ip':i,'kind':'ordinary','skipped':skipped}
        base,slot=lab
        if slot==0:
            skipped.append({'ip':i,'kind':'header'});continue
        head=i-slot
        valid=head>=0 and head+5<=n and agent.origins[head:head+5]==[base-j for j in range(5)]
        if not valid:
            return {'ip':i,'kind':'nop','reason':'fragmented','offset':slot,'skipped':skipped}
        header=int(agent.genome[head]);allowed=context_allowed(mode,header,agent.zone,gate_offset)
        return {'ip':i,'kind':'payload' if allowed else 'nop','reason':None if allowed else 'out_of_zone',
                'header':header,'zone':agent.zone,'offset':slot,'allowed':allowed,'skipped':skipped}
    return {'ip':None,'kind':'quiescent','skipped':skipped}


class ContextRuntime(PromoterRuntime):
    def __init__(self,world,target,alternatives,header,mode,policy,start,offset=0,state=None):
        super().__init__(world,target,alternatives,header,mode,start,state=state)
        self.policy=policy if state is None else state['policy']
        self.offset=offset if state is None else state['offset']
        self.nop_decisions=[] if state is None else copy.deepcopy(state['nop_decisions'])
        self._nop_id=None
        self._forage=world.forage;self._execute=world.execute
        world.forage=self.forage;world.execute=self.execute

    def snapshot(self):
        if self._nop_id is not None:raise RuntimeError('checkpoint must be between actions')
        return super().snapshot()|{'policy':self.policy,'offset':self.offset,
                                  'nop_decisions':copy.deepcopy(self.nop_decisions)}

    def forage(self,agent):
        if agent.ident!=self._nop_id:return self._forage(agent)
        # Keep ordinary focus, intent, nutrient stock and energy accounting;
        # the blocked digit does not alter focus or become credited experience.
        w=self.world;mind=w.minds[agent.ident];before=mind['focus']
        if mind['intent_ttl']>0:
            mind['focus']=mind['intent'];mind['intent_ttl']-=1;agent.energy-=.01
        focus=mind['focus'];intake=min(.12,w.field[agent.zone][focus])
        w.field[agent.zone][focus]-=intake;agent.energy+=intake
        mind['harvest']+=intake;mind['forages']+=1
        mind['channel_harvest'][focus]+=intake;mind['channel_visits'][focus]+=1
        if intake>=.08:mind['last_success']=focus
        w.emit('field_harvest',agent=agent.ident,zone=agent.zone,digit=int(agent.genome[agent.ip]),
               focus_before=before,focus=focus,intake=round(intake,9),
               stock_after=round(w.field[agent.zone][focus],9),neutralized=True)

    def execute(self,agent,op,operand):
        if agent.ident!=self._nop_id:return self._execute(agent,op,operand)
        self.world.emit('promoter_nop',agent=agent.ident,zone=agent.zone,ip=agent.ip,
                        suppressed_opcode=op,suppressed_operand=operand)

    def act(self,agent):
        if agent.ident==self.target:
            self.target_action_count+=1
            if self.target_action_count>=4 and (self.target_action_count-4)%3==0:self.echo(agent)
        before=agent.ip
        choice=(choose_instruction(agent,self.mode,self.groups) if self.policy=='jump'
                else choose_slide(agent,self.mode,self.groups,self.offset))
        self._selected[agent.ident]={'before_ip':before,**choice}
        if choice['kind'] in ('payload','nop') or choice['skipped']:
            entry={'elapsed':self.world.now-self.start,'agent':agent.ident,'zone':agent.zone,
                   'mode':self.mode,'policy':self.policy,'offset':self.offset,
                   'before_ip':before,'choice':copy.deepcopy(choice)}
            self.decisions.append(entry);self.world.emit('context_decision',**entry)
        if choice['ip'] is None:self.quiesce(agent)
        else:
            agent.ip=choice['ip']
            if choice['kind']=='nop':
                self._nop_id=agent.ident
                self.nop_decisions.append({'elapsed':self.world.now-self.start,'agent':agent.ident,
                                           'zone':agent.zone,'ip':choice['ip'],'reason':choice['reason']})
            try:self._act(agent)
            finally:self._nop_id=None
        self._selected.pop(agent.ident,None)


def arm_spec(arm,productive_zone,encounter_zone):
    if arm=='open_slide':return productive_zone,'open','slide','experienced',0
    if arm=='productive_jump':return productive_zone,'zone','jump','experienced',0
    if arm=='productive_slide':return productive_zone,'zone','slide','experienced',0
    if arm=='rotated_slide':return productive_zone,'rotated','slide','experienced',0
    if arm=='encounter_slide':return productive_zone,'offset','slide','experienced',(encounter_zone-productive_zone)%10
    if arm=='shuffled_slide':return productive_zone,'zone_shuffled','slide','shuffled',0
    if arm=='syzygy_slide':return productive_zone,'syzygy','slide','experienced',0
    raise ValueError('unknown arm')


def prepare_branch(world,encounter,alternatives,productive_zone,arm):
    clone=copy.deepcopy(world)
    header,mode,policy,variant,offset=arm_spec(arm,productive_zone,encounter.zone)
    packet=clone.packets[encounter.packet]
    packet['alternatives'][variant]={'code':str(header)+alternatives[variant]['code'],
                                     'origins':[TAG_BASE-i for i in range(5)]}
    finish_delivery(clone,encounter.packet,encounter.recipient,variant,trial=True)
    runtime=ContextRuntime(clone,encounter.recipient,alternatives,header,mode,policy,encounter.time,offset)
    return clone,runtime


def run_branch(world,encounter,alternatives,productive_zone,arm,return_world=False):
    clone,runtime=prepare_branch(world,encounter,alternatives,productive_zone,arm)
    points={}
    for h in HORIZONS:
        clone.advance(until_time=encounter.time+h)
        actions=[a for a in runtime.actions if a['time']<=h]
        echoes=[e for e in runtime.echoes if e['time']<=h]
        ds=[d for d in runtime.decisions if d['elapsed']<=h and d['agent']==encounter.recipient]
        host=clone.agents.get(encounter.recipient)
        points[str(h)]={'alive':host is not None,'uptake':sum(a['intake'] for a in actions),
            'actions':len(actions),'payload_actions':sum(a['selection'].get('kind')=='payload' for a in actions),
            'noop_actions':sum(a['selection'].get('kind')=='nop' for a in actions),
            'skipped_positions':sum(sum(s.get('kind') in ('payload','fragmented') for s in d['choice']['skipped']) for d in ds),
            'quiescent_actions':sum(a['quiescent'] for a in actions),
            'echo_delivered':sum(e['reason'] is None for e in echoes),
            'echo_skipped':sum(e['reason'] is not None for e in echoes),
            'echo_energy_cost':sum(e.get('cost',0.) for e in echoes),
            'end_energy':host.energy if host else None,'end_genome_length':len(host.genome) if host else None}
    result={'arm':arm,'header':runtime.header,'mode':runtime.mode,'policy':runtime.policy,'offset':runtime.offset,
            'timepoints':points,'actions':runtime.actions,'echoes':runtime.echoes,
            'decisions':runtime.decisions,'noops':runtime.nop_decisions,'death':runtime.death,
            'environment_future':runtime.environment,'state_sha256':digest(clone.snapshot()),
            'event_sha256':digest(clone.log)}
    return (result,clone,runtime) if return_world else result


def run_seed(seed,per_phase=2):
    w=create_strict_root(seed);root=digest(w.snapshot());seen=set();exclusions=Counter();trials=[]
    schedule=balanced_schedule(seed^0x9C5014,per_phase*2);order_rng=random.Random(seed^0xB2853D)
    for phase,limit in (('before',90.),('after',198.)):
        if phase=='after':w.advance(until_time=126.)
        count=0
        while count<per_phase:
            e=find_encounter(w,seen,w.contacted_packets,limit,exclusions)
            if e is None:break
            p=w.packets[e.packet];alts=copy.deepcopy(p['alternatives'])
            if not p['candidate_info']['selection_had_experience']:
                exclusions['no_donor_experience']+=1;finish_delivery(w,e.packet,e.recipient);continue
            n=len(alts['experienced']['code'])
            if n!=4:
                exclusions['non_four_digit_payload']+=1;finish_delivery(w,e.packet,e.recipient);continue
            if len(w.agents[e.recipient].genome)+n+1>w.cfg.max_genome:
                exclusions['promoter_cap_would_truncate']+=1;finish_delivery(w,e.packet,e.recipient);continue
            provenance=donor_provenance(w,p)
            if provenance['peak_intake']<=0:
                exclusions['no_positive_donor_uptake']+=1;finish_delivery(w,e.packet,e.recipient);continue
            common=digest(w.snapshot());order=list(ARMS);order_rng.shuffle(order);out={}
            for arm in order:
                assert digest(w.snapshot())==common
                out[arm]=run_branch(w,e,alts,provenance['productive_zone'],arm)
            assert all(out[a]['environment_future']==out[ARMS[0]]['environment_future'] for a in ARMS)
            assignment=schedule[len(trials)]
            finish_delivery(w,e.packet,e.recipient,assignment,trial=True);seen.add(e.recipient)
            trials.append({'index':len(trials),'phase':phase,'time':e.time,'host':e.recipient,
              'packet':e.packet,'zone':e.zone,'donor':e.source,'fork_digest':common,
              'alternatives':alts,'provenance':provenance,'continuation_assignment':assignment,
              'execution_order':order,'outcomes':out})
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
