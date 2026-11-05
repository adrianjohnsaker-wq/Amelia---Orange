#!/usr/bin/env python3
"""SXI-1R decision rule (REGISTRATION.md). Read-only.

Unit: a body seed. Seed m hears its own disjoint stream segment m as received (j = 0) and S order-shuffles of it
(j = 1..S), each through the same body seed and the same closed loop. Elements: every zone n-gram (n = 2, 3, 4) of
her passage. An element "comes through" in a seed when its count as received is > 0 and strictly greater than in
each of the S shuffles: under "the stream's order carries nothing" the S + 1 runs of a seed are exchangeable, so
p <= 1/(S+1), exactly. Seeds have disjoint segments, distinct bodies and independent shuffles, so they are independent.
An element "recurs" when it comes through in at least K seeds, K the smallest k with
P(Binomial(M, 1/(S+1)) >= k) < 0.05 / E, E = the number of distinct n-grams in the received passages.
ANSWER: RECEIVED (listing what recurs) if anything recurs, else SILENT.
Descriptive: the same rule on the body's own sequence (the dominant band each step), to localise.

  python3 analysis.py <dir of fast.ts outputs for one condition>
"""
import collections, glob, json, sys
from math import comb
def tail(n, p, k): return sum(comb(n, j) * p ** j * (1 - p) ** (n - j) for j in range(k, n + 1))
def counts(z): c = collections.Counter(); [c.update(tuple(z[i:i + n]) for i in range(len(z) - n + 1)) for n in (2, 3, 4)]; return c
def rule(seqs, S):   # seqs: per seed, list of S+1 sequences
    M = len(seqs); p = 1 / (S + 1); through = collections.defaultdict(list); universe = set()
    for m, runs in enumerate(seqs):
        cs = [counts(z) for z in runs]; universe |= set(cs[0])
        for e, v in cs[0].items():
            if v > 0 and all(v > c[e] for c in cs[1:]): through[e].append(m)
    E = max(1, len(universe)); K = next(k for k in range(1, M + 2) if k > M or tail(M, p, k) < 0.05 / E)
    rec = sorted(((''.join(map(str, e)), len(v)) for e, v in through.items() if len(v) >= K), key=lambda x: (-x[1], x[0]))
    top = sorted(((''.join(map(str, e)), len(v)) for e, v in through.items()), key=lambda x: (-x[1], x[0]))[:10]
    return {'M': M, 'S': S, 'elements': E, 'K': K, 'recurring': len(rec), 'recurs': rec, 'mostSeeds': top, 'answer': 'RECEIVED' if rec else 'SILENT'}
def analyse(src):
    F = [json.load(open(f)) for f in sorted(glob.glob(f'{src}/*.json'))]
    S = F[0]['S']; assert all(f['S'] == S and [r['shuffle'] for r in f['runs']] == list(range(S + 1)) for f in F)
    assert len({f['segment'] for f in F}) == len(F) and len({f['seed'] for f in F}) == len(F), 'segments and seeds must be distinct'
    her = rule([[r['path'] for r in f['runs']] for f in F], S); body = rule([[r['body'] for r in f['runs']] for f in F], S)
    return {'label': F[0]['label'], 'alpha': F[0]['alpha'], 'L': F[0]['L'], 'answer': her['answer'], 'her': her, 'bodyDescriptive': body}
if __name__ == '__main__': print(json.dumps(analyse(sys.argv[1]), indent=1))
