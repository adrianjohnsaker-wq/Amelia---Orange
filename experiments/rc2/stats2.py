#!/usr/bin/env python3
"""RC-2 statistic (REGISTRATION.md)."""
import random
def rc2(D, Z, live, seed='RC2'):
    """A_k = mean over epochs (with data) of the share of D_e equal to candidate k's zPre(e).
    p = (1 + #{k != live: A_k > A_live} + U) / K, U a seeded uniform draw from 0..#ties: exact under exchangeability."""
    A = {k: sum(sum(d == z for d in Dd) / len(Dd) for Dd, z in zip(D, zs) if Dd) / max(1, sum(1 for Dd in D if Dd)) for k, zs in Z.items()}
    gt = sum(1 for k, v in A.items() if k != live and v > A[live] + 1e-12); ties = sum(1 for k, v in A.items() if k != live and abs(v - A[live]) <= 1e-12)
    U = random.Random(f'{seed}|{live}').randint(0, ties)
    return {'A_live': A[live], 'A_yoked_mean': sum(v for k, v in A.items() if k != live) / (len(A) - 1), 'p': (1 + gt + U) / len(A), 'K': len(A), 'ties': ties,
            'distinctPaths': len({tuple(z) for z in Z.values()})}
