#!/usr/bin/env python3
"""ANTENNA II positive control: plant a known motif into a stream (see REGISTRATION.md).

The motif's tokens replace stream tokens at non-overlapping, seeded random positions until a fraction RHO of the
stream is motif. Shuffling the planted stream keeps its zone frequencies but destroys the motif, so a working
receiver must find order-structure in the planted stream that its own shuffles do not have.

  python3 plant.py <stream.json> <rho> <out.json>
"""
import hashlib, json, random, sys

MOTIF = [1, 8, 7, 2]          # registered: a Time-Circuit figure (8::1 current -> 7, 7::2 syzygy), no Warp, no death zone

def plant(zones, rho, seed='ANTENNA2-PLANT'):
    z = list(zones); n = len(z); m = len(MOTIF)
    k = round(rho * n / m)
    rng = random.Random(hashlib.sha256(f'{seed}|{rho}'.encode()).hexdigest())
    slots = rng.sample(range(n // m), k)
    for s in slots: z[s * m:(s + 1) * m] = MOTIF
    return z, k

if __name__ == '__main__':
    src, rho, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
    zones = json.load(open(src))['zones']
    planted, k = plant(zones, rho)
    json.dump({'zones': planted, 'planted': {'motif': MOTIF, 'rho': rho, 'insertions': k}}, open(out, 'w'))
    print(json.dumps({'n': len(planted), 'rho': rho, 'insertions': k}))
