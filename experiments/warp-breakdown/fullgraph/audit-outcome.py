"""Independently reaggregate origin summaries and all six registered tests."""
import hashlib,itertools,json,math,statistics,sys
from pathlib import Path
if len(sys.argv)!=3:raise SystemExit('audit-outcome.py OUTCOME OUTPUT')
p=Path(sys.argv[1]);x=json.loads(p.read_text());orig=x['origins'];assert len(orig)==8
for k,v in x['means'].items():assert math.isclose(v,statistics.mean(o['means'][k] for o in orig),abs_tol=1e-14)
def gain(o,decoder,route):return o['means'][f'{route}|displaced|same|retain|{decoder}']-o['means'][f'{route}|displaced|same|reset|{decoder}']
keys=[];values=[]
for decoder in ('gate','global'):
 w=[gain(o,decoder,'warp') for o in orig];n=[gain(o,decoder,'native27') for o in orig];m=[gain(o,decoder,'matched27') for o in orig]
 keys.extend([f'{decoder}:warp_memory',f'{decoder}:vs_native27',f'{decoder}:vs_matched27']);values.extend([w,[a-b for a,b in zip(w,n)],[a-b for a,b in zip(w,m)]])
raw=[]
for key,ds in zip(keys,values):
 rec=x['comparisons'][key];mean=statistics.mean(ds);assert math.isclose(mean,rec['meanDifference'],abs_tol=1e-14) and all(math.isclose(a,b,abs_tol=1e-14) for a,b in zip(ds,rec['originDifferences']))
 q=sum(statistics.mean(s*z for s,z in zip(pattern,ds))>=mean-1e-14 for pattern in itertools.product((-1,1),repeat=8))/256;assert q==rec['oneSidedSignFlipP'];raw.append(q)
rank=sorted(range(len(keys)),key=lambda i:raw[i]);corrected=[0]*len(keys);v=0
for i,j in enumerate(rank):v=max(v,min(1,(len(keys)-i)*raw[j]));corrected[j]=v
for i,key in enumerate(keys):
 r=x['comparisons'][key];assert r['holmP']==corrected[i] and r['passes']==(r['meanDifference']>=r['threshold'] and corrected[i]<=.05)
for dec in ('gate','global'):
 want='REGISTERED_WARP_SPECIFIC_MEMORY_ADVANTAGE' if all(x['comparisons'][f'{dec}:{k}']['passes'] for k in ('warp_memory','vs_native27','vs_matched27')) else 'NO_REGISTERED_WARP_SPECIFIC_MEMORY_ADVANTAGE';assert x['classification'][dec]==want
out={'status':'VERIFIED','outcomeSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'scope':'Independent reaggregation of recorded origin summaries and six sign-flip/Holm tests; no independent recomputation of Oracle dynamics.','classification':x['classification'],'pretraining':x['totals']['pretraining'],'postDisplacement':x['totals']['postDisplacement']};Path(sys.argv[2]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
