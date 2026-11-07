"""Train on separate histories, evaluate sealed route-selection and online baselines."""
import hashlib,itertools,json,math,statistics,subprocess,sys
from pathlib import Path
if len(sys.argv)!=8:raise SystemExit('Usage: aggregate.py REGISTRATION SELECTION RUN AUDITOR SUPPORT INPUT OUTPUT')
pp,sp,rp,ap,support,root,out=map(Path,sys.argv[1:]);pb,sb,rb=(x.read_bytes() for x in (pp,sp,rp));p,s,r=(json.loads(x) for x in (pb,sb,rb));H=lambda x:hashlib.sha256(x).hexdigest()
assert s['status']=='FROZEN' and s['registrationSha256']==H(pb) and r['registrationSha256']==H(pb) and r['selectionSha256']==H(sb)
assert r['pairsPerPartition']==p['pairsPerPartition'] and r['experimentSeed']!=p['calibrationSeed']
for k,f in [('aggregateSha256',Path(__file__)),('dataAuditSha256',ap),('auditSupportSha256',support)]:assert H(f.read_bytes())==p[k]
out.mkdir(parents=True,exist_ok=True);got={};bad=[]
for f in sorted(root.rglob('result.json')):
 try:
  raw=f.read_bytes();d=json.loads(raw);lid=d['lineage'];assert lid not in got
  re=json.loads((f.parent/'replay-audit.json').read_text());assert re['status']=='VERIFIED' and re['originalSha256']==H(raw) and re['registrationSha256']==H(pb) and re['replayScriptSha256']==p['replaySha256']
  q=subprocess.run([sys.executable,str(ap),str(pp),str(sp),str(rp),str(f),str(support)],capture_output=True,text=True)
  if q.returncode:raise ValueError('audit '+q.stderr[-700:])
  got[lid]=(d,raw,re)
 except Exception as e:bad.append({'path':str(f),'error':str(e)})
missing=sorted(set(p['lineages'])-set(got));summary={'schema':'amelia.warp-dynamic-summary/v1','registrationSha256':H(pb),'selectionSha256':H(sb),'runSha256':H(rb),'lineagesComplete':len(got),'missing':missing,'problems':bad}
for i,lid in enumerate(p['lineages']):
 if lid in got:
  (out/f'lineage-{i+1:02}.json').write_bytes(got[lid][1]);(out/f'replay-audit-{i+1:02}.json').write_text(json.dumps(got[lid][2],indent=2)+'\n')
if missing or bad or set(got)!=set(p['lineages']):
 summary['status']='INCOMPLETE';(out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary));raise SystemExit(1)
avg=statistics.mean

def fit(samples):
 X=[x for x,y in samples];assert X and len({len(x) for x in X})==1;dims=len(X[0]);mu=[avg(v[j] for v in X) for j in range(dims)]
 sd=[math.sqrt(avg((v[j]-mu[j])**2 for v in X)) for j in range(dims)];sd=[v if v>1e-12 else 1 for v in sd]
 z=lambda v:[(v[j]-mu[j])/sd[j] for j in range(dims)]
 a=[z(x) for x,y in samples if y==1];b=[z(x) for x,y in samples if y==3];assert a and b
 x=[avg(v[j] for v in a) for j in range(dims)];y=[avg(v[j] for v in b) for j in range(dims)]
 return {'mean':mu,'scale':sd,'middle':[(x[j]+y[j])/2 for j in range(dims)],'weight':[y[j]-x[j] for j in range(dims)]}
def decide(model,x):return 3 if sum(model['weight'][j]*((x[j]-model['mean'][j])/model['scale'][j]-model['middle'][j]) for j in range(len(x)))>0 else 1
def recent(obs,t):
 v=[z['ok'] for z in obs[max(0,t-3):t+1]];return [sum(v),len(v)]
