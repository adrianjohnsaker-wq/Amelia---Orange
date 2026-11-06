#!/bin/sh
# CD-1 calibration (REGISTRATION.md). No world data. Usage: sh calibrate.sh <outdir>
set -e
O="$1"; P=experiments/cd1; mkdir -p "$O/streams"; export O
for c in 01 02 03 04 05 06 07 08 09 10; do python3 -I $P/plant.py cd1c$c 12000 0 0 "$O/streams/clean_c$c.json"; done
for r in 0.02 0.05; do for m in 2727 3636; do python3 -I $P/plant.py cd1p 12000 $r $m "$O/streams/plant_${m}_$r.json"; done; done
for f in "$O"/streams/*.json; do n=$(basename "$f" .json); for m in 0 1 2 3 4 5 6 7 8 9 10 11; do echo "$f $m CD1-CAL-$n $O/runs/$n"; done; done |
  xargs -P 4 -n 4 sh -c 'mkdir -p "$3" && node --import tsx experiments/synthetic-pointer/nr2/order.ts "$0" "$1" 1000 49 "$2" "$3/seg$1.json"'
for d in "$O"/runs/*; do python3 -I $P/cd1.py "$d" > "$d.result.json"; done
python3 -I - "$O" <<'PY' > "$O/CALIBRATION.json"
import glob, json, os, sys
R = {os.path.basename(f)[:-12]: json.load(open(f)) for f in glob.glob(f'{sys.argv[1]}/runs/*.result.json')}
fp = sum(v['canonical'][s]['supported'] for k, v in R.items() if k.startswith('clean') for s in v['canonical'])
pos = {s: R[f'plant_{m}_0.05']['canonical'][s]['supported'] for s, m in (('SubCrypt 2::7', '2727'), ('BarkerLoop 3::6', '3636'))}
print(json.dumps({'cleanFalsePositives': fp, 'of': 20, 'planted5pct': pos, 'passes': fp <= 1 and all(pos.values()),
  'conditions': {k: {s: (x['unitsThrough'], x['supported']) for s, x in v['canonical'].items()} for k, v in sorted(R.items())}}, indent=1))
PY
