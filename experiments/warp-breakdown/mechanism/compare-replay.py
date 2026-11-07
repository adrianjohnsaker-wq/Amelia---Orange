"""Compare a full independent re-execution, discounting wall-clock-containing non-component hashes."""
import hashlib,json,math,sys
from pathlib import Path
if len(sys.argv)!=5:raise SystemExit('Usage: compare-replay.py PLAN ORIGINAL REPLAY OUTPUT')
pb,ab,bb=(Path(x).read_bytes() for x in sys.argv[1:4]);plan,a,b=(json.loads(x) for x in (pb,ab,bb));H=lambda x:hashlib.sha256(x).hexdigest()
assert a['status']==b['status']=='COMPLETE' and a['lineage']==b['lineage'] and a['planSha256']==b['planSha256']==H(pb)
for d in (a,b):
 for row in d['rows']:
  if 'swaps' in row:
   for k in ('house','pfm'):
    x=row['swaps'][k];assert x['nonComponentHash']==x['nonComponentHashAfter']

def compare(x,y,path='root'):
 assert type(x)==type(y),(path,'type')
 if isinstance(x,dict):
  assert x.keys()==y.keys(),(path,'keys')
  for k in x:
   if k not in ('nonComponentHash','nonComponentHashAfter'):compare(x[k],y[k],path+'.'+k)
 elif isinstance(x,list):
  assert len(x)==len(y),(path,'length')
  for i,(u,v) in enumerate(zip(x,y)):compare(u,v,path+f'[{i}]')
 elif isinstance(x,float):assert math.isclose(x,y,rel_tol=0,abs_tol=1e-12),(path,x,y)
 else:assert x==y,(path,x,y)
compare(a,b)
res={'schema':'amelia.warp-mechanism-replay-audit/v1','status':'VERIFIED','lineage':a['lineage'],'rows':len(a['rows']),
 'planSha256':H(pb),'originalSha256':H(ab),'replaySha256':H(bb),'auditSha256':H(Path(__file__).read_bytes()),
 'ignored':'non-component hashes contain wall-clock fields; equality before/after each swap is checked in each run'}
Path(sys.argv[4]).write_text(json.dumps(res,indent=2)+'\n');print(json.dumps(res))
