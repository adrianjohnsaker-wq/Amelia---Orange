"""Independent grid, gate path, readout and recorded-update audit."""
import hashlib,importlib.util,itertools,json,math,sys
from pathlib import Path
if len(sys.argv)!=6:raise SystemExit('audit.py REGISTRATION RUN DATA SUPPORT OUTPUT')
pb,rb,db=(Path(x).read_bytes() for x in sys.argv[1:4]);p,r,d=(json.loads(x) for x in (pb,rb,db));H=lambda b:hashlib.sha256(b).hexdigest();spec=importlib.util.spec_from_file_location('support',sys.argv[4]);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
assert H(Path(__file__).read_bytes())==p['scripts']['audit.py'] and H(Path(sys.argv[4]).read_bytes())==p['support']['audit-support.py'];assert d['schema']=='amelia.fullgraph-dataset/v1' and d['status']=='COMPLETE' and d['registrationSha256']==H(pb) and d['runSha256']==H(rb) and d['checkpointSha256']==p['checkpointSha256'] and d['lineage']==p['lineages'][d['index']]
BASE=[(0,9),(1,8),(2,7),(3,6),(4,5),(1,2),(2,4),(4,7),(7,8),(8,9),(9,1),(0,0),(1,1),(1,7),(2,3),(2,5),(3,3),(4,1),(5,1),(5,4),(5,6),(6,3),(7,1),(7,2),(7,5),(8,1),(8,7),(9,0),(9,9)];MATCH=[x for x in BASE if x[0] not in (2,7)]+[(2,2),(2,7),(7,2)]
def env(lid,n,flip):
 seed=m.sha(f"{r['seed']}:{lid}:{r['phase']}:{n}");mode=3 if m.rand(f'{seed}:mode',2)^flip else 1;other=3 if mode==1 else 1
 def case(phase,t,level):
  g=[m.grid(f'{seed}:{phase}:{t}:{j}',level) for j in (0,1)];return [m.evaluate(a,g)['passed'] for a in (m.LIGHT,m.HEAVY)]
 tr=[{'t':t,'real':case('train',t,mode),'donor':case('train',t,other)} for t in range(p['trainRounds'])];post=[{'t':t,'same':case('post',t,mode),'reversed':case('post',t,other)} for t in range(p['postRounds'])]
 return {'seedHash':m.sha(seed),'mode':mode,'other':other,'shockOffset':m.rand(f'{seed}:shock',3),'trainRows':tr,'postRows':post}
def verify_dec(q,graph,previous):
 assert len(q['path'])==4;chosen=None
 for x in q['path']:
  assert x['from']==previous;opts=sorted(b for a,b in graph if a==previous);assert x['options']==opts;assert x['to'] in opts and x['rank']==opts.index(x['to']);assert x['died']==(x['to']==5) and x['postZone']==(0 if x['died'] else x['to'])
  if len(opts)>=2:chosen={'source':previous,'options':opts,'rank':x['rank'],'action':x['rank']%2}
  previous=x['postZone']
 assert chosen is not None and q['selected']==chosen and q['action']==chosen['action'];return previous
def verify_change(q):
 c=q['change'];s=q['selected'];assert c['source']==s['source'] and c['options']==s['options'] and len(c['before'])==len(c['after'])==len(s['options'])
 for j,(a,b) in enumerate(zip(c['before'],c['after'])):
  assert math.isfinite(a) and math.isfinite(b);v=max(-1,min(1,.75*a+(q['score']-1)*(1 if j%2==q['action'] else -1)));assert abs(v-b)<1e-12
