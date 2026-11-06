#!/usr/bin/env python3
"""CD-2 (REGISTRATION.md): do the SubCrypt (2 <-> 7) and BarkerLoop (3 <-> 6) readings come through world input in a
structured way? Measured at ENTRY: an entry passage onto syzygy {a, 9-a} is three consecutive zones x -> a -> 9-a with
x outside the pair (she arrives from elsewhere and crosses), so her ongoing shuttling inside the pair is not counted.
Per unit: c_0 = entry passages as received, c_1..c_S in the S order-shuffles (NR-2 order.ts, CANONICAL/IDENTITY).
R_u = #{s: c_s < c_0} + a uniformly random position among the ties (seeded): exactly uniform on 0..S under
"order carries nothing". T = sum over units; p = P(sum of M independent Uniform{0..S} >= T), exact. Holm over the two
syzygies, alpha 0.05.   python3 cd2.py <dir of order.ts outputs> [arm canonical|relabel]"""
import glob, json, random, sys
PAIRS = {'SubCrypt 2::7': (2, 7), 'BarkerLoop 3::6': (3, 6)}
def entries(path, pair):
    a, b = pair; P = {a, b}
    return sum(1 for x, y, z in zip(path, path[1:], path[2:]) if x not in P and y in P and z == 9 - y)
def tail(M, S, T):
    dist = [1.0]
    for _ in range(M):
        new = [0.0] * (len(dist) + S)
        for i, p in enumerate(dist):
            for r in range(S + 1): new[i + r] += p / (S + 1)
        dist = new
    return sum(dist[T:]) if T < len(dist) else 0.0
def analyse(src, arm='canonical'):
    F = [json.load(open(f)) for f in sorted(glob.glob(f'{src}/seg*.json'))]; S = F[0]['S']; M = len(F)
    out = {'units': M, 'S': S, 'arm': arm, 'syzygies': {}}
    for name, pair in PAIRS.items():
        T, rec, sh = 0, [], []
        for f in F:
            c = [entries(r[arm], pair) for r in f['runs']]; c0 = c[0]
            less = sum(x < c0 for x in c[1:]); ties = sum(x == c0 for x in c[1:])
            R = less + random.Random(f"CD2|{f['label']}|{f['segment']}|{name}").randint(0, ties); T += R
            rec.append(c0); sh.append(round(sum(c[1:]) / S, 2))
        out['syzygies'][name] = {'T': T, 'p': tail(M, S, T), 'received': rec, 'meanShuffle': sh}
    ps = sorted(out['syzygies'].items(), key=lambda x: x[1]['p']); ok = True
    for i, (n, v) in enumerate(ps): ok = ok and v['p'] <= 0.05 / (2 - i); v['supported'] = ok
    out['answer'] = {n: ('STRUCTURED' if v['supported'] else 'NOT STRUCTURED') for n, v in out['syzygies'].items()}
    return out
if __name__ == '__main__': print(json.dumps(analyse(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else 'canonical'), indent=1))
