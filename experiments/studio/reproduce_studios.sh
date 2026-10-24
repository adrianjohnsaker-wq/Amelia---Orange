#!/bin/bash
# Re-run Studios 01-03 and compare every output file byte for byte with outputs/.
# Usage: bash reproduce_studios.sh <studio folder made by setup.sh>   (runs up to $(nproc) jobs at once)
set -e
A=$(cd "$(dirname "$0")" && pwd); S=$(cd "$1" && pwd); M="$S"/m; R="$S"/repro
N="node --experimental-strip-types --no-warnings"
mkdir -p "$R"/house "$R"/two
jobs=()
for a in L0 LS LSY Q; do jobs+=("$N $S/stone_tape.mjs $M $a 32 20 10000 $R/$a.json $A/outputs/LS.json|$a.json"); done
for a in 0 0.002 0.01; do for B in 0 1 4; do jobs+=("$N $S/house.mjs $M $a $B 32 10 10000 $R/house/h_${a}_$B.json|house/h_${a}_$B.json"); done; done
for a in 0 0.002; do for e in 5 5D; do jobs+=("$N $S/house.mjs $M $a 1 32 12 10000 $R/house/e_${a}_1_$e.json $e|house/e_${a}_1_$e.json"); done; done
while read name a B w; do jobs+=("$N $S/two_subjects.mjs $M $a $B $w 24 24 5000 $R/two/$name.json|two/$name.json"); done <<'T'
none 0 0 0
learn_only 0 0 0.5
house_only 0 1 0
malign_learn 0 1 0.5
malign_weak 0 1 0.25
contested_only 0.002 1 0
contested_learn 0.002 1 0.5
T
P=$(nproc)
for j in "${jobs[@]}"; do
  cmd=${j%%|*}
  while [ "$(jobs -rp | wc -l)" -ge "$P" ]; do wait -n; done
  $cmd > /dev/null &
done
wait
fail=0
for j in "${jobs[@]}"; do f=${j##*|}; if cmp -s "$R/$f" "$A/outputs/$f"; then echo "  identical  $f"; else echo "  DIFFERS    $f"; fail=1; fi; done
[ $fail = 0 ] && echo "Studios 01-03: all ${#jobs[@]} outputs byte-identical" || { echo "some outputs differ"; exit 1; }
