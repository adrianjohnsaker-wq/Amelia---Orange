"""Independent input, gate-closure, decoder, action and boundary audit."""
import hashlib,importlib.util,itertools,json,math,sys
from pathlib import Path
if len(sys.argv)!=7:raise SystemExit('audit.py REG RUN DATA SUPPORT MASKS OUTPUT')
pb,rb,db=(Path(x).read_bytes() for x in sys.argv[1:4]);p,r,d=(json.loads(x) for x in (pb,rb,db));mb=Path(sys.argv[5]).read_bytes();masks=json.loads(mb);H=lambda x:hashlib.sha256(x).hexdigest();spec=importlib.util.spec_from_file_location('support',sys.argv[4]);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
assert H(Path(__file__).read_bytes())==p['scripts']['audit.py'] and H(Path(sys.argv[4]).read_bytes())==p['support']['audit-support.py'] and H(mb)==p['scripts']['masks.json'];assert d['schema']=='amelia.density-dataset/v1' and d['status']=='COMPLETE' and d['registrationSha256']==H(pb) and d['runSha256']==H(rb) and d['checkpointSha256']==p['checkpointSha256'] and d['masksSha256']==H(mb) and d['lineage']==p['lineages'][d['index']]
BASE=[(0,9),(1,8),(2,7),(3,6),(4,5),(1,2),(2,4),(4,7),(7,8),(8,9),(9,1),(0,0),(1,1),(1,7),(2,3),(2,5),(3,3),(4,1),(5,1),(5,4),(5,6),(6,3),(7,1),(7,2),(7,5),(8,1),(8,7),(9,0),(9,9)];MATCH=[x for x in BASE if x[0] not in (2,7)]+[(2,2),(2,7),(7,2)];configs=('sham29','A','B','C','D','A_direct','B_direct','C_direct','D_direct','matched27','direct_host');S=.75;F=.25;I=.5
def near(a,b):
 assert len(a)==len(b)
 for x,y in zip(a,b):assert math.isfinite(x) and math.isfinite(y) and abs(x-y)<1e-11,(x,y)
def transition(v,t):return [(S if j<3 else F)*x+(I if j%3==t else 0) for j,x in enumerate(v)]
def decode(v,ctx,l,r):
 a=v[l]-v[r];b=v[3+l]-v[3+r];os=I*(S**4-S**3);ns=I*(S-1);of=I*(F**4-F**3);nf=I*(F-1);det=os*nf-of*ns;z=(a*nf-b*ns)/det if ctx=='old' else (os*b-of*a)/det;return {'estimate':z,'action':0 if z>=0 else 1,'slowDifference':a,'fastDifference':b}
def dec(path,selected,action,graph,prev,openCount=None,closedCount=None):
 assert len(path)==4;choice=None
 for q in path:
  assert q['from']==prev;opts=sorted(b for a,b in graph if a==prev);assert q['options']==opts and q['to'] in opts and q['rank']==opts.index(q['to']) and q['died']==(q['to']==5) and q['postZone']==(0 if q['died'] else q['to'])
  if openCount is not None:assert q['openCount']==openCount and q['closedCount']==closedCount
  if len(opts)>=2:choice={'source':prev,'options':opts,'rank':q['rank'],'action':q['rank']%2}
  prev=q['postZone']
 if choice is None:q=path[-1];choice={'source':q['from'],'options':q['options'],'rank':q['rank'],'action':0}
 assert selected==choice and action==choice['action'];return prev
def actual_input(ev,token,prev,graph,expected,openCount=None,closedCount=None):
 assert ev['token']==token;near(ev['before'],expected);near(ev['written'],transition(expected,token));prev=dec(ev['path'],ev['selected'],ev['action'],graph,prev,openCount,closedCount);return prev,ev['after']
def check_probe(q,v,ctx,l,r,seq,prev,graph,mode,op=None,cl=None):
 assert (q['context'],q['left'],q['right'])==(ctx,l,r);near(q['memory'],v);z=decode(v,ctx,l,r)
 for k in ('estimate','slowDifference','fastDifference'):assert abs(q['readout'][k]-z[k])<1e-10
 assert q['readout']['action']==z['action'] and q['target']==int(seq.index(l)>seq.index(r)) and q['correct']==int(q['action']==q['target'])
 if mode=='direct':assert q['mode']=='direct' and q['action']==z['action'];dec(q['path'],q['selected'],q['gateAction'],graph,prev,op,cl)
 elif mode=='gate':assert q['mode']=='gate' and q['action']==q['gateAction'];dec(q['path'],q['selected'],q['gateAction'],graph,prev,op,cl)
 else:assert q['action']==z['action']
