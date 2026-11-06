#!/bin/sh
# NR-2 calibration of the order test on the direct path (REGISTRATION.md). No world data. Usage: sh calibrate.sh <outdir>
set -e
O="$1"; P=experiments/synthetic-pointer/nr2; mkdir -p "$O/streams"; export O P
for c in 01 02 03 04 05 06 07 08 09 10; do python3 -I $P/stream3.py clean nr2c$c 12000 "$O/streams/clean_c$c.json"; done
for r in 0.02 0.05 0.10; do python3 -I $P/stream3.py plant nr2p 12000 $r "$O/streams/plant_$r.json"; done
for f in "$O"/streams/*.json; do n=$(basename "$f" .json); for m in 0 1 2 3 4 5 6 7 8 9 10 11; do echo "$f $m NR2-CAL-$n $O/runs/$n"; done; done |
  xargs -P 4 -n 4 sh -c 'mkdir -p "$3" && node --import tsx experiments/synthetic-pointer/nr2/order.ts "$0" "$1" 1000 49 "$2" "$3/seg$1.json"'
for d in "$O"/runs/*; do python3 -I $P/order_analysis.py "$d" > "$d.result.json"; done
python3 -I - "$O" <<'PY' > "$O/CALIBRATION.json"
import glob, json, os, sys
R = {os.path.basename(f)[:-12]: json.load(open(f)) for f in glob.glob(f'{sys.argv[1]}/runs/*.result.json')}
clean = sum(R[k]['answer'] == 'RECEIVED' for k in R if k.startswith('clean'))
passes = R['plant_0.05']['answer'] == 'RECEIVED' and R['plant_0.10']['answer'] == 'RECEIVED' and clean <= 1
print(json.dumps({'cleanReceived': clean, 'passes': passes, 'streams': {k: {'answer': v['answer'], 'K': v['canonical']['K'], 'E': v['canonical']['elements'],
      'recurs': v['canonical']['recurs'][:12], 'relabel': v['relabelDescriptive']['answer']} for k, v in sorted(R.items())}}, indent=1))
PY
