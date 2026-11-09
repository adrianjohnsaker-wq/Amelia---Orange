#!/bin/sh
# ND-3 world run (REGISTRATION.md): ND-1b on world data. Usage: sh run_world.sh <world.json> <outdir>
set -e
WJ="$1"; O="$2"; P=experiments/synthetic-pointer; mkdir -p "$O/order"; export WJ O P
node --import tsx $P/ndb/run.ts "$WJ" ND3-WORLD 1000 12 "$O/world.runs"
python3 -I $P/ndb/analysis.py "$O/world.runs" > "$O/W1_reading.json"
if python3 -I -c "import json,sys;sys.exit(0 if json.load(open('$P/ndb/results/CALIBRATION.json'))['passes'] else 1)"; then
  seq 0 11 | xargs -P 4 -I{} node --import tsx $P/ndb/order.ts "$WJ" {} 1000 49 ND3-WORLD "$O/order/seg{}.json"
  python3 -I $P/nr2/order_analysis.py "$O/order" > "$O/P1_order.json"
else echo '{"answer": "NOT_RUN: calibration did not pass"}' > "$O/P1_order.json"; fi
rm -rf "$O/order" "$O/world.runs"