def hmm_fit(episodes):
 counts={1:[1,2],3:[1,2]};switches=1;transitions=2
 for e in episodes:
  for i,v in enumerate(e['observations']):
   counts[v['mode']][0]+=v['ok'];counts[v['mode']][1]+=1
   if i:transitions+=1;switches+=int(v['switched'])
 return {'switch':switches/transitions,'success1':counts[1][0]/counts[1][1],'success3':counts[3][0]/counts[3][1]}
def hmm_predictions(episode,m):
 z=.5;out=[]
 for i,v in enumerate(episode['observations']):
  if i:z=z*(1-m['switch'])+(1-z)*m['switch']
  a=m['success3'] if v['ok'] else 1-m['success3'];b=m['success1'] if v['ok'] else 1-m['success1'];z=z*a/(z*a+(1-z)*b)
  out.append(3 if z>.5 else 1)
 return out
items=[];models={};breakdown={'switches':0,'twoCaseLoss':0,'beforeSum':0,'afterSum':0};recoveryCounts={}
for lid in p['lineages']:
 episodes=got[lid][0]['episodes'];train=[e for e in episodes if e['partition']=='train'];test=[e for e in episodes if e['partition']=='test'];assert len(train)==len(test)==2*r['pairsPerPartition']
 lastModel=fit([(recent(e['observations'],t),v['mode']) for e in train for t,v in enumerate(e['observations'])]);hmm=hmm_fit(train)
 fixedScores={k:sum(e['heldout'][t][k] for e in train for t,v in enumerate(e['observations']) if 0<=v['age']<p['recoveryWindow']) for k in ('light','heavy')}
 fixed='light' if fixedScores['light']>=fixedScores['heavy'] else 'heavy'
 for e in test:
  for q in e['shocks']:breakdown['switches']+=1;breakdown['twoCaseLoss']+=int(q['breakdown']);breakdown['beforeSum']+=q['before'];breakdown['afterSum']+=q['after']
 for gain in p['cueWeights']:
  arm=lambda e,route:next(a for a in e['arms'] if a['route']==route and a['gain']==gain)
  mm={rt:{f:fit([(arm(e,rt)['features'][t][f],v['mode']) for e in train for t,v in enumerate(e['observations'])]) for f in ('house','pfm')} for rt in ('warp','control')}
  selected=s['lineages'][lid]['selected'][str(gain)];acc={k:[] for k in ('warpHouse','controlHouse','selectedHouse','warpPFM','controlPFM','last4','fullHMM','fixed','oracle')};hit={k:[] for k in acc}
  for e in test:
   hp=hmm_predictions(e,hmm)
   for t,v in enumerate(e['observations']):
    if not 0<=v['age']<p['recoveryWindow']:continue
    predictions={}
    for rt in ('warp','control'):
     for f in ('house','pfm'):predictions[rt+('House' if f=='house' else 'PFM')]=decide(mm[rt][f],arm(e,rt)['features'][t][f])
    predictions['selectedHouse']=predictions[selected+'House'];predictions['last4']=decide(lastModel,recent(e['observations'],t));predictions['fullHMM']=hp[t];predictions['fixed']=1 if fixed=='light' else 3;predictions['oracle']=v['mode']
    for key,choice in predictions.items():
     acc[key].append(int(choice==v['mode']));hit[key].append(e['heldout'][t]['light' if choice==1 else 'heavy']/p['heldoutCases'])
  assert all(hit[k] for k in hit);key=str(gain);a=s['lineages'][lid]['counts'][key+':warp'];b=s['lineages'][lid]['counts'][key+':control']
  q={'lineage':lid,'gain':gain,'selectedRoute':selected,'calibrationSensitivityDifference':a['sensitive']/a['steps']-b['sensitive']/b['steps'],
     'eligibleTimepoints':len(hit['selectedHouse']),'accuracy':{k:avg(v) for k,v in acc.items()},'passFraction':{k:avg(v) for k,v in hit.items()},'fixedSelectedOnTrain':fixed,'hmmTrainingParameters':hmm}
  q['routeDifference']=q['passFraction']['warpHouse']-q['passFraction']['controlHouse'];q['selectionVsAverage']=q['passFraction']['selectedHouse']-(q['passFraction']['warpHouse']+q['passFraction']['controlHouse'])/2
  q['selectedVsLast4']=q['passFraction']['selectedHouse']-q['passFraction']['last4'];q['selectedVsFull']=q['passFraction']['selectedHouse']-q['passFraction']['fullHMM']
  items.append(q);models[f'{lid}:{gain}']={'housePFM':mm,'last4':lastModel,'hmm':hmm,'fixed':fixed}

