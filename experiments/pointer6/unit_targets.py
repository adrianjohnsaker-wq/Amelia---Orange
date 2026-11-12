#!/usr/bin/env python3
"""THE POINTER VI pipeline check only: dummy targets (seeded, not drand) in the targets.json format, so score.py can be run end
to end on the sealed answers before sealing. Its output is never a result.   python3 unit_targets.py <answers.json> <out.json>"""
import json, random, sys
runs = json.load(open(sys.argv[1])); rng = random.Random('POINTER6-UNIT-DUMMY-NOT-A-TARGET')
T = {f"{r['world']}|{r['lineage']}": [{'grid': [rng.getrandbits(1) for _ in range(64)], 'rule': rng.randrange(8)} for _ in r['paths']['BUBBAMU']] for r in runs}
json.dump({'schema': 'DUMMY', 'targets': T}, open(sys.argv[2], 'w')); print('dummy targets', len(T))
