#!/usr/bin/env python3
"""CD-1 calibration streams: stream3.py's clean SHA-256-counter stream with a motif planted at rate rho.
  python3 plant.py <seed> <n> <rho> <motif e.g. 2727> <out.json>    (rho = 0: clean)"""
import hashlib, json, random, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / 'synthetic-pointer' / 'sxi1r')); from stream3 import clean
seed, n, rho, motif, out = sys.argv[1], int(sys.argv[2]), float(sys.argv[3]), [int(c) for c in sys.argv[4]], sys.argv[5]
z = clean(seed, n); m = len(motif); k = round(rho * n / m)
rng = random.Random(hashlib.sha256(f'CD1-PLANT|{seed}|{rho}|{sys.argv[4]}'.encode()).hexdigest())
for s in rng.sample(range(n // m), k): z[s * m:(s + 1) * m] = motif
json.dump({'zones': z, 'planted': {'motif': motif, 'rho': rho, 'insertions': k}}, open(out, 'w'))
