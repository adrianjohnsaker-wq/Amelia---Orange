"""Independently audit grids, gate options, phase pulses, controls and feedback updates."""
import hashlib,importlib.util,itertools,json,math,sys
from pathlib import Path
if len(sys.argv)!=6:raise SystemExit('audit.py REGISTRATION RUN DATA SUPPORT OUTPUT')
pb,rb,db=(Path(x).read_bytes() for x in sys.argv[1:4]);p,r,d=(json.loads(x) for x in (pb,rb,db));H=lambda b:hashlib.sha256(b).hexdigest();spec=importlib.util.spec_from_file_location('support',sys.argv[4]);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
assert H(Path(__file__).read_bytes())==p['scripts']['audit.py'] and H(Path(sys.argv[4]).read_bytes())==p['support']['audit-support.py'];assert d['schema']=='amelia.syzygy-dataset/v1' and d['status']=='COMPLETE' and d['registrationSha256']==H(pb) and d['runSha256']==H(rb) and d['checkpointSha256']==p['checkpointSha256'] and d['lineage']==p['lineages'][d['index']]
BASE=[(0,9),(1,8),(2,7),(3,6),(4,5),(1,2),(2,4),(4,7),(7,8),(8,9),(9,1),(0,0),(1,1),(1,7),(2,3),(2,5),(3,3),(4,1),(5,1),(5,4),(5,6),(6,3),(7,1),(7,2),(7,5),(8,1),(8,7),(9,0),(9,9)];MATCH=[x for x in BASE if x[0] not in (2,7)]+[(2,2),(2,7),(7,2)];TYPES=('natural','global','focus_plain','focus_phase','phase_yoked','entry','sham_entry');STRONG=('natural','global','focus_phase','entry')
def env(lid,n,flip):
 seed=m.sha(f"{r['seed']}:{lid}:{r['phase']}:{n}");mode=3 if m.rand(f'{seed}:mode',2)^flip else 1;other=3 if mode==1 else 1
 def case(phase,t,level):
  g=[m.grid(f'{seed}:{phase}:{t}:{j}',level) for j in (0,1)];return [m.evaluate(a,g)['passed'] for a in (m.LIGHT,m.HEAVY)]
 tr=[{'t':t,'real':case('train',t,mode),'donor':case('train',t,other)} for t in range(p['trainRounds'])];post=[{'t':t,'same':case('post',t,mode),'reversed':case('post',t,other)} for t in range(p['postRounds'])]
 return {'seedHash':m.sha(seed),'mode':mode,'other':other,'shockOffset':m.rand(f'{seed}:shock',3),'trainRows':tr,'postRows':post}
def verify_change(q):
 c=q['change'];s=q['selected'];assert c['source']==s['source'] and c['options']==s['options'] and len(c['before'])==len(c['after'])==len(s['options'])
 for j,(a,b) in enumerate(zip(c['before'],c['after'])):
  v=max(-1,min(1,.75*a+(q['score']-1)*(1 if j%2==q['action'] else -1)));assert math.isfinite(a) and math.isfinite(b) and abs(v-b)<1e-12
def sign(v):return 1 if v>0 else -1 if v<0 else 0
def wrap(x):return ((x%(2*math.pi))+2*math.pi)%(2*math.pi)
def verify_dec(q,graph,previous,route=None,typ=None,shock=None,t=None):
 assert len(q['path'])==4;chosen=None
 for j,x in enumerate(q['path']):
  assert x['from']==previous;original=sorted(b for a,b in graph if a==previous);opts=original[:]
  if route is not None:
   virtual=t==0 and j==0 and typ in ('entry','sham_entry');assert x['virtual']==virtual
   if virtual:
    target=(3 if route=='warp' else 2) if typ=='entry' else {1:4,4:8,8:4}[shock];assert x['to']==target and x['wasNative']==(target in original);opts=sorted(opts+[target])
   else:assert x['wasNative'] is False
  assert x['options']==opts and x['to'] in opts and x['rank']==opts.index(x['to']);assert x['died']==(x['to']==5) and x['postZone']==(0 if x['died'] else x['to'])
  if route is not None:
   pair=(3,6) if route=='warp' else (2,7)
   def expected_counts(sources):
    v=[0,0]
    for source in sources:
     nn=sum(a==source for a,b in graph)
     if nn>=2:v[0]+=(nn+1)//2;v[1]+=nn//2
    return v
   assert x['focusCounts']==expected_counts(pair) and x['globalCounts']==expected_counts(range(10));assert x['focusBit']==sign(x['focusMeans'][1]-x['focusMeans'][0]) and x['globalBit']==sign(x['globalMeans'][1]-x['globalMeans'][0]);assert abs(x['phaseWeight']-(.75+.25*math.cos(x['phaseDifference'])))<1e-12 and abs(x['yokedPhaseWeight']-(.75+.25*math.cos(x['yokedPhaseDifference'])))<1e-12
   phase=typ in ('focus_phase','phase_yoked');pulse=x['pulse'];assert (pulse is not None)==phase
   if phase:
    expected=[3,6] if route=='warp' else [2,7];expected=expected if typ=='focus_phase' else [1,8];assert pulse['pair']==expected and abs(pulse['delta']-.08*x['focusBit'])<1e-12
    assert abs(pulse['after'][0]-wrap(pulse['before'][0]+pulse['delta']))<1e-12 and abs(pulse['after'][1]-wrap(pulse['before'][1]-pulse['delta']))<1e-12
    if typ=='focus_phase':assert abs(x['phaseDifference']-(pulse['after'][1]-pulse['after'][0]))<1e-12
    else:assert abs(x['yokedPhaseDifference']-(pulse['after'][1]-pulse['after'][0]))<1e-12
   signal={'natural':0,'global':.75*x['globalBit'],'focus_plain':.75*x['focusBit'],'focus_phase':x['phaseWeight']*x['focusBit'],'phase_yoked':x['yokedPhaseWeight']*x['focusBit'],'entry':0,'sham_entry':0}[typ];assert abs(x['appliedSignal']-signal)<1e-12
  if not(route is not None and x['virtual']) and len(opts)>=2:chosen={'source':previous,'options':opts,'rank':x['rank'],'action':x['rank']%2}
  previous=x['postZone']
 assert chosen is not None and q['selected']==chosen and q['action']==chosen['action'];return previous
