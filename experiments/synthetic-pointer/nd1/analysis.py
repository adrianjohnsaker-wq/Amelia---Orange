#!/usr/bin/env python3
"""ND-1 analysis (REGISTRATION.md). Read-only; NR-1's enrichment (../nr1/analysis.py) unchanged.
  python3 analysis.py stage1 <out.json> <run.ts outputs...>         exploratory profiles; selects (eta, D) and lag
  python3 analysis.py stage2 <eta> <D> <lag> <run.ts output on h05>  confirmatory N1, N2 and descriptives"""
import collections, json, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / 'nr1'))
import analysis as A
RELS = ('syzygy', 'current', 'gate')
def get(D): return {(r['graph'], r['mode'], r['eta'], r['D'], r['unit']): r for r in D['runs']}
def e(run, key, rel, L, tag): return A.enrich(run[key], run['input'], A.REL[rel], L, f'{tag}|{key}|{rel}|{L}')
def arms(configs): return [('EXIT', 0, 0, 'path')] + [('ND', a, d, k) for a, d in configs for k in ('path', 'fieldPath')]
def stage1(out, files):
    prof = {}
    for f in files:
        D = json.load(open(f)); G = get(D); U = sorted({r['unit'] for r in D['runs']})
        for mode, a, d, key in arms(D['configs']):
            n = f'{mode}/{a}/{d}/{key}'
            for L in range(1, 9):
                for rel in RELS:
                    for g in ('CANONICAL', 'RELABEL', 'REWIRED'):
                        v = sum(e(G[(g, mode, a, d, u)], key, rel, L, f"{D['label']}|{u}|{g}") for u in U) / len(U)
                        prof.setdefault(n, {}).setdefault(g, {}).setdefault(rel, [0.0] * 8)[L - 1] += v / len(files)
    best = None
    for n, P in prof.items():
        if not (n.startswith('ND/') and n.endswith('/path')): continue
        for L in range(8):
            s = sum(P['CANONICAL'][r][L] - (P['RELABEL'][r][L] + P['REWIRED'][r][L]) / 2 for r in RELS) / 3
            if best is None or s > best[0]: _, a, d, _ = n.split('/'); best = (s, float(a), float(d), L + 1)
    res = {'profiles': {n: {g: {r: [round(x, 4) for x in v] for r, v in P[g].items()} for g in P} for n, P in prof.items()},
           'selected': {'score': round(best[0], 5), 'eta': best[1], 'D': best[2], 'lag': best[3]}}
    json.dump(res, open(out, 'w'), indent=1); print(json.dumps(res['selected']))
def stage2(a, d, lag, f):
    D = json.load(open(f)); G = get(D); U = sorted({r['unit'] for r in D['runs']}); tag = D['label']
    T = {f'{rel}_CANONICALvs{c}': [e(G[('CANONICAL', 'ND', a, d, u)], 'path', rel, lag, f'{tag}|{u}|C') - e(G[(c, 'ND', a, d, u)], 'path', rel, lag, f'{tag}|{u}|{c}') for u in U]
         for rel in RELS for c in ('RELABEL', 'REWIRED')}
    P = {k: A.signflip2(x) for k, x in T.items()}; ok, n1 = True, {}
    for i, (k, p) in enumerate(sorted(P.items(), key=lambda x: x[1])):
        ok = ok and p <= 0.05 / (len(P) - i); n1[k] = {'p': p, 'meanD': round(sum(T[k]) / len(U), 5), 'positiveUnits': sum(x > 0 for x in T[k]), 'supported': ok}
    def area(mode, aa, dd, key, u): return sum(e(G[('CANONICAL', mode, aa, dd, u)], key, rel, L, f'{tag}|{u}|C') - e(G[('RELABEL', mode, aa, dd, u)], key, rel, L, f'{tag}|{u}|R') for rel in RELS for L in range(2, 9))
    n2 = [area('ND', a, d, 'path', u) - area('EXIT', 0, 0, 'path', u) for u in U]; p2 = A.signflip2(n2)
    def lagprof(mode, aa, dd): return {rel: [round(sum(e(G[('CANONICAL', mode, aa, dd, u)], 'path', rel, L, f'{tag}|{u}|C') - e(G[('RELABEL', mode, aa, dd, u)], 'path', rel, L, f'{tag}|{u}|R') for u in U) / len(U), 4) for L in range(1, 9)] for rel in RELS}
    desc = {'area': {'EXIT/path': round(sum(area('EXIT', 0, 0, 'path', u) for u in U) / len(U), 4), 'ND/path': round(sum(area('ND', a, d, 'path', u) for u in U) / len(U), 4),
                     'ND/fieldPath': round(sum(area('ND', a, d, 'fieldPath', u) for u in U) / len(U), 4)},
            'lagProfile_CminusR': {'EXIT': lagprof('EXIT', 0, 0), 'ND': lagprof('ND', a, d)},
            'warpShare': {m: round(sum(sum(z in (3, 6) for z in G[('CANONICAL', m, aa, dd, u)]['path']) / 1001 for u in U) / len(U), 3) for m, aa, dd in (('EXIT', 0, 0), ('ND', a, d))},
            'occupancyTop5': {m: dict(collections.Counter(z for u in U for z in G[('CANONICAL', m, aa, dd, u)]['path']).most_common(5)) for m, aa, dd in (('EXIT', 0, 0), ('ND', a, d))},
            'flights': {m: sum(G[('CANONICAL', m, aa, dd, u)]['flights'] for u in U) for m, aa, dd in (('EXIT', 0, 0), ('ND', a, d))}}
    print(json.dumps({'eta': a, 'D': d, 'lag': lag, 'N1_ndReading': n1, 'N2_ndMinusExit_area': {'d': [round(x, 4) for x in n2], 'p': p2, 'meanD': round(sum(n2) / len(U), 5), 'supported': p2 <= 0.05},
                      'descriptive': desc}, indent=1))
if __name__ == '__main__':
    if sys.argv[1] == 'stage1': stage1(sys.argv[2], sys.argv[3:])
    else: stage2(float(sys.argv[2]), float(sys.argv[3]), int(sys.argv[4]), sys.argv[5])
