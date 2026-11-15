#!/usr/bin/env python3
"""Independent recomputation of the viral-stop survival results from the saved per-population records.
Written without reading the package's analysis scripts. One record per screened population; an eligible one holds six arms.
   python3 recompute_stop.py <package dir>"""
import glob, json, random, sys
B = sys.argv[1]
for cohort in ('fresh_viral_stop_42001', 'fresh_stop_confirm_43001', 'fresh_stop_replication_44001'):
    R = [json.load(open(f)) for f in sorted(glob.glob(f'{B}/{cohort}/seed_*.json'))]
    E = [r for r in R if r['eligible']]
    arms = sorted(E[0]['outputs'])
    surv = {a: sum(r['outputs'][a]['long']['survived'] for r in E) for a in arms}
    births = {a: sum(r['outputs'][a]['long']['descendant_births'] for r in E) for a in arms}
    def diff(a, b, sample): return 100 * sum(r['outputs'][a]['long']['survived'] - r['outputs'][b]['long']['survived'] for r in sample) / len(sample)
    rng = random.Random(f'INDEPENDENT-{cohort}'); boots = {('intact_transfer', 'ruptured_transfer'): [], ('intact_transfer', 'active_transfer'): []}
    for _ in range(10000):
        s = [E[rng.randrange(len(E))] for _ in E]
        for k in boots: boots[k].append(diff(*k, s))
    print(f'== {cohort}: screened {len(R)}, eligible {len(E)}')
    print('   survived at 24:', {a: f'{v}/{len(E)}' for a, v in surv.items()})
    print('   births:', births)
    for k, v in boots.items():
        v.sort(); print(f'   {k[0]} - {k[1]}: {diff(*k, E):+.2f} pp, 97.5% interval {v[int(0.0125*len(v))]:+.2f} to {v[int(0.9875*len(v))-1]:+.2f}')
