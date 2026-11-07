"""Recalculate descriptive means and paired tests from stored origin tallies."""
import hashlib,itertools,json,math,statistics,sys
from pathlib import Path
p=Path(sys.argv[1]);x=json.loads(p.read_text());orig=x['origins'];assert len(orig)==8
for key in x['means']:
 for period,cname,mname in (('fiveStep','fiveStepCounts','means'),('first','firstCounts','firstMeans'),('all','allCounts','allMeans')):
  assert all(math.isclose(o[period][key],o[cname][key][0]/o[cname][key][1],abs_tol=1e-14) for o in orig)
  assert math.isclose(x[mname][key],statistics.mean(o[period][key] for o in orig),abs_tol=1e-14)
raw=[];keys=('matched','warp_yoked')
for key in keys:
 ds=[o['fiveStep']['warp']-o['fiveStep'][key] for o in orig];r=x['primaryComparisons'][key];assert all(math.isclose(a,b,abs_tol=1e-14) for a,b in zip(ds,r['originDifferences']));assert math.isclose(statistics.mean(ds),r['meanDifference'],abs_tol=1e-14)
 z=statistics.mean(ds);v=sum(statistics.mean(t*y for t,y in zip(pattern,ds))>=z-1e-14 for pattern in itertools.product((-1,1),repeat=8))/256;assert v==r['oneSidedSignFlipP'];raw.append(v)
order=sorted(range(2),key=lambda i:raw[i]);adjust=[0,0];last=0
for n,i in enumerate(order):last=max(last,min(1,(2-n)*raw[i]));adjust[i]=last
for i,key in enumerate(keys):
 r=x['primaryComparisons'][key];assert r['holmP']==adjust[i];assert r['passes']==(r['meanDifference']>=r['threshold'] and adjust[i]<=.05)
expected='REGISTERED_FEEDBACK_DRIVEN_WARP_ADVANTAGE_VS_MATCHED_LOOP' if all(v['passes'] for v in x['primaryComparisons'].values()) else 'NO_REGISTERED_FEEDBACK_DRIVEN_WARP_ADVANTAGE';assert x['classification']==expected
summary={'status':'VERIFIED','outcomeSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'scope':'Reaggregated recorded origin-level counts, sign-flip and Holm calculations, and classification; does not independently recreate decisions.','switches':sum(o['switches'] for o in orig),'houseSwapProbes':{route:{v:sum(o['houseSwapProbes'][route][v] for o in orig) for v in ('total','differentValues','gateChanged')} for route in ('warp','matched')}}
Path(sys.argv[2]).write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary))
