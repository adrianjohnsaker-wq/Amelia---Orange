#!/usr/bin/env python3
"""WE-2 input: WE-1's R60 stream (we1/encode.py, unchanged) with each datum's source key, so surrogates can keep each source's
own order.   python3 prepare.py <world-live checkout> <since ISO> <N> <we1 EDGES.json> <out.json>   (exit 3: not ready)"""
import json, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / 'we1')); import encode as E
live, since, n, edges, out = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4], sys.argv[5]
items = [x for x in E.load(live) if x['seenAt'] >= since]
if len(items) < n: print(json.dumps({'ready': False, 'have': len(items), 'need': n})); sys.exit(3)
items = items[:n]
json.dump({'zones': E.encode(items, json.load(open(edges))['earthMagnitudeNoniles']), 'sources': [f"{x['stream']}|{x['source']}" for x in items],
           'encoding': 'R60', 'first': items[0]['seenAt'], 'last': items[-1]['seenAt']}, open(out, 'w'))
print(json.dumps({'ready': True, 'n': n, 'first': items[0]['seenAt'], 'last': items[-1]['seenAt']}))
