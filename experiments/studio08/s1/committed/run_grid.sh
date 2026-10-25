#!/bin/bash
# Run every world x scenario x arm from existing checkpoints, $(nproc) at a time.
# Usage: bash run_grid.sh <runtimeDir> <checkpointDir> <traceDir> <summaryDir> <worldId>...
set -euo pipefail
RT=$1 CK=$2 TR=$3 SU=$4; shift 4
R="$(cd "$(dirname "$0")" && pwd)/s1_committed_runner.mjs"
mkdir -p "$TR" "$SU"
one() {
  node --experimental-strip-types --no-warnings "$R" run "$RT" "$CK/$1.json" "$1" "$2" "$3" \
    "$TR/$1_$2_$3.jsonl.gz" "$SU/$1_$2_$3.json" > /dev/null
}
export -f one; export R RT CK TR SU
for w in "$@"; do for s in intact lesion; do
  for a in adaptive round_robin fixed_surface_decline24 fixed_house_flux24 no_cue asm_textual; do echo "$w $s $a"; done
done; done | xargs -P "$(nproc)" -L 1 bash -c 'one "$@"' _
