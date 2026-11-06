#!/usr/bin/env python3
"""CD-2 calibration pass rule (REGISTRATION.md).   python3 calibration_summary.py <calibration outdir>"""
import glob, json, os, sys
R = {os.path.basename(f)[:-9]: json.load(open(f)) for f in glob.glob(f'{sys.argv[1]}/runs/*.cd2.json')}
fp = sum(v['syzygies'][s]['supported'] for k, v in R.items() if k.startswith('clean') for s in v['syzygies'])
pos = {s: R[f'plant_{m}_0.05']['syzygies'][s]['supported'] for s, m in (('SubCrypt 2::7', '2727'), ('BarkerLoop 3::6', '3636'))}
print(json.dumps({'cleanFalsePositives': fp, 'of': 20, 'planted5pct': pos, 'passes': fp <= 1 and all(pos.values()),
                  'conditions': {k: {s: [round(x['p'], 5), x['supported'], x['T']] for s, x in v['syzygies'].items()} for k, v in sorted(R.items())}}, indent=1))
