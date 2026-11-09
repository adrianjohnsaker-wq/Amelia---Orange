#!/bin/sh
# ND-1d order + motif (REGISTRATION.md).
#   sh calibrate.sh <cfg> <C|EXIT> <clean prefix> <n clean> <plant prefix> <n 2% streams> <outdir>
# streams: clean <prefix>01..; 2% plants seeded <plant prefix>01..<n>; 5% and 10% plants seeded <plant prefix>01.
set -e
CFG="$1"; ARCH="$2"; CP="$3"; NC="$4"; PP="$5"; N2="$6"; O="$7"; P=experiments/synthetic-pointer; mkdir -p "$O/streams"; export O P CFG ARCH
i=1; while [ $i -le "$NC" ]; do c=$(printf %02d $i); python3 -I $P/ndb/stream3.py clean $CP$c 12000 "$O/streams/clean_c$c.json"; i=$((i+1)); done
i=1; while [ $i -le "$N2" ]; do c=$(printf %02d $i); python3 -I $P/ndb/stream3.py plant $PP$c 12000 0.02 "$O/streams/plant2_p$c.json"; i=$((i+1)); done
for r in 0.05 0.10; do python3 -I $P/ndb/stream3.py plant ${PP}01 12000 $r "$O/streams/plant_$r.json"; done
for f in "$O"/streams/*.json; do n=$(basename "$f" .json); for m in 0 1 2 3 4 5 6 7 8 9 10 11; do echo "$f $m ND1D-$n $O/runs/$n"; done; done |
  xargs -P 4 -n 4 sh -c 'mkdir -p "$3" && node --import tsx experiments/synthetic-pointer/nd1d/order.ts "$0" "$1" 1000 49 "$2" "$CFG" "$ARCH" "$3/seg$1.json"'
for d in "$O"/runs/*; do if [ -d "$d" ]; then python3 -I $P/nr2/order_analysis.py "$d" > "$d.result.json"; python3 -I $P/nd1c/motif.py "$d" "$O/streams/$(basename "$d").json" > "$d.motif.json"; fi; done
python3 -I $P/nd1d/summarise.py "$O" "$CFG" "$ARCH" > "$O/ORDER.json"
