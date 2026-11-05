#!/usr/bin/env python3
"""Registered world-level analysis of the synthetic-source challenge."""
from __future__ import annotations

import argparse
import hashlib
from itertools import product
import json
from pathlib import Path

from analyse_wplus_challenge import compare

ARMS = ('source_a', 'source_b', 'shuffled', 'unpatterned', 'sham')


def load_extract(path: Path) -> dict:
    value = json.loads(path.read_text())
    value['samples'] = {int(k): v for k, v in value['samples'].items()}
    return value


def verified_extract(path: Path, receipt: dict, world: int, arm: str, mode: str, registration: dict) -> dict:
    if receipt['world'] != world or receipt['arm'] != arm or receipt['challenge'] != mode:
        raise ValueError('Run receipt identity mismatch')
    if hashlib.sha256(path.read_bytes()).hexdigest() != receipt['challenge_extract_sha256']:
        raise ValueError('Challenge extract hash mismatch')
    value = load_extract(path)
    header = value['header']
    plan_path = f'experiments/synthetic-pointer/sxi1/bank/{arm}.json'
    if header['world'] != f'S05W{world}' or header['lineage'] != 0 or header['challenge']['mode'] != mode or \
       header['pointer']['scheduleSha256'] != registration['files'][plan_path]:
        raise ValueError('World, lineage, condition or source-plan identity mismatch')
    return value


def exact_flip(values: list[float]) -> float:
    """One-sided exhaustive sign flip, conditional on symmetric world differences."""
    if not values:
        raise ValueError('Empty sign flip')
    observed = sum(values)
    return sum(sum(sign * value for sign, value in zip(signs, values)) >= observed - 1e-12
               for signs in product((-1, 1), repeat=len(values))) / (2 ** len(values))


def analyse(root: Path, registration: dict) -> dict:
    rows, failures = [], []
    for world in registration['worlds']:
        base = root / 'runs' / f'W{world}'
        try:
            row = {'world': world, 'recovery': {}, 'choice_opportunities': {}}
            for arm in ARMS:
                paths = [base / arm / condition for condition in ('none', 'injured')]
                receipts = [json.loads((p / 'run_receipt.json').read_text()) for p in paths]
                for receipt in receipts:
                    verification = receipt['verification']
                    if verification['status'] != 'PASS' or verification['pointerActiveTicks'] != (0 if arm == 'sham' else 4800):
                        raise ValueError(f'Failed trace/exposure verification: {arm}')
                    expected_dose = 0 if arm == 'sham' else 240
                    if abs(verification['realisedAbsoluteDelta'] - expected_dose) > 1e-7:
                        raise ValueError(f'Wrong score dose: {arm}')
                a, b = [verified_extract(p / 'challenge_extract.json', receipt, world, arm, mode, registration)
                        for p, receipt, mode in zip(paths, receipts, ('none', 'injured'))]
                row['recovery'][arm] = compare(a, b)['recovery']
                row['choice_opportunities'][arm] = receipts[0]['verification']['choicesWithAlternatives']
            positive_path = base / 'source_a' / 'positive'
            positive_receipt = json.loads((positive_path / 'run_receipt.json').read_text())
            if positive_receipt['verification']['status'] != 'PASS' or positive_receipt['verification']['plantedRepairEvents'] != 100 or \
               positive_receipt['verification']['pointerActiveTicks'] != 4800 or \
               abs(positive_receipt['verification']['realisedAbsoluteDelta'] - 240) > 1e-7:
                raise ValueError('Positive control failed trace verification')
            uninjured_path = base / 'source_a' / 'none'
            uninjured_receipt = json.loads((uninjured_path / 'run_receipt.json').read_text())
            uninjured = verified_extract(uninjured_path / 'challenge_extract.json', uninjured_receipt,
                                         world, 'source_a', 'none', registration)
            positive = verified_extract(positive_path / 'challenge_extract.json', positive_receipt,
                                        world, 'source_a', 'positive', registration)
            row['positive_recovery'] = compare(uninjured, positive)['recovery']
            row['positive_pass'] = row['positive_recovery'] >= 0.6 and \
                row['positive_recovery'] - row['recovery']['source_a'] >= 0.2
            rows.append(row)
        except (OSError, ValueError, KeyError, json.JSONDecodeError) as error:
            failures.append({'world': world, 'reason': str(error)})

    result = {'status': 'inconclusive_missing_worlds' if failures else 'complete',
              'planned_worlds': registration['worlds'], 'valid_worlds': len(rows),
              'failures': failures, 'rows': rows, 'tests': [],
              'interpretation': 'A synthetic recovery screen; not proof of an external mind or agency.'}
    if failures or len(rows) != len(registration['worlds']):
        return result
    positive_count = sum(row['positive_pass'] for row in rows)
    gate = positive_count >= 6
    result['positive_control'] = {'passing_worlds': positive_count, 'required_worlds': 6, 'pass': gate}
    threshold = registration['minimum_recovery_advantage']
    for name, control in [('H1', 'shuffled'), ('H2', 'unpatterned')]:
        effects = [row['recovery']['source_a'] - row['recovery'][control] for row in rows]
        tests = {'test': name, 'comparison': f'source_a - {control}', 'mean_difference': sum(effects) / len(effects),
                 'minimum_advantage': threshold, 'worlds_above_advantage': sum(x > threshold for x in effects),
                 'p_sign_flip': exact_flip([x - threshold for x in effects])}
        result['tests'].append(tests)
    order = sorted(range(len(result['tests'])), key=lambda i: result['tests'][i]['p_sign_flip'])
    stop = False
    for rank, index in enumerate(order):
        test = result['tests'][index]
        test['holm_threshold'] = 0.01 / (len(order) - rank)
        test['holm_pass'] = not stop and test['p_sign_flip'] <= test['holm_threshold']
        stop = stop or not test['holm_pass']
        test['supported'] = bool(gate and test['holm_pass'] and test['worlds_above_advantage'] >= 6)
    if not gate:
        result['status'] = 'inconclusive_positive_control'
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', required=True, type=Path)
    parser.add_argument('--registration', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    result = analyse(args.root, json.loads(args.registration.read_text()))
    with args.output.open('x') as stream:
        json.dump(result, stream, indent=2)
        stream.write('\n')
    print(json.dumps(result, indent=2))
