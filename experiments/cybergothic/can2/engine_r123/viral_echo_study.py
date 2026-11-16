"""Track and experimentally refresh viral fragments in the isolated ecology.

Uses the earlier study's first-contact sampler and frozen world. The marks below
are observation-only substitutions for ancestry tags, not executable digits.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import random
from collections import Counter, defaultdict, deque
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

from encounter_trial import balanced_schedule, find_encounter, finish_delivery
from reactor import digest
from strict_trial import create_strict_root

ARMS = ('natural', 'experienced_echo', 'shuffled_echo')
HORIZONS = (3, 6, 12, 24, 36)
ECHO_COST = .05


def labels_for_shuffle(exp, shuf):
    """Map the earlier digit/origin permutation back to experienced positions."""
    pools = defaultdict(deque)
    for i, pair in enumerate(zip(exp['code'], exp['origins'])):
        pools[pair].append(i)
    result = []
    for pair in zip(shuf['code'], shuf['origins']):
        if not pools[pair]:
            raise AssertionError('shuffled packet is not a digit/ancestry permutation')
        result.append(pools[pair].popleft())
    if any(pools.values()):
        raise AssertionError('incomplete shuffled packet')
    return result


def scrub_ancestry(obj):
    """Comparison projection only; ancestry never enters the behavioral rules."""
    if isinstance(obj, dict):
        return {k: scrub_ancestry(v) for k, v in obj.items() if 'origin' not in k.lower()}
    if isinstance(obj, (list, tuple)):
        return [scrub_ancestry(v) for v in obj]
    return obj


class Trace:
    def __init__(self, world, host_id, code, start_time):
        self.world, self.host_id, self.code, self.start_time = world, host_id, code, start_time
        self.labels = [-100000 - i for i in range(len(code))]
        self.correct_digit = dict(zip(self.labels, code))
        self.copy_patterns = [self.labels]
        self.host_actions = []
        self.echo_events = []
        self.transitions = []
        self.environment = []
        self.before_first_loss = None
        self.first_death = None
        self._last_original_intact = None

    def inspect(self):
        a = self.world.agents.get(self.host_id)
        if a is None:
            return {'alive': False, 'intact': False, 'original_intact': False, 'correct_tagged_digits': 0,
                    'intact_copies': 0, 'genome_length': None, 'energy': None}
        if len(a.genome) != len(a.origins):
            raise AssertionError('genome and ancestry lengths disagree')
        n = len(self.code)
        original_copies = sum(a.origins[i:i+n] == self.labels and a.genome[i:i+n] == self.code
                              for i in range(len(a.genome)-n+1))
        patterns = {tuple(x) for x in self.copy_patterns}
        copies = sum(tuple(a.origins[i:i+n]) in patterns and a.genome[i:i+n] == self.code
                     for i in range(len(a.genome)-n+1))
        count = sum(self.correct_digit.get(tag) == digit for tag, digit in zip(a.origins, a.genome)
                    if tag in self.correct_digit)
        return {'alive': True, 'intact': copies > 0, 'original_intact': original_copies > 0,
                'correct_tagged_digits': count,
                'intact_copies': copies, 'genome_length': len(a.genome), 'energy': a.energy}

    def at_event(self, event, fields):
        if event == 'environment':
            self.environment.append(fields['signals'])
            return
        if event == 'death' and fields.get('agent') == self.host_id and self.first_death is None:
            self.first_death = {'time': self.world.now - self.start_time, 'cause': fields.get('cause')}
            return
        changes = {
            'genome_mutation': ('agent',), 'infection': ('target',),
            'vector_infection': ('target',), 'reinject': ('host',),
            'scavenge': ('agent',), 'timesplice': ('agent', 'target'),
            'replay': ('agent',), 'chrono_recall': ('target',), 'viral_echo': ('agent',),
        }
        relevant_change = event in changes and any(fields.get(k) == self.host_id for k in changes[event])
        host_harvest = event == 'field_harvest' and fields.get('agent') == self.host_id
        if not relevant_change and not host_harvest:
            return
        s = self.inspect()
        if s['alive']:
            if self._last_original_intact is None:
                self._last_original_intact = s['original_intact']
            elif s['original_intact'] != self._last_original_intact:
                transition = {'time': self.world.now - self.start_time, 'event': event,
                              'intact': s['original_intact']}
                self.transitions.append(transition)
                if not s['original_intact'] and self.before_first_loss is None:
                    self.before_first_loss = transition
                self._last_original_intact = s['original_intact']
        if host_harvest:
            a = self.world.agents[self.host_id]
            tag = a.origins[a.ip]
            self.host_actions.append({'time': self.world.now - self.start_time,
                'zone': a.zone, 'digit': fields['digit'], 'focus': fields['focus'],
                'intake': fields['intake'],
                'matches_tagged_digit': int(tag in self.correct_digit and
                                              str(fields['digit']) == self.correct_digit[tag]),
                'has_intact_fragment': s['intact']})


def install_trace_and_echo(w, target_id, start_time, original, alternatives, arm, *, tagged=True):
    trace = Trace(w, target_id, original, start_time)
    a = w.agents[target_id]
    pos = a.ip
    assert a.genome[pos:pos+len(original)] == original
    if tagged:
        a.origins[pos:pos+len(original)] = trace.labels
    assert not tagged or trace.inspect()['intact']
    trace._last_original_intact = trace.inspect()['original_intact']
    original_emit = w.emit
    def monitored_emit(event, **fields):
        original_emit(event, **fields)
        trace.at_event(event, fields)
    w.emit = monitored_emit
    original_act = w.act
    count = 0
    shuffle_order = labels_for_shuffle(alternatives['experienced'], alternatives['shuffled'])
    def monitored_act(agent):
        nonlocal count
        if agent.ident == target_id:
            count += 1
            if arm != 'natural' and count >= 4 and (count-4) % 3 == 0:
                variant = 'experienced' if arm == 'experienced_echo' else 'shuffled'
                payload = alternatives[variant]['code']
                perm = list(range(len(original))) if variant == 'experienced' else shuffle_order
                reason = None
                if agent.energy <= ECHO_COST:
                    reason = 'insufficient_energy'
                elif len(agent.genome) + len(payload) > w.cfg.max_genome:
                    reason = 'genome_cap'
                if reason is None:
                    if tagged:
                        # A distinct mark for each copy distinguishes the original
                        # transmitted lineage from later maintenance insertions.
                        echo_number = 1 + sum(e['reason'] is None for e in trace.echo_events)
                        base = -200000 - echo_number * 100
                        canonical_labels = [base-i for i in range(len(original))]
                        trace.copy_patterns.append(canonical_labels)
                        trace.correct_digit.update(zip(canonical_labels, original))
                        labels = [canonical_labels[i] for i in perm]
                    else:
                        labels = alternatives[variant]['origins'].copy()
                    ip = agent.ip
                    agent.genome = agent.genome[:ip] + payload + agent.genome[ip:]
                    agent.origins = agent.origins[:ip] + labels + agent.origins[ip:]
                    agent.energy -= ECHO_COST
                    details = {'time': w.now-start_time, 'action': count, 'variant': variant,
                               'code': payload, 'ip': ip, 'energy_cost': ECHO_COST,
                               'reason': None}
                    trace.echo_events.append(details)
                    w.emit('viral_echo', agent=agent.ident, zone=agent.zone, code=payload,
                           ip=ip, energy_cost=ECHO_COST, arm=arm)
                else:
                    trace.echo_events.append({'time': w.now-start_time, 'action': count,
                                              'variant': variant, 'reason': reason})
        return original_act(agent)
    w.act = monitored_act
    return trace


def run_branch(world, encounter, alternatives, arm, tagged=True, return_world=False):
    clone = copy.deepcopy(world)
    original = alternatives['experienced']['code']
    finish_delivery(clone, encounter.packet, encounter.recipient, 'experienced', trial=True)
    trace = install_trace_and_echo(clone, encounter.recipient, encounter.time,
                                   original, alternatives, arm, tagged=tagged)
    timepoints = {}
    for horizon in HORIZONS:
        clone.advance(until_time=encounter.time+horizon)
        s = trace.inspect()
        actions = [x for x in trace.host_actions if x['time'] <= horizon]
        echoes = [x for x in trace.echo_events if x['time'] <= horizon]
        timepoints[str(horizon)] = dict(s, uptake=sum(a['intake'] for a in actions),
            actions=len(actions), tagged_executions=sum(a['matches_tagged_digit'] for a in actions),
            echo_delivered=sum(e['reason'] is None for e in echoes),
            echo_skipped=sum(e['reason'] is not None for e in echoes),
            echo_energy_cost=sum(e.get('energy_cost', 0.) for e in echoes))
    result = {'arm': arm, 'timepoints': timepoints, 'first_loss': trace.before_first_loss,
              'first_death': trace.first_death, 'transitions': trace.transitions,
              'actions': trace.host_actions, 'echoes': trace.echo_events,
              'environment_future': trace.environment,
              'final_state_sha256': digest(clone.snapshot()), 'event_sha256': digest(clone.log)}
    return (result, clone) if return_world else result


def run_seed(seed, per_phase=2):
    w = create_strict_root(seed)
    root = digest(w.snapshot())
    seen, exclusions, trials = set(), Counter(), []
    schedule = balanced_schedule(seed ^ 0x2711, per_phase*2)
    order_rng = random.Random(seed ^ 0xA187DB)
    for phase, limit in (('before', 90.), ('after', 198.)):
        if phase == 'after':
            w.advance(until_time=126.)
        count = 0
        while count < per_phase:
            e = find_encounter(w, seen, w.contacted_packets, limit, exclusions)
            if e is None:
                break
            packet = w.packets[e.packet]
            if not packet['candidate_info']['selection_had_experience']:
                exclusions['no_donor_experience'] += 1
                finish_delivery(w, e.packet, e.recipient)
                continue
            alts = copy.deepcopy(packet['alternatives'])
            common = digest(w.snapshot())
            order = list(ARMS)
            order_rng.shuffle(order)
            outputs = {}
            for arm in order:
                assert digest(w.snapshot()) == common
                outputs[arm] = run_branch(w, e, alts, arm)
            assert all(outputs[a]['environment_future'] == outputs[ARMS[0]]['environment_future'] for a in ARMS)
            assignment = schedule[len(trials)]
            finish_delivery(w, e.packet, e.recipient, assignment, trial=True)
            seen.add(e.recipient)
            trials.append({'index':len(trials), 'phase':phase, 'time':e.time, 'host':e.recipient,
                           'packet':e.packet, 'zone':e.zone, 'donor':e.source, 'fork_digest':common,
                           'alternatives':alts, 'continuation_assignment':assignment,
                           'execution_order':order, 'outcomes':outputs})
            count += 1
    return {'seed':seed, 'root_hash':root, 'trials':trials, 'exclusions':dict(exclusions)}


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--start', type=int, required=True)
    p.add_argument('--seeds', type=int, required=True)
    p.add_argument('--per-phase', type=int, default=2)
    p.add_argument('--workers', type=int, default=4)
    p.add_argument('--output', type=Path, required=True)
    a = p.parse_args()
    a.output.mkdir(parents=True, exist_ok=False)
    with ProcessPoolExecutor(max_workers=a.workers) as pool:
        jobs = [pool.submit(run_seed, seed, a.per_phase) for seed in range(a.start, a.start+a.seeds)]
        for i, fut in enumerate(as_completed(jobs), 1):
            row = fut.result()
            (a.output/f"seed_{row['seed']}.json").write_text(json.dumps(row, sort_keys=True, indent=2)+'\n')
            print(f"completed population {row['seed']} ({i}/{a.seeds}): {len(row['trials'])} encounters", flush=True)
    (a.output/'parameters.json').write_text(json.dumps(vars(a), default=str, sort_keys=True, indent=2)+'\n')


if __name__ == '__main__':
    main()
