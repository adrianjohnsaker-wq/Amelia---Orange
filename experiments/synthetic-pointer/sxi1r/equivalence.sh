#!/bin/sh
# SXI-1R: the fast harness must reproduce the ledgered coordinator path exactly (every transition).
# Usage: sh equivalence.sh <stream.json> <alpha> <label> <dir>. Exits non-zero on any difference.
set -e
ST="$1"; A="$2"; LB="$3"; O="$4"; C=$(git rev-parse HEAD); mkdir -p "$O"
for spec in "0 101 0" "1 102 3" "2 103 7"; do set -- $spec
  SXI1R_STREAM="$ST" SXI1R_SEGMENT=$1 SXI1R_SHUFFLE=$3 SXI1R_LABEL="$LB" SXI1R_ALPHA="$A" node --import tsx experiments/synthetic-pointer/sxi0c/run_arm.ts TOUCH $2 300 "$O/TOUCH_$2" "$C" drop repaired >/dev/null
  node --import tsx experiments/synthetic-pointer/sxi1r/fast.ts "$ST" $1 300 $2 $3 "$A" "$LB" "$O/fast_$2.json"
  python3 -I -c "
import json,sys
c=json.load(open('$O/TOUCH_$2.metrics.json'))['rows']; f=json.load(open('$O/fast_$2.json'))['runs'][$3]['path']
ok=[r['to'] for r in c]==f[1:] and c[0]['from']==f[0]; print('seed $2 segment $1 shuffle $3:', 'IDENTICAL' if ok else 'DIFFERENT'); sys.exit(0 if ok else 1)"
done
