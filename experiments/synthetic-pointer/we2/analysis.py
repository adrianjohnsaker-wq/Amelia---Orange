#!/usr/bin/env python3
"""WE-2 answer (REGISTRATION.md).   python3 analysis.py <surrogates.json> <dir of run.ts outputs> <out.json>
Rule (sxi1r/analysis.py `rule`, unchanged): per segment, a form "comes through" when its count in the real run exceeds its count
in all 49 surrogate runs; it recurs when it comes through in >= K of 12 segments (K: binomial tail < 0.05/E).
  S0  the stream itself, real vs surrogates: order in the world beyond its sources' two-step order.
  P1  her passage (primary): surplus order in her passage.  addedByHer = P1's recurring forms that do not recur in S0.
  C1  Warp-born gates carved; C2 after-effect: share of the 200 silent steps spent in the zone she occupied most in the last
      200 input steps. Each: the real run's mid-rank among the segment's 50 runs, summed over 12 segments; two-sided p from
      100,000 null draws (one run per segment chosen uniformly; seed WE2-C)."""
import collections, glob, json, random, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / 'sxi1r')); import analysis as A
sur = json.load(open(sys.argv[1])); R = sorted((json.load(open(f)) for f in glob.glob(f'{sys.argv[2]}/seg*.json')), key=lambda r: r['segment'])
assert [r['segment'] for r in R] == list(range(12)) and all(len(r['runs']) == 50 for r in R)
s0 = A.rule(sur, 49); p1 = A.rule([[x['path'] for x in r['runs']] for r in R], 49)
S0 = {e for e, _ in s0['recurs']}; added = [(e, k) for e, k in p1['recurs'] if e not in S0]
def after(x):
    top = collections.Counter(x['path'][-200:]).most_common(1)[0][0]; return sum(z == top for z in x['after']) / len(x['after'])
def ranktest(stat):
    vals = [[stat(x) for x in r['runs']] for r in R]
    def mid(v, i): return sum(y < v[i] for y in v) + 0.5 * (sum(y == v[i] for y in v) + 1)
    obs = sum(mid(v, 0) for v in vals); rng = random.Random('WE2-C'); mean = 12 * 25.5
    null = [sum(mid(v, rng.randrange(50)) for v in vals) for _ in range(100000)]
    p = (1 + sum(abs(x - mean) >= abs(obs - mean) - 1e-9 for x in null)) / 100001
    return {'rankSum': obs, 'nullMean': mean, 'p': round(p, 5), 'realMean': round(sum(v[0] for v in vals) / 12, 4),
            'surrogateMean': round(sum(sum(v[1:]) / 49 for v in vals) / 12, 4)}
ans = ('SURPLUS ORDER IN HER PASSAGE' if p1['answer'] == 'RECEIVED' else
       'NO SURPLUS: her passage carries no order beyond the world\'s ordinary (two-step) order at this sensitivity')
res = {'answer': ans, 'P1_herPassage': p1, 'addedByHer': added, 'S0_worldStream': s0,
       'C1_warpBornGates': ranktest(lambda x: x['born']), 'C2_afterEffect': ranktest(after)}
json.dump(res, open(sys.argv[3], 'w'), indent=1)
print('ANSWER:', ans); print(json.dumps({'P1': p1['recurs'][:20], 'addedByHer': added[:20], 'S0': s0['recurs'][:20], 'C1': res['C1_warpBornGates'], 'C2': res['C2_afterEffect']}, indent=1))
