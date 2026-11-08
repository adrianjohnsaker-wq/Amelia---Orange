"""Independent check of synthetic grids, paths, relay math and write accounting."""
import hashlib,importlib.util,itertools,json,math,sys
from pathlib import Path
if len(sys.argv)!=6:raise SystemExit('audit.py REG RUN DATA SUPPORT OUTPUT')
pb,rb,db=(Path(x).read_bytes() for x in sys.argv[1:4]);p,r,d=(json.loads(x) for x in (pb,rb,db));H=lambda x:hashlib.sha256(x).hexdigest();spec=importlib.util.spec_from_file_location('support',sys.argv[4]);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
assert H(Path(__file__).read_bytes())==p['scripts']['audit.py'] and H(Path(sys.argv[4]).read_bytes())==p['support']['audit-support.py'];assert d['schema']=='amelia.bidir-dataset/v1' and d['status']=='COMPLETE' and d['registrationSha256']==H(pb) and d['runSha256']==H(rb) and d['checkpointSha256']==p['checkpointSha256'] and d['lineage']==p['lineages'][d['index']]
BASE=[(0,9),(1,8),(2,7),(3,6),(4,5),(1,2),(2,4),(4,7),(7,8),(8,9),(9,1),(0,0),(1,1),(1,7),(2,3),(2,5),(3,3),(4,1),(5,1),(5,4),(5,6),(6,3),(7,1),(7,2),(7,5),(8,1),(8,7),(9,0),(9,9)];MATCH=[x for x in BASE if x[0] not in (2,7)]+[(2,2),(2,7),(7,2)];ROUTES=('warp','matched27');MODES=('natural','global','read_only','bidirectional','sham_write','reverse_write','entry')
def env(lid,n,flip):
 seed=m.sha(f"{r['seed']}:{lid}:{r['phase']}:{n}");mode=3 if m.rand(f'{seed}:mode',2)^flip else 1;other=3 if mode==1 else 1
 def case(phase,t,level):
  g=[m.grid(f'{seed}:{phase}:{t}:{j}',level) for j in (0,1)];return [m.evaluate(a,g)['passed'] for a in (m.LIGHT,m.HEAVY)]
 tr=[{'t':t,'real':case('train',t,mode),'donor':case('train',t,other)} for t in range(p['trainRounds'])];post=[{'t':t,'same':case('post',t,mode),'reversed':case('post',t,other)} for t in range(p['maxPostRounds'])]
 return {'seedHash':m.sha(seed),'mode':mode,'other':other,'shockOffset':m.rand(f'{seed}:shock',3),'trainRows':tr,'postRows':post}
def sign(x):return 1 if x>0 else -1 if x<0 else 0
def wrap(x):return ((x%(2*math.pi))+2*math.pi)%(2*math.pi)
def dec(q,graph,previous,route=None,mode=None,t=None):
 assert len(q['path'])==4;chosen=None
 for j,x in enumerate(q['path']):
  assert x['from']==previous;original=sorted(b for a,b in graph if a==previous);opts=original[:];virtual=route is not None and mode=='entry' and t==0 and j==0
  if route is not None:
   assert x['virtual']==virtual
   if virtual:
    target=3 if route=='warp' else 2;assert x['to']==target and x['wasNative']==(target in original);opts.sort();opts=sorted(opts+[target])
   else:assert x['wasNative'] is False
  assert x['options']==opts and x['to'] in opts and x['rank']==opts.index(x['to']) and x['died']==(x['to']==5) and x['postZone']==(0 if x['died'] else x['to'])
  if route is not None:
   pair=(3,6) if route=='warp' else (2,7)
   def counts(src):
    v=[0,0]
    for source in src:
     nn=sum(a==source for a,b in graph)
     if nn>=2:v[0]+=(nn+1)//2;v[1]+=nn//2
    return v
   assert x['focusCounts']==counts(pair) and x['globalCounts']==counts(range(10));assert x['focusBit']==sign(x['focusMeans'][1]-x['focusMeans'][0]) and x['globalBit']==sign(x['globalMeans'][1]-x['globalMeans'][0]);assert abs(x['phaseWeight']-(.75+.25*math.cos(x['phaseDifference'])))<1e-12
   phase=mode in ('read_only','bidirectional','sham_write','reverse_write');pulse=x['pulse'];assert (pulse is not None)==phase
   if phase:
    assert pulse['pair']==list(pair) and abs(pulse['delta']-.08*x['focusBit'])<1e-12
    assert abs(pulse['after'][0]-wrap(pulse['before'][0]+pulse['delta']))<1e-12 and abs(pulse['after'][1]-wrap(pulse['before'][1]-pulse['delta']))<1e-12
    assert abs(x['phaseDifference']-(pulse['after'][1]-pulse['after'][0]))<1e-12
   signal=(.75*x['globalBit'] if mode=='global' else x['phaseWeight']*x['focusBit'] if phase else 0);assert abs(x['appliedSignal']-signal)<1e-12
  if not virtual and len(opts)>=2:chosen={'source':previous,'options':opts,'rank':x['rank'],'action':x['rank']%2}
  previous=x['postZone']
 if chosen is None:
  z=q['path'][-1];chosen={'source':z['from'],'options':z['options'],'rank':z['rank'],'action':0}
 assert q['selected']==chosen and q['action']==chosen['action'];return previous
