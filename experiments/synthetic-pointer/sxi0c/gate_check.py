#!/usr/bin/env python3
"""Standing gate (INTERFACE.md): positive control, null control, seed independence. Exit 0 only if all pass.
  python3 gate_check.py <dir with SHAM_, PLANT_, NULLNOISE_ metrics>"""
import json, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import analysis as A
R = A.load(sys.argv[1]); seeds = sorted(R['SHAM']); P = {a: {s: A.per_run(R[a][s]) for s in seeds} for a in ('SHAM', 'PLANT', 'NULLNOISE')}
dp = [P['PLANT'][s]['z7window'] - P['SHAM'][s]['z7window'] for s in seeds]; dn = [P['NULLNOISE'][s]['z7window'] - P['SHAM'][s]['z7window'] for s in seeds]
pp, pn = A.signflip(dp), A.signflip(dn); distinct = len({tuple(P['SHAM'][s]['path']) for s in seeds})
ok = {'positive': pp <= 0.01 and sum(x > 0 for x in dp) >= 10, 'null': pn > 0.05, 'seedsIndependent': distinct == len(seeds) == 12}
print(json.dumps({'positiveP': pp, 'positiveSeeds': sum(x > 0 for x in dp), 'nullP': pn, 'distinctShamPaths': distinct, 'pass': ok}, indent=1))
sys.exit(0 if all(ok.values()) else 1)
