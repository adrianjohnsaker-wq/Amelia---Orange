#!/usr/bin/env python3
"""ANTENNA B calibration (see REGISTRATION.md): 10 clean streams and motif 1-8-7-2 planted at 1%, 2%, 5%, 10%.
Pass: planted 2% -> STRUCTURED with 1-8-7-2 recurring, and at most 1 of 10 clean -> STRUCTURED.
  python3 calibrate.py <out dir>
"""
import json, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent)); sys.path.insert(0, str(pathlib.Path(__file__).parent.parent / 'antenna3'))
from structure import analyse
from stream3 import clean, plant
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True); res = {}
for c in [f'c{i:02d}' for i in range(1, 11)]: res[c] = analyse(clean(c, 16000), label=f'calB-{c}')
for rho in (0.01, 0.02, 0.05, 0.10): res[f'p{int(rho*100):02d}'] = analyse(plant(clean('P', 16000), rho, 'P')[0], label=f'calB-p{rho}')
fa = sum(res[c]['answer'] == 'STRUCTURED' for c in res if c.startswith('c'))
p2 = res['p02']; ok = p2['answer'] == 'STRUCTURED' and any(g == '1-8-7-2' for g, _ in p2['recurs']) and fa <= 1
lines = ['ANTENNA B calibration (REGISTRATION.md)', f'false alarms {fa}/10 clean; planted 1% {res["p01"]["answer"]}, 2% {p2["answer"]}, 5% {res["p05"]["answer"]}, 10% {res["p10"]["answer"]}', '']
for k, v in res.items(): lines.append(f'{k}: {v["answer"]:12} K={v["K"]} E={v["elements"]} recurs {v["recurs"][:5]} MI p {[m["p"] for m in v["mutualInformation"].values()]}')
lines += ['', 'CALIBRATION PASSED' if ok else 'CALIBRATION FAILED']
(out / 'CALIBRATION.txt').write_text('\n'.join(lines) + '\n'); json.dump(res, open(out / 'calibration.json', 'w'), indent=1)
print('\n'.join(lines))
