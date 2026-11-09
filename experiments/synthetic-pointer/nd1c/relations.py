#!/usr/bin/env python3
"""ND-1c K4 (REGISTRATION.md): ND-1b's B1 tests, unchanged (ndb/analysis.py): the candidate's lag-2 reading, relation x
{RELABEL, REWIRED}, exact two-sided sign-flip over 12 units, Holm at 0.05. Descriptive: reading area (lags 2-8) and Warp stay.
  python3 relations.py <relations.ts output>"""
import json, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / 'nr1'))
import analysis as A
RELS = ('syzygy', 'current', 'gate')
D = json.load(open(sys.argv[1])); G = {(r['graph'], r['mode'], r['unit']): r for r in D['runs']}; U = sorted({r['unit'] for r in D['runs']}); tag = D['label']
def e(run, rel, L, t): return A.enrich(run['path'], run['input'], A.REL[rel], L, f'{tag}|{t}|{rel}|{L}')
T = {f'{rel}_CANONICALvs{c}': [e(G[('CANONICAL', 'HYBRID', u)], rel, 2, f'{u}|C') - e(G[(c, 'HYBRID', u)], rel, 2, f'{u}|{c}') for u in U] for rel in RELS for c in ('RELABEL', 'REWIRED')}
P = {k: A.signflip2(x) for k, x in T.items()}; ok, k4 = True, {}
for i, (k, p) in enumerate(sorted(P.items(), key=lambda x: x[1])):
    ok = ok and p <= 0.05 / (len(P) - i); k4[k] = {'p': p, 'meanD': round(sum(T[k]) / len(U), 5), 'positiveUnits': sum(x > 0 for x in T[k]), 'supported': ok}
def area(m, u): return sum(e(G[('CANONICAL', m, u)], rel, L, f'{u}|C') - e(G[('RELABEL', m, u)], rel, L, f'{u}|R') for rel in RELS for L in range(2, 9))
def longestWarp(p):
    m = r = 0
    for z in p: r = r + 1 if z in (3, 6) else 0; m = max(m, r)
    return m
desc = {m: {'area': round(sum(area(m, u) for u in U) / len(U), 4), 'longestWarpStay': max(longestWarp(G[('CANONICAL', m, u)]['path']) for u in U)} for m in ('EXIT', 'HYBRID')}
print(json.dumps({'cfg': D['cfg'], 'K4': k4, 'K4_allSupported': all(v['supported'] for v in k4.values()), 'descriptive': desc}, indent=1))
