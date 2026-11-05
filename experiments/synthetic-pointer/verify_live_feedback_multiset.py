#!/usr/bin/env python3
"""Check that verified replay and shuffled traces use the same donor samples."""
from collections import Counter
import hashlib
import json
from pathlib import Path
import sys


def read(trace: Path, receipt: Path, mode: str):
    verified = json.loads(receipt.read_text())
    if verified['status'] != 'PASS' or verified['mode'] != mode:
        raise ValueError('Expected a separately verified ' + mode + ' trace')
    counts, steps, footer = Counter(), 0, None
    with trace.open() as stream:
        for line in stream:
            item = json.loads(line)
            if item['kind'] == 'STEP':
                steps += 1
                if item['tick'] != steps:
                    raise ValueError('Nonconsecutive trace')
                if item['liveLoop']['active']:
                    value = json.dumps(item['liveLoop']['deliveredFeedback'], sort_keys=True, separators=(',', ':'))
                    counts[value] += 1
            elif item['kind'] == 'FINISH':
                footer = item
    if steps != 20160 or sum(counts.values()) != 4800 or not footer or \
       footer['recordHash'] != verified['independentlyRecomputedHead']:
        raise ValueError('Trace does not match its verification receipt')
    return verified, counts


def main():
    if len(sys.argv) != 5:
        raise SystemExit('usage: python verify_live_feedback_multiset.py REPLAY_TRACE REPLAY_RECEIPT SHUFFLED_TRACE SHUFFLED_RECEIPT')
    a, x = read(Path(sys.argv[1]), Path(sys.argv[2]), 'replay')
    b, y = read(Path(sys.argv[3]), Path(sys.argv[4]), 'shuffled')
    if a['world'] != b['world'] or a['donorSha256'] != b['donorSha256'] or x != y:
        raise ValueError('Donor identity or feedback multiset differs')
    encoded = json.dumps(sorted(x.items()), separators=(',', ':')).encode()
    print(json.dumps({'status': 'PASS', 'world': a['world'], 'samples': sum(x.values()),
        'unique_feedback_triples': len(x), 'donor_sha256': a['donorSha256'],
        'feedback_multiset_sha256': hashlib.sha256(encoded).hexdigest()}, indent=2))


if __name__ == '__main__':
    main()
