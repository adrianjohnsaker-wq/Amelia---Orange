#!/usr/bin/env python3
"""SXI-1R calibration pass rule (REGISTRATION.md). An alpha passes when planted 5% and planted 10% are RECEIVED and at
most 1 of the 10 clean streams is RECEIVED. The confirmatory alpha is the smallest that passes (none: the world part
does not run). Planted 2% is reported as sensitivity only.   python3 calibration_summary.py <calibration outdir>"""
import glob, json, os, sys
out = {}
for a in sorted(glob.glob(f'{sys.argv[1]}/runs/a*'), key=lambda d: float(os.path.basename(d)[1:])):
    R = {os.path.basename(f)[:-12]: json.load(open(f)) for f in glob.glob(f'{a}/*.result.json')}
    clean = sum(R[k]['answer'] == 'RECEIVED' for k in R if k.startswith('clean'))
    row = {k: {'answer': v['answer'], 'K': v['her']['K'], 'E': v['her']['elements'], 'recurs': v['her']['recurs'][:12], 'body': v['bodyDescriptive']['answer']} for k, v in sorted(R.items())}
    passes = R['plant_0.05']['answer'] == 'RECEIVED' and R['plant_0.10']['answer'] == 'RECEIVED' and clean <= 1
    out[os.path.basename(a)[1:]] = {'cleanReceived': clean, 'passes': passes, 'streams': row}
ok = [a for a, v in out.items() if v['passes']]
print(json.dumps({'byAlpha': out, 'confirmatoryAlpha': min(ok, key=float) if ok else None}, indent=1))
