#!/usr/bin/env python3
"""AG-1 and RC-1 statistics (REGISTRATION.md), shared by the analysis and the calibration."""
import random
def epochs_data(items, log, stop):
    """D_e = digits of the data first seen in (T_e, T_{e+1}] (the last epoch: (T_last, stop])."""
    T = [e['T'] for e in log] + [stop]; D = [[] for _ in log]; j = 0
    for x in items:
        while j < len(log) and x['seenAt'] > T[j + 1]: j += 1
        if j < len(log) and T[j] < x['seenAt'] <= T[j + 1]: D[j].append(x['zone'])
    return D
def ag1(D, X, arm, perms=100000, seed='AG1'):
    """Delta = mean match rate to X_e over APPLY epochs - over SHAM epochs; two-sided randomisation test over arm labels."""
    m = [sum(d == x for d in Dd) / len(Dd) for Dd, x in zip(D, X) if Dd]; a = [ar for Dd, ar in zip(D, arm) if Dd]
    def delta(lab): A = [v for v, l in zip(m, lab) if l == 'APPLY']; S = [v for v, l in zip(m, lab) if l == 'SHAM']; return (sum(A) / len(A) - sum(S) / len(S)) if A and S else 0.0
    obs = delta(a); r = random.Random(seed); ge = 0; lab = a[:]
    for _ in range(perms): r.shuffle(lab); ge += abs(delta(lab)) >= abs(obs) - 1e-12
    return {'delta': obs, 'p': (ge + 1) / (perms + 1), 'epochs': len(m), 'apply': a.count('APPLY'), 'sham': a.count('SHAM')}
def rc1(D, Z, live):
    """A_k = mean over epochs of the share of D_e equal to candidate k's zPre(e); p = (1 + #{k != live: A_k >= A_live}) / K."""
    A = {k: sum(sum(d == z for d in Dd) / len(Dd) for Dd, z in zip(D, zs) if Dd) / max(1, sum(1 for Dd in D if Dd)) for k, zs in Z.items()}
    ge = sum(1 for k, v in A.items() if k != live and v >= A[live] - 1e-12)
    return {'A_live': A[live], 'A_yoked_mean': sum(v for k, v in A.items() if k != live) / (len(A) - 1), 'p': (1 + ge) / len(A), 'K': len(A),
            'distinctPaths': len({tuple(z) for z in Z.values()})}
