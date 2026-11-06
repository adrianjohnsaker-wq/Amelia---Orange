#!/bin/sh
# NR-1 part 1 (REGISTRATION.md). No world data. Usage: sh calibrate.sh <outdir>
set -e
O="$1"; P=experiments/synthetic-pointer/nr1; mkdir -p "$O"; export O P
node --import tsx $P/equivalence.ts > "$O/EQUIVALENCE.txt"
for i in 01 02 03 04 05 06 07 08 09 10; do python3 -I $P/stream3.py clean c$i 12000 "$O/clean_c$i.json"; done
python3 -I $P/stream3.py clean h01 12000 "$O/heldout_h01.json"
for r in 0.05 0.10; do python3 -I $P/stream3.py plant nr1m 12000 $r "$O/motif_$r.json"; done
ls "$O"/*.json | xargs -P 4 -I{} sh -c 'n=$(basename {} .json); node --import tsx $P/run.ts {} "NR1-$n" 1000 12 "$O/$n.runs"'
for f in "$O"/*.runs; do n=$(basename "$f" .runs); echo "$f $n"; done | xargs -P 4 -n 2 sh -c 'case "$1" in motif*) m=--motif;; *) m=;; esac; python3 -I $P/analysis.py "$0" $m > "$O/$1.result.json"'
python3 -I $P/summary.py "$O" > "$O/SUMMARY.json"
