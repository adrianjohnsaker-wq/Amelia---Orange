# Hybrid mode (CG_TOPOLOGY=hybrid) must reproduce shipped records exactly: 10 viral-stop and 3 from-birth populations.
import json, sys, os
sys.path.insert(0, os.getcwd())
import stop_trial, from_birth_study
E = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'evidence')
ok = True
for s in range(44001, 44011):
    a = json.loads(json.dumps(stop_trial.run_seed(s), sort_keys=True)); b = json.load(open(f'{E}/CYBERGOTHIC_VIRAL_STOP_EVIDENCE_2026-11-15/fresh_stop_replication_44001/seed_{s}.json'))
    ok &= a == b; print('stop', s, a == b)
for s in range(41001, 41004):
    a = json.loads(json.dumps(from_birth_study.run_seed(s, 180.0), sort_keys=True)); b = json.load(open(f'{E}/CYBERGOTHIC_DIGIT_GENOME_EVIDENCE_2026-11-15/fresh_birth_41001/seed_{s}.json'))
    ok &= a == b; print('birth', s, a == b)
print('HYBRID_EQUIVALENT' if ok else 'DIFFERENT')
