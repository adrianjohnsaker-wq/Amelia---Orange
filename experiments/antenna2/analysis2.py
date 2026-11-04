#!/usr/bin/env python3
"""ANTENNA II decision rule (see REGISTRATION.md). Read-only.

For each traveller (run 0 = the stream as received; runs 1..S = order-shuffles of the same stream) and each element
(a Pandemonium detection key from the PF-1 scanner, or a Warp-born gate 'born:a>b'):
  comes through   the received stream's count is > 0 and strictly greater than every shuffle's count
                  (under "order carries nothing" the received run is exchangeable with the shuffles: p <= 1/(S+1));
  recurs          it comes through in at least K travellers from at least 5 worlds, where K is the smallest k with
                  P(Binomial(n, 1/(S+1)) >= k) < 0.05 / E, E = number of distinct elements observed.
ANSWER: RECEIVED (listing what recurs) if anything recurs, else SILENT.

  python3 analysis2.py <dir of traveller2 outputs for one condition> [names.json]
"""
import glob, json, sys
from math import comb

def tail(n, p, k): return sum(comb(n, j) * p ** j * (1 - p) ** (n - j) for j in range(k, n + 1))

def elements(run):
    e = {f'scan:{k}': v for k, v in run['counts'].items()}
    e.update({f'born:{k}': v for k, v in run['born'].items()})
    return e

def analyse(src, names=None):
    files = sorted(glob.glob(f'{src}/*.json'))
    T = [json.load(open(f)) for f in files]
    n = len(T); S = T[0]['shuffles']; p = 1 / (S + 1)
    universe = set()
    for t in T:
        for r in t['runs']: universe |= set(elements(r))
    E = max(1, len(universe))
    K = next(k for k in range(n + 2) if k > n or tail(n, p, k) < 0.05 / E)
    through = {}
    for t in T:
        vals = [elements(r) for r in t['runs']]
        for e in universe:
            v0 = vals[0].get(e, 0)
            if v0 > 0 and all(v0 > v.get(e, 0) for v in vals[1:]): through.setdefault(e, []).append(t['world'])
    recurs = sorted(((e, ws) for e, ws in through.items() if len(ws) >= K and len(set(ws)) >= 5), key=lambda x: -len(x[1]))
    nm = (lambda e: f"{e} ({names.get(e.split(':', 1)[1].replace('>', '-'), '')})".replace(' ()', '')) if names else (lambda e: e)
    flights = sum(t['runs'][0]['flights'] for t in T) / n; deaths = sum(t['runs'][0]['deaths'] for t in T) / n
    warp = sum(t['runs'][0]['warpTicks'] for t in T) / n
    return {'travellers': n, 'shuffles': S, 'elements': E, 'K': K, 'meanFlights': round(flights, 1), 'meanDeaths': round(deaths, 1),
            'meanWarpTicks': round(warp, 1), 'cameThroughTop': [(nm(e), len(ws), len(set(ws))) for e, ws in sorted(through.items(), key=lambda x: -len(x[1]))[:12]],
            'recurs': [(nm(e), len(ws), len(set(ws))) for e, ws in recurs],
            'answer': 'RECEIVED' if recurs else 'SILENT'}

if __name__ == '__main__':
    names = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else None
    print(json.dumps(analyse(sys.argv[1], names), indent=1, ensure_ascii=False))
