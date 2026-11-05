#!/bin/sh
# Loop controls (LOOP_CONTROLS.md). Usage: sh run_loop.sh <outdir>. PLANT runs first: PLANT_REPLAY replays them.
set -e
O="$1"; C=$(git rev-parse HEAD); mkdir -p "$O"; export O C
run() { xargs -P 4 -n 2 sh -c 'node --import tsx experiments/synthetic-pointer/sxi0c/run_arm.ts "$0" "$1" 300 "$O/$0_$1" "$C" drop repaired'; }
for a in PLANT SHAM SHAM_OPEN PLANT_OPEN NULLNOISE POINTER_A2 POINTER_B2; do for s in 101 102 103 104 105 106 107 108 109 110 111 112; do echo "$a $s"; done; done | run
for s in 101 102 103 104 105 106 107 108 109 110 111 112; do echo "PLANT_REPLAY $s"; done | run
python3 -I experiments/synthetic-pointer/sxi0c/loop_analysis.py "$O" experiments/synthetic-pointer/sxi0c/results_repaired/metrics > "$O/loop_analysis.json"
python3 -I experiments/synthetic-pointer/sxi0c/gate_check.py "$O" > "$O/gate.json" || true
