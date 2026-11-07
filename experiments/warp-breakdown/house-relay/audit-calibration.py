"""Check independently recalculated House relay calibration, ignoring timestamps."""
import json,math,sys
from pathlib import Path
assert len(sys.argv)==3
a,b=[json.loads(Path(p).read_text()) for p in sys.argv[1:]]
assert a['schema']==b['schema']=='amelia.oracle-house-relay-calibration/v1' and a['snapshotSha256']==b['snapshotSha256']
assert len(a['rows'])==len(b['rows'])==8
checked=0
for x,y in zip(a['rows'],b['rows']):
 assert x['id']==y['id'] and x['promptTape']==y['promptTape'] and len(x['traces'])==len(y['traces'])==8
 for h in (x['house'],y['house']):
  assert h['nativeHash']!=h['permutedHash'] and h['controlNativeHash']!=h['controlPermutedHash'] and abs(h['nativeGap']-h['permutedGap'])>=0.1
 for t,u in zip(x['traces'],y['traces']):
  assert all(t[k]==u[k] for k in ('route','house','target')) and len(t['rounds'])==len(u['rounds'])==3
  for v,w in zip(t['rounds'],u['rounds']):
   assert all(v[k]==w[k] for k in ('round','path','live','misaligned','masked'))
   assert len(v['live'])==len(v['misaligned'])==len(v['masked'])==7 and v['live']!=v['misaligned']
   assert abs(v['info']['live']-v['info']['misaligned'])>=0.1
   for k in ('live','misaligned'):assert math.isclose(v['info'][k],w['info'][k],rel_tol=0,abs_tol=1e-12)
   checked+=1
print(json.dumps({'status':'VERIFIED','lineages':8,'decisionReadouts':checked}))
