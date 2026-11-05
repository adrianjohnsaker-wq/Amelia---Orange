#!/usr/bin/env python3
"""Post-hoc diagnostic: compare 100-step routes and the fixed S-decay value."""
import argparse
import io
import json
from pathlib import Path

import zstandard


def route(condition: Path) -> list[tuple[int, int]]:
    receipt = json.loads((condition / 'run_receipt.json').read_text())
    file = condition / f"attempt_{receipt['attempt']}" / receipt['archive']['compressed_trace']
    result = []
    with file.open('rb') as source, zstandard.ZstdDecompressor().stream_reader(source) as reader:
        with io.TextIOWrapper(reader, encoding='utf-8') as lines:
            for index, line in enumerate(lines):
                if index > 12099:
                    break
                if index >= 12000:  # Header is line 0; step tick is its line number.
                    event = json.loads(line)
                    if event.get('tick') != index:
                        raise ValueError('Unexpected step index in verified trace')
                    result.append((event['from'], event['to']))
    if len(result) != 100:
        raise ValueError('Missing challenge route')
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    data = json.loads((args.root / 'analysis.json').read_text())
    expected = 1 - (1 - 0.002) ** 100
    rows = []
    for item in data['rows']:
        for arm, recovery in item['recovery'].items():
            base = args.root / 'runs' / f"W{item['world']}" / arm
            left, right = route(base / 'none'), route(base / 'injured')
            differences = sum(a != b for a, b in zip(left, right))
            rows.append({'world': item['world'], 'arm': arm, 'recovery': recovery,
                         'matches_passive_decay': abs(recovery - expected) < 1e-10,
                         'different_transitions_during_followup': differences})
    result = {'status': 'POST_HOC_DESCRIPTIVE_ONLY', 'passive_decay_recovery': expected,
        'pairs': len(rows), 'at_passive_decay': sum(r['matches_passive_decay'] for r in rows),
        'same_route': sum(r['different_transitions_during_followup'] == 0 for r in rows),
        'at_decay_and_same_route': sum(r['matches_passive_decay'] and r['different_transitions_during_followup'] == 0 for r in rows),
        'rows': rows,
        'interpretation': 'The fixed S decay explains the value when both twins follow the same 100-step route; this is not a new registered hypothesis.'}
    with args.output.open('x') as target:
        json.dump(result, target, indent=2)
        target.write('\n')
    print(json.dumps({k: v for k, v in result.items() if k != 'rows'}, indent=2))


if __name__ == '__main__':
    main()
