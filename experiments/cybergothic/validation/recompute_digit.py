#!/usr/bin/env python3
"""Independent recomputation of the digit-genome results from saved per-population records.   python3 recompute_digit.py <package dir>"""
import glob, json, random, sys
B = sys.argv[1]
def load(c): return [json.load(open(f)) for f in sorted(glob.glob(f'{B}/{c}/seed_*.json'))]
def paired(R, a, b, label):
    d = [r['results'][a]['agent_time'] - r['results'][b]['agent_time'] for r in R]; m = sum(d) / len(d)
    rng = random.Random('IND-' + label); bs = sorted(sum(d[rng.randrange(len(d))] for _ in d) / len(d) for _ in range(10000))
    return f'{a} - {b}: {m:+.2f} agent-time (95% {bs[249]:+.2f} to {bs[9749]:+.2f}; 97.5% {bs[124]:+.2f} to {bs[9874]:+.2f}), n={len(d)}'
F = load('fresh_birth_41001'); s = [r['results']['self'] for r in F]
print('== from birth, populations', len(F))
print('   founders with an intron:', sum(1 for r in F if any(sp for sp in [r.get('baseline', {}).get('founder_intron_spans', 0)] if sp)), '(field present:', 'founder_intron_spans' in F[0].get('baseline', {}), ')')
print('   mutation-created intron span >= 1:', sum(x['mutation_created_intron_spans'] > 0 for x in s), '/', len(F))
print('   no-op executed >= 1:', sum(x['decode_counts'].get('intron_nop', x['decode_counts'].get('nop', 0)) > 0 for x in s), '/', len(F), '| decode keys', sorted(s[0]['decode_counts']))
print('   hosts with intron at horizon >= 1:', sum(x['hosts_with_intron'] > 0 for x in s), '/', len(F))
print('   ' + paired(F, 'self', 'intron_active', 'birth'))
D = load('fresh_digit_39001'); G = load('fresh_grammar_40001')
print('== transition study, populations', len(D)); print('   ' + paired(D, 'self', 'intron_active', 'digit'))
print('== grammar confirmation, populations', len(G)); print('   ' + paired(G, 'self', 'literal', 'grammar'))
