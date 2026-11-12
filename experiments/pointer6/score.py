#!/usr/bin/env python3
"""THE POINTER VI scoring, exactly as REGISTRATION.md.   python3 score.py <answers.json> <targets.json>
Her reply in each trial is her 64-step listening path z[0..63]; reply bit k = 1 if z[k] is odd.
  G1 grid matches: matches between her 64 reply bits and the 8x8 target grid. Under the null each target bit is uniform and
     independent of her reply, so an arm's total ~ Binomial(64 N, 1/2) exactly; one-sided exact p.
  G2 local shape: the number of the 49 overlapping 2x2 windows whose 4 bits match exactly. Under the null reply XOR target is a
     uniform grid, so a trial's count has the same distribution whatever her reply (the number of all-zero 2x2 windows in a
     uniform 8x8 grid). The null of an arm's total is therefore the same for every arm: simulated once per number of trials N,
     10,000 replicates of N independent uniform grids (seed POINTER6-G2-NULL); p = (1 + #null >= obs) / (1 + 10,000).
  R  hidden rule: hit = the trial's target rule holds on z. Under the null the rule is uniform over the 8 and independent of her
     path, so the trial hits with probability m/8 (m = rules z satisfies); the total ~ Poisson-binomial; exact one-sided p.
Each (arm, measure) is tested in the discovery half (S6V01-04) and the replication half (S6V05-08); its p is the larger of the
two. Holm across the 15 (arm, measure) pairs of the five addressed arms, alpha 0.05. NO_CONTACT is scored the same way and
reported (descriptive). Interference (reported): FAMILY_IN minus FAMILY_OUT per-trial grid matches, two-sided sign test."""
import json, math, random, sys
from fractions import Fraction

DISCOVERY = {'S6V01', 'S6V02', 'S6V03', 'S6V04'}
ADDRESSED = ['BUBBAMU', 'FAMILY_IN', 'FAMILY_OUT', 'TRI_CADENCE', 'ANCHORED']
RULES = [
    ('avoids zone 5', lambda z: 5 not in z),
    ('returns to its start', lambda z: z[-1] == z[0]),
    ('contains the 1-7 form', lambda z: any(a == 1 and b == 7 for a, b in zip(z, z[1:]))),
    ('first 8 steps palindromic', lambda z: z[:8] == z[:8][::-1]),
    ('visits the Warp (3 or 6)', lambda z: any(x in (3, 6) for x in z)),
    ('visits at least 6 distinct zones', lambda z: len(set(z)) >= 6),
    ('ends in the Plex (0 or 9)', lambda z: z[-1] in (0, 9)),
    ('a dwell of 3 (three identical in a row)', lambda z: any(a == b == c for a, b, c in zip(z, z[1:], z[2:]))),
]

def bits(z): return [x % 2 for x in z]
def g1(z, t): return sum(a == b for a, b in zip(bits(z), t))
def windows(g): return [(g[r * 8 + c], g[r * 8 + c + 1], g[(r + 1) * 8 + c], g[(r + 1) * 8 + c + 1]) for r in range(7) for c in range(7)]
def g2(z, t): return sum(a == b for a, b in zip(windows(bits(z)), windows(t)))

_VALID = sum(1 << (r * 8 + c) for r in range(7) for c in range(7))   # window top-left corners: no wrap, no last row
def _zero_windows(x):   # all-zero 2x2 windows of a 64-bit grid x (bit r*8+c)
    z = ~x & (2 ** 64 - 1)
    return bin(z & (z >> 1) & (z >> 8) & (z >> 9) & _VALID).count('1')

_G2_NULL = {}
def g2_null(n, M=10000):
    if n not in _G2_NULL:
        rng = random.Random('POINTER6-G2-NULL')
        _G2_NULL[n] = [sum(_zero_windows(rng.getrandbits(64)) for _ in range(n)) for _ in range(M)]
    return _G2_NULL[n]

