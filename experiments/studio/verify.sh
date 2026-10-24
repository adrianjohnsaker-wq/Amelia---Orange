#!/bin/sh
# Reproduction checks from a fresh unpack. Usage: sh verify.sh <new studio folder>
# 1. the hooked runtime (m/) and the unmodified runtime (m0/) give identical trajectories;
# 2. the PF-2 receiver reproduces the four registered golden trace digests;
# 3. the scar assay reproduces outputs/scar/scar_assay.json byte for byte;
# 4. the bootstrap loops reproduce outputs/loop and outputs/loopB pass by pass (codes, traces, deaths).
set -e
A=$(cd "$(dirname "$0")" && pwd)
S="$1"
sh "$A"/setup.sh "$S"
S=$(cd "$S" && pwd)
N="node --experimental-strip-types --no-warnings"
echo "[1] runtime equivalence"; $N "$S"/eqcheck.mjs "$S"/m0 "$S"/m
echo "[2] PF-2 golden traces"
for mode in learner unchanged; do
  $N "$S"/receiver.mjs "$S"/m $mode 2 20000 GOLD "$S"/gold_$mode.json > /dev/null
  python3 -c "
import json,sys
a=json.load(open(sys.argv[1]))['lineages'];b=json.load(open(sys.argv[2]))['lineages']
ok=[x['traceSha256']==y['traceSha256'] for x,y in zip(a,b)]
print('  $mode', 'match' if all(ok) and len(ok)==2 else 'MISMATCH', [x['traceSha256'][:8] for x in a])
sys.exit(0 if all(ok) else 1)" "$S"/gold_$mode.json "$A"/outputs/gold_$mode.json
done
echo "[3] scar assay"
python3 "$S"/scar_assay.py "$S" > /dev/null
cmp "$S"/scar/scar_assay.json "$A"/outputs/scar/scar_assay.json && echo "  scar_assay.json byte-identical"
echo "[4] the bootstrap loop (Studio 04): 30 passes from zero, 20 passes from the archived random seed code"
mkdir -p "$S"/re_loop "$S"/re_loopB
python3 "$S"/bootstrap_loop.py "$S" "$S"/re_loop 30 20160 > /dev/null
python3 -c "import json,sys; json.dump(json.load(open(sys.argv[1]))[:1], open(sys.argv[2],'w'))" "$A"/outputs/loopB/loop_log.json "$S"/re_loopB/loop_log.json
python3 "$S"/bootstrap_loop.py "$S" "$S"/re_loopB 20 20160 > /dev/null
for d in loop loopB; do python3 -c "
import json,sys
a=json.load(open(sys.argv[1]));b=json.load(open(sys.argv[2]))
same=len(a)==len(b) and all(x[k]==y[k] for x,y in zip(a,b) for k in ('pass','Vstart','Vend','traces','deaths'))
print('  $d', len(a), 'passes', 'identical' if same else 'DIFFER'); sys.exit(0 if same else 1)" "$S"/re_$d/loop_log.json "$A"/outputs/$d/loop_log.json; done
echo "all checks passed"
