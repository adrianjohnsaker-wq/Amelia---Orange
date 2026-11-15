"""Atomic SQLite persistence for a paused, marked viral-echo research branch.

This checkpoint type is local to the separate research prototype; do not use it
with older CLI tools or with Amelia's production persistence.
"""
import argparse
import hashlib
import json
import sqlite3

from reactor import canonical, digest
from storage import payload_of, validate_payload
from strict_trial import StrictWorld
from viral_echo_study import ECHO_COST, Trace, labels_for_shuffle

TRACE_FIELDS=('host_id','code','start_time','labels','correct_digit','copy_patterns',
              'host_actions','echo_events','transitions','environment','before_first_loss',
              'first_death','_last_original_intact')


def save_echo(path, world, trace, alternatives, arm):
    payload=payload_of(world)
    payload['echo_runtime']={'trace':{k:getattr(trace,k) for k in TRACE_FIELDS},
                             'alternatives':alternatives,'arm':arm}
    raw=canonical(payload)
    sha=hashlib.sha256(raw).hexdigest()
    with sqlite3.connect(path) as db:
        db.execute('PRAGMA synchronous=FULL')
        db.execute('CREATE TABLE IF NOT EXISTS echo_checkpoint (singleton INTEGER PRIMARY KEY CHECK(singleton=1), payload TEXT NOT NULL, sha256 TEXT NOT NULL)')
        db.execute('BEGIN IMMEDIATE')
        db.execute('INSERT OR REPLACE INTO echo_checkpoint VALUES (1, ?, ?)',(raw.decode(),sha))
    return sha


def attach_resumed(world, trace, alternatives, arm):
    """Restore the action/observation hooks and exact recipient action count."""
    target_id=trace.host_id
    original=trace.code
    original_emit=world.emit
    def monitored_emit(event,**fields):
        original_emit(event,**fields)
        trace.at_event(event,fields)
    world.emit=monitored_emit
    original_act=world.act
    count=len(trace.host_actions)
    shuffle_order=labels_for_shuffle(alternatives['experienced'],alternatives['shuffled'])
    def monitored_act(agent):
        nonlocal count
        if agent.ident==target_id:
            count+=1
            if arm!='natural' and count>=4 and (count-4)%3==0:
                variant='experienced' if arm=='experienced_echo' else 'shuffled'
                payload=alternatives[variant]['code']
                perm=list(range(len(original))) if variant=='experienced' else shuffle_order
                reason=None
                if agent.energy<=ECHO_COST:reason='insufficient_energy'
                elif len(agent.genome)+len(payload)>world.cfg.max_genome:reason='genome_cap'
                if reason is None:
                    echo_number=1+sum(e['reason'] is None for e in trace.echo_events)
                    base=-200000-echo_number*100
                    canonical_labels=[base-i for i in range(len(original))]
                    trace.copy_patterns.append(canonical_labels)
                    trace.correct_digit.update(zip(canonical_labels,original))
                    labels=[canonical_labels[i] for i in perm]
                    ip=agent.ip
                    agent.genome=agent.genome[:ip]+payload+agent.genome[ip:]
                    agent.origins=agent.origins[:ip]+labels+agent.origins[ip:]
                    agent.energy-=ECHO_COST
                    details={'time':world.now-trace.start_time,'action':count,'variant':variant,
                             'code':payload,'ip':ip,'energy_cost':ECHO_COST,'reason':None}
                    trace.echo_events.append(details)
                    world.emit('viral_echo',agent=agent.ident,zone=agent.zone,code=payload,
                               ip=ip,energy_cost=ECHO_COST,arm=arm)
                else:
                    trace.echo_events.append({'time':world.now-trace.start_time,'action':count,
                                              'variant':variant,'reason':reason})
        return original_act(agent)
    world.act=monitored_act


def load_echo(path):
    with sqlite3.connect(path) as db:
        row=db.execute('SELECT payload,sha256 FROM echo_checkpoint WHERE singleton=1').fetchone()
    if row is None:raise LookupError('no echo checkpoint')
    raw,stored=row
    if hashlib.sha256(raw.encode()).hexdigest()!=stored:raise ValueError('echo checkpoint digest mismatch')
    payload=json.loads(raw)
    validate_payload(payload)  # Validate complete event chain and world-state digest.
    world=StrictWorld.restore(payload['state'],payload['events'])
    runtime=payload['echo_runtime'];d=runtime['trace']
    trace=Trace(world,d['host_id'],d['code'],d['start_time'])
    for k in TRACE_FIELDS:setattr(trace,k,d[k])
    trace.correct_digit={int(k):v for k,v in trace.correct_digit.items()}
    attach_resumed(world,trace,runtime['alternatives'],runtime['arm'])
    return world,trace


def main():
    p=argparse.ArgumentParser()
    p.add_argument('db');p.add_argument('--until',type=float,required=True)
    a=p.parse_args()
    w,t=load_echo(a.db)
    if a.until<w.now:raise ValueError('cannot resume backwards')
    w.advance(until_time=a.until)
    print(json.dumps({'state_sha256':digest(w.snapshot()),'event_sha256':digest(w.log),
                      'actions':t.host_actions,'echoes':t.echo_events,'transitions':t.transitions,
                      'environment':t.environment,'first_loss':t.before_first_loss,
                      'first_death':t.first_death},sort_keys=True))


if __name__=='__main__':main()
