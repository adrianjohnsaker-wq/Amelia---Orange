#!/usr/bin/env python3
"""CD-1 (REGISTRATION.md): do the 2 <-> 7 (SubCrypt) and 3 <-> 6 (BarkerLoop) syzygy readings come through world input
in a structured way? Her direct passage (NR-1 runtime, CANONICAL Numogram, IDENTITY receiver) per unit, as received and
in S order-shuffles (../synthetic-pointer/nr2/order.ts). For each syzygy, a unit's count = her passages along it (both
directions). It comes through in a unit when the count as received is > every shuffle's (p <= 1/(S+1), exact). It is
SUPPORTED when it comes through in at least K units, K the smallest k with P(Binomial(M, 1/(S+1)) >= k) < 0.05 / 2.
Descriptive: the same on the RELABEL arm; received and mean-shuffle counts.   python3 cd1.py <dir of order.ts outputs>"""
import glob, json, sys
from math import comb
SYZ = {'SubCrypt 2::7': {(2, 7), (7, 2)}, 'BarkerLoop 3::6': {(3, 6), (6, 3)}}
def tail(n, p, k): return sum(comb(n, j) * p ** j * (1 - p) ** (n - j) for j in range(k, n + 1))
F = [json.load(open(f)) for f in sorted(glob.glob(f'{sys.argv[1]}/seg*.json'))]; S = F[0]['S']; M = len(F)
K = next(k for k in range(1, M + 2) if k > M or tail(M, 1 / (S + 1), k) < 0.05 / 2)
def count(path, pairs): return sum((a, b) in pairs for a, b in zip(path, path[1:]))
out = {'units': M, 'S': S, 'K': K}
for arm in ('canonical', 'relabel'):
    res = {}
    for name, pairs in SYZ.items():
        thr, rec, sh = 0, [], []
        for f in F:
            c = [count(r[arm], pairs) for r in f['runs']]; thr += c[0] > max(c[1:]); rec.append(c[0]); sh.append(round(sum(c[1:]) / S, 1))
        res[name] = {'unitsThrough': thr, 'supported': thr >= K, 'received': rec, 'meanShuffle': sh}
    out[arm] = res
out['answer'] = {n: ('STRUCTURED' if v['supported'] else 'NOT STRUCTURED') for n, v in out['canonical'].items()}
print(json.dumps(out, indent=1))
