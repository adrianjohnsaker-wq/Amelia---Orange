#!/bin/sh
# SXI-1R calibration (REGISTRATION.md). No world data. Usage: sh calibrate.sh <outdir>
set -e
O="$1"; mkdir -p "$O/streams"; export O
P=experiments/synthetic-pointer/sxi1r
for c in 01 02 03 04 05 06 07 08 09 10; do python3 -I $P/stream3.py clean c$c 12000 "$O/streams/clean_c$c.json"; done
for r in 0.02 0.05 0.10; do python3 -I $P/stream3.py plant p 12000 $r "$O/streams/plant_$r.json"; done
for a in 0.1 0.3 0.9; do for f in "$O"/streams/*.json; do n=$(basename "$f" .json); for m in 0 1 2 3 4 5 6 7 8 9 10 11; do
  echo "$f $m $((101 + m)) $a SXI1R-CAL-$n $O/runs/a$a/$n"; done; done; done |
  xargs -P 4 -n 6 sh -c 'mkdir -p "$5" && node --import tsx experiments/synthetic-pointer/sxi1r/fast.ts "$0" "$1" 1000 "$2" 49 "$3" "$4" "$5/seed$2.json"'
for d in "$O"/runs/*/*; do python3 -I $P/analysis.py "$d" > "$d.result.json"; done
python3 -I $P/calibration_summary.py "$O" > "$O/CALIBRATION.json"
