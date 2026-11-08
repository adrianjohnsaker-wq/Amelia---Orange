"""Independent validation of balanced sequence identities, input writes and action records."""
import hashlib,importlib.util,json,math,sys,itertools
from pathlib import Path
if len(sys.argv)!=6:raise SystemExit('audit.py REG RUN DATA SUPPORT OUTPUT')
pb,rb,db=(Path(x).read_bytes() for x in sys.argv[1:4]);p,r,d=(json.loads(x) for x in (pb,rb,db));H=lambda x:hashlib.sha256(x).hexdigest();spec=importlib.util.spec_from_file_location('support',sys.argv[4]);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
assert H(Path(__file__).read_bytes())==p['scripts']['audit.py'] and H(Path(sys.argv[4]).read_bytes())==p['support']['audit-support.py'];assert d['schema']=='amelia.order-dataset/v1' and d['status']=='COMPLETE' and d['registrationSha256']==H(pb) and d['runSha256']==H(rb) and d['checkpointSha256']==p['checkpointSha256'] and d['lineage']==p['lineages'][d['index']]
BASE=[(0,9),(1,8),(2,7),(3,6),(4,5),(1,2),(2,4),(4,7),(7,8),(8,9),(9,1),(0,0),(1,1),(1,7),(2,3),(2,5),(3,3),(4,1),(5,1),(5,4),(5,6),(6,3),(7,1),(7,2),(7,5),(8,1),(8,7),(9,0),(9,9)];MATCH=[x for x in BASE if x[0] not in (2,7)]+[(2,2),(2,7),(7,2)];routes=('warp','matched27','direct_host');S=.75;F=.25;I=.5
def near(a,b):
 assert len(a)==len(b)
 for x,y in zip(a,b):assert math.isfinite(x) and math.isfinite(y) and abs(x-y)<1e-11,(x,y)
def transition(v,t):return [(S if j<3 else F)*x+(I if j%3==t else 0) for j,x in enumerate(v)]
def decode(v,ctx,l,r):
 a=v[l]-v[r];b=v[3+l]-v[3+r];os=I*(S**4-S**3);ns=I*(S-1);of=I*(F**4-F**3);nf=I*(F-1);det=os*nf-of*ns;z=(a*nf-b*ns)/det if ctx=='old' else (os*b-of*a)/det;return {'estimate':z,'action':0 if z>=0 else 1,'slowDifference':a,'fastDifference':b}
def dec(path,selected,action,graph,prev):
 assert len(path)==4;choice=None
 for q in path:
  assert q['from']==prev;opts=sorted(b for a,b in graph if a==prev);assert q['options']==opts and q['to'] in opts and q['rank']==opts.index(q['to']) and q['died']==(q['to']==5) and q['postZone']==(0 if q['died'] else q['to'])
  if len(opts)>=2:choice={'source':prev,'options':opts,'rank':q['rank'],'action':q['rank']%2}
  prev=q['postZone']
 if choice is None:
  q=path[-1];choice={'source':q['from'],'options':q['options'],'rank':q['rank'],'action':0}
 assert selected==choice and action==choice['action'];return prev
def actual_input(ev,token,prev,graph,expected):
 assert ev['token']==token;near(ev['before'],expected);near(ev['written'],transition(expected,token));prev=dec(ev['path'],ev['selected'],ev['action'],graph,prev);return prev,ev['after']
def true_action(seq,l,r):return int(seq.index(l)>seq.index(r))
def check_probe(q,v,ctx,l,r,seq,prev,graph,mode):
 assert (q['context'],q['left'],q['right'])==(ctx,l,r);near(q['memory'],v);z=decode(v,ctx,l,r)
 for key in ('estimate','slowDifference','fastDifference'):assert abs(q['readout'][key]-z[key])<1e-10
 assert q['readout']['action']==z['action'] and q['target']==true_action(seq,l,r) and q['correct']==int(q['action']==q['target'])
 if mode=='direct':
  assert q['mode']=='direct' and q['action']==z['action'];dec(q['path'],q['selected'],q['gateAction'],graph,prev)
 elif mode=='gate':
  assert q['mode']=='gate' and q['action']==q['gateAction'];dec(q['path'],q['selected'],q['gateAction'],graph,prev)
 else:assert q['action']==z['action']
