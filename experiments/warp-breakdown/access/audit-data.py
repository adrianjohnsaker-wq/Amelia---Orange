"""Independent task regeneration and exact per-block gate-quota audit."""
import hashlib,itertools,json,math,sys
from pathlib import Path
if len(sys.argv)!=4:raise SystemExit('Usage: audit-data.py REGISTRATION RUN DATA')
pb,rb,db=(Path(x).read_bytes() for x in sys.argv[1:]);p,r,d=(json.loads(x) for x in (pb,rb,db));H=lambda x:hashlib.sha256(x).hexdigest();sha=lambda x:hashlib.sha256(x.encode()).hexdigest()
def ri(s,n):return int(sha(s)[:8],16)%n
def task(master,lid,family,part,index,flip):
 seed=sha(f'{master}:{lid}:{family}:{part}:{index}');s1=3+ri(seed+':switch1',3);s2=10+ri(seed+':switch2',2);parity=ri(seed+':initial',2)^flip;x=y=0;age=-1;out=[]
 for t in range(16):
  event=ri(f'{seed}:event:{t}',2)
  if family=='ordered':
   if event==0:x^=1
   else:x,y=y,x
  switched=t in (s1,s2)
  if switched:parity^=1;age=0
  elif age>=0:age+=1
  target=parity^(x if family=='ordered' else 0);noise=int(ri(f'{seed}:noise:{t}',4)==0);feedback=target^noise
  out.append({'t':t,'event':event,'switched':switched,'age':age,'target':target,'feedback':feedback,'parity':parity,'x':x,'y':y,'noise':noise})
 return seed,s1,s2,out
def path(bit,pr,di):
 out=[];at=7 if bit==0 else 14
 for i in range(1,15):
  dest=pr if i==at else di;out.append([pr,dest])
  if dest==di:out.append([di,pr])
 assert len(out)==27;return out
assert d['schema']=='amelia.warp-access-dataset/v1' and d['status']=='COMPLETE' and d['lineage']==p['lineages'][d['index']]
assert d['registrationSha256']==H(pb) and d['runSha256']==H(rb) and d['checkpointSha256']==p['checkpointSha256'] and d['scriptSha256']==p['datasetSha256']
assert r['registrationSha256']==H(pb) and r['pairsPerPartition']==p['pairsPerPartition'];seen=set();blocks=0;maxOffset=0
for e in d['episodes']:
 k=(e['family'],e['partition'],e['index'],e['flip']);assert k not in seen;seen.add(k)
 seed,s1,s2,obs=task(r['experimentSeed'],d['lineage'],*k);yseed,_,_,yobs=task(r['experimentSeed'],d['lineage'],k[0],'yoked:'+k[1],k[2],k[3])
 assert e['seedHash']==sha(seed) and e['switches']==[s1,s2] and e['observations']==obs and e['yoked']=={'seedHash':sha(yseed),'observations':yobs}
 arms={(a['route'],a['kind']):a for a in e['arms']};assert len(arms)==4 and set(arms)==set(itertools.product(('warp','matched'),('real','yoked')))
 for (route,kind),a in arms.items():
  pr,di=(3,6) if route=='warp' else (2,7);assert len(a['rounds'])==p['rounds']
  for t,q in enumerate(a['rounds']):
   feed=obs[t]['feedback'] if kind=='real' else yobs[t]['feedback'];assert q['eventPath']==path(obs[t]['event'],pr,di) and q['feedbackPath']==path(feed,pr,di)
   f=q['features'];assert len(f['house'])==9 and len(f['pfm'])==3 and len(f['phase'])==10 and all(math.isfinite(z) for z in f['house']+f['pfm']+f['phase'])
   assert math.isfinite(q['maxAbsOffset']) and 0<=q['maxAbsOffset']<=2;maxOffset=max(maxOffset,q['maxAbsOffset']);blocks+=2
assert seen==set(itertools.product(('parity','ordered'),('train','test'),range(p['pairsPerPartition']),(0,1)))
print(json.dumps({'status':'VERIFIED','lineage':d['lineage'],'episodes':len(seen),'blocks':blocks,'maxAbsOffset':maxOffset,'dwellPerBlock':1,'stepsPerBlock':27,'resultSha256':H(db)}))
