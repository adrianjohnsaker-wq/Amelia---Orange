"""Frozen analysis: causal per-round readouts, adaptive baselines, eight-origin inference."""
import hashlib,itertools,json,math,statistics,sys
from pathlib import Path

if len(sys.argv)!=5: raise SystemExit('Usage: aggregate.py REGISTRATION RUN DATA_ROOT OUTPUT')
pb,rb=(Path(q).read_bytes() for q in sys.argv[1:3]);p,r=(json.loads(q) for q in (pb,rb));root=Path(sys.argv[3]);H=lambda b:hashlib.sha256(b).hexdigest()
assert p['schema']=='amelia.warp-access-registration/v1' and r['registrationSha256']==H(pb)
assert H(Path(__file__).read_bytes())==p['aggregateSha256']
D=[]
for i,lid in enumerate(p['lineages']):
 data=(root/lid/'result.json').read_bytes();d=json.loads(data);v=json.loads((root/lid/'replay-proof.json').read_text());a=json.loads((root/lid/'audit.json').read_text())
 assert d['status']=='COMPLETE' and d['index']==i and d['lineage']==lid and d['registrationSha256']==H(pb) and d['runSha256']==H(rb)
 assert v['status']=='VERIFIED' and v['originalSha256']==H(data) and v['lineage']==lid and a['status']=='VERIFIED' and a['resultSha256']==H(data)
 D.append(d)

def arm(e,route,kind):return next(a for a in e['arms'] if a['route']==route and a['kind']==kind)
def vec(q,view):
 f=q['features']
 return f['house'] if view=='house' else (f['pfm']+f['phase'] if view=='phase' else f['house']+f['pfm']+f['phase'])
def meanscale(X):
 n=len(X);m=[sum(x[j] for x in X)/n for j in range(len(X[0]))];s=[math.sqrt(sum((x[j]-m[j])**2 for x in X)/n) for j in range(len(m))]
 return m,[v if v>1e-12 else 1 for v in s]
def norm(x,m,s):return [max(-10,min(10,(a-b)/c)) for a,b,c in zip(x,m,s)]
def expand(x):return x+[x[i]*x[j] for i in range(len(x)) for j in range(i,len(x))]
def fit(examples,view):
 X=[vec(q,view) for q,_ in examples];Y=[y for _,y in examples];assert set(Y)=={0,1};m,s=meanscale(X);Z=[norm(x,m,s) for x in X]
 if view=='quadratic':
  Z=[expand(z) for z in Z];m2,s2=meanscale(Z);Z=[norm(z,m2,s2) for z in Z]
 else:m2=s2=None
 c=[[sum(z[j] for z,y in zip(Z,Y) if y==k)/sum(y==k for y in Y) for j in range(len(Z[0]))] for k in (0,1)]
 return m,s,m2,s2,c

def predict(model,q,view):
 m,s,m2,s2,c=model;z=norm(vec(q,view),m,s)
 if view=='quadratic':z=norm(expand(z),m2,s2)
 ds=[sum((v-w)**2 for v,w in zip(z,cc)) for cc in c]
 return int(ds[1]<ds[0])

def window(obs):return [o for o in obs if 0<=o['age']<5]
def examples(episodes,route,kind,label):
 return [(q,o[label]) for e in episodes for q,o in zip(arm(e,route,kind)['rounds'],e['observations'])]
def score(model,view,episodes,route,kind):
 out=[]
 for e in episodes:
  for q,o in zip(arm(e,route,kind)['rounds'],e['observations']):
   if 0<=o['age']<5:out.append(int(predict(model,q,view)==o['target']))
 assert out;return sum(out)/len(out)
def select(train,route,fitpairs):
 fitset=[e for e in train if e['index']<fitpairs];val=[e for e in train if e['index']>=fitpairs];assert fitset and val
 best=None
 for view in ('house','phase','combined','quadratic'):
  model=fit(examples(fitset,route,'real','target'),view);s=score(model,view,val,route,'real')
  if best is None or s>best[0]:best=(s,view)
 return best[1],best[0],fit(examples(train,route,'real','target'),best[1])

def base_predict(train,e):
 # Schedule and noise are estimated on training episodes, with Laplace smoothing.
 # The filter sees event and current noisy feedback, but no test target or switch.
 schedules=list(itertools.product(range(3,6),range(10,12)))
 count={s:1 for s in schedules};bad=1;total=2
 for tr in train:
  count[tuple(tr['switches'])]+=1
  for o in tr['observations']:bad+=o['noise'];total+=1
 err=bad/total
 weights={(a,b,par):count[(a,b)]/2 for a,b in schedules for par in (0,1)}
 targets=[o['target'] for tr in train for o in tr['observations']];fixed=int(sum(targets)>len(targets)/2)
 x=y=0;recent=[];outputs=[]
 for o in e['observations']:
  t,event,fb=o['t'],o['event'],o['feedback']
  if e['family']=='ordered':
   if event==0:x^=1
   else:x,y=y,x
  evidence=fb^x;recent.append(evidence);recent=recent[-4:]
  for (a,b,par) in weights:
   state=par^(t>=a)^(t>=b);weights[(a,b,par)]*=1-err if state==evidence else err
  z=sum(weights.values());assert z>0
  for k in weights:weights[k]/=z
  prob=sum(v for (a,b,par),v in weights.items() if (par^(t>=a)^(t>=b))==1)
  last=int(sum(recent)>len(recent)/2) if sum(recent)*2!=len(recent) else recent[-1]
  outputs.append({'fixed':fixed,'current_cue':fb,'last_four':last^x,'full_history':int(prob>0.5)^x})
 return outputs

