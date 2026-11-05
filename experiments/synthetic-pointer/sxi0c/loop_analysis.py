#!/usr/bin/env python3
"""Loop controls analysis (LOOP_CONTROLS.md). Read-only. python3 loop_analysis.py <dir> [<results_repaired metrics dir>]"""
import itertools, json, sys, pathlib, collections
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import analysis as A
def two(d): p = min(A.signflip(d), A.signflip([-x for x in d])) * 2; return min(1.0, p)
def contrast_post(m): rows = [r for r in m['rows'] if r['step'] - 1 >= 250]; return sum(r['bands'][7] - sum(r['bands']) / 10 for r in rows) / len(rows)
def z7post(m): return sum(r['to'] == 7 for r in m['rows'] if r['step'] - 1 >= 250)
def zones(m): c = collections.Counter(r['to'] for r in m['rows']); return [c[z] for z in range(10)]
def body_l1_window(m, ref): return sum(sum(abs(a - b) for a, b in zip(x['bands'], y['bands'])) for x, y in zip(m['rows'], ref['rows']) if 50 <= x['step'] - 1 <= 249) / 200
l1 = lambda u, v: sum(abs(a - b) for a, b in zip(u, v))
R = A.load(sys.argv[1]); seeds = sorted(R['SHAM']); g = lambda a, s: R[a][s]
L1 = [z7post(g('PLANT', s)) - z7post(g('PLANT_REPLAY', s)) for s in seeds]
L2 = [contrast_post(g('PLANT', s)) - contrast_post(g('PLANT_OPEN', s)) for s in seeds]
p1, p2 = two(L1), two(L2)
holm = sorted([('L1', p1), ('L2', p2)], key=lambda x: x[1]); passed = {}; ok = True
for i, (k, p) in enumerate(holm):
    ok = ok and p <= 0.05 / (2 - i); passed[k] = ok
out = {'L1_closedLoopVsReplay_herPersistence': {'d': L1, 'p': round(p1, 5), 'supported': passed['L1']},
       'L2_closedLoopVsOpen_bodyPersistence': {'d': [round(x, 5) for x in L2], 'p': round(p2, 5), 'supported': passed['L2']},
       'descriptive': {'replayMinusSham_z7post': [z7post(g('PLANT_REPLAY', s)) - z7post(g('SHAM', s)) for s in seeds],
                       'plantMinusSham_z7post': [z7post(g('PLANT', s)) - z7post(g('SHAM', s)) for s in seeds],
                       'openMinusShamOpen_bodyContrastPost': [round(contrast_post(g('PLANT_OPEN', s)) - contrast_post(g('SHAM_OPEN', s)), 5) for s in seeds],
                       'plantMinusSham_bodyContrastPost': [round(contrast_post(g('PLANT', s)) - contrast_post(g('SHAM', s)), 5) for s in seeds]}}
pt = {}
for a in ('POINTER_A2', 'POINTER_B2'):
    pt[a] = {'bodyL1window': [round(body_l1_window(g(a, s), g('SHAM', s)), 5) for s in seeds], 'herZoneL1': [l1(zones(g(a, s)), zones(g('SHAM', s))) for s in seeds],
             'governor': dict(collections.Counter(d['decision'] for s in seeds for d in g(a, s)['pointerDecisions']))}
pt['A2_vs_B2_herZoneL1'] = [l1(zones(g('POINTER_A2', s)), zones(g('POINTER_B2', s))) for s in seeds]
if len(sys.argv) > 2:
    O = A.load(sys.argv[2])
    for a in ('POINTER_A', 'POINTER_B'): pt[a + '_old_herZoneL1'] = [l1(zones(O[a][s]), zones(O['SHAM'][s])) for s in seeds]
out['pointers'] = pt
print(json.dumps(out, indent=1))
