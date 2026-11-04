#!/usr/bin/env python3
"""ANTENNA II decision rule, amendment 1: exact stream-level permutation test. Read-only.

Every traveller hears the same S+1 streams: stream 0 as received and the same S order-shuffles (traveller2.mjs,
amendment 1). For any stream s, an element e "comes through" in a traveller when its count in s is > 0 and strictly
greater than in each of the other S streams. N_s(e) = number of travellers where e comes through in s, counted only
if they span at least 5 worlds (else 0). T_s = max_e N_s(e).

Under "the stream's order carries nothing", the S+1 streams are exchangeable, and every traveller is the same
function of the stream, so T_0, ..., T_S are exchangeable: P(T_0 > all others) <= 1/(S+1). This holds however
strongly the travellers depend on one another. ANSWER: RECEIVED if T_0 is strictly greater than every T_s (s >= 1),
else SILENT. What recurs: the elements with N_0(e) > max over s >= 1 of T_s.

  python3 analysis3.py <dir of traveller2 outputs for one condition> [names.json]
"""
import glob, json, sys

def elements(run):
    e = {f'scan:{k}': v for k, v in run['counts'].items()}
    e.update({f'born:{k}': v for k, v in run['born'].items()})
    return e

def analyse(src, names=None):
    T = [json.load(open(f)) for f in sorted(glob.glob(f'{src}/*.json'))]
    n, S = len(T), T[0]['shuffles']
    for t in T: assert len(t['runs']) == S + 1 and [r['shuffle'] for r in t['runs']] == list(range(S + 1))
    universe = set()
    for t in T:
        for r in t['runs']: universe |= set(elements(r))
    N = [dict() for _ in range(S + 1)]                       # N[s][e] = worlds of travellers where e comes through in s
    for t in T:
        vals = [elements(r) for r in t['runs']]
        for s in range(S + 1):
            for e in universe:
                v = vals[s].get(e, 0)
                if v > 0 and all(v > vals[q].get(e, 0) for q in range(S + 1) if q != s): N[s].setdefault(e, []).append(t['world'])
    score = lambda s, e: len(N[s].get(e, [])) if len(set(N[s].get(e, []))) >= 5 else 0
    Ts = [max([score(s, e) for e in universe] or [0]) for s in range(S + 1)]
    null_max = max(Ts[1:])
    received = Ts[0] > null_max
    nm = (lambda e: f"{e} ({names.get(e.split(':', 1)[1].replace('>', '-'), '')})".replace(' ()', '')) if names else (lambda e: e)
    recurs = sorted(((nm(e), score(0, e), len(set(N[0][e]))) for e in N[0] if score(0, e) > null_max), key=lambda x: -x[1])
    first = [t['runs'][0] for t in T]
    return {'travellers': n, 'streams': S + 1, 'elements': len(universe), 'T_received': Ts[0], 'T_shuffles_max': null_max,
            'T_shuffles': Ts[1:], 'meanFlights': round(sum(r['flights'] for r in first) / n, 1),
            'meanDeaths': round(sum(r['deaths'] for r in first) / n, 1), 'meanWarpTicks': round(sum(r['warpTicks'] for r in first) / n, 1),
            'recurs': recurs, 'answer': 'RECEIVED' if received else 'SILENT'}

if __name__ == '__main__':
    names = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else None
    print(json.dumps(analyse(sys.argv[1], names), indent=1, ensure_ascii=False))
