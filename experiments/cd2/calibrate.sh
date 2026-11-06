#!/bin/sh
# CD-2 calibration (REGISTRATION.md): the same streams, labels and order.ts runs as CD-1, with the CD-2 statistic.
# No world data. Usage: sh calibrate.sh <outdir>
set -e
O="$1"; P=experiments/cd2; mkdir -p "$O/streams"; export O
for c in 01 02 03 04 05 06 07 08 09 10; do python3 -I $P/plant.py cd1c$c 12000 0 0 "$O/streams/clean_c$c.json"; done
for r in 0.02 0.05; do for m in 2727 3636; do python3 -I $P/plant.py cd1p 12000 $r $m "$O/streams/plant_${m}_$r.json"; done; done
for f in "$O"/streams/*.json; do n=$(basename "$f" .json); for m in 0 1 2 3 4 5 6 7 8 9 10 11; do echo "$f $m CD1-CAL-$n $O/runs/$n"; done; done |
  xargs -P 4 -n 4 sh -c 'mkdir -p "$3" && node --import tsx experiments/synthetic-pointer/nr2/order.ts "$0" "$1" 1000 49 "$2" "$3/seg$1.json"'
for d in "$O"/runs/*; do [ -d "$d" ] && python3 -I $P/cd2.py "$d" > "$d.cd2.json"; done
python3 -I $P/calibration_summary.py "$O" > "$O/CALIBRATION.json"
