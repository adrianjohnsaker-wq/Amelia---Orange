"""Predeclared full-graph post-displacement memory and control analysis."""
import hashlib,itertools,json,math,statistics,sys
from pathlib import Path
if len(sys.argv)!=6:raise SystemExit('aggregate.py REGISTRATION PRIOR_MODEL RUN DATA_ROOT OUTPUT')
pb,mb,rb=(Path(x).read_bytes() for x in sys.argv[1:4]);p,m,r=(json.loads(x) for x in (pb,mb,rb));H=lambda b:hashlib.sha256(b).hexdigest();assert r['registrationSha256']==H(pb) and H(mb)==p['priorModelSha256'] and H(Path(__file__).read_bytes())==p['scripts']['aggregate.py'];root=Path(sys.argv[4]);data=[]
for i,lid in enumerate(p['lineages']):
 b=(root/lid/'result.json').read_bytes();d=json.loads(b);a=json.loads((root/lid/'audit.json').read_text());v=json.loads((root/lid/'replay-proof.json').read_text());assert d['lineage']==lid and d['index']==i and d['runSha256']==H(rb) and a['status']=='VERIFIED' and a['resultSha256']==H(b) and v['status']=='VERIFIED' and v['originalSha256']==H(b);data.append(d)
def avg(xs):return statistics.mean(xs)
def select(e,route,place,memory,scenario):return [a for a in e['post'] if (a['route'],a['displacement'],a['memory'],a['scenario'])==(route,place,memory,scenario)]
def score(a,decoder,start=0,end=5):return sum(q['score' if decoder=='gate' else 'globalScore'] for q in a['steps'][start:end])/(2*(end-start))
def bayes(e,model,scenario):
 belief=.5;h=model['hazard'];means=model['meanSuccess'];lik=model['likelihood']
 def action(b):return int((1-b)*means['1'][1]+b*means['3'][1]>(1-b)*means['1'][0]+b*means['3'][0])
 def update(b,a,y):
  v1=lik['1'][a][y];v3=lik['3'][a][y];d=(1-b)*v1+b*v3;posterior=b*v3/d;return posterior*(1-h)+(1-posterior)*h
 for row in e['env']['trainRows']:
  a=action(belief);belief=update(belief,a,row['real'][a])
 values=[]
 for row in e['env']['postRows']:
  a=action(belief);y=row[scenario][a];values.append(y)
  belief=belief*(1-h)+(1-belief)*h if row['t']<p['withholdRounds'] else update(belief,a,y)
 return sum(values[:5])/10

def signp(vals):
 observed=avg(vals);return sum(avg(s*x for s,x in zip(z,vals))>=observed-1e-14 for z in itertools.product((-1,1),repeat=len(vals)))/2**len(vals)
def holm(ps):
 ordered=sorted(range(len(ps)),key=lambda i:ps[i]);out=[0]*len(ps);last=0
 for rank,i in enumerate(ordered):last=max(last,min(1,ps[i]*(len(ps)-rank)));out[i]=last
 return out
