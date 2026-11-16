#!/usr/bin/env bash
# FEP-INV-1 runs: 8 regimes x seeds [first, last], 6000 steps, twins at step 3000. Usage: run.sh <out dir> <first seed> <last seed> [jobs]
set -euo pipefail
O=$(realpath -m "$1"); A=$2; Z=$3; J=${4:-4}; mkdir -p "$O"; cd "$(dirname "$0")"
for r in -1 -0.25 0 0.25 1 4 16 H:0.5:0.05; do for s in $(seq "$A" "$Z"); do echo "$r $s"; done; done |
  xargs -P "$J" -n 2 sh -c 'node --experimental-strip-types --no-warnings fep.mjs "$0" "$1" 6000 "'"$O"'/$0_$1.json" --twins > /dev/null'
echo "runs: $(ls "$O"/*.json | wc -l)"
