# Hybrid mode (CG_TOPOLOGY=hybrid) must reproduce R4's shipped confirmation records exactly (seeds 37001-37003).
import json, os, sys
H = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, H)
import donor_context_study as S
E = os.path.join(H, '..', 'evidence', 'R4_donor_context', 'package', 'fresh_survival_37001')
ok = True
for s in (37001, 37002, 37003):
    a = json.loads(json.dumps(S.run_seed(s, 2), sort_keys=True)); b = json.load(open(os.path.join(E, f'seed_{s}.json')))
    ok &= a == b; print('r4', s, a == b)
print('HYBRID_EQUIVALENT' if ok else 'DIFFERENT')
