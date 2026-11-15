"""Matched natural-infection study of intron stop rupture in the digit ecology.

The local intervention exists only in this experiment harness. Genome grammar,
viral mechanics and the independently evolving ecological source remain unchanged.
"""
from __future__ import annotations

import argparse
import copy
import gzip
import json
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

from digit_world import DigitWorld, decode
from legacy_engine import signature
from pilot_stop_screen import create_world, candidates
from reactor import digest

ARMS=('intact_transfer','ruptured_transfer','intact_exposure','ruptured_exposure',
      'active_transfer','active_exposure')


def eligible(event):
    """Select a natural transfer into the body of a vulnerable recipient intron."""
    if event['event']!='infection':return []
    before=event['before']; ip=event['target_ip']; payload=event['payload'];zone=event['zone']
    if len(payload)!=3:return []
    accepted=[]
    for span in candidates(event):
        if not span['body']<=ip<=span['stop']:continue
        broken=before[:span['stop']]+'00'+before[span['stop']+2:]
        intact_after=before[:ip]+payload+before[ip:]
        broken_after=broken[:ip]+payload+broken[ip:]
        ni=[decode(intact_after,j,zone,'self')['nop'] for j in range(ip,ip+3)]
        nb=[decode(broken_after,j,zone,'self')['nop'] for j in range(ip,ip+3)]
        # All three transferred digits initially switch from silent to active.
        if all(ni) and not any(nb):accepted.append(span)
    return accepted


class PauseAction(Exception):
    def __init__(self,ident):self.ident=ident


class TrialWorld(DigitWorld):
    def __init__(self,*args,**kwargs):
        self.pause_action=None
        self.intervention=None
        self.intervention_applied=False
        super().__init__(*args,**kwargs)

    def act(self,agent):
        if self.pause_action==self.actions+1:
            self.pause_action=None
            raise PauseAction(agent.ident)
        # A recipient-only research control: leave digits intact but interpret
        # that host's introns as active. No annotations are placed in genomes.
        p=self.intervention
        active=(p is not None and self.intervention_applied and p['arm'].startswith('active_')
                and agent.ident==p['target'])
        previous=self.parser_mode
        if active:self.parser_mode='intron_active'
        try:return super().act(agent)
        finally:self.parser_mode=previous

    def infect(self,attacker,target):
        p=self.intervention
        if (p is None or self.intervention_applied or self.actions!=p['action'] or
            attacker.ident!=p['attacker'] or target.ident!=p['target'] or
            target.ip!=p['target_ip'] or target.genome!=p['before']):
            return super().infect(attacker,target)
        payload=(attacker.genome+attacker.genome)[attacker.ip:attacker.ip+3]
        assert payload==p['payload'] and attacker.ip==p['attacker_ip']
        old=target.genome;stop=p['span']['stop']
        assert old[stop:stop+2]=='09'
        ruptured=p['arm'].startswith('ruptured_')
        sham=p['arm'].endswith('_exposure')
        edited=old[:stop]+'00'+old[stop+2:] if ruptured else old
        assert len(edited)==len(old) and signature(edited)==signature(old)
        target.genome=edited
        success=super().infect(attacker,target)
        assert success
        transmitted=target.genome
        assert transmitted==edited[:target.ip]+payload+edited[target.ip:]
        if sham:
            # Preserve the actual contact's energy transfer and any shed packet;
            # remove the recipient's insertion before another simulated action.
            target.genome=edited
        self.intervention_applied=True
        self.emit('trial_contact',arm=p['arm'],attacker=attacker.ident,target=target.ident,
                  zone=target.zone,target_ip=target.ip,stop=stop,payload=payload,
                  before=old,edited=edited,transmitted=transmitted,after=target.genome,
                  actual_contact_performed=True,recipient_insertion_removed=sham)
        return True


def select_event(events,max_time=150.):
    for e in events:
        if e['time']>max_time:break
        if e['event']=='infection':
            ca=eligible(e)
            if ca:
                return {k:e[k] for k in ('action','time','attacker','target','target_ip',
                                          'attacker_ip','payload','before','after','zone')} | {'span':ca[0]}
    return None


def natural_inventory(events,max_time=180.):
    """Describe observed direct and vector insertions, without causal attribution."""
    from collections import Counter
    from digit_world import parse_genome
    counts=Counter()
    for e in events:
        if e['time']>max_time:break
        kind=e['event']
        if kind not in ('infection','vector_infection'):continue
        counts[kind]+=1
        b=[s for s in parse_genome(e['before']) if s[0]=='intron']
        a=[s for s in parse_genome(e['after']) if s[0]=='intron']
        ip=e['target_ip'] if kind=='infection' else e['ip']
        cargo=e['payload'] if kind=='infection' else e['code']
        if b:counts[kind+'_host_with_intron']+=1
        if any(ip==s[3]+1 for s in b):
            counts[kind+'_splits_stop_digits']+=1
            if e['after'][ip-1:ip+1]=='09':counts[kind+'_recloses_split_stop']+=1
        if len(a)>len(b):counts[kind+'_more_intron_spans']+=1
        if len(a)<len(b):counts[kind+'_fewer_intron_spans']+=1
        if '60' in cargo:counts[kind+'_cargo_contains_start']+=1
        if '09' in cargo:counts[kind+'_cargo_contains_stop']+=1
    return dict(counts)


