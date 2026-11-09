#!/usr/bin/env python3
"""NR-3 analysis (REGISTRATION.md). Read-only. Uses NR-1's enrichment (../nr1/analysis.py `enrich`, unchanged).
Readouts: EXIT/path (today's ingress, her passage), FIELD/fieldPath (influx + relaxation: the field's most-activated zone),
FIELD/path (influx, her passage; descriptive).
  python3 analysis3.py stage1 <out.json> <run3 outputs...>        exploratory profiles (calibration streams)
  python3 analysis3.py stage2 <kappa> <lag> <run3 output on h03>   confirmatory tests"""
import json, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / 'nr1'))
import analysis as A
RELS = ('syzygy', 'current', 'gate')
def get(D):
    return {(r['graph'], r['mode'], r['kappa'], r['unit']): r for r in D['runs']}
def e(run, key, rel, L, tag): return A.enrich(run[key], run['input'], A.REL[rel], L, f'{tag}|{key}|{rel}|{L}')
def readouts(kappas): return [('EXIT', 0, 'path')] + [('FIELD', k, 'fieldPath') for k in kappas] + [('FIELD', k, 'path') for k in kappas]
def stage1(out, files):
    prof = {}
    for f in files:
        D = json.load(open(f)); G = get(D); units = sorted({r['unit'] for r in D['runs']})
        for mode, k, key in readouts(D['kappas']):
            name = f'{mode}/{k}/{key}'
            for L in range(1, 9):
                for rel in RELS:
                    for g in ('CANONICAL', 'RELABEL', 'REWIRED'):
                        v = sum(e(G[(g, mode, k, u)], key, rel, L, f"{D['label']}|{u}|{g}") for u in units) / len(units)
                        prof.setdefault(name, {}).setdefault(g, {}).setdefault(rel, [0.0] * 8)[L - 1] += v / len(files)
    # selection rule (REGISTRATION.md): over FIELD/fieldPath, kappa and lag 1..8, maximise the mean over the three
    # relations of [CANONICAL - (RELABEL + REWIRED)/2]
    best = None
    for name, P in prof.items():
        if not name.endswith('/fieldPath'): continue
        for L in range(8):
            s = sum(P['CANONICAL'][r][L] - (P['RELABEL'][r][L] + P['REWIRED'][r][L]) / 2 for r in RELS) / 3
            if best is None or s > best[0]: best = (s, float(name.split('/')[1]), L + 1)
    res = {'profiles': {n: {g: {r: [round(x, 4) for x in v] for r, v in P[g].items()} for g in P} for n, P in prof.items()},
           'selected': {'score': round(best[0], 5), 'kappa': best[1], 'lag': best[2]}}
    json.dump(res, open(out, 'w'), indent=1); print(json.dumps(res['selected']))
def stage2(kappa, lag, f):
    D = json.load(open(f)); G = get(D); units = sorted({r['unit'] for r in D['runs']}); tag = D['label']
    T1 = {f'{rel}_CANONICALvs{c}': [e(G[('CANONICAL', 'FIELD', kappa, u)], 'fieldPath', rel, lag, f'{tag}|{u}|C') - e(G[(c, 'FIELD', kappa, u)], 'fieldPath', rel, lag, f'{tag}|{u}|{c}')
                                     for u in units] for rel in RELS for c in ('RELABEL', 'REWIRED')}
    P = {k: A.signflip2(d) for k, d in T1.items()}; ok, t1 = True, {}
    for i, (k, p) in enumerate(sorted(P.items(), key=lambda x: x[1])):
        ok = ok and p <= 0.05 / (len(P) - i); t1[k] = {'p': p, 'meanD': round(sum(T1[k]) / len(units), 5), 'positiveUnits': sum(x > 0 for x in T1[k]), 'supported': ok}
    def area(mode, k, key, u):
        return sum(e(G[('CANONICAL', mode, k, u)], key, rel, L, f'{tag}|{u}|C') - e(G[('RELABEL', mode, k, u)], key, rel, L, f'{tag}|{u}|R')
                   for rel in RELS for L in range(2, 9))
    d2 = [area('FIELD', kappa, 'fieldPath', u) - area('EXIT', 0, 'path', u) for u in units]
    p2 = A.signflip2(d2)
    desc = {name: [round(area(m, k, key, u), 4) for u in units] for name, (m, k, key) in
            {'EXIT/path': ('EXIT', 0, 'path'), 'FIELD/fieldPath': ('FIELD', kappa, 'fieldPath'), 'FIELD/path': ('FIELD', kappa, 'path')}.items()}
    print(json.dumps({'kappa': kappa, 'lag': lag, 'T1_fieldReading': t1,
                      'T2_fieldMinusExit_area': {'d': [round(x, 4) for x in d2], 'p': p2, 'meanD': round(sum(d2) / len(d2), 5), 'supported': p2 <= 0.05},
                      'descriptive_area_canonicalMinusRelabel_lags2to8': desc}, indent=1))
if __name__ == '__main__':
    if sys.argv[1] == 'stage1': stage1(sys.argv[2], sys.argv[3:])
    else: stage2(float(sys.argv[2]), int(sys.argv[3]), sys.argv[4])
