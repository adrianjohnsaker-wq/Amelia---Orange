#!/usr/bin/env python3
"""REP-1 analysis (REGISTRATION.md), written independently of the prototype's analysis scripts.
   python3 analyse.py <stop output dir> <from-birth output dir> <out.json>"""
import glob, json, random, sys
S, F, OUT = sys.argv[1:4]
E = [r for r in (json.load(open(f)) for f in sorted(glob.glob(f'{S}/seed_*.json'))) if r['eligible']]
N = len(glob.glob(f'{S}/seed_*.json'))
def d(a, b, s): return 100 * sum(r['outputs'][a]['long']['survived'] - r['outputs'][b]['long']['survived'] for r in s) / len(s)
rng = random.Random('REP1-BOOT'); C = [('intact_transfer', 'ruptured_transfer'), ('intact_transfer', 'active_transfer')]; boots = {c: [] for c in C}
for _ in range(10000):
    s = [E[rng.randrange(len(E))] for _ in E]
    for c in C: boots[c].append(d(*c, s))
res = {'stop': {'screened': N, 'eligible': len(E), 'survived': {a: sum(r['outputs'][a]['long']['survived'] for r in E) for a in sorted(E[0]['outputs'])},
                'births': {a: sum(r['outputs'][a]['long']['descendant_births'] for r in E) for a in sorted(E[0]['outputs'])}}}
ok = []
for c in C:
    v = sorted(boots[c]); lo, hi = v[124], v[9874]
    res['stop'][f'{c[0]} - {c[1]}'] = {'pp': round(d(*c, E), 2), 'interval97_5': [round(lo, 2), round(hi, 2)], 'pass': lo > 0}; ok.append(lo > 0)
B = [json.load(open(f)) for f in sorted(glob.glob(f'{F}/seed_*.json'))]; s = [r['results']['self'] for r in B]
res['fromBirth'] = {'populations': len(B), 'mutationCreatedIntron': sum(x['mutation_created_intron_spans'] > 0 for x in s),
                    'intronNoopExecuted': sum(x['decode_counts'].get('noop_intron', 0) > 0 for x in s), 'carriersAtHorizon': sum(x['hosts_with_intron'] > 0 for x in s),
                    'intronNoops': sum(x['decode_counts'].get('noop_intron', 0) for x in s)}
fb = all(res['fromBirth'][k] >= 27 for k in ('mutationCreatedIntron', 'intronNoopExecuted', 'carriersAtHorizon'))
res['answer'] = {'R6_survival': 'CORROBORATED' if all(ok) else 'PARTLY CORROBORATED' if any(ok) else 'NOT CORROBORATED', 'R5_formation': 'CORROBORATED' if fb else 'NOT CORROBORATED'}
json.dump(res, open(OUT, 'w'), indent=1); print(json.dumps(res, indent=1))
