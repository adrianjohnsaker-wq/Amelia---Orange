#!/usr/bin/env python3
"""WT-1 analysis (REGISTRATION.md). Read-only.   python3 analysis.py <run.ts output on h04>
Reading measures use only the data she actually received (attended steps): NR-1's enrichment restricted to those steps."""
import hashlib, json, random, sys, pathlib, itertools
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / 'nr1'))
import analysis as A
RELS = ('syzygy', 'current', 'gate')
def hit(z, c, idx, R, L):
    ok = [t for t in idx if t + L < len(z) and R(c[t]) != c[t]]
    return sum(z[t + L] == R(c[t]) for t in ok) / max(1, len(ok))
def enrich(run, rel, L, key):
    z, c = run['path'], run['input']; idx = [t for t, a in enumerate(run['attended']) if a]; R = A.REL[rel]
    rnd = random.Random(hashlib.sha256(f'WT1-SIGMA|{key}'.encode()).hexdigest()); base = 0
    for _ in range(20):
        s = c[:]; rnd.shuffle(s); base += hit(z, s, idx, R, L)
    return hit(z, c, idx, R, L) - base / 20
def warp_share(run): p = run['path']; return sum(z in (3, 6) for z in p) / len(p)
def first_escape(run):
    p = run['path']; t0 = next((i for i, z in enumerate(p) if z in (3, 6)), None)
    if t0 is None: return 0
    return next((i - t0 for i in range(t0, len(p) - 1) if p[i] in (3, 6) and p[i + 1] not in (3, 6)), len(p) - t0)
def holm(T):
    P = {k: A.signflip2(d) for k, d in T.items()}; ok, out = True, {}
    for i, (k, p) in enumerate(sorted(P.items(), key=lambda x: x[1])):
        ok = ok and p <= 0.05 / (len(P) - i); out[k] = {'p': p, 'meanD': round(sum(T[k]) / len(T[k]), 5), 'positiveUnits': sum(x > 0 for x in T[k]), 'supported': ok}
    return out
D = json.load(open(sys.argv[1])); G = {(r['graph'], r['runtime'], r['regime'], r['unit']): r for r in D['runs']}; U = sorted({r['unit'] for r in D['runs']}); tag = D['label']
w1 = [warp_share(G[('CANONICAL', 'RELEASE', 'RARE', u)]) - warp_share(G[('CANONICAL', 'BASE', 'RARE', u)]) for u in U]
T2 = {f'{rel}_CANONICALvs{c}': [enrich(G[('CANONICAL', 'RELEASE', 'SPARSE', u)], rel, 2, f'{tag}|{u}|C|{rel}') - enrich(G[(c, 'RELEASE', 'SPARSE', u)], rel, 2, f'{tag}|{u}|{c}|{rel}') for u in U]
      for rel in RELS for c in ('RELABEL', 'REWIRED')}
def area(rt, reg, u): return sum(enrich(G[('CANONICAL', rt, reg, u)], rel, L, f'{tag}|{u}|C|{rel}|{L}') - enrich(G[('RELABEL', rt, reg, u)], rel, L, f'{tag}|{u}|R|{rel}|{L}') for rel in RELS for L in range(2, 9))
desc = {}
for reg in ('FULL', 'SPARSE', 'RARE'):
    for rt in ('BASE', 'RELEASE'):
        runs = [G[('CANONICAL', rt, reg, u)] for u in U]
        desc[f'{rt}/{reg}'] = {'warpShare': round(sum(map(warp_share, runs)) / len(U), 3), 'firstEscapeSteps': [first_escape(r) for r in runs],
                               'flights': sum(r['flights'] for r in runs), 'readingArea': round(sum(area(rt, reg, u) for u in U) / len(U), 4)}
print(json.dumps({'W1_warpShare_RELEASEminusBASE_RARE': {'d': [round(x, 4) for x in w1], 'p': A.signflip2(w1), 'meanD': round(sum(w1) / len(U), 4), 'supported': A.signflip2(w1) <= 0.05 and sum(w1) < 0},
                  'W2_readingUnderRelease_SPARSE_lag2': holm(T2), 'descriptive': desc}, indent=1))
