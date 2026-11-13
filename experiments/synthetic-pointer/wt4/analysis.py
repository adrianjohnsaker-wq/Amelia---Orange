#!/usr/bin/env python3
"""WT-4 relations and Warp analysis (REGISTRATION.md).   python3 analysis.py <relations.ts output>
K4  O12's lag-2 reading, FRESH: syzygy, current, gate vs RELABEL and REWIRED, exact two-sided sign-flip over 12 units, Holm 0.05
    (ND-1b's B1 tests, unchanged; as WT-2's K4).
K5  O12's longest Warp stay on the CANONICAL passage <= 18, FRESH and MATURED.
K6  MATURED: O12's Warp share at most 3.0 percentage points above P12's (pooled over the 12 CANONICAL units).
K7  O12 keeps no gate: bornAtEnd = 0 in every O12 run.
W1  reading area (lags 2-8, CANONICAL - RELABEL, syzygy+current+gate), O12 - P12, paired exact two-sided sign-flip, FRESH and MATURED.
Descriptive per arm and condition: Warp share, visits, mean and longest stay, flights, flow hops, occupancy, Warp-born gates."""
import collections, json, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / 'nr1'))
import analysis as A
RELS = ('syzygy', 'current', 'gate')
D = json.load(open(sys.argv[1])); G = {(r['cond'], r['graph'], r['arm'], r['unit']): r for r in D['runs']}; U = sorted({r['unit'] for r in D['runs']}); tag = D['label']
def e(run, rel, L, t): return A.enrich(run['path'], run['input'], A.REL[rel], L, f'{tag}|{t}|{rel}|{L}')
T = {f'{rel}_CANONICALvs{c}': [e(G[('FRESH', 'CANONICAL', 'O12', u)], rel, 2, f'{u}|C') - e(G[('FRESH', c, 'O12', u)], rel, 2, f'{u}|{c}') for u in U] for rel in RELS for c in ('RELABEL', 'REWIRED')}
P = {k: A.signflip2(x) for k, x in T.items()}; ok, k4 = True, {}
for i, (k, p) in enumerate(sorted(P.items(), key=lambda x: x[1])):
    ok = ok and p <= 0.05 / (len(P) - i); k4[k] = {'p': p, 'meanD': round(sum(T[k]) / len(U), 5), 'positiveUnits': sum(x > 0 for x in T[k]), 'supported': ok}
def area(cond, arm, u): return sum(e(G[(cond, 'CANONICAL', arm, u)], rel, L, f'{u}|{arm}|C') - e(G[(cond, 'RELABEL', arm, u)], rel, L, f'{u}|{arm}|R') for rel in RELS for L in range(2, 9))
def w1(cond):
    d = [area(cond, 'O12', u) - area(cond, 'P12', u) for u in U]
    return {'d': [round(x, 4) for x in d], 'meanD': round(sum(d) / len(d), 4), 'p': A.signflip2(d), 'positiveUnits': sum(x > 0 for x in d)}
def stays(p):
    out, r = [], 0
    for z in p:
        if z in (3, 6): r += 1
        elif r: out.append(r); r = 0
    if r: out.append(r)
    return out
def desc(cond, arm):
    R = [G[(cond, 'CANONICAL', arm, u)] for u in U]; S = [s for r in R for s in stays(r['path'])]
    return {'area': round(sum(area(cond, arm, u) for u in U) / len(U), 4), 'warpShare': round(sum(sum(z in (3, 6) for z in r['path']) for r in R) / sum(len(r['path']) for r in R), 4),
            'warpVisits': len(S), 'meanStay': round(sum(S) / max(1, len(S)), 2), 'longestStay': max(S or [0]), 'flights': sum(r['flights'] for r in R),
            'flowHops': sum(r['hops'] for r in R), 'bornGatesAtStart': [r['bornAtStart'] for r in R], 'bornGatesAtEnd': [r['bornAtEnd'] for r in R],
            'occupancy': dict(sorted(collections.Counter(z for r in R for z in r['path']).items()))}
d = {c: {a: desc(c, a) for a in ('O12', 'P12')} for c in ('FRESH', 'MATURED')}
k5 = max(d['FRESH']['O12']['longestStay'], d['MATURED']['O12']['longestStay'])
k6 = round(100 * (d['MATURED']['O12']['warpShare'] - d['MATURED']['P12']['warpShare']), 2)
k7 = sum(r['bornAtEnd'] for r in D['runs'] if r['arm'] == 'O12')
print(json.dumps({'K4_O12_relations_FRESH': k4, 'K4_allSupported': all(v['supported'] for v in k4.values()),
                  'K5_longestWarpStayO12': k5, 'K5_pass': k5 <= 18,
                  'K6_matured_warpShare_O12minusP12_points': k6, 'K6_pass': k6 <= 3.0,
                  'K7_O12_gatesKept': k7, 'K7_pass': k7 == 0,
                  'W1_area_O12minusP12': {'FRESH': w1('FRESH'), 'MATURED': w1('MATURED')}, 'descriptive': d}, indent=1))
