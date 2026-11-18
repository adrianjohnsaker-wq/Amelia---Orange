#!/usr/bin/env bash
# CONJ-1 runs: regimes {B, D, DT, DTR2} x seeds [first, last] x subject {on, off}, 6000 steps. Usage: run_conj.sh <out> <first> <last> [jobs]
set -euo pipefail
O=$(realpath -m "$1"); A=$2; Z=$3; J=${4:-4}; mkdir -p "$O"; cd "$(dirname "$0")"
for r in B D DT DTR2; do for s in $(seq "$A" "$Z"); do for m in on off; do echo "$r $s $m"; done; done; done |
  xargs -P "$J" -n 3 sh -c 'node --experimental-strip-types --no-warnings conj.mjs "$0" "$1" 6000 "'"$O"'/$0_$1_$2.json" "$2" > /dev/null'
echo "runs: $(ls "$O"/*.json | wc -l)"
