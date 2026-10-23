#!/usr/bin/env bash
# Monday analysis: replay PF-2 from its committed chunks, verify every logged event, compute the three measures.
# Usage: pf2_weekly_indices.sh <repo chunks dir> <studio dir> <out dir> <days>
set -euo pipefail
CH=$1; ST=$2; OUT=$3; DAYS=${4:-7}
mkdir -p "$OUT"
node --experimental-strip-types --no-warnings "$ST/pf2_replay_instrumented.mjs" "$ST/m" learner "$CH" "$OUT/pf2_l.json" >/dev/null
node --experimental-strip-types --no-warnings "$ST/pf2_replay_instrumented.mjs" "$ST/m" unchanged "$CH" "$OUT/pf2_u.json" >/dev/null
python3 -I - "$CH" "$OUT" <<'PY'
import json, os, sys
CH, OUT = sys.argv[1], sys.argv[2]
ev = {}
for f in sorted(os.listdir(CH)):
    for row in json.load(open(f'{CH}/{f}'))['rows']:
        for e in row['armEvents']: ev[(e['k'], e['mode'], e['tick'])] = (e['toZone'], e['cueZone'])
bad = n = 0
for fn, mode in (('pf2_l.json', 'learner'), ('pf2_u.json', 'unchanged')):
    for l in json.load(open(f'{OUT}/{fn}'))['lineages']:
        for t, (z, c) in enumerate(zip(l['zones'], l['cues']), start=1):
            n += 1; bad += ev.get((l['k'], mode, t)) != (z, c)
print(json.dumps({'replayedEvents': n, 'mismatches': bad}))
if bad: sys.exit('REPLAY MISMATCH: measures not computed')
PY
python3 -I "$ST/spiral_capture.py" "$OUT/pf2_l.json" "$OUT/pf2_u.json"
python3 -I "$ST/fi_only.py" "$OUT/pf2_l.json" "$OUT/pf2_u.json" 300 "$ST"
