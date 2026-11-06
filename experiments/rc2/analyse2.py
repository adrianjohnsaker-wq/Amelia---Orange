#!/usr/bin/env python3
"""RC-2 final analysis (REGISTRATION.md).   python3 analyse.py <world-live dir> <ledger dir> <stop ISO> <outdir>"""
import json, subprocess, sys, pathlib
HERE = pathlib.Path(__file__).resolve().parent; sys.path.insert(0, str(HERE))
sys.path.insert(0, str(HERE.parent / 'agentic')); from epoch import items as load_items; from stats import epochs_data; from stats2 import rc2
live, ledger, stop, out = sys.argv[1:5]; O = pathlib.Path(out); O.mkdir(parents=True, exist_ok=True)
log = json.load(open(pathlib.Path(ledger, 'log.json'))); meta = json.load(open(pathlib.Path(ledger, 'meta.json')))
log = [e for e in log if e['T'] < stop]; it = [x for x in load_items(live, log[0]['T']) if x['seenAt'] <= stop]
json.dump(it, open(O / 'items.json', 'w')); json.dump(log, open(O / 'log.json', 'w'))
D = epochs_data(it, log, stop)
res = {}
procs = [subprocess.Popen(['node', '--import', 'tsx', str(HERE / 'batch2.ts'), str(O / 'items.json'), str(O / 'log.json'), str(a), str(a + 25), stop, str(O / f'z{a}.json')]) for a in (0, 25, 50, 75)]
assert all(p.wait() == 0 for p in procs)
Z = {}; [Z.update({int(k): v for k, v in json.load(open(O / f'z{a}.json')).items()}) for a in (0, 25, 50, 75)]
assert Z[meta['liveCandidate']] == [e['zPre'] for e in log], 'live zPre not reproduced'
res['RC2'] = rc2(D, Z, meta['liveCandidate']); res['meta'] = meta; res['epochs'] = len(log); res['data'] = len(it)
json.dump(res, open(O / 'RESULT.json', 'w'), indent=1); print(json.dumps(res, indent=1))
