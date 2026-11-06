#!/usr/bin/env python3
"""NR-1 part 1 decision (REGISTRATION.md).   python3 summary.py <outdir>"""
import glob, json, os, sys
O = sys.argv[1]; R = {os.path.basename(f)[:-12]: json.load(open(f)) for f in glob.glob(f'{O}/*.result.json')}
cal = [R[f'clean_c{i:02d}'] for i in range(1, 11)]
pos = sum(r['positiveControl_INGRESSvsIDENTITY_syzygy_lag1']['p'] <= 0.01 and sum(r['positiveControl_INGRESSvsIDENTITY_syzygy_lag1']['d']) > 0 for r in cal)
nul = sum(v['p'] <= 0.05 for r in cal for v in r['nullControl_RELABELvsRELABEL_B'].values())
calibrated = pos >= 9 and nul <= 3
h = R['heldout_h01']['primary']; ps = sorted(h.items(), key=lambda x: x[1]['p']); sup, ok = {}, True
for i, (k, v) in enumerate(ps): ok = ok and v['p'] <= 0.05 / (len(ps) - i); sup[k] = {'p': v['p'], 'meanD': round(sum(v['d']) / len(v['d']), 5), 'supported': ok and calibrated}
print(json.dumps({'calibration': {'positiveControlPassedStreams': pos, 'of': 10, 'nullFalsePositives': nul, 'of_tests': 30, 'calibrated': calibrated},
                  'primary_heldout_h01': sup, 'note': 'primary results are interpretable only if calibrated is true'}, indent=1))
