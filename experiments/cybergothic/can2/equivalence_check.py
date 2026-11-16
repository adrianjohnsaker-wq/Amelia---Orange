"""CAN-2 hybrid equivalence: with CG_TOPOLOGY=hybrid the CAN-2 engines must reproduce shipped records exactly.
R1 seed 33001, R2 seed 34001, R3 seed 35001 (engine_r123); R7 seeds 50002 and 50176 (engine_r7, full population summary)."""
import gzip, json, os, subprocess, sys, tempfile
assert os.environ.get('CG_TOPOLOGY') == 'hybrid', 'run with CG_TOPOLOGY=hybrid'
H = os.path.dirname(os.path.abspath(__file__)); EV = os.path.join(H, '..', 'evidence')
def norm(x): return json.loads(json.dumps(x, sort_keys=True))
def run_r123(mod, fn_args, record):
    code = (f"import json,sys;sys.path.insert(0,{os.path.join(H,'engine_r123')!r});import {mod} as M;"
            f"print(json.dumps(M.run_seed(*{fn_args!r}),sort_keys=True))")
    out = subprocess.run([sys.executable, '-c', code], cwd=os.path.join(H, 'engine_r123'), check=True, capture_output=True, text=True).stdout
    return norm(json.loads(out)) == norm(json.load(open(record)))
ok = True
checks = [('R1', 'strict_trial', (33001,), 'R1_host_encounter/evidence/results/confirmation/seed_33001.json'),
          ('R2', 'viral_echo_study', (34001,), 'R2_viral_echo/package/fresh_echo_34001/seed_34001.json'),
          ('R3', 'promoter_study', (35001,), 'R3_promoter/package/fresh_promoter_35001/seed_35001.json')]
for name, mod, args, rec in checks:
    r = run_r123(mod, args, os.path.join(EV, rec)); ok &= r; print(name, args[0], r, flush=True)
P = {p['seed']: p for p in json.load(gzip.open(os.path.join(EV, 'R7_chimeric_cohort/results_package/analysis/population_summaries.json.gz')))['populations']}
for s in (50002, 50176):
    with tempfile.TemporaryDirectory() as t:
        out = subprocess.run([sys.executable, '-B', 'cohort_worker.py', '--seed', str(s), '--output-dir', t, '--no-ledgers'],
                             cwd=os.path.join(H, 'engine_r7'), check=True, capture_output=True, text=True).stdout
    r = json.loads(out); r.pop('lockdown', None); a = dict(P[s]); a.pop('lockdown', None)
    same = norm(r) == norm(a); ok &= same; print('R7', s, same, flush=True)
print('HYBRID_EQUIVALENT' if ok else 'DIFFERENT')
