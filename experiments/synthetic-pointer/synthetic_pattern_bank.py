#!/usr/bin/env python3
"""Create two addressed, self-repairing synthetic source fixtures and controls.

The source programs, targets and address map are deliberately engineered.
They are not evidence of a naturally occurring outside or an autonomous mind.
Only a frozen output of the source is delivered to W+; the fixture does not
claim that the source remains coupled to Amelia after the exposure window.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

LABELS = ('0>9', '9>1', '1>8', '8>9')
PROGRAMS = {'A': (0, 1, 2, 3), 'B': (0, 2, 1, 3)}
LAYOUTS = {'A': (1, 1, 0, 0), 'B': (0, 0, 1, 1)}
START, WIDTH, BLOCKS = 501, 24, 200
SEED = 'SXI1-SYNTHETIC-BANK-20261104'


def canonical(value) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(',', ':')) + '\n').encode()


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def pointer_layout(source: str) -> dict:
    if source not in LAYOUTS:
        raise ValueError('Unknown synthetic source')
    bits = LAYOUTS[source]
    return {'kind': 'synthetic-coupling-address/v1',
            'couplings': [{'edge': edge, 'multiplier': 0.5 if bit else 1.0}
                          for edge, bit in zip(LABELS, bits)]}


def pointer_address(layout: dict) -> str:
    if layout not in [pointer_layout('A'), pointer_layout('B')]:
        raise ValueError('Pointer layout is not mapped to a source')
    return sha(canonical(layout))


def source_for_layout(layout: dict) -> str:
    address = pointer_address(layout)
    matches = [name for name in PROGRAMS if pointer_address(pointer_layout(name)) == address]
    if len(matches) != 1:
        raise ValueError('Ambiguous source address')
    return matches[0]


class RepairingPattern:
    """A planted cyclic program that restores one altered slot per block."""

    def __init__(self, source: str):
        if source not in PROGRAMS:
            raise ValueError('Unknown synthetic source')
        self.source = source
        self.target = PROGRAMS[source]
        self.ring = list(self.target)
        self.phase = 0
        self.blocks = 0

    def damage(self, slot: int, replacement: int) -> None:
        if slot not in range(4) or replacement not in range(4):
            raise ValueError('Invalid source lesion')
        self.ring[slot] = replacement

    def step(self) -> dict:
        before = self.ring.copy()
        for i, target in enumerate(self.target):
            if self.ring[i] != target:
                self.ring[i] = target
                break
        event = {'block': self.blocks, 'phase': self.phase, 'ring_before': before,
                 'ring_after': self.ring.copy(), 'label': LABELS[self.ring[self.phase]]}
        self.phase = (self.phase + 1) % 4
        self.blocks += 1
        return event


def generated() -> tuple[dict, dict]:
    outputs, provenance = {}, {}
    for layout in (pointer_layout('A'), pointer_layout('B')):
        source = source_for_layout(layout)
        pattern = RepairingPattern(source)
        events = [pattern.step() for _ in range(BLOCKS)]
        sequence = [e['label'] for e in events]
        provenance[source] = {'layout': layout, 'address_sha256': pointer_address(layout),
                              'target': list(PROGRAMS[source]), 'events': events}
        outputs['source_' + source.lower()] = sequence

    # Both controls retain precisely the source-A label multiset.
    seq_a = outputs['source_a']
    permutation = sorted(range(BLOCKS), key=lambda i: hashlib.sha256(
        f'{SEED}|SHUFFLE|{i}'.encode()).digest())
    outputs['shuffled'] = [seq_a[i] for i in permutation]
    mixed = []
    for block in range(BLOCKS // 4):
        mixed.extend(sorted(LABELS, key=lambda edge: hashlib.sha256(
            f'{SEED}|MIX|{block}|{edge}'.encode()).digest()))
    outputs['unpatterned'] = mixed
    outputs['sham'] = []
    return outputs, provenance


def plan(name: str, sequence: list[str], provenance: dict) -> dict:
    source = 'B' if name == 'source_b' else 'A'
    transform = {'source_a': 'none', 'source_b': 'none', 'shuffled': 'whole-block-permutation',
                 'unpatterned': 'balanced-rapid-mix', 'sham': 'no-source'}[name]
    if name != 'sham' and (len(sequence) != BLOCKS or any(sequence.count(x) != 50 for x in LABELS)):
        raise ValueError('Source labels are not perfectly balanced')
    windows = [{'start': START + i * WIDTH, 'end': START + (i + 1) * WIDTH - 1, 'edge': e}
               for i, e in enumerate(sequence)]
    return {'version': 1, 'arm': 'sham' if name == 'sham' else ('patterned' if name.startswith('source_') else name),
            'factor': 0.5, 'windows': windows,
            'synthetic_source': {'id': None if name == 'sham' else source,
                'address_sha256': None if name == 'sham' else provenance[source]['address_sha256'],
                'pointer_layout': None if name == 'sham' else provenance[source]['layout'],
                'transform': transform, 'block_ticks': WIDTH, 'seed': SEED,
                'status': 'PLANTED_SYNTHETIC_SOURCE_NOT_EVIDENCE_OF_AGENCY'}}


def write_bank(output: Path) -> dict:
    output.mkdir(parents=True, exist_ok=False)
    sequences, provenance = generated()
    manifest = {'version': 1, 'seed': SEED, 'labels': LABELS, 'source_records': {}, 'plans': {}}
    for name, record in provenance.items():
        data = canonical(record)
        (output / f'source_{name.lower()}_events.json').write_bytes(data)
        manifest['source_records'][name] = {'address_sha256': record['address_sha256'],
            'source_record_sha256': sha(data), 'events': len(record['events'])}
    for name, sequence in sequences.items():
        doc = plan(name, sequence, provenance)
        data = canonical(doc)
        (output / f'{name}.json').write_bytes(data)
        manifest['plans'][name] = {'sha256': sha(data), 'blocks': len(sequence),
            'per_label_ticks': {e: sequence.count(e) * WIDTH for e in LABELS},
            'total_active_ticks': len(sequence) * WIDTH}
    (output / 'manifest.json').write_bytes(canonical(manifest))
    return manifest


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    print(json.dumps(write_bank(args.output), indent=2))
