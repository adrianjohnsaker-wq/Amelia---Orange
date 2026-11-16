#!/usr/bin/env bash
# FEP-INV-2 runs: arms S, U, M x regimes {-1, 0, 1, 4, H:0.5:0.05} x seeds [first, last], 6000 steps. Usage: run2.sh <out> <first> <last> [jobs]
set -euo pipefail
O=$(realpath -m "$1"); A=$2; Z=$3; J=${4:-4}; mkdir -p "$O"; cd "$(dirname "$0")"
for arm in S U M; do for r in -1 0 1 4 H:0.5:0.05; do for s in $(seq "$A" "$Z"); do echo "$arm $r $s"; done; done; done |
  xargs -P "$J" -n 3 sh -c 'node --experimental-strip-types --no-warnings fep2.mjs "$0" "$1" "$2" 6000 "'"$O"'/$0_$1_$2.json" > /dev/null'
echo "runs: $(ls "$O"/*.json | wc -l)"
