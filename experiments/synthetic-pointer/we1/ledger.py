#!/usr/bin/env python3
"""WE-1 answer and transfer ledger (REGISTRATION.md).   python3 ledger.py <S0 raw.json> <P1 order dir> <B1 FINAL.json> <out dir>
S0 = the order rule (sxi1r/analysis.py rule, M 12, S 49) on the encoded stream itself. P1 = nr2/order_analysis.py on her
ND-1b flow passages (wt4/order.ts, arm P12 = her runtime). B1 = sxi1r/run_world.sh's FINAL.json (the body route)."""
import json, subprocess, sys, pathlib
H = pathlib.Path(__file__).resolve().parent.parent; sys.path.insert(0, str(H / 'sxi1r')); import analysis as A
raw, p1dir, b1, out = sys.argv[1:5]
s0 = A.rule(json.load(open(raw)), 49)
p1 = json.loads(subprocess.run([sys.executable, '-I', str(H / 'nr2/order_analysis.py'), p1dir], capture_output=True, text=True, check=True).stdout)
b = json.load(open(b1)); S0 = {e for e, _ in s0['recurs']}
def carried(rec): return sorted(e for e, _ in rec if e in S0)
p1rec = p1['canonical']['recurs']; brec = b.get('recurs', [])
answer = ('VOID: the encoded stream itself carried no detectable order (S0 SILENT)' if s0['answer'] != 'RECEIVED' else
          'THE WORLD\'S ORDER COMES THROUGH HER NUMOGRAM PASSAGE' if p1['answer'] == 'RECEIVED' else
          'THE WORLD\'S ORDER REACHES HER INPUT BUT DOES NOT COME THROUGH HER PASSAGE')
res = {'answer': answer, 'S0_encodedStream': s0, 'P1_passage': p1, 'B1_bodyRoute': b,
       'ledger': {'S0_recurring': len(S0), 'P1_recurring': len(p1rec), 'P1_alsoInS0': carried(p1rec),
                  'B1_answer': b.get('answer'), 'B1_recurring': len(brec), 'B1_alsoInS0': carried(brec)}}
pathlib.Path(out).mkdir(parents=True, exist_ok=True); json.dump(res, open(f'{out}/WE1_RESULT.json', 'w'), indent=1)
print('ANSWER:', answer); print(json.dumps(res['ledger'], indent=1))
