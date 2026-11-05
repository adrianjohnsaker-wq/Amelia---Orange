#!/usr/bin/env python3
"""Predeclared SXI-2 held-out route-retention analysis."""
from __future__ import annotations
import argparse
import itertools
import json
from pathlib import Path
import statistics

ARMS = ('live', 'replay', 'shuffled', 'sham', 'target_dynamic', 'target_frozen', 'orthogonal')


def similarity(a, b):
    if sum(a.values()) != 498 or sum(b.values()) != 498:
        raise ValueError('Each 500-step window must contain exactly 498 triples')
    return 1 - sum(abs(a.get(k, 0)-b.get(k, 0)) for k in a.keys() | b.keys()) / (2*498)


def retention(triplets):
    return similarity(triplets['exposure'], triplets['post']) - similarity(triplets['baseline'], triplets['post'])


def sign_flip_p(values, margin):
    """Exact one-sided paired sign-flip test; assumes independent symmetric differences."""
    centered = [v-margin for v in values]
    observed = sum(centered)
    all_sums = [sum(s*x for s, x in zip(signs, centered)) for signs in itertools.product((-1, 1), repeat=len(centered))]
    return sum(x >= observed-1e-12 for x in all_sums) / len(all_sums)


def holm(ps):
    adjusted = [0.0] * len(ps)
    prior = 0.0
    for rank, i in enumerate(sorted(range(len(ps)), key=lambda x: ps[x])):
        prior = max(prior, min(1.0, (len(ps)-rank)*ps[i]))
        adjusted[i] = prior
    return adjusted


def analyse(root, registration):
    rows, checks = [], []
    worlds = registration['worlds']
    for world in worlds:
        data = {}
        for arm in ARMS:
            final = root / 'runs' / f'W{world}' / arm
            receipt = json.loads((final / 'run_receipt.json').read_text())
            extract = json.loads((final / 'extract.json').read_text())
            v = receipt['verification']
            if v['status'] != 'PASS' or extract['traceHead'] != v['independentlyRecomputedHead']:
                raise ValueError(f'Unverified trace W{world} {arm}')
            if extract['world'] != f'S05W{world}':
                raise ValueError('World mismatch')
            data[arm] = (extract, v)
        if len({data[arm][0]['prefix500Digest'] for arm in ARMS}) != 1:
            raise ValueError(f'Nonidentical pre-exposure trajectory W{world}')
        d, vd = data['target_dynamic']; f, vf = data['target_frozen']; o, vo = data['orthogonal']
        if not (vd['prefix699Digest'] == vf['prefix699Digest'] == vo['prefix699Digest']):
            raise ValueError(f'Nonidentical intervention prefix W{world}')
        a, b, c = d['tick700'], f['tick700'], o['tick700']
        for key in ('organDigest', 'houseDigest', 'actualFeedback', 'bankBefore'):
            if a[key] != b[key]: raise ValueError(f'Targeted twins differ at intervention: {key} W{world}')
        if abs(a['mutation']['actualL2']-c['mutation']['actualL2']) > 1e-12:
            raise ValueError('Unequal phase intervention magnitude')
        first = next((700+i for i,(x,y) in enumerate(zip(d['transitions700to1000'], f['transitions700to1000'])) if x != y), None)
        checks.append({'world':world, 'address_switched':a['address'] != b['address'],
            'orthogonal_retained_address':c['address'] == c['mutation']['before']['address'],
            'different_selected_gate':a['selectedEdge'] != b['selectedEdge'],
            'first_different_destination_700_to_1000':first,
            'same_body_feedback_bank_at_intervention':True,
            'phase_intervention_l2':a['mutation']['actualL2']})
        row = {'world':world, 'donor_world':world+100}
        for arm in ARMS:
            extract, verify = data[arm]
            row[arm] = {'retention':retention(extract['triplets']),
                'exposure_post_similarity':similarity(extract['triplets']['exposure'],extract['triplets']['post']),
                'baseline_post_similarity':similarity(extract['triplets']['baseline'],extract['triplets']['post']),
                'choices_with_alternatives':verify['choicesWithAlternatives'],
                'source_ticks':verify['sourceTicks'], 'pointer_address_changes':verify['pointerAddressChanges']}
        row['live_counterfactual'] = data['live'][0]['counterfactual']
        if not row['live_counterfactual'] or row['live_counterfactual']['ticks'] != 4800:
            raise ValueError('Missing counterfactual feedback check')
        rows.append(row)
    tests = []
    margin = registration['minimum_retention_advantage']
    for control in ('replay', 'shuffled'):
        differences = [row['live']['retention']-row[control]['retention'] for row in rows]
        tests.append({'control':control, 'world_differences':differences,
            'mean_difference':statistics.mean(differences), 'worlds_above_margin':sum(x>margin for x in differences),
            'p_one_sided_sign_flip':sign_flip_p(differences,margin)})
    for test, adj in zip(tests, holm([t['p_one_sided_sign_flip'] for t in tests])):
        test['p_holm'] = adj
        test['supported'] = (adj <= registration['family_alpha'] and
                             test['worlds_above_margin'] >= registration['required_worlds_above_margin'])
    return {'study':registration['study'], 'status':'complete', 'worlds':worlds,
        'tests':tests, 'rows':rows, 'mechanism_checks':checks,
        'limitations':['Source and address decoder are engineered; no inference of an external mind or consciousness.',
          'Replay and shuffle share a donor multiset; live feedback does not have the same multiset.',
          'Sign-flip inference is conditional on independent, symmetric world differences; worlds share the same initial lineage.',
          'No positive control establishes whole-W+ sensitivity of the retention outcome.']}


def main():
    p=argparse.ArgumentParser();p.add_argument('--output',required=True,type=Path);p.add_argument('--registration',required=True,type=Path)
    p.add_argument('--result',required=True,type=Path); a=p.parse_args()
    result=analyse(a.output,json.loads(a.registration.read_text()))
    with a.result.open('x') as f: json.dump(result,f,indent=2);f.write('\n')
    print(json.dumps({'status':result['status'],'tests':result['tests']},indent=2))
if __name__ == '__main__': main()
