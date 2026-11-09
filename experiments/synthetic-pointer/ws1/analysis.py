#!/usr/bin/env python3
"""WS-1 tests (REGISTRATION.md).   python3 analysis.py <ws1/run.ts output>
capture_P(arm, u) = longest consecutive stay in pair P on the CANONICAL passage of unit u.
W1  capture_36(NONE) - capture_27(NONE)                                   (the trap belongs to the Warp, not to any syzygy)
W2  capture_36(NONE) - capture_36(F36)                                    (the mechanism relieves the Warp)
W3  [capture_36(NONE) - capture_36(F36)] - [capture_27(NONE) - capture_27(F27)]   (the mechanism matters at 3/6, not at 2/7)
W4  area(F36) - area(F27)  (reading area, lags 2-8, CANONICAL - RELABEL, syzygy+current+gate: does binding it to 3/6 help?)
Exact two-sided sign-flip over the 12 units (nr1 signflip2), Holm across W1-W4 at 0.05."""
import collections, json, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / 'nr1'))
import analysis as A
RELS = ('syzygy', 'current', 'gate')
D = json.load(open(sys.argv[1])); G = {(r['graph'], r['arm'], r['unit']): r for r in D['runs']}; U = sorted({r['unit'] for r in D['runs']}); tag = D['label']
def cap(p, P):
    m = r = 0
    for z in p: r = r + 1 if z in P else 0; m = max(m, r)
    return m
def c(arm, P, u): return cap(G[('CANONICAL', arm, u)]['path'], P)
def e(run, rel, L, t): return A.enrich(run['path'], run['input'], A.REL[rel], L, f'{tag}|{t}|{rel}|{L}')
def area(arm, u): return sum(e(G[('CANONICAL', arm, u)], rel, L, f'{u}|{arm}|C') - e(G[('RELABEL', arm, u)], rel, L, f'{u}|{arm}|R') for rel in RELS for L in range(2, 9))
S36, S27 = (3, 6), (2, 7)
W = {'W1_trapIsTheWarps': [c('NONE', S36, u) - c('NONE', S27, u) for u in U],
     'W2_mechanismRelievesWarp': [c('NONE', S36, u) - c('F36', S36, u) for u in U],
     'W3_specificity': [(c('NONE', S36, u) - c('F36', S36, u)) - (c('NONE', S27, u) - c('F27', S27, u)) for u in U],
     'W4_readingF36minusF27': [area('F36', u) - area('F27', u) for u in U]}
P = {k: A.signflip2(v) for k, v in W.items()}; ok, out = True, {}
for i, (k, p) in enumerate(sorted(P.items(), key=lambda x: x[1])):
    ok = ok and p <= 0.05 / (len(P) - i); out[k] = {'p': p, 'meanD': round(sum(W[k]) / len(U), 4), 'positiveUnits': sum(x > 0 for x in W[k]), 'zeroUnits': sum(x == 0 for x in W[k]), 'supported': ok}
desc = {arm: {'longestStay36': [c(arm, S36, u) for u in U], 'longestStay27': [c(arm, S27, u) for u in U],
              'share36': round(sum(sum(z in S36 for z in G[('CANONICAL', arm, u)]['path']) for u in U) / (1001 * len(U)), 3),
              'share27': round(sum(sum(z in S27 for z in G[('CANONICAL', arm, u)]['path']) for u in U) / (1001 * len(U)), 3),
              'flights': sum(G[('CANONICAL', arm, u)]['flights'] for u in U), 'area': round(sum(area(arm, u) for u in U) / len(U), 4),
              'occupancyTop4': dict(collections.Counter(z for u in U for z in G[('CANONICAL', arm, u)]['path']).most_common(4))} for arm in ('F36', 'F27', 'NONE')}
print(json.dumps({'tests': out, 'descriptive': desc}, indent=1))
