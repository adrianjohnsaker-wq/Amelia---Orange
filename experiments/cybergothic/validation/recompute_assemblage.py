#!/usr/bin/env python3
"""Independent recomputation of the 14 Nov assemblage results from the saved per-seed records.   python3 recompute_assemblage.py <package dir>"""
import glob, json, random, sys
B = sys.argv[1]
def load(d): return [json.load(open(f)) for f in sorted(glob.glob(f'{B}/{d}/results/seed_*.json'))]
def boot(d, level, tag):
    rng = random.Random('IND-A-' + tag); bs = sorted(sum(d[rng.randrange(len(d))] for _ in d) / len(d) for _ in range(10000))
    a = (1 - level) / 2; return round(bs[int(a * 10000)], 2), round(bs[int((1 - a) * 10000) - 1], 2)
def contrast(rows, f, label, level):
    d = [f(r) for r in rows]; m = sum(d) / len(d)
    print(f'   {label}: {m:+.2f}  ({level*100:.2f}% {boot(d, level, label)})  positive {sum(x > 0 for x in d)}/{len(d)}')
S = load('second_pass'); print('== second pass, seeds', len(S))
A = lambda r, arm, k: r['arms'][arm][k]; V = lambda r, arm, k: r['recovery'][arm][k]
contrast(S, lambda r: A(r, 'advanced', 'field_harvest') - A(r, 'pointer_cargo', 'field_harvest'), 'experienced - pointer cargo, total nutrient', 0.991667)
contrast(S, lambda r: A(r, 'advanced', 'field_harvest') - A(r, 'shuffled_cargo', 'field_harvest'), 'experienced - shuffled cargo', 0.991667)
print('   mean nutrient experienced / pointer:', round(sum(A(r, 'advanced', 'field_harvest') for r in S) / 30, 1), round(sum(A(r, 'pointer_cargo', 'field_harvest') for r in S) / 30, 1),
      '| agent-time:', round(sum(A(r, 'advanced', 'agent_time') for r in S) / 30), round(sum(A(r, 'pointer_cargo', 'agent_time') for r in S) / 30))
contrast(S, lambda r: V(r, 'portfolio', 'field_harvest') - V(r, 'random', 'field_harvest'), 'portfolio - random archive', 0.991667)
contrast(S, lambda r: V(r, 'portfolio', 'field_harvest') - V(r, 'portfolio_shuffled', 'field_harvest'), 'portfolio - order-shuffled portfolio', 0.991667)
print('   recovery mean nutrient random / portfolio / shuffled:', *[round(sum(V(r, a, 'field_harvest') for r in S) / 30, 1) for a in ('random', 'portfolio', 'portfolio_shuffled')])
contrast(S, lambda r: A(r, 'no_salvage', 'external_reactor_input') - A(r, 'advanced', 'external_reactor_input'), 'external reactor input: no-salvage - salvage', 0.991667)
print('   external reactor input salvage / no-salvage:', round(sum(A(r, 'advanced', 'external_reactor_input') for r in S) / 30, 2), round(sum(A(r, 'no_salvage', 'external_reactor_input') for r in S) / 30, 2))
F = load('first_pass'); print('== first pass, seeds', len(F))
contrast(F, lambda r: r['arms']['full']['field_harvest'] - r['arms']['no_vector']['field_harvest'], 'full - no-vector, total nutrient', 0.991667)
T = load('temporal'); print('== temporal, seeds', len(T))
acc = lambda r, a, ph: r['arms'][a]['shadow'][ph]['correct'] / r['arms'][a]['shadow'][ph]['total']
for a in ('accumulating', 'moderate', 'rapid'):
    print(f'   {a}: before {100*sum(acc(r,a,"before") for r in T)/len(T):.1f}%  after {100*sum(acc(r,a,"after") for r in T)/len(T):.1f}%')
contrast(T, lambda r: 100 * (acc(r, 'moderate', 'after') - acc(r, 'accumulating', 'after')), 'moderate - accumulating, after reversal (pp)', 0.975)
contrast(T, lambda r: 100 * (acc(r, 'rapid', 'after') - acc(r, 'accumulating', 'after')), 'rapid - accumulating, after reversal (pp)', 0.975)
P = load('portable'); print('== portable, seeds', len(P))
contrast(P, lambda r: r['arms']['portable']['net_bet_energy'] - r['arms']['local']['net_bet_energy'], 'portable - local, net claim energy', 0.975)
contrast(P, lambda r: r['arms']['portable']['field_harvest'] - r['arms']['local']['field_harvest'], 'portable - local, total nutrient', 0.975)
print('   levy local / portable:', round(sum(r['arms']['local']['levy_total'] for r in P) / 30, 2), round(sum(r['arms']['portable']['levy_total'] for r in P) / 30, 2))
