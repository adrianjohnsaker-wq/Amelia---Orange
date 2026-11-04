#!/usr/bin/env python3
"""Create matched, synthetic pointer schedules for an exploratory W+ check.

The same four edges, multiplier and edge-specific durations occur in each
active arm. A schedule is an imposed control, not an ingressing organisation.
"""
import argparse
import hashlib
import json
from pathlib import Path

EDGES = ('0>9', '9>1', '1>8', '8>9')
START = 501
BLOCK = 1200
MICRO = 24
SEED = 'SXI-PILOT-UNPATTERNED-20261104'


def make_windows(order, duration):
    return [{'start': START + i * duration, 'end': START + (i + 1) * duration - 1, 'edge': edge}
            for i, edge in enumerate(order)]


def build():
    unpatterned = []
    for block in range(BLOCK // MICRO):
        unpatterned.extend(sorted(EDGES, key=lambda edge: hashlib.sha256(
            f'{SEED}|{block}|{edge}'.encode()).digest()))
    orders = {
        'sham': [],
        'patterned': make_windows(EDGES, BLOCK),
        'shuffled': make_windows((EDGES[2], EDGES[0], EDGES[3], EDGES[1]), BLOCK),
        'unpatterned': make_windows(unpatterned, MICRO),
    }
    return {name: {'version': 1, 'arm': name, 'factor': 0.5,
                   'windows': windows} for name, windows in orders.items()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=False)
    manifest = {'seed': SEED, 'edges': EDGES, 'arms': {}}
    for name, schedule in build().items():
        data = (json.dumps(schedule, sort_keys=True, separators=(',', ':')) + '\n').encode()
        target = args.output / f'{name}.json'
        target.write_bytes(data)
        durations = {edge: sum(w['end'] - w['start'] + 1 for w in schedule['windows']
                               if w['edge'] == edge) for edge in EDGES}
        ticks = sum(durations.values())
        manifest['arms'][name] = {'sha256': hashlib.sha256(data).hexdigest(),
            'edge_ticks': durations, 'active_ticks': ticks,
            'scheduled_absolute_dose': ticks * (1 - schedule['factor']),
            'scheduled_squared_dose': ticks * (1 - schedule['factor']) ** 2}
    (args.output / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(json.dumps(manifest, indent=2))


if __name__ == '__main__':
    main()
