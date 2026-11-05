#!/bin/sh
# SXI-1R part 2, world run (REGISTRATION.md). Usage: sh run_world.sh <world.json> <outdir>
# Decision on the fast path; 48 ledgered re-runs must be IDENTICAL or the result is VOID; the standing gate must pass.
set -e
WJ="$1"; O="$2"; P=experiments/synthetic-pointer/sxi1r; C=$(git rev-parse HEAD); mkdir -p "$O/fast" "$O/ledgered"
A=$(python3 -I -c "import json;print(json.load(open('$P/calibration/CALIBRATION.json'))['confirmatoryAlpha'])")
export WJ O A C
seq 0 11 | xargs -P 4 -I{} sh -c 'node --import tsx experiments/synthetic-pointer/sxi1r/fast.ts "$WJ" {} 1000 $((101 + {})) 49 "$A" SXI1R-WORLD "$O/fast/seed$((101 + {})).json"'
python3 -I $P/analysis.py "$O/fast" > "$O/RESULT.json"
for m in 0 1 2 3 4 5 6 7 8 9 10 11; do for j in 0 1 2 3; do echo "$m $j"; done; done | xargs -P 4 -n 2 sh -c '
  s=$((101 + $0)); SXI1R_STREAM="$WJ" SXI1R_SEGMENT=$0 SXI1R_SHUFFLE=$1 SXI1R_LABEL=SXI1R-WORLD SXI1R_ALPHA="$A" \
  node --import tsx experiments/synthetic-pointer/sxi0c/run_arm.ts TOUCH $s 1000 "$O/ledgered/TOUCH_${s}_j$1" "$C" drop repaired >/dev/null'
python3 -I - "$O" <<'PY' > "$O/EQUIVALENCE.json"
import json, sys
O = sys.argv[1]; rows = []
for m in range(12):
    s = 101 + m; f = json.load(open(f'{O}/fast/seed{s}.json'))['runs']
    for j in range(4):
        c = json.load(open(f'{O}/ledgered/TOUCH_{s}_j{j}.metrics.json'))
        ok = [r['to'] for r in c['rows']] == f[j]['path'][1:] and c['rows'][0]['from'] == f[j]['path'][0]
        rows.append({'seed': s, 'shuffle': j, 'head': c['head'], 'identical': ok})
print(json.dumps({'allIdentical': all(r['identical'] for r in rows), 'runs': rows}, indent=1))
PY
sh experiments/synthetic-pointer/sxi0c/gate.sh "$O/gate" > "$O/gate.json" && G=PASS || G=FAIL
python3 -I - "$O" "$G" <<'PY'
import json, sys
O, G = sys.argv[1], sys.argv[2]; r = json.load(open(f'{O}/RESULT.json')); e = json.load(open(f'{O}/EQUIVALENCE.json'))
valid = e['allIdentical'] and G == 'PASS'
final = {'answer': r['answer'] if valid else 'VOID', 'valid': valid, 'gate': G, 'ledgeredEquivalence': e['allIdentical'], 'alpha': r['alpha'],
         'K': r['her']['K'], 'elements': r['her']['elements'], 'recurs': r['her']['recurs'], 'mostSeeds': r['her']['mostSeeds'],
         'bodyDescriptive': {k: r['bodyDescriptive'][k] for k in ('answer', 'K', 'recurs', 'mostSeeds')}}
json.dump(final, open(f'{O}/FINAL.json', 'w'), indent=1); print(json.dumps(final, indent=1))
PY
rm -rf "$O/gate"/*_[0-9]* "$O/ledgered"/*/ 2>/dev/null || true