seen=set();transitions=0;eligible=0;proofs=0
for e in d['episodes']:
 key=(e['n'],e['flip']);assert key not in seen;seen.add(key);assert e['env']==env(d['lineage'],*key)
 origins={};hashes={}
 for route in ('warp','native27','matched27'):
  a=e['training'][route];graph=MATCH if route=='matched27' else BASE;assert a['graph']==sorted(f'{x}>{y}' for x,y in graph);hashes[route]=a
  for kind in ('real','donor'):
   prev=3 if route=='warp' else 2;track=a['tracks'][kind];assert len(track)==p['trainRounds']
   for row,q in zip(e['env']['trainRows'],track):prev=verify_dec(q,graph,prev);assert q['score']==row[kind][q['action']];verify_change(q);transitions+=4
   if kind=='real':origins[route]=prev
 assert origins==e['origins'];z=[1,4,8];k=e['env']['shockOffset'];shocks=[j for j in z[k:]+z[:k] if j not in origins.values()];assert shocks==e['shocks'] and shocks;eligible+=len(shocks)
 expected=set(itertools.product(('warp','native27','matched27'),(None,*shocks),('retain','reset','donor'),('same','reversed')));actual=set();proof_groups={}
 for a in e['post']:
  key=(a['route'],a['shockZone'],a['memory'],a['scenario']);assert key not in actual;actual.add(key);route,shock,mem,scenario=key;graph=MATCH if route=='matched27' else BASE
  assert a['preZone']==origins[route] and a['displacement']==('sham' if shock is None else 'displaced');proof=a['boundaryProof'];assert proof['originalNonV']==proof['afterMemoryNonV'] and proof['originalOther']==proof['afterShockOther'];expectedHash=hashes[route][{'retain':'realVHash','reset':'baseVHash','donor':'donorVHash'}[mem]];assert proof['vHash']==expectedHash
  proof_groups.setdefault(route,set()).add((proof['originalNonV'],proof['originalOther']));proofs+=1;prev=origins[route] if shock is None else shock
  assert len(a['steps'])==p['postRounds']
  for row,q in zip(e['env']['postRows'],a['steps']):
   prev=verify_dec(q,graph,prev);assert q['score']==row[scenario][q['action']];transitions+=4
   if row['t']<p['withholdRounds']:
    assert q['change'] is None;g=q['global'];assert len(g['values'])==2 and all(len(v)>0 and all(math.isfinite(x) for x in v) for v in g['values']);means=[sum(v)/len(v) for v in g['values']];assert g['counts']==list(map(len,g['values'])) and all(abs(x-y)<1e-12 for x,y in zip(means,g['means'])) and g['action']==int(means[1]>means[0]);assert q['globalScore']==row[scenario][g['action']]
   else:assert q['global'] is None and q['globalScore'] is None;verify_change(q)
 assert actual==expected and all(len(v)==1 for v in proof_groups.values())
 for kind in ('real','donor'):
  q=[0,0];track=e['directTraining'][kind]['steps'];assert len(track)==p['trainRounds']
  for row,v in zip(e['env']['trainRows'],track):
   action=int(q[1]>q[0]);score=row[kind][action];new=[max(-1,min(1,.75*q[j]+(score-1)*(1 if j==action else -1))) for j in (0,1)];assert v=={'action':action,'score':score,'before':q,'after':new};q=new
  assert q==e['directTraining'][kind]['q']
 for a in e['directPost']:
  q=[0,0] if a['memory']=='reset' else e['directTraining']['donor' if a['memory']=='donor' else 'real']['q'];scenario=a['scenario'];assert len(a['steps'])==p['postRounds']
  for row,v in zip(e['env']['postRows'],a['steps']):
   action=int(q[1]>q[0]);score=row[scenario][action];new=q if row['t']<p['withholdRounds'] else [max(-1,min(1,.75*q[j]+(score-1)*(1 if j==action else -1))) for j in (0,1)];assert v=={'action':action,'score':score,'before':q,'after':new};q=new
assert seen==set(itertools.product(range(p['pairs']),(0,1)))
out={'status':'VERIFIED','lineage':d['lineage'],'episodes':len(seen),'eligibleDisplacements':eligible,'nativeTransitionsChecked':transitions,'boundaryProofs':proofs,'resultSha256':H(db),'scope':'Regenerated grids, strategy scores, gate path validity, recorded V updates and global-readout arithmetic; boundary hash consistency checked; Oracle gate winners reproduced by same-code replay, not independently recalculated.'};Path(sys.argv[5]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