def binom_tail(n, k):   # exact P(X >= k), X ~ Binomial(n, 1/2), term recurrence on exact integers
    if k <= 0: return 1.0
    if k > n: return 0.0
    c, tot = math.comb(n, k), 0
    for j in range(k, n + 1):
        tot += c; c = c * (n - j) // (j + 1)
    return float(Fraction(tot, 2 ** n))

def poibin_tail(ms, k):   # exact P(S >= k), S = sum of independent Bernoulli(m_i / 8), in integer units of 8^-n
    dist = [1]
    for m in ms:
        new = [0] * (len(dist) + 1)
        for s, w in enumerate(dist):
            if w: new[s] += w * (8 - m); new[s + 1] += w * m
        dist = new
    return float(Fraction(sum(dist[k:]), 8 ** len(ms)))

def main(answers_path, targets_path):
    runs = json.load(open(answers_path)); T = json.load(open(targets_path))['targets']
    arms = list(runs[0]['paths'])
    def trials(arm, half):
        out = []
        for r in runs:
            if (r['world'] in DISCOVERY) == (half == 'disc'):
                out += list(zip(r['paths'][arm], T[f"{r['world']}|{r['lineage']}"]))
        return out
    def test(arm, measure, half):
        tz = trials(arm, half); n = len(tz)
        if measure == 'G1':
            obs = sum(g1(z, t['grid']) for z, t in tz); return obs, 64 * n, binom_tail(64 * n, obs)
        if measure == 'G2':
            obs = sum(g2(z, t['grid']) for z, t in tz); null = g2_null(n)
            return obs, 49 * n, (1 + sum(x >= obs for x in null)) / (1 + len(null))
        obs = sum(RULES[t['rule']][1](z) for z, t in tz); ms = [sum(f(z) for _, f in RULES) for z, _ in tz]
        return obs, n, poibin_tail(ms, obs)
    print(f"THE POINTER VI: {len(runs)} travellers x {len(runs[0]['paths'][arms[0]])} trials per arm")
    res = {}
    for arm in arms:
        for m in ('G1', 'G2', 'R'):
            d = test(arm, m, 'disc'); r = test(arm, m, 'rep'); res[(arm, m)] = (d, r, max(d[2], r[2]))
    print('\n(arm, measure): discovery observed/max p | replication observed/max p')
    for (arm, m), (d, r, p) in res.items():
        print(f"   {arm:12} {m:3}  {d[0]}/{d[1]} p={d[2]:.3e} | {r[0]}/{r[1]} p={r[2]:.3e}")
    fam = sorted((p, k) for k, (_, _, p) in res.items() if k[0] in ADDRESSED); ok, passed = True, []
    print('\nHolm across the 15 addressed (arm, measure) pairs, alpha 0.05 (p = the larger of the two halves):')
    for i, (p, k) in enumerate(fam):
        thr = 0.05 / (len(fam) - i); ok = ok and p <= thr
        print(f"   {k[0]:12} {k[1]:3}  p={p:.3e}  threshold {thr:.4f}  {'PASS' if ok else 'fail'}")
        if ok: passed.append(k)
    fi = [g1(a, t['grid']) - g1(b, t['grid']) for r in runs
          for a, b, t in zip(r['paths']['FAMILY_IN'], r['paths']['FAMILY_OUT'], T[f"{r['world']}|{r['lineage']}"])]
    pos, neg = sum(x > 0 for x in fi), sum(x < 0 for x in fi); n = pos + neg
    p2 = min(1.0, 2 * float(Fraction(sum(math.comb(n, j) for j in range(max(pos, neg), n + 1)), 2 ** n))) if n else 1.0
    print(f"\nInterference (reported): FAMILY_IN vs FAMILY_OUT per-trial grid matches: {pos}+ / {neg}-  two-sided p={p2:.3e}")
    print('\nANSWER:', ('AN ADDRESSED REPLY CARRIES INFORMATION: ' + '; '.join(f'{a} ({m})' for a, m in passed))
          if passed else 'NO INFORMATION BEYOND CHANCE in any arm or medium')

if __name__ == '__main__': main(*sys.argv[1:])