seen=set();transitions=0;virtual=0;proofs=0;eligible=0
for e in d['episodes']:
 key=(e['n'],e['flip']);assert key not in seen;seen.add(key);assert e['env']==env(d['lineage'],*key);origins={}
 for route in ('warp','native27','matched27'):
  a=e['training'][route];graph=MATCH if route=='matched27' else BASE;assert a['graph']==sorted(f'{x}>{y}' for x,y in graph)
  for kind in ('real','donor'):
   prev=3 if route=='warp' else 2;track=a['tracks'][kind];assert len(track)==p['trainRounds']
   for row,q in zip(e['env']['trainRows'],track):prev=verify_dec(q,graph,prev);assert q['score']==row[kind][q['action']];verify_change(q);transitions+=4
   if kind=='real':origins[route]=prev
 assert origins==e['origins'];z=[1,4,8];k=e['env']['shockOffset'];shocks=[j for j in z[k:]+z[:k] if j not in origins.values()];assert shocks==e['shocks'] and shocks;eligible+=len(shocks)
 expected=set()
 for route,shock,scenario,typ in itertools.product(('warp','native27','matched27'),shocks,('same','reversed'),TYPES):
  for mem in (('retain','reset','donor') if scenario=='same' and typ in STRONG else ('retain',)):expected.add((route,shock,mem,scenario,typ))
 seenarms=set();proof_groups={}
 for a in e['post']:
  key=(a['route'],a['shock'],a['memory'],a['scenario'],a['type']);assert key not in seenarms;seenarms.add(key);route,shock,mem,scenario,typ=key;graph=MATCH if route=='matched27' else BASE;assert a['preZone']==origins[route];proof=a['boundaryProof'];assert proof['originalNonV']==proof['afterMemoryNonV'] and proof['originalOther']==proof['afterShockOther'] and proof['vHash']==e['training'][route][{'retain':'realVHash','reset':'baseVHash','donor':'donorVHash'}[mem]];proof_groups.setdefault(route,set()).add((proof['originalNonV'],proof['originalOther']));proofs+=1;prev=shock;assert len(a['steps'])==p['postRounds']
  for row,q in zip(e['env']['postRows'],a['steps']):
   prev=verify_dec(q,graph,prev,route,typ,shock,row['t']);assert q['score']==row[scenario][q['action']];transitions+=4;virtual+=sum(x['virtual'] for x in q['path'])
   if row['t']<p['withholdRounds']:assert q['change'] is None
   else:verify_change(q)
 assert seenarms==expected and all(len(x)==1 for x in proof_groups.values())
 for kind in ('real','donor'):
  q=[0,0]
  for row,v in zip(e['env']['trainRows'],e['directTraining'][kind]['steps']):
   a=int(q[1]>q[0]);score=row[kind][a];new=[max(-1,min(1,.75*q[j]+(score-1)*(1 if j==a else -1))) for j in (0,1)];assert v=={'action':a,'score':score,'before':q,'after':new};q=new
  assert q==e['directTraining'][kind]['q']
 assert len(e['directPost'])==6 and {(a['memory'],a['scenario']) for a in e['directPost']}==set(itertools.product(('retain','reset','donor'),('same','reversed')))
 for a in e['directPost']:
  assert len(a['steps'])==p['postRounds'];q=[0,0] if a['memory']=='reset' else e['directTraining']['donor' if a['memory']=='donor' else 'real']['q'];scenario=a['scenario']
  for row,v in zip(e['env']['postRows'],a['steps']):
   action=int(q[1]>q[0]);score=row[scenario][action];new=q if row['t']<p['withholdRounds'] else [max(-1,min(1,.75*q[j]+(score-1)*(1 if j==action else -1))) for j in (0,1)];assert v=={'action':action,'score':score,'before':q,'after':new};q=new
assert seen==set(itertools.product(range(p['pairs']),(0,1)))
out={'status':'VERIFIED','lineage':d['lineage'],'episodes':len(seen),'eligibleDisplacements':eligible,'transitionsChecked':transitions,'syntheticEntryEvents':virtual,'boundaryProofs':proofs,'resultSha256':H(db),'scope':'Independently regenerated grids, valid gate options and paths, signal arithmetic, phase-pulse arithmetic, V feedback updates and boundary hash consistency. Same-code replay checks actual Oracle gate winners; phase readouts are not independently regenerated from the full Oracle state.'};Path(sys.argv[5]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
