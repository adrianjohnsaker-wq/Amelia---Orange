"""Compare complete deterministic execution, allowing sub-picounit numerical tolerance."""
import hashlib,json,math,sys
from pathlib import Path
if len(sys.argv)!=5:raise SystemExit('Usage: compare-replay.py REGISTRATION ORIGINAL REPLAY OUTPUT')
pb,ab,bb=(Path(x).read_bytes() for x in sys.argv[1:4]);p,a,b=(json.loads(x) for x in (pb,ab,bb));H=lambda x:hashlib.sha256(x).hexdigest()
assert a['status']==b['status']=='COMPLETE' and a['schema']==b['schema'] and a['lineage']==b['lineage']
assert a['registrationSha256']==b['registrationSha256']==H(pb)
def comp(x,y,path='root'):
 assert type(x)==type(y),(path,'type')
 if isinstance(x,dict):
  assert x.keys()==y.keys(),(path,'keys')
  for k in x:comp(x[k],y[k],path+'.'+k)
 elif isinstance(x,list):
  assert len(x)==len(y),(path,'length')
  for i,(u,v) in enumerate(zip(x,y)):comp(u,v,f'{path}[{i}]')
 elif isinstance(x,float):assert math.isclose(x,y,rel_tol=0,abs_tol=1e-12),(path,x,y)
 else:assert x==y,(path,x,y)
comp(a,b)
out={'schema':'amelia.warp-dynamic-replay/v1','status':'VERIFIED','lineage':a['lineage'],'registrationSha256':H(pb),'originalSha256':H(ab),'replaySha256':H(bb),'replayScriptSha256':H(Path(__file__).read_bytes()),'sourceSchema':a['schema']}
Path(sys.argv[4]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
