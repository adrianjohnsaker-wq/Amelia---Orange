#!/bin/sh
# NR-2 world run (REGISTRATION.md). Usage: sh run_world.sh <world.json> <outdir>
set -e
WJ="$1"; O="$2"; P=experiments/synthetic-pointer; mkdir -p "$O/order"; export WJ O P
# W1: the lag-2 Numogram reading of the world's numbers (NR-1b statistic and tests, unchanged)
node --import tsx $P/nr1/run.ts "$WJ" NR2-WORLD 1000 12 "$O/world.runs"
python3 -I $P/nr1/nr1b.py "$O/world.runs" > "$O/W1_reading.json"
# P1: does the world's order come through her Numogram passage (only if the calibration passed)
if python3 -I -c "import json,sys;sys.exit(0 if json.load(open('$P/nr2/calibration/CALIBRATION.json'))['passes'] else 1)"; then
  seq 0 11 | xargs -P 4 -I{} node --import tsx $P/nr2/order.ts "$WJ" {} 1000 49 NR2-WORLD "$O/order/seg{}.json"
  python3 -I $P/nr2/order_analysis.py "$O/order" > "$O/P1_order.json"
else echo '{"answer": "NOT_RUN: calibration did not pass"}' > "$O/P1_order.json"; fi
# Descriptive: per-source reading, and the readout of her output, world vs the clean held-out stream h02
python3 -I $P/nr2/world_descriptive.py "$WJ" "$O"
rm -rf "$O/order" "$O"/*.runs "$O"/src_*.runs