origins=[]
for d in data:
 accum={};returns={r:{'originalPair':0,'warpPair':0,'total':0,'deaths':0} for r in ('warp','native27','matched27')};pre={r:{'everWarp':0,'endsWarp':0,'total':0} for r in returns};changed={r:[0,0] for r in returns};eligible=0
 for e in d['episodes']:
  eligible+=len(e['shocks'])
  for route in returns:
   track=e['training'][route]['tracks']['real'];zones=[q['to'] for x in track for q in x['path']];pre[route]['everWarp']+=int(any(z in (3,6) for z in zones));pre[route]['endsWarp']+=int(e['origins'][route] in (3,6));pre[route]['total']+=1
   for place in ('sham','displaced'):
    for scenario in ('same','reversed'):
     for mem in ('retain','reset','donor'):
      rows=select(e,route,place,mem,scenario);assert len(rows)==(1 if place=='sham' else len(e['shocks']))
      for decoder in ('gate','global'):
       key=f'{route}|{place}|{scenario}|{mem}|{decoder}';accum.setdefault(key,[]).append(avg(score(a,decoder) for a in rows))
      key=f'{route}|{place}|{scenario}|{mem}|later';accum.setdefault(key,[]).append(avg(score(a,'gate',5,10) for a in rows))
   retained=select(e,route,'displaced','retain','same');reset=select(e,route,'displaced','reset','same');rm={a['shockZone']:a for a in reset};pair=(3,6) if route=='warp' else (2,7)
   for a in retained:
    b=rm[a['shockZone']];seq=[q for x in a['steps'][:5] for q in x['path']];z=returns[route];z['total']+=1;z['originalPair']+=int(any(q['to'] in pair or q['postZone'] in pair for q in seq));z['warpPair']+=int(any(q['to'] in (3,6) or q['postZone'] in (3,6) for q in seq));z['deaths']+=sum(q['died'] for q in seq);changed[route][0]+=int(any(x['action']!=y['action'] for x,y in zip(a['steps'][:5],b['steps'][:5])));changed[route][1]+=1
  for scenario in ('same','reversed'):
   for memory in ('retain','reset','donor'):
    x=next(a for a in e['directPost'] if a['memory']==memory and a['scenario']==scenario);accum.setdefault(f'direct|{scenario}|{memory}',[]).append(sum(q['score'] for q in x['steps'][:5])/10)
   for action in (0,1):accum.setdefault(f'fixed{action}|{scenario}',[]).append(sum(row[scenario][action] for row in e['env']['postRows'][:5])/10)
   accum.setdefault(f'fullModel|{scenario}',[]).append(bayes(e,m['calibratedTaskModel'],scenario))
 origins.append({'lineage':d['lineage'],'episodes':len(d['episodes']),'eligibleDisplacements':eligible,'means':{k:avg(v) for k,v in accum.items()},'returns':returns,'pretraining':pre,'gateActionChangedAfterVReset':changed})
def gain(o,decoder,route):
 k=lambda mem:f'{route}|displaced|same|{mem}|{decoder}'
 return o['means'][k('retain')]-o['means'][k('reset')]
keys=[];diffs=[]
for decoder in ('gate','global'):
 w=[gain(o,decoder,'warp') for o in origins];c=[gain(o,decoder,'native27') for o in origins];mc=[gain(o,decoder,'matched27') for o in origins]
 keys.extend([(decoder,'warp_memory'),(decoder,'vs_native27'),(decoder,'vs_matched27')]);diffs.extend([w,[x-y for x,y in zip(w,c)],[x-y for x,y in zip(w,mc)]])
raw=[signp(v) for v in diffs];corrected=holm(raw);comparisons={}
for i,((decoder,name),v) in enumerate(zip(keys,diffs)):
 mean=avg(v);comparisons[f'{decoder}:{name}']={'meanDifference':mean,'originDifferences':v,'oneSidedSignFlipP':raw[i],'holmP':corrected[i],'threshold':p['minimumAdvantage'],'passes':mean>=p['minimumAdvantage'] and corrected[i]<=.05}
classification={decoder:('REGISTERED_WARP_SPECIFIC_MEMORY_ADVANTAGE' if all(comparisons[f'{decoder}:{k}']['passes'] for k in ('warp_memory','vs_native27','vs_matched27')) else 'NO_REGISTERED_WARP_SPECIFIC_MEMORY_ADVANTAGE') for decoder in ('gate','global')}
means={key:avg(o['means'][key] for o in origins) for key in origins[0]['means']};totals={r:{k:sum(o['returns'][r][k] for o in origins) for k in ('originalPair','warpPair','total','deaths')} for r in ('warp','native27','matched27')};preTotals={r:{k:sum(o['pretraining'][r][k] for o in origins) for k in ('everWarp','endsWarp','total')} for r in totals}
out={'schema':'amelia.fullgraph-outcome/v1','registrationSha256':H(pb),'priorModelSha256':H(mb),'runSha256':H(rb),'classification':classification,'means':means,'comparisons':comparisons,'origins':origins,'totals':{'postDisplacement':totals,'pretraining':preTotals},'limitations':['Native 2/7 is an initialization on the full graph and can enter 3/6, so it is not a non-Warp-isolated comparison.','Full V reset removes native and engineered V changes together while preserving the rest of each cloned host.','Global House readout is external to the gate decision and is counterfactual only during the first five feedback-withheld actions.','Eight reused lineages later shared input.']};Path(sys.argv[5]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'classification':classification,'comparisons':comparisons,'returns':totals,'pretraining':preTotals}))