def follow(world,p,begin,horizon):
    events=world.log[begin:]; target=p['target']; descendants={target};births=0
    trans=0;vector_trans=0; shed=0
    first_foraging=None;first_execute=None;first_nop=False;nutrient=0.;target_actions=0
    for e in events:
        kind=e['event']
        if kind=='birth' and e['parent'] in descendants:
            descendants.add(e['agent']);births+=1
        if kind=='infection' and e['attacker'] in descendants:trans+=1
        if kind=='vector_shed' and e['donor'] in descendants:shed+=1
        if kind=='vector_infection' and e['donor'] in descendants:vector_trans+=1
        if kind=='field_harvest' and e['agent']==target:
            nutrient+=e['intake']
            if first_foraging is None:first_foraging=e
        if kind=='execute' and e['agent']==target:
            target_actions+=1
            if first_execute is None:first_execute=e
        if (first_execute is not None and kind=='digit_nop' and e['agent']==target
            and e['action']==first_execute['action']):first_nop=True
    read_payload=False
    if first_execute is not None:
        ip=first_execute['ip'];g=first_execute['genome']
        read_payload=(ip==p['target_ip'] and g[ip:ip+3]==p['payload'])
    return {'survived':int(target in world.agents),
            'first_action_nutrient':first_foraging['intake'] if first_foraging else 0.,
            'first_action_performed':int(first_execute is not None),
            'first_action_nop':int(first_nop),
            'first_action_reads_payload':int(read_payload),
            'target_actions':target_actions,'total_target_nutrient':round(nutrient,9),
            'descendant_births':births,'living_descendants':sum(i in world.agents for i in descendants),
            'lineage_direct_transmissions':trans,'lineage_vector_deliveries':vector_trans,
            'lineage_vector_sheds':shed,'follow_time':horizon}


def run_seed(seed,retain=False):
    screen=create_world(seed);screen.advance(until_time=180.)
    selection=select_event(screen.log)
    inventory=natural_inventory(screen.log)
    if selection is None:
        return {'seed':seed,'eligible':False,'inventory':inventory}
    replay=create_world(seed,TrialWorld)
    replay.pause_action=selection['action']
    try:replay.advance(until_time=180.)
    except PauseAction as ex:pending=ex.ident
    else:raise AssertionError('screened action was not found in replay')
    assert pending==selection['attacker']
    t0=replay.now;initial_digest=digest(replay.snapshot());start=len(replay.log)
    outputs={};ledgers={}
    for arm in ARMS:
        w=copy.deepcopy(replay)
        assert digest(w.snapshot())==initial_digest
        w.intervention={**selection,'arm':arm}
        w.act(w.agents[pending])
        if not w.intervention_applied:raise AssertionError('chosen natural infection was not encountered')
        markers=[i for i,e in enumerate(w.log) if e['event']=='trial_contact']
        assert len(markers)==1
        mark=markers[0]+1
        w.advance(until_time=t0+6.)
        short=follow(w,selection,mark,6.)
        w.advance(until_time=t0+24.)
        long=follow(w,selection,mark,24.)
        natural_verified=None
        if arm=='intact_transfer':
            ordinary=[e for e in w.log if e['event']!='trial_contact']
            assert ordinary==screen.log[:len(ordinary)],'intact transfer diverged from natural ecology'
            natural_verified=True
        outputs[arm]={'short':short,'long':long,'events':len(w.log),
                      'state_sha256':digest(w.snapshot()),'event_sha256':digest(w.log),
                      'natural_trajectory_verified':natural_verified,
                      'future_environment':[e['signals'] for e in w.log[start:] if e['event']=='environment']}
        if retain:ledgers[arm]=w.log
    assert all(outputs[m]['future_environment']==outputs[ARMS[0]]['future_environment'] for m in ARMS)
    return {'seed':seed,'eligible':True,'selection':selection,'inventory':inventory,
            'fork':{'state_sha256':initial_digest,'pending_agent':pending,'time':t0},
            'outputs':outputs,'ledgers':ledgers}


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--start',type=int,required=True);p.add_argument('--seeds',type=int,required=True)
    p.add_argument('--workers',type=int,default=4);p.add_argument('--output',type=Path,required=True)
    a=p.parse_args();a.output.mkdir(parents=True,exist_ok=False)
    with ProcessPoolExecutor(max_workers=a.workers) as pool:
        fs=[pool.submit(run_seed,s) for s in range(a.start,a.start+a.seeds)]
        for i,f in enumerate(as_completed(fs),1):
            row=f.result()
            (a.output/f"seed_{row['seed']}.json").write_text(json.dumps(row,sort_keys=True,indent=2)+'\n')
            if i%10==0:print(f'completed {i}/{a.seeds} populations',flush=True)
    (a.output/'parameters.json').write_text(json.dumps(vars(a),default=str,indent=2,sort_keys=True)+'\n')


if __name__=='__main__':main()
