"""Independent Python regeneration of grids, disruption schedule, payoffs and House updates."""
import hashlib,importlib.util,itertools,json,math,sys
from pathlib import Path
if len(sys.argv)!=6:raise SystemExit('audit.py REGISTRATION RUN DATA SUPPORT OUTPUT')
pb,rb,db=(Path(x).read_bytes() for x in sys.argv[1:4]);p,r,d=(json.loads(x) for x in (pb,rb,db));H=lambda b:hashlib.sha256(b).hexdigest();spec=importlib.util.spec_from_file_location('support',sys.argv[4]);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
assert H(Path(sys.argv[4]).read_bytes())==p['support']['audit-support.py'] and H(Path(__file__).read_bytes())==p['scripts']['audit.py']
assert d['schema']=='amelia.warp-feedback-dataset/v1' and d['status']=='COMPLETE' and d['registrationSha256']==H(pb) and d['runSha256']==H(rb) and d['checkpointSha256']==p['checkpointSha256'] and d['lineage']==p['lineages'][d['index']]
def generate(lid,n,flip,which):
 attempt=0
 while True:
  seed=m.sha(f"{r['seed']}:{lid}:{r['phase']}:{n}:{which}:{attempt}");attempt+=1;switches=[];since=999
  for t in range(p['rounds']):
   hit=t>=6 and t<=p['rounds']-5 and since>=6 and m.rand(f'{seed}:switch:{t}',8)==0
   switches.append(hit);since=0 if hit else since+1
  if any(switches):break
  assert attempt<100
 mode=3 if m.rand(f'{seed}:initial',2)^flip else 1;age=-1;rows=[]
 for t in range(p['rounds']):
  if switches[t]:mode=3 if mode==1 else 1;age=0
  elif age>=0:age+=1
  cases=[m.grid(f'{seed}:grid:{t}:{j}',mode) for j in (0,1)]
  payoffs=[m.evaluate(policy,cases)['passed'] for policy in (m.LIGHT,m.HEAVY)];rows.append({'t':t,'mode':mode,'age':age,'switched':switches[t],'payoffs':payoffs})
 return {'seedHash':m.sha(seed),'attempts':attempt,'rows':rows}
pairs=p['calibrationPairs'] if r['phase']=='calibration' else p['evaluationPairs'];etas=p['candidateEta'] if r['phase']=='calibration' else [r['eta']];assert len(d['episodes'])==2*pairs;seen=set();switches=0;steps=0
for e in d['episodes']:
 key=(e['n'],e['flip']);assert key not in seen;seen.add(key)
 for kind in ('real','yoked'):assert e[kind]==generate(d['lineage'],e['n'],e['flip'],kind)
 switches+=sum(o['switched'] for o in e['real']['rows']);arms={(a['eta'],a['route'],a['kind']):a for a in e['arms']};expected=set(itertools.product(etas,('warp','matched'),('real','yoked','frozen')))
 if r['phase']=='evaluation':expected|=set(itertools.product(etas,('warp','matched'),('sameStateHouseProbe',)))
 assert set(arms)==expected
 for eta,route,kind in sorted(expected):
  if kind=='sameStateHouseProbe':continue
  a=arms[eta,route,kind];pzone,dzone=(3,6) if route=='warp' else (2,7);previous=pzone;assert len(a['steps'])==p['rounds']
  for t,q in enumerate(a['steps']):
   path=q['path'];assert path==([[dzone,pzone]] if previous==dzone else [])+[[pzone,pzone if q['action']==0 else dzone]];previous=path[-1][1]
   assert q['actualPayoff']==e['real']['rows'][t]['payoffs'][q['action']];expected_fb=None if kind=='frozen' else e[kind]['rows'][t]['payoffs'][q['action']];assert q['feedback']==expected_fb
   for field in ('vBefore','vAfterDecision','vAfter'):assert len(q[field])==2 and all(math.isfinite(x) for x in q[field])
   calc=q['vAfterDecision'] if kind=='frozen' else [max(-1,min(1,.75*q['vAfterDecision'][j]+eta*(expected_fb-1)*(1 if j==q['action'] else -1))) for j in (0,1)]
   assert all(abs(x-y)<1e-12 for x,y in zip(calc,q['vAfter']));steps+=len(path)
 for eta in etas:
  if r['phase']=='evaluation':
   for route in ('warp','matched'):
    for q in arms[eta,route,'sameStateHouseProbe']['probes']:
     t=q['t'];a=arms[eta,route,'real']['steps'][t];b=arms[eta,route,'yoked']['steps'][t];assert t%4==0 and q['vBefore']==a['vBefore'] and q['vDonor']==b['vBefore'] and q['realAction']==a['action'] and q['donorAction'] in (0,1)
assert seen==set(itertools.product(range(pairs),(0,1)))
out={'status':'VERIFIED','lineage':d['lineage'],'phase':r['phase'],'episodes':len(seen),'switches':switches,'transitions':steps,'resultSha256':H(db),'scope':'Independently regenerated schedules, grid costs, strategy payoffs, paths, and recorded House feedback updates; native state dynamics are checked by deterministic replay.'};Path(sys.argv[5]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
