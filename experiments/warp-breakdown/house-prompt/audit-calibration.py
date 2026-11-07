"""Compare sealed and freshly re-executed calibration, allowing timestamps in state hashes."""
import json,math,sys
from pathlib import Path
if len(sys.argv)!=3:raise SystemExit('Usage: audit-calibration.py SEALED ACTUAL')
a,b=(json.loads(Path(p).read_text()) for p in sys.argv[1:])
assert a['schema']==b['schema']=='amelia.house-prompt-calibration/v1' and a['snapshotSha256']==b['snapshotSha256']
assert len(a['rows'])==len(b['rows'])==8
for x,y in zip(a['rows'],b['rows']):
 assert x['id']==y['id'] and x['entry']==y['entry'] and x['burn']==y['burn']
 for p in ('promptWarp','promptControl'):assert x[p]==y[p]
 for v in (x,y):
  h=v['house'];assert h['nativeHash']!=h['permutedHash'] and h['controlNativeHash']!=h['controlPermutedHash']
  assert abs(h['nativeGap']-h['permutedGap'])>=.1
  assert len(v['trace'])==32 and sum(z['pivotal'] for z in v['trace'])>=1
  assert all(v['promptWarp']['pairs'][i]!=v['promptControl']['pairs'][i] for i in range(3))
 for p in ('nativeGap','permutedGap'):assert math.isclose(x['house'][p],y['house'][p],abs_tol=1e-12)
 for u,v in zip(x['trace'],y['trace']):
  for p in ('t','cue','from','native','permuted','pivotal'):assert u[p]==v[p]
  for p in ('nativeGap','permutedGap'):assert math.isclose(u[p],v[p],abs_tol=1e-12)
print(json.dumps({'status':'VERIFIED','lineages':8,'counterfactuals':256,'pivotal':sum(z['pivotal'] for row in b['rows'] for z in row['trace'])}))