def signs(values):
 observed=sum(values)/len(values);total=0
 for ss in itertools.product((-1,1),repeat=len(values)):
  total+=sum(s*x for s,x in zip(ss,values))/len(values)>=observed-1e-14
 return total/(2**len(values))
def holm(raw):
 order=sorted(range(len(raw)),key=lambda i:raw[i]);out=[0]*len(raw);last=0
 for j,i in enumerate(order):last=max(last,min(1,raw[i]*(len(raw)-j)));out[i]=last
 return out

results={};details=[]
for family in ('parity','ordered'):
 origins=[]
 for d in D:
  train=[e for e in d['episodes'] if e['family']==family and e['partition']=='train'];test=[e for e in d['episodes'] if e['family']==family and e['partition']=='test']
  assert len(train)==len(test)==2*p['pairsPerPartition']
  models={route:select(train,route,p['fitPairs']) for route in ('warp','matched')}
  counts={k:[0,0] for k in ('warp','matched','warp_yoked','matched_yoked','fixed','current_cue','last_four','full_history')};first={k:[0,0] for k in counts};info={};house_diffs=[]
  for route in ('warp','matched'):
   model=fit(examples(train,route,'real','feedback'),'house');vals=[];yokevals=[]
   for e in test:
    for q,yq,o in zip(arm(e,route,'real')['rounds'],arm(e,route,'yoked')['rounds'],e['observations']):
     vals.append(int(predict(model,q,'house')==o['feedback']));yokevals.append(int(predict(model,yq,'house')==o['feedback']))
     house_diffs.append(math.sqrt(sum((a-b)**2 for a,b in zip(q['features']['house'],yq['features']['house']))))
   info[route]={'feedbackDecodeHouseReal':sum(vals)/len(vals),'feedbackDecodeHouseYoked':sum(yokevals)/len(yokevals)}
  for e in test:
   b=base_predict(train,e)
   for t,o in enumerate(e['observations']):
    guesses={route:predict(models[route][2],arm(e,route,'real')['rounds'][t],models[route][0]) for route in ('warp','matched')}
    guesses.update({route+'_yoked':predict(models[route][2],arm(e,route,'yoked')['rounds'][t],models[route][0]) for route in ('warp','matched')});guesses.update(b[t])
    for name,g in guesses.items():
     for scores,condition in ((counts,0<=o['age']<5),(first,o['age']==0)):
      if condition:scores[name][0]+=int(g==o['target']);scores[name][1]+=1
  assert all(v[1]==len(test)*10 for v in counts.values()) and all(v[1]==len(test)*2 for v in first.values())
  origins.append({'lineage':d['lineage'],'window':{k:a/b for k,(a,b) in counts.items()},'firstStep':{k:a/b for k,(a,b) in first.items()},'windowCounts':counts,'firstCounts':first,'selectedViews':{k:{'view':v[0],'trainValidationAccuracy':v[1]} for k,v in models.items()},'houseFeedbackDiagnostic':info,'houseRealYokedL2Mean':sum(house_diffs)/len(house_diffs),'houseRealYokedDifferentFraction':sum(v>1e-12 for v in house_diffs)/len(house_diffs)})
 means={k:statistics.mean(o['window'][k] for o in origins) for k in origins[0]['window']}
 firstmeans={k:statistics.mean(o['firstStep'][k] for o in origins) for k in origins[0]['firstStep']}
 contrasts={k:[o['window']['warp']-o['window'][k] for o in origins] for k in ('matched','warp_yoked','full_history')}
 ps={k:signs(v) for k,v in contrasts.items()};hs=holm(list(ps.values()));comparisons={k:{'meanDifference':statistics.mean(v),'originDifferences':v,'oneSidedSignFlipP':ps[k],'holmP':hs[i],'target':p['minimumAdvantage'],'passes':statistics.mean(v)>=p['minimumAdvantage'] and hs[i]<=0.05} for i,(k,v) in enumerate(contrasts.items())}
 results[family]={'means':means,'firstStepMeans':firstmeans,'comparisons':comparisons,'origins':origins,'meanCorrectPerFive':{k:5*v for k,v in means.items()},'windowsPerOrigin':2*len(test),'testEpisodesPerOrigin':len(test)}
primary=results['parity'];classification='REGISTERED_ENGINEERED_WARP_ACCESS_ADVANTAGE' if all(x['passes'] for x in primary['comparisons'].values()) else 'NO_REGISTERED_WARP_ACCESS_ADVANTAGE'
out={'schema':'amelia.warp-access-outcome/v1','registrationSha256':H(pb),'runSha256':H(rb),'classification':classification,'primaryFamily':'parity','lineages':p['lineages'],'results':results,'limits':['Fresh synthetic challenges on eight previously existing origins that later shared input.','Engineered quota steers and deliberately codes each public input; local paths and dwell are matched.','House readouts and task-specific classifiers are externally trained; no live-world ingress or autonomous self-improvement is shown.']}
Path(sys.argv[4]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'classification':classification,'parity':primary['means'],'comparisons':primary['comparisons'],'ordered':results['ordered']['means']}))
