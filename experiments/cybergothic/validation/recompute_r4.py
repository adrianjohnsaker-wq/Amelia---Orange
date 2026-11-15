#!/usr/bin/env python3
"""Independent recomputation of the R4 slide-vs-jump survival results from saved records (not using the package's scripts).
Estimand (as the confirmation plan states it): per seed, the mean encounter-level paired difference; then the mean over
eligible seeds; 95% seed-clustered bootstrap, 10,000 resamples.   python3 recompute_r4.py <package dir>"""
import collections, glob, json, random, sys
B = sys.argv[1]
for study in ('fresh_donor_36001', 'fresh_survival_37001'):
    R = [json.load(open(f)) for f in sorted(glob.glob(f'{B}/{study}/seed_*.json'))]
    T = [(r['seed'], t) for r in R for t in r['trials']]
    alive = lambda t, arm: int(t['outcomes'][arm]['timepoints']['24']['alive'])
    arms = sorted(T[0][1]['outcomes'])
    print(f'== {study}: seeds {len(R)}, encounters {len(T)}')
    print('   alive at 24:', {a: f'{sum(alive(t, a) for _, t in T)}/{len(T)}' for a in arms})
    by = collections.defaultdict(list)
    for s, t in T: by[s].append(alive(t, 'productive_slide') - alive(t, 'productive_jump'))
    seeds = sorted(by); means = [sum(by[s]) / len(by[s]) for s in seeds]; est = 100 * sum(means) / len(means)
    rng = random.Random('IND-R4-' + study); bs = sorted(100 * sum(means[rng.randrange(len(means))] for _ in means) / len(means) for _ in range(10000))
    print(f'   slide - jump (seed-weighted): {est:+.1f} pp, 95% {bs[249]:+.1f} to {bs[9749]:+.1f}  (eligible seeds {len(seeds)})')
    deaths = {a: collections.Counter((t['outcomes'][a]['death'] or {}).get('cause') for _, t in T if t['outcomes'][a]['death'] and t['outcomes'][a]['death'].get('time', 99) <= 24) for a in ('productive_slide', 'productive_jump')}
    print('   death causes by 24:', {a: dict(c) for a, c in deaths.items()})
