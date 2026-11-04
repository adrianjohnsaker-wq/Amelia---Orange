#!/usr/bin/env python3
"""ANTENNA B: does the stream's order carry structure? (see REGISTRATION.md). No Amelia; read-only.

Elements: every zone n-gram, n = 2, 3, 4. The stream is cut into M consecutive segments of L data. In each segment,
an n-gram "comes through" when its count in the segment as received is > 0 and strictly greater than in each of S
order-shuffles of that segment (exact: p <= 1/(S+1) under "order carries nothing"). It "recurs" when it comes
through in at least K segments, K the smallest k with P(Binomial(M, 1/(S+1)) >= k) < 0.05 / E, E = the number of
distinct n-grams in the received segments. Segments are disjoint and shuffled independently, so this is exact.
ANSWER: STRUCTURED (listing what recurs) if anything recurs, else UNSTRUCTURED.
Descriptive (not decisive): lag-1..5 mutual information of the whole stream, ranked against 999 shuffles.

  python3 structure.py <stream.json> [--M 16 --L 1000 --S 99 --label X]
"""
import argparse, collections, hashlib, json, math, random
from math import comb

def tail(n, p, k): return sum(comb(n, j) * p ** j * (1 - p) ** (n - j) for j in range(k, n + 1))
def rng_for(label): return random.Random(hashlib.sha256(label.encode()).hexdigest())
def ngrams(z, n): return collections.Counter(tuple(z[i:i + n]) for i in range(len(z) - n + 1))
def counts(z): c = collections.Counter(); [c.update(ngrams(z, n)) for n in (2, 3, 4)]; return c
def mi(z, lag):
    pairs = collections.Counter(zip(z, z[lag:])); a = collections.Counter(z[:-lag]); b = collections.Counter(z[lag:]); n = len(z) - lag
    return sum(v / n * math.log(v * n / (a[x] * b[y])) for (x, y), v in pairs.items())

def analyse(z, M=16, L=1000, S=99, label='B'):
    assert len(z) >= M * L, f'need {M*L} data, have {len(z)}'
    p = 1 / (S + 1); through = collections.defaultdict(list); universe = set()
    for m in range(M):
        seg = z[m * L:(m + 1) * L]; c0 = counts(seg); universe |= set(c0)
        r = rng_for(f'{label}|seg|{m}'); best = collections.Counter()
        for _ in range(S):
            s = seg[:]; r.shuffle(s)
            for g, v in counts(s).items():
                if v > best[g]: best[g] = v
        for g, v in c0.items():
            if v > best[g]: through[g].append(m)
    E = max(1, len(universe)); K = next(k for k in range(M + 2) if k > M or tail(M, p, k) < 0.05 / E)
    fmt = lambda g: '-'.join(map(str, g))
    recurs = sorted(((fmt(g), len(ms)) for g, ms in through.items() if len(ms) >= K), key=lambda x: (-x[1], x[0]))
    whole = z[:M * L]; r = rng_for(f'{label}|mi')
    mis = {}
    for lag in range(1, 6):
        obs = mi(whole, lag); ge = 0
        for _ in range(999):
            s = whole[:]; r.shuffle(s); ge += mi(s, lag) >= obs
        mis[f'lag{lag}'] = {'mi': round(obs, 6), 'p': round((ge + 1) / 1000, 4)}
    return {'M': M, 'L': L, 'S': S, 'elements': E, 'K': K, 'recurring': len(recurs), 'recurs': recurs[:40],
            'topCameThrough': sorted(((fmt(g), len(ms)) for g, ms in through.items()), key=lambda x: -x[1])[:10],
            'mutualInformation': mis, 'answer': 'STRUCTURED' if recurs else 'UNSTRUCTURED'}

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('stream'); ap.add_argument('--M', type=int, default=16); ap.add_argument('--L', type=int, default=1000)
    ap.add_argument('--S', type=int, default=99); ap.add_argument('--label', default='B'); a = ap.parse_args()
    print(json.dumps(analyse(json.load(open(a.stream))['zones'], a.M, a.L, a.S, a.label), indent=1))
