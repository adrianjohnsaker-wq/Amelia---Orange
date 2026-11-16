#!/usr/bin/env python3
"""WORLD-2 data: the N world data that follow WE-1's window, R60-encoded.
WE-1 (nr3-field-ingress-20261109, we1/) takes the first 12,000 world data first seen at or after its seal
(2026-11-13T17:56:41Z), ordered as its encode.py load() orders them. WORLD-2 takes the next N data in that same order, so
the two never share a datum. Encoding: WE-1's encode.py encode() (R60) with WE-1's earth edges, history starting at the
first WORLD-2 datum.
  python3 -I prepare_world2.py <world-live checkout> <N> <out world_fresh.json> <out provenance.json>
  exit 3 (and write nothing) if fewer than 12,000 + N data exist after WE-1's seal."""
import hashlib, importlib.util, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); SEAL, WE1_N = '2026-11-13T17:56:41Z', 12000
s = importlib.util.spec_from_file_location('we1encode', os.path.join(HERE, 'encode_we1.py')); e = importlib.util.module_from_spec(s); s.loader.exec_module(e)
live, n, out, prov = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4]
after = [x for x in e.load(live) if x['seenAt'] >= SEAL]
if len(after) < WE1_N + n:
    print(json.dumps({'ready': False, 'afterWE1Seal': len(after), 'need': WE1_N + n})); sys.exit(3)
items = after[WE1_N:WE1_N + n]
z = e.encode(items, json.load(open(os.path.join(HERE, 'EDGES_we1.json')))['earthMagnitudeNoniles'])
json.dump({'zones': z, 'streams': [x['stream'] for x in items], 'first': items[0]['seenAt'], 'last': items[-1]['seenAt'],
           'encoding': 'R60 (WE-1 encode.py)'}, open(out, 'w'))
sha = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()
json.dump({'we1WindowLast': after[WE1_N - 1]['seenAt'], 'first': items[0]['seenAt'], 'last': items[-1]['seenAt'], 'n': n,
           'streams': {k: sum(1 for x in items if x['stream'] == k) for k in sorted({x['stream'] for x in items})},
           'encoderSHA256': sha(os.path.join(HERE, 'encode_we1.py')), 'worldFileSHA256': sha(out)}, open(prov, 'w'), indent=1)
print(json.dumps({'ready': True, 'n': n, 'first': items[0]['seenAt'], 'last': items[-1]['seenAt']}))
