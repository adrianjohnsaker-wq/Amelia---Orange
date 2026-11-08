"""Predeclared fixed mask comparisons for retained original-order recall."""
import hashlib,itertools,json,statistics,sys
from pathlib import Path
if len(sys.argv)!=5:raise SystemExit('aggregate.py REG RUN DATA OUTPUT')
pb,rb=(Path(x).read_bytes() for x in sys.argv[1:3]);p,r=(json.loads(x) for x in (pb,rb));H=lambda x:hashlib.sha256(x).hexdigest();assert H(pb)==r['registrationSha256'] and H(Path(__file__).read_bytes())==p['scripts']['aggregate.py'];root=Path(sys.argv[3]);mean=statistics.mean;configs=('sham29','A','B','C','D','A_direct','B_direct','C_direct','D_direct','matched27','direct_host','direct_standalone');origins=[]
for i,lid in enumerate(p['lineages']):
 b=(root/lid/'result.json').read_bytes();d=json.loads(b);a=json.loads((root/lid/'audit.json').read_text());v=json.loads((root/lid/'replay-proof.json').read_text());assert d['lineage']==lid and d['index']==i and d['runSha256']==H(rb) and a['status']=='VERIFIED' and a['resultSha256']==H(b) and v['status']=='VERIFIED' and v['originalSha256']==H(b);vals={};drifts={};resources={k:{'switchedBranches':0,'phase2GateEvents':0,'phase2Deaths':0,'phase2FocusReturns':0,'oldProbes':0,'oldGateEvents':0,'oldProbeDeaths':0,'gateMatchesDecoder':0} for k in configs if k!='direct_standalone'}
 for e in d['episodes']:
  phase='switched' if e['switched'] else 'unchanged'
  for config in configs:
   for kind in ('retain','reset','donor'):
    for ctx in ('old','new'):
     arms=e['direct'] if config=='direct_standalone' else [a for a in e['arms'] if a['config']==config];assert len(arms)==3;zs=[]
     for arm in arms:
      state=next(x for x in arm['results'] if x['kind']==kind);qs=[q for q in state['probes'] if q['context']==ctx];assert len(qs)==2;zs.append(mean(q['correct'] for q in qs))
     vals.setdefault(f'{config}|{kind}|{ctx}|{phase}',[]).append(mean(zs))
  if e['switched']:
   for config in resources:
    arms=[a for a in e['arms'] if a['config']==config];assert len(arms)==3
    for arm in arms:
     rec=resources[config];rec['switchedBranches']+=1;events=[q for s in arm['second'] for q in s['path']];rec['phase2GateEvents']+=len(events);rec['phase2Deaths']+=sum(q['died'] for q in events);focus=(2,7) if config=='matched27' else (3,6);rec['phase2FocusReturns']+=int(any(q['to'] in focus or q['postZone'] in focus for q in events))
     for field,idx in (('V',0),('D',3)):
      drifts.setdefault(f'{config}|{field}',[]).append(mean(mean(abs(q['after'][idx+j]-q['written'][idx+j]) for j in range(3)) for q in arm['second']))
     z=next(x for x in arm['results'] if x['kind']=='retain')
     for q in z['probes']:
      if q['context']!='old':continue
      rec['oldProbes']+=1;rec['oldGateEvents']+=len(q['path']);rec['oldProbeDeaths']+=sum(t['died'] for t in q['path']);rec['gateMatchesDecoder']+=int(q['gateAction']==q['readout']['action'])
 assert all(len(v)==2*p['pairs'] for v in vals.values());origins.append({'lineage':lid,'episodes':len(d['episodes']),'means':{k:mean(v) for k,v in vals.items()},'meanPhase2SlotDrift':{k:mean(v) for k,v in drifts.items()},'resources':resources})
def get(o,config,kind='retain',ctx='old',phase='switched'):return o['means'][f'{config}|{kind}|{ctx}|{phase}']
def signp(v):
 ob=mean(v);return sum(mean(s*x for s,x in zip(z,v))>=ob-1e-14 for z in itertools.product((-1,1),repeat=len(v)))/2**len(v)
def holm(ps):
 order=sorted(range(len(ps)),key=lambda i:ps[i]);out=[0]*len(ps);last=0
 for j,i in enumerate(order):last=max(last,min(1,ps[i]*(len(ps)-j)));out[i]=last
 return out
def family(vs):
 raw=[signp(v) for v in vs.values()];adj=holm(raw);return {k:{'meanDifference':mean(v),'originDifferences':v,'rawP':raw[i],'holmP':adj[i],'passes':mean(v)>0 and adj[i]<.05} for i,(k,v) in enumerate(vs.items())}
primary=family({key:vector for mask in ('A','B','C','D') for key,vector in ((f'{mask}_vs_matched27',[get(o,mask)-get(o,'matched27') for o in origins]),(f'{mask}_vs_direct',[get(o,mask)-get(o,mask+'_direct') for o in origins]))});density=family({f'{mask}_vs_sham29':[get(o,mask)-get(o,'sham29') for o in origins] for mask in ('A','B','C','D')});memory=family({'A_retained_vs_reset':[get(o,'A')-get(o,'A','reset') for o in origins],'A_retained_vs_donor':[get(o,'A')-get(o,'A','donor') for o in origins]});wins=[mask for mask in ('A','B','C','D') if primary[f'{mask}_vs_matched27']['passes'] and primary[f'{mask}_vs_direct']['passes']];classification='REGISTERED_WARP_DENSITY_MASK_ADVANTAGE' if wins else 'NO_REGISTERED_WARP_DENSITY_MASK_ADVANTAGE';means={k:mean(o['means'][k] for o in origins) for k in origins[0]['means']};drift={k:mean(o['meanPhase2SlotDrift'][k] for o in origins) for k in origins[0]['meanPhase2SlotDrift']};resources={k:{f:sum(o['resources'][k][f] for o in origins) for f in origins[0]['resources'][k]} for k in origins[0]['resources']}
out={'schema':'amelia.density-outcome/v1','registrationSha256':H(pb),'runSha256':H(rb),'classification':classification,'winningMasks':wins,'primary':primary,'secondaryDensity':density,'secondaryMemory':memory,'means':means,'meanPhase2SlotDrift':drift,'resources':resources,'origins':origins,'notes':['The four masks were chosen after prior paths were examined but before the fresh seed.','All masked/sham 3/6 copies share the same first-sequence host state; masks are installed after displacement and perturbation.','Masks stay closed after Zone-5 reset; House S/D updates are not silenced.','All four masks share some closures, so the grid is not a representative sample of all possible 24-gate networks.','Eight reused origins later shared input.']};Path(sys.argv[4]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'classification':classification,'winningMasks':wins,'primary':primary,'secondaryDensity':density,'secondaryMemory':memory,'means':means,'drift':drift,'resources':resources}))
