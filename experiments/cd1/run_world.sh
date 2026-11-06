#!/bin/sh
# CD-1 world run (REGISTRATION.md). Usage: sh run_world.sh <world.json> <outdir>
set -e
WJ="$1"; O="$2"; mkdir -p "$O/order"; export WJ O
seq 0 11 | xargs -P 4 -I{} node --import tsx experiments/synthetic-pointer/nr2/order.ts "$WJ" {} 1000 49 CD1-WORLD "$O/order/seg{}.json"
python3 -I experiments/cd1/cd1.py "$O/order" > "$O/RESULT.json"; rm -rf "$O/order"; cat "$O/RESULT.json"
