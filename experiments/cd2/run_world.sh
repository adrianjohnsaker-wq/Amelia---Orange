#!/bin/sh
# CD-2 world run (REGISTRATION.md). Usage: sh run_world.sh <world.json> <outdir>
set -e
WJ="$1"; O="$2"; mkdir -p "$O/order"; export WJ O
seq 0 11 | xargs -P 4 -I{} node --import tsx experiments/synthetic-pointer/nr2/order.ts "$WJ" {} 1000 49 CD2-WORLD "$O/order/seg{}.json"
python3 -I experiments/cd2/cd2.py "$O/order" canonical > "$O/RESULT.json"
python3 -I experiments/cd2/cd2.py "$O/order" relabel > "$O/RELABEL_descriptive.json"
rm -rf "$O/order"; cat "$O/RESULT.json"
