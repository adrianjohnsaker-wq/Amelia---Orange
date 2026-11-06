#!/usr/bin/env python3
"""NR-1b (REGISTRATION_1B.md): lag-2 reading, 6 tests, Holm.   python3 nr1b.py <run.ts output on h02>"""
import json, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import analysis as A
D = json.load(open(sys.argv[1])); get = {(r['graph'], r['receiver'], r['unit']): r for r in D['runs']}; units = sorted({r['unit'] for r in D['runs']})
e = {(g, u, rel): A.enrich(get[(g, 'IDENTITY', u)]['path'], get[(g, 'IDENTITY', u)]['input'], A.REL[rel], 2, f"{D['label']}|lag2|{g}|{u}|{rel}")
     for g in ('CANONICAL', 'RELABEL', 'REWIRED') for u in units for rel in ('syzygy', 'current', 'gate')}
T = {f'{rel}_CANONICALvs{k}': [e[('CANONICAL', u, rel)] - e[(k, u, rel)] for u in units] for rel in ('syzygy', 'current', 'gate') for k in ('RELABEL', 'REWIRED')}
P = {k: A.signflip2(d) for k, d in T.items()}; ok, out = True, {}
for i, (k, p) in enumerate(sorted(P.items(), key=lambda x: x[1])): ok = ok and p <= 0.05 / (len(P) - i); out[k] = {'p': p, 'meanD': round(sum(T[k]) / len(T[k]), 5), 'positiveUnits': sum(x > 0 for x in T[k]), 'supported': ok}
means = {g: {rel: round(sum(e[(g, u, rel)] for u in units) / len(units), 5) for rel in ('syzygy', 'current', 'gate')} for g in ('CANONICAL', 'RELABEL', 'REWIRED')}
print(json.dumps({'label': D['label'], 'lag': 2, 'tests': out, 'meanLag2Enrichment': means}, indent=1))
