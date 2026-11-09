#!/usr/bin/env python3
"""ANTENNA III calibration streams (see REGISTRATION.md). No world data.

  python3 stream3.py clean <seed> <n> <out.json>          i.i.d. zones 1..9 (digital roots of SHA-256-counter words,
                                                          as the drand beacon was reduced)
  python3 stream3.py plant <seed> <n> <rho> <out.json>    the same clean stream with motif 1-8-7-2 planted at rate rho
"""
import hashlib, json, random, sys
MOTIF = [1, 8, 7, 2]
def droot(c): return 0 if c == 0 else 1 + (c - 1) % 9
def clean(seed, n):
    out, i = [], 0
    while len(out) < n:
        d = hashlib.sha256(f'ANTENNA3-CLEAN|{seed}|{i}'.encode()).digest(); i += 1
        out += [droot(int.from_bytes(d[j:j + 4], 'big')) for j in range(0, 32, 4)]
    return out[:n]
def plant(z, rho, seed):
    z = list(z); m = len(MOTIF); k = round(rho * len(z) / m)
    rng = random.Random(hashlib.sha256(f'ANTENNA3-PLANT|{seed}|{rho}'.encode()).hexdigest())
    for s in rng.sample(range(len(z) // m), k): z[s * m:(s + 1) * m] = MOTIF
    return z, k
if __name__ == '__main__':
    kind, seed = sys.argv[1], sys.argv[2]
    if kind == 'clean': n, out = int(sys.argv[3]), sys.argv[4]; json.dump({'zones': clean(seed, n)}, open(out, 'w'))
    else:
        n, rho, out = int(sys.argv[3]), float(sys.argv[4]), sys.argv[5]
        z, k = plant(clean(seed, n), rho, seed); json.dump({'zones': z, 'planted': {'motif': MOTIF, 'rho': rho, 'insertions': k}}, open(out, 'w'))