def signflip(vals):
 ob=sum(vals);ext=sum(sum(x*s for x,s in zip(vals,sg))>=ob-1e-12 for sg in itertools.product((-1,1),repeat=8));return ext/256

def pearson(a,b):
 ma=avg(a);mb=avg(b);n=sum((x-ma)*(y-mb) for x,y in zip(a,b));den=math.sqrt(sum((x-ma)**2 for x in a)*sum((y-mb)**2 for y in b));return n/den if den>0 else None

def perm_p(x,y,ob):
 if ob is None:return 1.0
 return sum((pearson(x,v) or 0)>=ob-1e-12 for v in itertools.permutations(y))/math.factorial(8)
primary={};gains={}
for gain in p['cueWeights']:
 z=[q for q in items if q['gain']==gain];assert len(z)==8
 x=[q['calibrationSensitivityDifference'] for q in z];y=[q['routeDifference'] for q in z];corr=pearson(x,y)
 result={'selectedWarp':sum(q['selectedRoute']=='warp' for q in z),'eligibleTimepoints':sum(q['eligibleTimepoints'] for q in z),
  'means':{k:{'regimeAccuracy':avg(q['accuracy'][k] for q in z),'heldoutPassFraction':avg(q['passFraction'][k] for q in z)} for k in z[0]['passFraction']},
  'selectionVsMatchedAverage':avg(q['selectionVsAverage'] for q in z),'selectedVsLast4':avg(q['selectedVsLast4'] for q in z),'selectedVsFullHMM':avg(q['selectedVsFull'] for q in z),
  'calibrationVsRouteRecoveryPearson':corr,'lineages':z}
 gains[str(gain)]=result
 if gain==p['primaryGain']:
  primary={'selectionVsAverage':{'effect':result['selectionVsMatchedAverage'],'rawP':signflip([q['selectionVsAverage'] for q in z]),'practical':p['selectionPractical']},
   'selectedVsLast4':{'effect':result['selectedVsLast4'],'rawP':signflip([q['selectedVsLast4'] for q in z]),'practical':p['recentPractical']},
   'sensitivityPrediction':{'effect':corr,'rawP':perm_p(x,y,corr),'practical':p['correlationPractical']}}
ranked=sorted(primary,key=lambda k:primary[k]['rawP']);running=0
for i,k in enumerate(ranked):
 q=primary[k];running=max(running,min(1.0,q['rawP']*(len(ranked)-i)));q['holmAdjustedP']=running;q['practicalMet']=q['effect'] is not None and q['effect']>=q['practical'];q['statisticalMet']=running<=0.05
success=all(q['practicalMet'] and q['statisticalMet'] for q in primary.values())
summary.update({'status':'COMPLETE','classification':'EXPLORATORY_CALIBRATED_ROUTE_SELECTION_LEAD' if success else 'NO_REGISTERED_CALIBRATED_RECOVERY_ADVANTAGE','primary':primary,'gains':gains,'models':models,'breakdown':breakdown,
 'interpretation':'Gate calibration, model training, and switching test histories use separate seeds. Decoders are externally trained on synthetic feedback. All inputs are forward-generated. Full-history HMM is trained on labelled training episodes and uses only past and present test feedback. Historical origins later shared inputs; eight-origin inference is conditional.'})
(out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps({'status':'COMPLETE','classification':summary['classification'],'primary':primary,'gains':{k:{x:v[x] for x in ('selectedWarp','eligibleTimepoints','means','selectionVsMatchedAverage','selectedVsLast4','selectedVsFullHMM','calibrationVsRouteRecoveryPearson')} for k,v in gains.items()},'breakdown':breakdown}))
