#!/usr/bin/env python3
"""Compare a challenged W+ trace to its matched uninjured twin.

Recovery is 1 - ||S_challenged - S_twin||_2 / ||injury||_2, measured before
the transition at tick 12100. Verification of each trace is a separate step.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path


def trace(path: Path) -> dict:
    prefix = hashlib.sha256()
    inputs = hashlib.sha256()
    result = {'header': None, 'samples': {}, 'reference': None, 'steps': 0, 'finish': None}
    with path.open() as stream:
        for line in stream:
            record = json.loads(line)
            if record['kind'] == 'START':
                if result['header'] is not None:
                    raise ValueError('Duplicate trace header')
                result['header'] = record
            elif record['kind'] == 'FINISH':
                result['finish'] = record
            elif record['kind'] == 'STEP':
                tick = record['tick']
                result['steps'] += 1
                if tick != result['steps']:
                    raise ValueError('Trace ticks are not consecutive')
                inputs.update(record['inputDigest'].encode())
                if tick < 12000:
                    prefix.update(json.dumps([record[x] for x in ('tick', 'from', 'to', 'inputDigest',
                        'transitionDigest', 'organDigest', 'houseDigest')], separators=(',', ':')).encode())
                if tick in (12000, 12100):
                    if not record['stateSample']:
                        raise ValueError('Missing challenge sample')
                    result['samples'][tick] = record['stateSample']['S']
                if tick == 12000:
                    result['reference'] = record['challenge']['reference']
            else:
                raise ValueError('Unexpected trace record')
    if not result['header'] or not result['finish'] or result['steps'] != 20160 or len(result['samples']) != 2:
        raise ValueError('Incomplete challenge trace')
    result['prefix_sha256'] = prefix.hexdigest()
    result['input_sequence_sha256'] = inputs.hexdigest()
    return result


def distance(a: dict, b: dict) -> float:
    if a.keys() != b.keys():
        raise ValueError('House edge sets differ')
    return math.sqrt(sum((a[e] - b[e]) ** 2 for e in sorted(a)))


def compare(baseline: dict, intervention: dict) -> dict:
    a, b = baseline['header'], intervention['header']
    if a['challenge']['mode'] != 'none' or b['challenge']['mode'] not in ('injured', 'positive'):
        raise ValueError('Expected an uninjured twin and an injured or positive twin')
    for key in ('world', 'lineage', 'season', 'overlaySha256', 'runtimeHashes'):
        if a[key] != b[key]:
            raise ValueError(f'Unmatched twin field: {key}')
    if a['pointer']['scheduleSha256'] != b['pointer']['scheduleSha256']:
        raise ValueError('Twins used different synthetic source schedules')
    if baseline['prefix_sha256'] != intervention['prefix_sha256'] or \
       baseline['input_sequence_sha256'] != intervention['input_sequence_sha256'] or \
       baseline['reference'] != intervention['reference']:
        raise ValueError('Twins differ before injury or have different input')
    initial = distance(baseline['samples'][12000], intervention['samples'][12000])
    expected = math.sqrt(30) * 0.1
    if abs(initial - expected) > 1e-10:
        raise ValueError('Initial injury does not have the registered magnitude')
    later = distance(baseline['samples'][12100], intervention['samples'][12100])
    return {'world': a['world'], 'lineage': a['lineage'],
        'source_plan_sha256': a['pointer']['scheduleSha256'],
        'synthetic_source': a['pointer']['schedule'].get('synthetic_source'),
        'challenge_mode': b['challenge']['mode'], 'initial_distance': initial,
        'distance_after_100_steps': later, 'recovery': 1 - later / initial,
        'pre_injury_identity_sha256': baseline['prefix_sha256'],
        'interpretation': 'A descriptive house-state recovery measure, not by itself evidence of agency.'}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--baseline', required=True, type=Path)
    parser.add_argument('--challenged', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    value = compare(trace(args.baseline), trace(args.challenged))
    with args.output.open('x') as stream:
        json.dump(value, stream, indent=2)
        stream.write('\n')
    print(json.dumps(value, indent=2))
