#!/usr/bin/env python3
"""WE-1 order-preserving encoding R60 (REGISTRATION.md). Selection and arrival order exactly as nr2/prepare_world.py (the
first N world-stream data first seen at or after the seal, sorted by seenAt, time, stream, source, id); only the reduction
of each datum to a zone changes.
  markets (each symbol), sun : the reading's rank within that source's previous 60 readings in the window (ties count half),
                               r in [0, 1] -> zone min(9, 1 + floor(9 r)). A source's first reading -> zone 5.
                               (Where the reading stands against its own recent past: a rising market climbs toward 9.)
  earth                      : the magnitude (first number), by nonile edges from data first seen before the seal -> 1-9.
  words, date                : AQ digital root, as before (THE ANTENNA's reduction).
  python3 encode.py calibrate <world-live checkout> <until ISO> <EDGES.json>
  python3 encode.py prepare   <world-live checkout> <seal time ISO> <N> <EDGES.json> <out.json>   (exit 3: not ready)"""
import bisect, collections, glob, json, sys, unicodedata
ORDER = {'words': 0, 'markets': 1, 'earth': 2, 'sun': 3, 'date': 4}
RANKED, W = {'markets', 'sun'}, 60
def aq(text):
    t = unicodedata.normalize('NFKD', text).upper()
    return sum(int(c) if c in '0123456789' else ord(c) - 55 for c in t if c in '0123456789' or 'A' <= c <= 'Z')
def droot(c): return 0 if c == 0 else 1 + (c - 1) % 9
def value(x): return float(x['text'].split()[0])
def load(live):
    seen, items = set(), []
    for f in sorted(glob.glob(f'{live}/batches/*.json')):
        for x in json.load(open(f))['items']:
            k = (x['stream'], x['source'], x['id'])
            if k in seen: continue
            seen.add(k); items.append(x)
    items.sort(key=lambda x: (x['seenAt'], x['time'], ORDER[x['stream']], x['source'], x['id']))
    return items
def encode(items, mag_edges):
    hist, out = collections.defaultdict(list), []
    for x in items:
        if x['stream'] in RANKED:
            v, h = value(x), hist[f"{x['stream']}|{x['source']}"]
            r = (sum(y < v for y in h) + 0.5 * sum(y == v for y in h)) / len(h) if h else 0.5
            out.append(min(9, 1 + int(r * 9))); h.append(v)
            if len(h) > W: h.pop(0)
        elif x['stream'] == 'earth': out.append(1 + bisect.bisect_right(mag_edges, value(x)))
        else: out.append(droot(aq(x['text'])))
    return out
def calibrate(live, until, out):
    mags = sorted(value(x) for x in load(live) if x['seenAt'] < until and x['stream'] == 'earth')
    e = [mags[min(len(mags) - 1, int(len(mags) * i / 9))] for i in range(1, 9)]
    json.dump({'earthMagnitudeNoniles': e, 'n': len(mags), 'until': until}, open(out, 'w'), indent=1); print(json.dumps({'n': len(mags), 'edges': e}))
def prepare(live, since, n, edges, out):
    items = [x for x in load(live) if x['seenAt'] >= since]
    if len(items) < n: print(json.dumps({'ready': False, 'have': len(items), 'need': n})); sys.exit(3)
    items = items[:n]
    json.dump({'zones': encode(items, json.load(open(edges))['earthMagnitudeNoniles']), 'streams': [x['stream'] for x in items],
               'encoding': 'R60', 'first': items[0]['seenAt'], 'last': items[-1]['seenAt']}, open(out, 'w'))
    print(json.dumps({'ready': True, 'n': n, 'first': items[0]['seenAt'], 'last': items[-1]['seenAt']}))
if __name__ == '__main__':
    if sys.argv[1] == 'calibrate': calibrate(*sys.argv[2:5])
    elif sys.argv[1] == 'prepare': prepare(sys.argv[2], sys.argv[3], int(sys.argv[4]), sys.argv[5], sys.argv[6])
