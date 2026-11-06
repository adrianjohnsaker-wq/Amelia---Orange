#!/usr/bin/env python3
"""NR-2 order test (REGISTRATION.md): the SXI-1R rule (../sxi1r/analysis.py `rule`, unchanged) applied to her direct
passage: elements = her zone n-grams (n = 2, 3, 4); comes through in a unit = count as received > 0 and > all S shuffles
(p <= 1/(S+1), exact); recurs = in >= K units, K from Binomial(M, 1/(S+1)) at 0.05/E. RECEIVED / SILENT.
  python3 order_analysis.py <dir of order.ts outputs>"""
import glob, json, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent / 'sxi1r'))
from analysis import rule
F = [json.load(open(f)) for f in sorted(glob.glob(f'{sys.argv[1]}/seg*.json'))]; S = F[0]['S']
assert len({f['segment'] for f in F}) == len(F) and all([r['shuffle'] for r in f['runs']] == list(range(S + 1)) for f in F)
can = rule([[r['canonical'] for r in f['runs']] for f in F], S); rel = rule([[r['relabel'] for r in f['runs']] for f in F], S)
print(json.dumps({'label': F[0]['label'], 'answer': can['answer'], 'canonical': can, 'relabelDescriptive': rel}, indent=1))