records={(e['n'],e['oldFlip'],e['newFlip']):e for e in d['episodes']};assert set(records)==set(itertools.product(range(p['pairs']),(0,1),(0,1)));transitions=0;probes=0;proofs=0;switches=0
for (n,oldFlip,newFlip),e in records.items():
 seed=m.sha(f"{r['seed']}:{d['lineage']}:{r['phase']}:{n}");anchor=m.rand(f'{seed}:anchor',3);pair=[x for x in (0,1,2) if x!=anchor];seqs=[[anchor,*pair],[anchor,*reversed(pair)]];assert e['seedHash']==m.sha(seed) and e['anchor']==anchor and e['pair']==pair and e['old']==seqs[oldFlip] and e['next']==seqs[newFlip] and e['switched']==(oldFlip!=newFlip);switches+=int(e['switched']);donor=records[(n,1-oldFlip,newFlip)];arms={(a['route'],a['zone']):a for a in e['arms']};darms={(a['route'],a['zone']):a for a in donor['arms']};assert set(arms)==set(itertools.product(routes,(1,4,8)))
 for (route,zone),a in arms.items():
  graph=MATCH if route=='matched27' else BASE;expectedCap={'zones':10,'house':{'V':30,'S':30,'D':30},'gates':24 if route=='matched27' else 29,'openGates':24 if route=='matched27' else 29,'taskSlots':6,'taskNodes':2};assert a['capacities']==expectedCap
  prev=2 if route=='matched27' else 3;v=[0,0,0,0,0,0];assert len(a['first'])==3
  for t,ev in zip(e['old'],a['first']):prev,v=actual_input(ev,t,prev,graph,v);transitions+=4
  assert prev==a['origin'] and prev!=zone;near(v,a['shockBefore']);assert a['shockProof']['originalNonV']==a['shockProof']['afterMemoryNonV'] and a['shockProof']['originalOther']==a['shockProof']['afterShockOther'];noise=[(m.rand(f'{seed}:noise:{zone}:{j}',9)-4)*.06 for j in range(6)];near(a['noise'],noise);v=[x+y for x,y in zip(v,noise)];near(v,a['shockAfter']);prev=zone;assert len(a['second'])==3
  for t,ev in zip(e['next'],a['second']):prev,v=actual_input(ev,t,prev,graph,v);transitions+=4
  near(v,a['postMemory']);assert {z['kind'] for z in a['results']}=={'retain','reset','donor'}
  for z in a['results']:
   proof=z['proof'];assert proof['otherBefore']==proof['otherAfter'];near(proof['beforeMemory'],v);target={'retain':v,'reset':[0]*6,'donor':darms[(route,zone)]['postMemory']}[z['kind']];near(proof['afterMemory'],target);proofs+=1;assert len(z['probes'])==4
   for q,(ctx,opt) in zip(z['probes'],itertools.product(('old','new'),(pair,list(reversed(pair))))):
    check_probe(q,target,ctx,*opt,e['old'] if ctx=='old' else e['next'],prev,graph,'direct' if route=='direct_host' else 'gate');probes+=1;transitions+=4
 assert len(e['direct'])==3
 for a in e['direct']:
  zone=a['zone'];da=next(q for q in donor['direct'] if q['zone']==zone);noise=[(m.rand(f'{seed}:noise:{zone}:{j}',9)-4)*.06 for j in range(6)];near(a['noise'],noise);v=[0]*6
  for tok,q in zip(e['old'],a['first']):assert q['token']==tok;near(q['before'],v);v=transition(v,tok);near(q['after'],v)
  near(a['disturbance']['before'],v);v=[x+y for x,y in zip(v,noise)];near(a['disturbance']['after'],v)
  for tok,q in zip(e['next'],a['second']):assert q['token']==tok;near(q['before'],v);v=transition(v,tok);near(q['after'],v)
  near(a['postMemory'],v)
  for z in a['results']:
   target={'retain':v,'reset':[0]*6,'donor':da['postMemory']}[z['kind']]
   for q,(ctx,opt) in zip(z['probes'],itertools.product(('old','new'),(pair,list(reversed(pair))))):check_probe(q,target,ctx,*opt,e['old'] if ctx=='old' else e['next'],0,BASE,'standalone');probes+=1
 # Two independent host copies have identical event histories before their probe decisions.
 for zone in (1,4,8):
  w=arms[('warp',zone)];q=arms[('direct_host',zone)];near(w['postMemory'],q['postMemory']);assert [v['path'] for v in w['first']+w['second']]==[v['path'] for v in q['first']+q['second']]
out={'status':'VERIFIED','lineage':d['lineage'],'episodes':len(records),'switchedEpisodes':switches,'transitionsChecked':transitions,'probesChecked':probes,'boundaryProofs':proofs,'resultSha256':H(db),'scope':'Independently regenerated balanced histories, matched perturbations, labels, input-recurrence arithmetic, two-scale decoder, legal Oracle paths and intervention-boundary checks. Same-code replay, rather than independent gate-score reconstruction, validates Oracle trajectories.'};Path(sys.argv[5]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
