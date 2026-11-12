#!/usr/bin/env python3
"""THE POINTER VI: merge per-world answer files into answers.json, sorted by (world, lineage).  python3 merge.py <out> <part>..."""
import json, sys
runs = [r for f in sys.argv[2:] for r in json.load(open(f))]; runs.sort(key=lambda r: (r['world'], r['lineage']))
assert len(runs) == 72 and len({(r['world'], r['lineage']) for r in runs}) == 72, len(runs)
json.dump(runs, open(sys.argv[1], 'w'), sort_keys=True); print('merged', len(runs))
