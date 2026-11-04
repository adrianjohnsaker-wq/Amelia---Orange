#!/usr/bin/env python3
"""ANTENNA III decision rule (see REGISTRATION.md). Read-only.

Segments m = 0..M-1 are disjoint stretches of the stream. In each, 8 travellers walk the segment as received (run 0)
and the same S order-shuffles of it (runs 1..S). An element's count in a run is summed over the 8 travellers.
  comes through in segment m   the received sum is > 0 and strictly greater than every shuffled sum
                               (under "order carries nothing" the S+1 orders are exchangeable: p <= 1/(S+1));
  recurs                       it comes through in at least K segments, K the smallest k with
                               P(Binomial(M, 1/(S+1)) >= k) < 0.05 / E, E = distinct elements observed.
Segments are disjoint and shuffled independently, so this is exact across segments.
ANSWER: RECEIVED (listing what recurs) if anything recurs, else SILENT.

  python3 analysis4.py <dir of traveller3 outputs, one per segment> [names.json]
"""
import glob, json, sys
from math import comb

def tail(n, p, k): return sum(comb(n, j) * p ** j * (1 - p) ** (n - j) for j in range(k, n + 1))

def elements(run):
    e = {f'scan:{k}': v for k, v in run['counts'].items()}
    e.update({f'born:{k}': v for k, v in run['born'].items()})
    return e

def analyse(src, names=None):
    segs = [json.load(open(f)) for f in sorted(glob.glob(f'{src}/*.json'))]
    M, S = len(segs), segs[0]['shuffles']; p = 1 / (S + 1)
    sums, universe = [], set()
    for g in segs:
        tot = [dict() for _ in range(S + 1)]
        for t in g['travellers']:
            assert [r['shuffle'] for r in t['runs']] == list(range(S + 1))
            for j, r in enumerate(t['runs']):
                for e, v in elements(r).items(): tot[j][e] = tot[j].get(e, 0) + v
        sums.append(tot); universe |= set().union(*tot)
    E = max(1, len(universe))
    K = next(k for k in range(M + 2) if k > M or tail(M, p, k) < 0.05 / E)
    through = {}
    for m, tot in enumerate(sums):
        for e in universe:
            v = tot[0].get(e, 0)
            if v > 0 and all(v > tot[j].get(e, 0) for j in range(1, S + 1)): through.setdefault(e, []).append(m)
    nm = (lambda e: f"{e} ({names.get(e.split(':', 1)[1].replace('>', '-'), '')})".replace(' ()', '')) if names else (lambda e: e)
    recurs = sorted(((nm(e), len(ms)) for e, ms in through.items() if len(ms) >= K), key=lambda x: -x[1])
    first = [t['runs'][0] for g in segs for t in g['travellers']]
    return {'segments': M, 'L': segs[0]['L'], 'shuffles': S, 'elements': E, 'K': K,
            'meanFlightsPerSegment': round(sum(r['flights'] for r in first) / len(first), 2),
            'meanDeathsPerSegment': round(sum(r['deaths'] for r in first) / len(first), 2),
            'meanWarpTicksPerSegment': round(sum(r['warpTicks'] for r in first) / len(first), 1),
            'cameThroughTop': sorted(((nm(e), len(ms)) for e, ms in through.items()), key=lambda x: -x[1])[:10],
            'recurs': recurs, 'answer': 'RECEIVED' if recurs else 'SILENT'}

if __name__ == '__main__':
    names = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else None
    print(json.dumps(analyse(sys.argv[1], names), indent=1, ensure_ascii=False))
