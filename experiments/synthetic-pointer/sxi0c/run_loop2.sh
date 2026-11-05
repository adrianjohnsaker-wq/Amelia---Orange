#!/bin/sh
# Loop controls II (LOOP_CONTROLS_2.md). Usage: sh run_loop2.sh <outdir>. PLANT runs first: PLANT_REPLAY_TRUNC replays it.
set -e
O="$1"; C=$(git rev-parse HEAD); mkdir -p "$O"; export O C
run() { xargs -P 4 -n 2 sh -c 'node --import tsx experiments/synthetic-pointer/sxi0c/run_arm.ts "$0" "$1" 300 "$O/$0_$1" "$C" drop repaired'; }
for a in PLANT SHAM NULLNOISE POINTER_A3 POINTER_B3 POINTER_A4 POINTER_B4 STRESS_A3 STRESS_NEUTRAL; do for s in 101 102 103 104 105 106 107 108 109 110 111 112; do echo "$a $s"; done; done | run
for s in 101 102 103 104 105 106 107 108 109 110 111 112; do echo "PLANT_REPLAY_TRUNC $s"; done | run
python3 -I experiments/synthetic-pointer/sxi0c/loop2_analysis.py "$O" > "$O/loop2_analysis.json"
python3 -I experiments/synthetic-pointer/sxi0c/gate_check.py "$O" > "$O/gate.json" || true
