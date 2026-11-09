#!/bin/sh
# ND-1c order + motif (REGISTRATION.md).  sh calibrate.sh <cfg> <clean seed prefix> <n clean> <plant seed> <outdir>
# e.g. development: sh calibrate.sh DERIV nd1cdev 4 nd1cdevp out/dev_DERIV ; confirmatory: sh calibrate.sh <cfg*> nd1cc 10 nd1cp out/conf
set -e
CFG="$1"; CP="$2"; NC="$3"; PS="$4"; O="$5"; P=experiments/synthetic-pointer; mkdir -p "$O/streams"; export O P CFG
i=1; while [ $i -le "$NC" ]; do c=$(printf %02d $i); python3 -I $P/ndb/stream3.py clean $CP$c 12000 "$O/streams/clean_c$c.json"; i=$((i+1)); done
for r in 0.02 0.05 0.10; do python3 -I $P/ndb/stream3.py plant $PS 12000 $r "$O/streams/plant_$r.json"; done
for f in "$O"/streams/*.json; do n=$(basename "$f" .json); for m in 0 1 2 3 4 5 6 7 8 9 10 11; do echo "$f $m ND1C-$n $O/runs/$n"; done; done |
  xargs -P 4 -n 4 sh -c 'mkdir -p "$3" && node --import tsx experiments/synthetic-pointer/nd1c/order.ts "$0" "$1" 1000 49 "$2" "$CFG" "$3/seg$1.json"'
for d in "$O"/runs/*; do if [ -d "$d" ]; then python3 -I $P/nr2/order_analysis.py "$d" > "$d.result.json"; fi; done
for r in 0.02 0.05 0.10; do python3 -I $P/nd1c/motif.py "$O/runs/plant_$r" "$O/streams/plant_$r.json" > "$O/motif_$r.json"; done
python3 -I - "$O" "$CFG" <<'PY' > "$O/ORDER.json"
import glob, json, os, sys
R = {os.path.basename(f)[:-12]: json.load(open(f)) for f in glob.glob(f'{sys.argv[1]}/runs/*.result.json')}
M = {r: json.load(open(f'{sys.argv[1]}/motif_{r}.json')) for r in ('0.02', '0.05', '0.10')}
print(json.dumps({'cfg': sys.argv[2], 'cleanReceived': sum(R[k]['answer'] == 'RECEIVED' for k in R if k.startswith('clean')),
  'cleanStreams': sum(1 for k in R if k.startswith('clean')), 'plant': {r: R[f'plant_{r}']['answer'] for r in ('0.02', '0.05', '0.10')},
  'motif': {r: {'candidate': M[r]['candidate']['exactRate'], 'exit': M[r]['exit']['exactRate'], 'candidateTop': M[r]['candidate']['top'][:3], 'motifs': M[r]['candidate']['motifs']} for r in M},
  'streams': {k: {'answer': v['answer'], 'recurs': v['canonical']['recurs'][:8]} for k, v in sorted(R.items())}}, indent=1))
PY
