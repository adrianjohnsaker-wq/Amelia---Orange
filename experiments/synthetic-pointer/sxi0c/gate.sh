#!/bin/sh
# Standing gate for SXI-1 on the reference-field route (INTERFACE.md). Usage: sh experiments/synthetic-pointer/sxi0c/gate.sh <new dir>
set -e
O="$1"; C=$(git rev-parse HEAD); mkdir -p "$O"; export O C
for a in SHAM PLANT NULLNOISE; do for s in 101 102 103 104 105 106 107 108 109 110 111 112; do echo "$a $s"; done; done |
  xargs -P 4 -n 2 sh -c 'node --import tsx experiments/synthetic-pointer/sxi0c/run_arm.ts "$0" "$1" 300 "$O/$0_$1" "$C" drop repaired'
python3 -I experiments/synthetic-pointer/sxi0c/gate_check.py "$O"