def check_update(change,options,action,score):
 assert change['options']==options and len(change['before'])==len(change['after'])==len(options)
 for j,(a,b) in enumerate(zip(change['before'],change['after'])):
  v=max(-1,min(1,.75*a+(score-1)*(1 if j%2==action else -1)));assert math.isfinite(a) and math.isfinite(b) and abs(v-b)<1e-12
def local(q,change):
 s=q['selected'];assert change['source']==s['source'];check_update(change,s['options'],q['action'],q['score'])
def changes(q,route,mode,graph):
 ch=q['change'];local(q,ch['local']);pair=(3,6) if route=='warp' else (2,7);expected=[]
 if mode in ('bidirectional','sham_write','reverse_write'):
  for source in pair:
   opts=sorted(b for a,b in graph if a==source)
   if len(opts)>=2:expected.append((source,opts))
 assert len(ch['writes'])==len(expected)
 for w,(source,opts) in zip(ch['writes'],expected):
  assert w['source']==source and w['options']==opts and w['skippedLocal']==(source==ch['local']['source'])
  if not w['skippedLocal']:
   score=1 if mode=='sham_write' else q['score'];action=1-q['action'] if mode=='reverse_write' else q['action'];assert w['usedScore']==score and w['usedAction']==action;check_update(w,opts,action,score)
seen=set();transitions=0;remote=0;skipped=0;eligible=0;reversals=0;proofs=0
for e in d['episodes']:
 key=(e['n'],e['flip']);assert key not in seen;seen.add(key);assert e['env']==env(d['lineage'],*key)
 lengths=[p['minSegment']+m.rand(f"{e['env']['seedHash']}:bidir-segment:{k}",p['maxSegment']-p['minSegment']+1) for k in range(p['reversals'])];bound=[];total=0
 for ln in lengths:bound.append(total);total+=ln
 assert lengths==e['lengths'] and bound==e['boundaries'];origins={}
 for route in ROUTES:
  a=e['train'][route];graph=BASE if route=='warp' else MATCH;assert a['graph']==sorted(f'{x}>{y}' for x,y in graph);prev=3 if route=='warp' else 2;assert len(a['track'])==p['trainRounds']
  for row,q in zip(e['env']['trainRows'],a['track']):prev=dec(q,graph,prev);assert q['score']==row['real'][q['action']];local(q,q['change']);transitions+=4
  origins[route]=prev;assert a['origin']==prev
 assert origins==e['origins'];z=[1,4,8];k=e['env']['shockOffset'];shocks=[x for x in z[k:]+z[:k] if x not in origins.values()];assert shocks==e['shocks'] and shocks;eligible+=len(shocks);reversals+=len(shocks)*p['reversals']
 expected=set(itertools.product(ROUTES,shocks,MODES));actual=set();proof_groups={}
 for a in e['post']:
  key=(a['route'],a['shock'],a['mode']);assert key not in actual;actual.add(key);route,shock,mode=key;graph=BASE if route=='warp' else MATCH;proof=a['boundaryProof'];assert a['preZone']==origins[route] and proof['originalNonV']==proof['afterMemoryNonV'] and proof['originalOther']==proof['afterShockOther'] and proof['vHash']==e['train'][route]['realVHash'];proof_groups.setdefault(route,set()).add((proof['originalNonV'],proof['originalOther']));proofs+=1;prev=shock;assert len(a['steps'])==total
  for t,q in enumerate(a['steps']):
   seg=max(j for j,b in enumerate(bound) if b<=t);scen='reversed' if seg%2==0 else 'same';row=e['env']['postRows'][t];assert q['t']==t and q['segment']==seg and q['lag']==t-bound[seg]+1
   prev=dec(q,graph,prev,route,mode,t);assert q['score']==row[scen][q['action']];changes(q,route,mode,graph);remote+=sum(not w['skippedLocal'] for w in q['change']['writes']);skipped+=sum(w['skippedLocal'] for w in q['change']['writes']);transitions+=4
 assert actual==expected and all(len(v)==1 for v in proof_groups.values())
 q=[0,0]
 for row,v in zip(e['env']['trainRows'],e['trainDirect']):
  act=int(q[1]>q[0]);score=row['real'][act];new=[max(-1,min(1,.75*q[j]+(score-1)*(1 if j==act else -1))) for j in (0,1)];assert v=={'action':act,'score':score,'before':q,'after':new};q=new
 assert q==e['directTrainQ'] and len(e['direct'])==total
 for t,v in enumerate(e['direct']):
  seg=max(j for j,b in enumerate(bound) if b<=t);scen='reversed' if seg%2==0 else 'same';act=int(q[1]>q[0]);score=e['env']['postRows'][t][scen][act];new=[max(-1,min(1,.75*q[j]+(score-1)*(1 if j==act else -1))) for j in (0,1)];assert v=={'t':t,'segment':seg,'lag':t-bound[seg]+1,'action':act,'score':score,'before':q,'after':new};q=new
assert seen==set(itertools.product(range(p['pairs']),(0,1)))
out={'status':'VERIFIED','lineage':d['lineage'],'episodes':len(seen),'eligibleDisplacements':eligible,'switchBranches':reversals,'transitionsChecked':transitions,'remoteWritesChecked':remote,'alreadyLocalSkips':skipped,'boundaryProofs':proofs,'resultSha256':H(db),'scope':'Independent grid, schedule, legal path, relay-signal, local and remote write arithmetic and intervention-boundary checks; deterministic replay, not independent reconstruction, verifies actual Oracle gate winners and phase values.'};Path(sys.argv[5]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
