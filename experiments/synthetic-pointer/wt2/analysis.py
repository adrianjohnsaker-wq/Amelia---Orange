#!/usr/bin/env python3
"""WT-2 relations and Warp analysis (REGISTRATION.md).   python3 analysis.py <relations.ts output>
K4  T12's lag-2 reading: syzygy, current, gate vs RELABEL and REWIRED, exact two-sided sign-flip over 12 units, Holm 0.05
    (ND-1b's B1 tests, unchanged).
W1  reading area (lags 2-8, CANONICAL - RELABEL, syzygy+current+gate), T12 - T24, paired exact two-sided sign-flip.
K5  T12's longest Warp stay on the CANONICAL passage <= 18 (12 + 6).
Descriptive per arm: Warp share, visits, mean and longest stay, flights, occupancy."""
import collections, json, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / 'nr1'))
import analysis as A
RELS = ('syzygy', 'current', 'gate')
D = json.load(open(sys.argv[1])); G = {(r['graph'], r['arm'], r['unit']): r for r in D['runs']}; U = sorted({r['unit'] for r in D['runs']}); tag = D['label']
def e(run, rel, L, t): return A.enrich(run['path'], run['input'], A.REL[rel], L, f'{tag}|{t}|{rel}|{L}')
T = {f'{rel}_CANONICALvs{c}': [e(G[('CANONICAL', 'T12', u)], rel, 2, f'{u}|C') - e(G[(c, 'T12', u)], rel, 2, f'{u}|{c}') for u in U] for rel in RELS for c in ('RELABEL', 'REWIRED')}
P = {k: A.signflip2(x) for k, x in T.items()}; ok, k4 = True, {}
for i, (k, p) in enumerate(sorted(P.items(), key=lambda x: x[1])):
    ok = ok and p <= 0.05 / (len(P) - i); k4[k] = {'p': p, 'meanD': round(sum(T[k]) / len(U), 5), 'positiveUnits': sum(x > 0 for x in T[k]), 'supported': ok}
def area(arm, u): return sum(e(G[('CANONICAL', arm, u)], rel, L, f'{u}|{arm}|C') - e(G[('RELABEL', arm, u)], rel, L, f'{u}|{arm}|R') for rel in RELS for L in range(2, 9))
w1 = [area('T12', u) - area('T24', u) for u in U]
def stays(p):
    out, r = [], 0
    for z in p:
        if z in (3, 6): r += 1
        elif r: out.append(r); r = 0
    if r: out.append(r)
    return out
def desc(arm):
    S = [s for u in U for s in stays(G[('CANONICAL', arm, u)]['path'])]
    return {'area': round(sum(area(arm, u) for u in U) / len(U), 4), 'warpShare': round(sum(sum(z in (3, 6) for z in G[('CANONICAL', arm, u)]['path']) for u in U) / (1001 * len(U)), 4),
            'warpVisits': len(S), 'meanStay': round(sum(S) / max(1, len(S)), 2), 'longestStay': max(S or [0]), 'flights': sum(G[('CANONICAL', arm, u)]['flights'] for u in U),
            'flowHops': sum(G[('CANONICAL', arm, u)]['hops'] for u in U), 'occupancy': dict(sorted(collections.Counter(z for u in U for z in G[('CANONICAL', arm, u)]['path']).items()))}
d = {a: desc(a) for a in ('T12', 'T24')}
print(json.dumps({'K4_T12_relations': k4, 'K4_allSupported': all(v['supported'] for v in k4.values()),
                  'W1_area_T12minusT24': {'d': [round(x, 4) for x in w1], 'meanD': round(sum(w1) / len(w1), 4), 'p': A.signflip2(w1), 'positiveUnits': sum(x > 0 for x in w1)},
                  'K5_longestWarpStayT12': d['T12']['longestStay'], 'K5_pass': d['T12']['longestStay'] <= 18, 'descriptive': d}, indent=1))
