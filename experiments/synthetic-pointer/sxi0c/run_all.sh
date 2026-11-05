#!/bin/sh
# SXI-0 controls: 6 arms x 12 seeds x 300 steps, 4 in parallel (see REGISTRATION.md). Usage: sh run_all.sh <outdir>
set -e
O="$1"; C=$(git rev-parse HEAD); mkdir -p "$O"
for a in SHAM WITHHELD PLANT NULLNOISE POINTER_A POINTER_B; do for s in 101 102 103 104 105 106 107 108 109 110 111 112; do
  k=drop; [ "$a" = SHAM ] && [ "$s" = 101 ] && k=keep; echo "$a $s $k"; done; done |
  xargs -P 4 -n 3 sh -c 'node --import tsx experiments/synthetic-pointer/sxi0c/run_arm.ts "$0" "$1" 300 "'"$O"'/$0_$1" '"$C"' "$2"'
python3 -I experiments/synthetic-pointer/sxi0c/analysis.py "$O" > "$O/analysis.json"
