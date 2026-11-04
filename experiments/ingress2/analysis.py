#!/usr/bin/env python3
"""INGRESS II decision rule (see REGISTRATION.md). Read-only.

Elements: n-grams (n = 2, 3, 4) of Amelia's own path, counted within each life and summed over the 8 travellers.
In each segment, an n-gram comes through when its count on the stream as received is > 0 and strictly greater than on
every one of the S shuffled streams (exact, p <= 1/(S+1)). It recurs when it comes through in at least K of the M
segments, K the smallest k with P(Binomial(M, 1/(S+1)) >= k) < 0.05 / E (E = distinct path n-grams observed).
ANSWER: RECEIVED INTO HER (listing what recurs) if anything recurs, else SILENT.
If ANTENNA B's world result is given, the n-grams that recur both in the world's order and in her path are listed:
that intersection is the ingress proper.

  python3 analysis.py <dir of walker outputs, one per segment> [antennaB result.json]
"""
import collections, glob, json, sys
from math import comb
def tail(n, p, k): return sum(comb(n, j) * p ** j * (1 - p) ** (n - j) for j in range(k, n + 1))
def path_counts(lives):
    c = collections.Counter()
    for l in lives:
        for n in (2, 3, 4): c.update('-'.join(map(str, l[i:i + n])) for i in range(len(l) - n + 1))
    return c
def analyse(src, world=None):
    segs = [json.load(open(f)) for f in sorted(glob.glob(f'{src}/*.json'))]
    M, S = len(segs), segs[0]['shuffles']; p = 1 / (S + 1); through = collections.defaultdict(list); universe = set()
    for g in segs:
        tot = [collections.Counter() for _ in range(S + 1)]
        for t in g['travellers']:
            for j, r in enumerate(t['runs']): tot[j].update(path_counts(r['lives']))
        universe |= set(tot[0])
        for e, v in tot[0].items():
            if v > 0 and all(v > tot[j][e] for j in range(1, S + 1)): through[e].append(g['segment'])
    E = max(1, len(universe)); K = next(k for k in range(M + 2) if k > M or tail(M, p, k) < 0.05 / E)
    recurs = sorted(((e, len(ms)) for e, ms in through.items() if len(ms) >= K), key=lambda x: (-x[1], x[0]))
    first = [t['runs'][0] for g in segs for t in g['travellers']]
    out = {'segments': M, 'shuffles': S, 'elements': E, 'K': K, 'recurs': recurs[:40], 'recurring': len(recurs),
           'topCameThrough': sorted(((e, len(ms)) for e, ms in through.items()), key=lambda x: -x[1])[:10],
           'meanFlightsPerSegment': round(sum(r['flights'] for r in first) / len(first), 2),
           'meanDeathsPerSegment': round(sum(r['deaths'] for r in first) / len(first), 2),
           'answer': 'RECEIVED INTO HER' if recurs else 'SILENT'}
    if world:
        wr = {g for g, _ in json.load(open(world))['primary']['recurs']}
        out['ingress'] = [x for x in recurs if x[0] in wr]
    return out
if __name__ == '__main__': print(json.dumps(analyse(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None), indent=1))