records={(e['n'],e['oldFlip'],e['newFlip']):e for e in d['episodes']};assert set(records)==set(itertools.product(range(p['pairs']),(0,1),(0,1)));transitions=0;probes=0;proofs=0;deathEvents=0;switches=0
for (n,oldFlip,newFlip),e in records.items():
 seed=m.sha(f"{r['seed']}:{d['lineage']}:{r['phase']}:{n}");anchor=m.rand(f'{seed}:anchor',3);pair=[x for x in (0,1,2) if x!=anchor];seqs=[[anchor,*pair],[anchor,*reversed(pair)]];assert e['seedHash']==m.sha(seed) and e['anchor']==anchor and e['pair']==pair and e['old']==seqs[oldFlip] and e['next']==seqs[newFlip] and e['switched']==(oldFlip!=newFlip);switches+=int(e['switched']);donor=records[(n,1-oldFlip,newFlip)];arms={(a['config'],a['zone']):a for a in e['arms']};da={(a['config'],a['zone']):a for a in donor['arms']};assert set(arms)==set(itertools.product(configs,(1,4,8)))
 for (config,zone),a in arms.items():
  rt='matched27' if config=='matched27' else 'direct_host' if config=='direct_host' else 'warp';assert a['route']==rt;maskName=config.removesuffix('_direct');closed={tuple(x) for x in masks.get(maskName,[])};graph=MATCH if config=='matched27' else [e for e in BASE if e not in closed];opened=24 if maskName in ('A','B','C','D','matched27') else 29;closedN=5 if maskName in ('A','B','C','D') else 0;cap={'zones':10,'house':{'V':30,'S':30,'D':30},'gates':24 if config=='matched27' else 29,'openGates':24 if config=='matched27' else 29,'taskSlots':6,'taskNodes':2};assert a['capacities']==cap and a['openGates']==opened
  prev=2 if config=='matched27' else 3;v=[0]*6;assert len(a['first'])==3
  for tok,q in zip(e['old'],a['first']):prev,v=actual_input(q,tok,prev,MATCH if config=='matched27' else BASE,v);transitions+=4
  assert prev==a['origin'] and prev!=zone;near(v,a['shockBefore']);s=a['shockProof'];assert s['originalNonV']==s['afterMemoryNonV'] and s['originalOther']==s['afterShockOther'];noise=[(m.rand(f'{seed}:noise:{zone}:{j}',9)-4)*.06 for j in range(6)];near(a['noise'],noise);v=[x+y for x,y in zip(v,noise)];near(v,a['shockAfter'])
  if config not in ('matched27','direct_host'):
   z=a['maskProof'];assert z['beforeOther']==z['afterOther'] and z['closed']==masks.get(maskName,[]);assert a['first']==arms[('sham29',zone)]['first'];near(a['shockBefore'],arms[('sham29',zone)]['shockBefore']);near(a['shockAfter'],arms[('sham29',zone)]['shockAfter'])
  else:assert a['maskProof'] is None
  prev=zone;assert len(a['second'])==3
  for tok,q in zip(e['next'],a['second']):prev,v=actual_input(q,tok,prev,graph,v,opened,closedN);transitions+=4;deathEvents+=sum(h['died'] for h in q['path'])
  near(v,a['postMemory']);assert {x['kind'] for x in a['results']}=={'retain','reset','donor'}
  for z in a['results']:
   pp=z['proof'];assert pp['otherBefore']==pp['otherAfter'];near(pp['beforeMemory'],v);target={'retain':v,'reset':[0]*6,'donor':da[(config,zone)]['postMemory']}[z['kind']];near(pp['afterMemory'],target);proofs+=1;assert len(z['probes'])==4
   for q,(ctx,opt) in zip(z['probes'],itertools.product(('old','new'),(pair,list(reversed(pair))))):check_probe(q,target,ctx,*opt,e['old'] if ctx=='old' else e['next'],prev,graph,'direct' if config=='direct_host' or config.endswith('_direct') else 'gate',opened,closedN);probes+=1;transitions+=4;deathEvents+=sum(h['died'] for h in q['path'])
 assert len(e['direct'])==3
 for a in e['direct']:
  zone=a['zone'];donorDirect=next(q for q in donor['direct'] if q['zone']==zone);noise=[(m.rand(f'{seed}:noise:{zone}:{j}',9)-4)*.06 for j in range(6)];near(a['noise'],noise);v=[0]*6
  for tok,q in zip(e['old'],a['first']):assert q['token']==tok;near(q['before'],v);v=transition(v,tok);near(q['after'],v)
  near(a['disturbance']['before'],v);v=[x+y for x,y in zip(v,noise)];near(a['disturbance']['after'],v)
  for tok,q in zip(e['next'],a['second']):assert q['token']==tok;near(q['before'],v);v=transition(v,tok);near(q['after'],v)
  near(a['postMemory'],v);assert {x['kind'] for x in a['results']}=={'retain','reset','donor'}
  for z in a['results']:
   target={'retain':v,'reset':[0]*6,'donor':donorDirect['postMemory']}[z['kind']]
   for q,(ctx,opt) in zip(z['probes'],itertools.product(('old','new'),(pair,list(reversed(pair))))):check_probe(q,target,ctx,*opt,e['old'] if ctx=='old' else e['next'],0,BASE,'standalone');probes+=1
 for zone in (1,4,8):
  w=arms[('sham29',zone)];q=arms[('direct_host',zone)];near(w['postMemory'],q['postMemory']);assert [v['path'] for v in w['first']]==[v['path'] for v in q['first']]
  for name in ('A','B','C','D'):
   w=arms[(name,zone)];q=arms[(name+'_direct',zone)];near(w['postMemory'],q['postMemory']);assert w['second']==q['second']
out={'status':'VERIFIED','lineage':d['lineage'],'episodes':len(records),'switchedEpisodes':switches,'transitionsChecked':transitions,'recordedDeathEvents':deathEvents,'probesChecked':probes,'memoryBoundaryProofs':proofs,'resultSha256':H(db),'scope':'Independently regenerated balanced histories and perturbations; checked same pre-mask histories, allowed paths and mask counts, input/decoder arithmetic, labels and memory boundary hashes. Actual gate scoring and native House effects checked by same-code replay.'};Path(sys.argv[6]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
