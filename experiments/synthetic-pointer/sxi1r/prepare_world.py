#!/usr/bin/env python3
"""ANTENNA B world stream (see REGISTRATION.md): the first N world-stream data first seen at or after the seal time,
in arrival order, each reduced by AQ to its digital root exactly as THE ANTENNA did (experiments/antenna/prepare.py).

  python3 prepare_world.py <world-live checkout> <seal time ISO> <N> <out.json>
"""
import glob, json, sys, unicodedata
ORDER = {'words': 0, 'markets': 1, 'earth': 2, 'sun': 3, 'date': 4}
def aq(text):
    t = unicodedata.normalize('NFKD', text).upper()
    return sum(int(c) if c in '0123456789' else ord(c) - 55 for c in t if c in '0123456789' or 'A' <= c <= 'Z')
def droot(c): return 0 if c == 0 else 1 + (c - 1) % 9
def main(live, since, n, out):
    seen, items = set(), []
    for f in sorted(glob.glob(f'{live}/batches/*.json')):
        for x in json.load(open(f))['items']:
            k = (x['stream'], x['source'], x['id'])
            if k in seen or x['seenAt'] < since: continue
            seen.add(k); items.append(x)
    items.sort(key=lambda x: (x['seenAt'], x['time'], ORDER[x['stream']], x['source'], x['id']))
    if len(items) < n: print(json.dumps({'ready': False, 'have': len(items), 'need': n})); sys.exit(3)
    items = items[:n]
    json.dump({'zones': [droot(aq(x['text'])) for x in items], 'streams': [x['stream'] for x in items],
               'first': items[0]['seenAt'], 'last': items[-1]['seenAt']}, open(out, 'w'))
    print(json.dumps({'ready': True, 'n': n, 'first': items[0]['seenAt'], 'last': items[-1]['seenAt']}))
if __name__ == '__main__': main(sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4])
