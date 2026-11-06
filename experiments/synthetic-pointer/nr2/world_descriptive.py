#!/usr/bin/env python3
"""NR-2 descriptive (REGISTRATION.md): per-source lag-2 reading and Numogram readout, world vs clean h02. No decisions.
  python3 world_descriptive.py <world.json> <outdir>"""
import json, subprocess, sys, pathlib
P = pathlib.Path(__file__).resolve().parent; NR1 = P.parent / 'nr1'; sys.path.insert(0, str(NR1))
import analysis as A
WJ, O = sys.argv[1], pathlib.Path(sys.argv[2]); W = json.load(open(WJ))
def runjs(stream_file, label, M, out): subprocess.run(['node', '--import', 'tsx', str(NR1 / 'run.ts'), str(stream_file), label, '1000', str(M), str(out)], check=True)
def lag2(runs_file):
    return json.loads(subprocess.run([sys.executable, '-I', str(NR1 / 'nr1b.py'), str(runs_file)], check=True, capture_output=True, text=True).stdout)
def readout(runs_file):
    D = json.load(open(runs_file)); return A.readout([x for r in D['runs'] if r['graph'] == 'CANONICAL' and r['receiver'] == 'IDENTITY' for x in r['path']])
per = {}
for s in ('markets', 'sun', 'words', 'earth', 'date'):
    z = [x for x, t in zip(W['zones'], W['streams']) if t == s]; M = min(12, len(z) // 1000)
    if M < 5: per[s] = {'n': len(z), 'reading': 'not measured (< 5,000 data)'}; continue
    f = O / f'src_{s}.json'; json.dump({'zones': z}, open(f, 'w')); runjs(f, f'NR2-WORLD-{s}', M, O / f'src_{s}.runs')
    r = lag2(O / f'src_{s}.runs'); per[s] = {'n': len(z), 'units': M, 'meanLag2Enrichment': r['meanLag2Enrichment'], 'tests': r['tests']}
h = O / 'h02.json'; subprocess.run([sys.executable, '-I', str(NR1 / 'stream3.py'), 'clean', 'h02', '12000', str(h)], check=True)
runjs(h, 'NR1B-heldout_h02', 12, O / 'h02.runs')
from collections import Counter
digits = Counter(W['zones'])
out = {'perSource': per, 'readout': {'world': readout(O / 'world.runs'), 'clean_h02': readout(O / 'h02.runs')},
       'worldDigitShare': {str(k): round(v / len(W['zones']), 4) for k, v in sorted(digits.items())}}
json.dump(out, open(O / 'DESCRIPTIVE.json', 'w'), indent=1); print(json.dumps(out, indent=1))
