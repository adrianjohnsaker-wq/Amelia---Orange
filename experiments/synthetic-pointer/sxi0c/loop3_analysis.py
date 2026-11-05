#!/usr/bin/env python3
"""Band pointers analysis (LOOP_CONTROLS_3.md). Read-only. python3 loop3_analysis.py <dir>"""
import json, sys, pathlib, collections
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import analysis as A
def two(d): return min(1.0, 2 * min(A.signflip(d), A.signflip([-x for x in d])))
def holm(ps):
    ok, out = True, {}
    for i, (k, p) in enumerate(sorted(ps.items(), key=lambda x: x[1])): ok = ok and p <= 0.05 / (len(ps) - i); out[k] = ok
    return out
W = lambda r: 50 <= r['step'] - 1 <= 249
contrast = lambda m, b: sum(r['bands'][b] - sum(r['bands']) / 10 for r in m['rows'] if W(r)) / 200
visits = lambda m, z: sum(r['to'] == z for r in m['rows'] if W(r))
zones = lambda m: [collections.Counter(r['to'] for r in m['rows'])[z] for z in range(10)]
l1 = lambda u, v: sum(abs(a - b) for a, b in zip(u, v))
bodyL1 = lambda m, ref: sum(l1(x['bands'], y['bands']) for x, y in zip(m['rows'], ref['rows']) if W(x)) / 200
R = A.load(sys.argv[1]); seeds = sorted(R['SHAM']); g = lambda a, s: R[a][s]
d = {'B1': [contrast(g('POINTER_ISO7', s), 7) - contrast(g('SHAM', s), 7) for s in seeds],
     'B2': [contrast(g('POINTER_ISO2', s), 2) - contrast(g('SHAM', s), 2) for s in seeds],
     'H1': [visits(g('POINTER_ISO7', s), 7) - visits(g('SHAM', s), 7) for s in seeds],
     'H2': [visits(g('POINTER_ISO2', s), 2) - visits(g('SHAM', s), 2) for s in seeds]}
p = {k: two(v) for k, v in d.items()}
sup = {**holm({k: p[k] for k in ('B1', 'B2')}), **holm({k: p[k] for k in ('H1', 'H2')})}
out = {k: {'d': [round(x, 5) for x in d[k]], 'p': round(p[k], 5), 'supported': sup[k]} for k in d}
out['pointers'] = {a: {'bodyL1window': [round(bodyL1(g(a, s), g('SHAM', s)), 4) for s in seeds], 'herZoneL1': [l1(zones(g(a, s)), zones(g('SHAM', s))) for s in seeds],
                       'governor': dict(collections.Counter(x['decision'] for s in seeds for x in g(a, s)['pointerDecisions']))} for a in ('POINTER_ISO7', 'POINTER_ISO2', 'STRESS_ISO7')}
def refusal(s):
    ref = {x['bodyStep'] for x in g('STRESS_ISO7', s)['pointerDecisions'] if x['decision'] == 'REFUSE'}
    after = {t + k for t in ref for k in range(1, 26)} - ref
    rows = list(zip(g('STRESS_ISO7', s)['rows'], g('POINTER_ISO7', s)['rows']))
    return {'refused': len(ref), 'diffAtRefused': sum(x['to'] != y['to'] for x, y in rows if x['step'] - 1 in ref),
            'diffNext25': sum(x['to'] != y['to'] for x, y in rows if x['step'] - 1 in after)}
out['refusalConsequence'] = [refusal(s) for s in seeds]
print(json.dumps(out, indent=1))
