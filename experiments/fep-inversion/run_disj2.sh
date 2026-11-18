#!/usr/bin/env bash
# DISJ-2 runs: regimes {B, DT, DTI, DTIL, DTIS, DTID} x seeds [first, last], 6000 steps. Usage: run_disj2.sh <out> <first> <last> [jobs]
set -euo pipefail
O=$(realpath -m "$1"); A=$2; Z=$3; J=${4:-4}; mkdir -p "$O"; cd "$(dirname "$0")"
for r in B DT DTI DTIL DTIS DTID; do for s in $(seq "$A" "$Z"); do echo "$r $s"; done; done |
  xargs -P "$J" -n 2 sh -c 'node --experimental-strip-types --no-warnings disj2.mjs "$0" "$1" 6000 "'"$O"'/$0_$1.json" > /dev/null'
echo "runs: $(ls "$O"/*.json | wc -l)"
