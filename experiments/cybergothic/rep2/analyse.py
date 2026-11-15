#!/usr/bin/env python3
"""REP-2 analysis (REGISTRATION.md), written independently of the prototype's scripts.   python3 analyse.py <hybrid dir> <canonical dir> <out.json>
Primary, per part: productive_slide minus productive_jump survival of the original recipient at 24 model-time units. Per seed:
mean encounter-level paired difference; then the mean over eligible seeds; 95% seed-clustered bootstrap (10,000, seed REP2-BOOT-<part>)."""
import collections, glob, json, random, sys
def part(d, name):
    R = [json.load(open(f)) for f in sorted(glob.glob(f'{d}/seed_*.json'))]
    T = [(r['seed'], t) for r in R for t in r['trials']]
    if not T: return {'seeds': len(R), 'encounters': 0, 'answer': 'VOID: no eligible encounters'}
    alive = lambda t, a: int(t['outcomes'][a]['timepoints']['24']['alive'])
    arms = sorted(T[0][1]['outcomes'])
    by = collections.defaultdict(list)
    for s, t in T: by[s].append(alive(t, 'productive_slide') - alive(t, 'productive_jump'))
    means = [sum(v) / len(v) for v in by.values()]; est = 100 * sum(means) / len(means)
    rng = random.Random('REP2-BOOT-' + name); bs = sorted(100 * sum(means[rng.randrange(len(means))] for _ in means) / len(means) for _ in range(10000))
    lo, hi = bs[249], bs[9749]
    deaths = {a: dict(collections.Counter(t['outcomes'][a]['death']['cause'] for _, t in T if t['outcomes'][a]['death'] and t['outcomes'][a]['death'].get('time', 99) <= 24)) for a in ('productive_slide', 'productive_jump')}
    return {'seeds': len(R), 'eligibleSeeds': len(by), 'encounters': len(T), 'aliveAt24': {a: sum(alive(t, a) for _, t in T) for a in arms},
            'slideMinusJump_pp': round(est, 2), 'interval95': [round(lo, 2), round(hi, 2)], 'deathCausesBy24': deaths,
            'answer': 'CORROBORATED' if lo > 0 else 'NOT CORROBORATED'}
res = {'hybridFresh': part(sys.argv[1], 'hybrid'), 'canonicalFresh': part(sys.argv[2], 'canonical')}
json.dump(res, open(sys.argv[3], 'w'), indent=1); print(json.dumps(res, indent=1))
