"""Independent summary check: recompute origin counts, contrasts and sign-flip adjustment."""
import hashlib,itertools,json,math,statistics,sys
from pathlib import Path
path=Path(sys.argv[1]);d=json.loads(path.read_bytes());checks=[]
for family in ('parity','ordered'):
 r=d['results'][family];orig=r['origins'];assert len(orig)==8
 for k in r['means']:
  mean=statistics.mean(o['windowCounts'][k][0]/o['windowCounts'][k][1] for o in orig)
  first=statistics.mean(o['firstCounts'][k][0]/o['firstCounts'][k][1] for o in orig)
  assert math.isclose(mean,r['means'][k],abs_tol=1e-14) and math.isclose(first,r['firstStepMeans'][k],abs_tol=1e-14)
  assert all(o['windowCounts'][k][1]==160 and o['firstCounts'][k][1]==32 for o in orig)
 ps=[];keys=('matched','warp_yoked','full_history')
 for k in keys:
  diffs=[o['windowCounts']['warp'][0]/160-o['windowCounts'][k][0]/160 for o in orig];q=r['comparisons'][k]
  assert all(math.isclose(a,b,abs_tol=1e-14) for a,b in zip(diffs,q['originDifferences']))
  average=statistics.mean(diffs); assert math.isclose(average,q['meanDifference'],abs_tol=1e-14)
  p=sum(sum(s*x for s,x in zip(sign,diffs))/8>=average-1e-14 for sign in itertools.product((-1,1),repeat=8))/256
  assert p==q['oneSidedSignFlipP'];ps.append(p)
 order=sorted(range(3),key=lambda i:ps[i]);hp=[0]*3;v=0
 for j,i in enumerate(order):v=max(v,min(1,ps[i]*(3-j)));hp[i]=v
 for i,k in enumerate(keys):assert hp[i]==r['comparisons'][k]['holmP']
 checks.append({'family':family,'origins':len(orig),'result':'MATCH','holmP':dict(zip(keys,hp))})
expected='REGISTERED_ENGINEERED_WARP_ACCESS_ADVANTAGE' if all(x['passes'] for x in d['results']['parity']['comparisons'].values()) else 'NO_REGISTERED_WARP_ACCESS_ADVANTAGE'
assert d['classification']==expected
print(json.dumps({'status':'VERIFIED','scope':'Reaggregation of stored origin-level model and baseline tallies; not an independent recomputation of predictions.','outcomeSha256':hashlib.sha256(path.read_bytes()).hexdigest(),'checks':checks}))
