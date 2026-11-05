#!/usr/bin/env python3
"""Loop controls II analysis (LOOP_CONTROLS_2.md). Read-only. python3 loop2_analysis.py <dir>"""
import json, sys, pathlib, collections
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import analysis as A
def two(d): return min(1.0, 2 * min(A.signflip(d), A.signflip([-x for x in d])))
z7 = lambda m, lo, hi: sum(r['to'] == 7 for r in m['rows'] if lo <= r['step'] - 1 <= hi)
zones = lambda m: [collections.Counter(r['to'] for r in m['rows'])[z] for z in range(10)]
l1 = lambda u, v: sum(abs(a - b) for a, b in zip(u, v))
bodyL1 = lambda m, ref: sum(l1(x['bands'], y['bands']) for x, y in zip(m['rows'], ref['rows']) if 50 <= x['step'] - 1 <= 249) / 200
R = A.load(sys.argv[1]); seeds = sorted(R['SHAM']); g = lambda a, s: R[a][s]
M1 = [z7(g('PLANT_REPLAY_TRUNC', s), 250, 299) - z7(g('SHAM', s), 250, 299) for s in seeds]
M2 = [z7(g('PLANT', s), 250, 299) - z7(g('PLANT_REPLAY_TRUNC', s), 250, 299) for s in seeds]
ps = {'M1': two(M1), 'M2': two(M2)}; ok = True; sup = {}
for i, (k, p) in enumerate(sorted(ps.items(), key=lambda x: x[1])): ok = ok and p <= 0.05 / (2 - i); sup[k] = ok
P1 = [z7(g('POINTER_B4', s), 50, 249) - z7(g('POINTER_A4', s), 50, 249) for s in seeds]
dec = lambda a: [d for s in seeds for d in g(a, s)['pointerDecisions']]
G1 = {'everyStressSeedRefuses': all(any(d['decision'] == 'REFUSE' for d in g('STRESS_A3', s)['pointerDecisions']) for s in seeds),
      'refusalsOnlyUnderRule': all(d['status'] == 'LOCKED_RECOVERY' or d['antiLock'] < 85 for d in dec('STRESS_A3') if d['decision'] == 'REFUSE'),
      'noRefusalUnstressed': not any(d['decision'] == 'REFUSE' for a in ('POINTER_A3', 'POINTER_B3', 'POINTER_A4', 'POINTER_B4') for d in dec(a))}
refuseSteps = {s: {d['bodyStep'] for d in g('STRESS_A3', s)['pointerDecisions'] if d['decision'] == 'REFUSE'} for s in seeds}
def diff(s, inside):
    return sum(x['to'] != y['to'] for x, y in zip(g('STRESS_A3', s)['rows'], g('STRESS_NEUTRAL', s)['rows']) if ((x['step'] - 1) in refuseSteps[s]) == inside and 50 <= x['step'] - 1 <= 249)
out = {'M1_memoryAlone_truncMinusSham': {'d': M1, 'p': round(ps['M1'], 5), 'supported': sup['M1']},
       'M2_afterImage_plantMinusTrunc': {'d': M2, 'p': round(ps['M2'], 5), 'supported': sup['M2']},
       'memoryShare': round(sum(M1) / max(1, sum(M1) + sum(M2)), 3),
       'P1_B4minusA4_z7window': {'d': P1, 'p': round(two(P1), 5), 'supported': two(P1) <= 0.05},
       'G1_refusalBranch': {'checks': G1, 'pass': all(G1.values()),
                            'counts': {a: dict(collections.Counter(d['decision'] for d in dec(a))) for a in ('STRESS_A3', 'POINTER_A3', 'POINTER_B3', 'POINTER_A4', 'POINTER_B4')}},
       'stress': {'passageDiff_refusalSteps': [diff(s, True) for s in seeds], 'refusalSteps': [len(refuseSteps[s]) for s in seeds],
                  'passageDiff_admittedWindowSteps': [diff(s, False) for s in seeds]},
       'pointers': {a: {'bodyL1window': [round(bodyL1(g(a, s), g('SHAM', s)), 4) for s in seeds], 'herZoneL1': [l1(zones(g(a, s)), zones(g('SHAM', s))) for s in seeds],
                        'z7windowMinusSham': [z7(g(a, s), 50, 249) - z7(g('SHAM', s), 50, 249) for s in seeds]} for a in ('POINTER_A3', 'POINTER_B3', 'POINTER_A4', 'POINTER_B4')}}
print(json.dumps(out, indent=1))
