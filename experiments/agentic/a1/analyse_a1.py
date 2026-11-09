#!/usr/bin/env python3
"""Amendment A1 final analysis (A1.md), for AG-1/RC-1 and RC-2. Identical to the sealed analyse.py / analyse2.py except
for one thing: the candidates (live and yoked) are replayed on the items as the ledger's A1 assignment fed them
(a1/assigned.json), so that the live candidate's logged zPre is reproduced. The outcome data D_e keep their sealed
definition (world data first seen in (T_e, T_{e+1}]); the statistics are the sealed ones.
  python3 analyse_a1.py ag1|rc2 <world-live dir> <ledger dir> <stop ISO> <outdir>"""
import json, subprocess, sys, pathlib
HERE = pathlib.Path(__file__).resolve().parent; sys.path.insert(0, str(HERE)); import a1lib as A
EXP = HERE.parents[1]; sys.path.insert(0, str(EXP / 'agentic'))
from epoch import items as load_items; from stats import epochs_data
study, live, ledger, stop, out = sys.argv[1:6]; O = pathlib.Path(out); O.mkdir(parents=True, exist_ok=True)
log = json.load(open(pathlib.Path(ledger, 'log.json'))); meta = json.load(open(pathlib.Path(ledger, 'meta.json')))
assigned = json.load(open(pathlib.Path(ledger, 'a1', 'assigned.json')))
log = [e for e in log if e['T'] < stop]; it = [x for x in load_items(live, log[0]['T']) if x['seenAt'] <= stop]
fed = A.feed_list(A.world(live, log[0]['T']), {k: v for k, v in assigned.items() if v < len(log)}, [e['T'] for e in log])
json.dump(fed, open(O / 'items.json', 'w')); json.dump(log, open(O / 'log.json', 'w'))
D = epochs_data(it, log, stop)
batch = EXP / 'agentic' / 'batch.ts' if study == 'ag1' else EXP / 'rc2' / 'batch2.ts'
procs = [subprocess.Popen(['node', '--import', 'tsx', str(batch), str(O / 'items.json'), str(O / 'log.json'), str(a), str(a + 25), stop, str(O / f'z{a}.json')]) for a in (0, 25, 50, 75)]
assert all(p.wait() == 0 for p in procs)
Z = {}; [Z.update({int(k): v for k, v in json.load(open(O / f'z{a}.json')).items()}) for a in (0, 25, 50, 75)]
assert Z[meta['liveCandidate']] == [e['zPre'] for e in log], 'live zPre not reproduced'
if study == 'ag1':
    from stats import ag1, rc1
    res = {'AG1': ag1(D, [e['X'] for e in log], [e['arm'] for e in log]), 'RC1': rc1(D, Z, meta['liveCandidate'])}
else:
    sys.path.insert(0, str(EXP / 'rc2')); from stats2 import rc2
    res = {'RC2': rc2(D, Z, meta['liveCandidate'])}
res.update({'meta': meta, 'epochs': len(log), 'data': len(it), 'amendment': 'A1'})
json.dump(res, open(O / 'RESULT.json', 'w'), indent=1); print(json.dumps(res, indent=1))
