"""Blocked held-out decoder and recovery comparison; no fitting on test cases."""
import hashlib,itertools,json,math,statistics,subprocess,sys
from pathlib import Path
from collections import defaultdict
if len(sys.argv)!=7:raise SystemExit('Usage: aggregate.py PLAN DATASET ADAPTER AUDITOR ARTIFACT_ROOT OUTPUT')
pp,sp,ad,au=map(Path,sys.argv[1:5]);root=Path(sys.argv[5]);out=Path(sys.argv[6]);p=Path(__file__).parent
H=lambda x:hashlib.sha256(x).hexdigest();pb=pp.read_bytes();plan=json.loads(pb)
for k,f in [('scriptSha256',sp),('adapterSha256',ad),('prepareSha256',p/'prepare.mjs'),('auditSha256',au),('aggregatorSha256',Path(__file__)),('replayAuditSha256',p/'compare-replay.py')]:assert H(f.read_bytes())==plan[k],k
out.mkdir(parents=True,exist_ok=True);shards={};problems=[]
for f in sorted(root.rglob('result.json')):
 try:
  b=f.read_bytes();d=json.loads(b);lid=d.get('lineage')
  if lid in shards:raise ValueError('duplicate lineage')
  if d.get('status')!='COMPLETE':raise ValueError('incomplete lineage '+str(d.get('error')))
  replay=json.loads((f.parent/'replay-audit.json').read_text())
  assert replay['schema']=='amelia.warp-mechanism-replay-audit/v1' and replay['status']=='VERIFIED'
  assert replay['lineage']==lid and replay['planSha256']==H(pb) and replay['originalSha256']==H(b) and replay['auditSha256']==plan['replayAuditSha256']
  a=subprocess.run([sys.executable,str(au),str(pp),str(sp),str(f)],capture_output=True,text=True)
  if a.returncode:raise ValueError('audit failed '+a.stderr[-800:])
  shards[lid]=(d,b,json.loads(a.stdout),replay)
 except Exception as e:problems.append({'path':str(f),'error':str(e)})
missing=sorted(set(plan['lineages'])-set(shards));summary={'schema':'amelia.warp-mechanism-transfer-summary/v1','planSha256':H(pb),'lineagesExpected':len(plan['lineages']),'lineagesComplete':len(shards),'missing':missing,'problems':problems}
for i,lid in enumerate(plan['lineages']):
 if lid in shards:
  (out/f'lineage-{i+1:02}.json').write_bytes(shards[lid][1])
  (out/f'replay-audit-{i+1:02}.json').write_text(json.dumps(shards[lid][3],indent=2)+'\n')
if missing or problems or set(shards)!=set(plan['lineages']):
 summary['status']='INCOMPLETE';(out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary));raise SystemExit(1)
avg=statistics.mean

def vector(row,feature):
 f=row['features'];return f['house']+f['pfm'] if feature=='housepfm' else f[feature]
def fit(rows,feature):
 # Supervised nearest-centroid readout; class labels and features from train only.
 X=[vector(r,feature) for r in rows];assert X and len({len(x) for x in X})==1
 dims=len(X[0]);mu=[avg(v[j] for v in X) for j in range(dims)]
 sd=[math.sqrt(avg((v[j]-mu[j])**2 for v in X)) for j in range(dims)]
 sd=[s if s>1e-12 else 1.0 for s in sd]
 z=lambda v:[(v[j]-mu[j])/sd[j] for j in range(dims)]
 light=[z(vector(r,feature)) for r in rows if r['mode']==1];heavy=[z(vector(r,feature)) for r in rows if r['mode']==3]
 assert light and heavy
 a=[avg(x[j] for x in light) for j in range(dims)];b=[avg(x[j] for x in heavy) for j in range(dims)]
 return {'feature':feature,'mean':mu,'scale':sd,'middle':[(a[j]+b[j])/2 for j in range(dims)],'weight':[b[j]-a[j] for j in range(dims)]}
def decide(model,x):return 3 if sum(model['weight'][j]*((x[j]-model['mean'][j])/model['scale'][j]-model['middle'][j]) for j in range(len(x)))>0 else 1

def choice(row,pred):return row['heldout']['heavy' if pred==3 else 'light']['passed']
features=('house','pfm','housepfm','path','last1','last4','all24');gainResults={};lineageItems=[];allModels={};totalSwap=defaultdict(int)
for gain in plan['cueWeights']:
 for lid in plan['lineages']:
  rows=shards[lid][0]['rows'];item={'lineage':lid,'gain':gain,'routes':{},'testBreakdowns':{},'trainSpecialization':{}}
  for route in ('warp','control'):
   train=[x for x in rows if x['partition']=='train' and x['route']==route and x['gain']==gain]
   test=[x for x in rows if x['partition']=='test' and x['route']==route and x['gain']==gain]
   assert len(train)==len(test)==plan['pairsPerPartition']*2
   models={f:fit(train,f) for f in features};allModels[f'{lid}:{gain}:{route}']=models
   trainLight=[r['heldout']['light']['passed']-r['heldout']['heavy']['passed'] for r in train if r['mode']==1]
   trainHeavy=[r['heldout']['heavy']['passed']-r['heldout']['light']['passed'] for r in train if r['mode']==3]
   item['trainSpecialization'][route]={'light':avg(trainLight),'heavy':avg(trainHeavy),'met':avg(trainLight)>0 and avg(trainHeavy)>0}
   fixed='light' if sum(r['heldout']['light']['passed'] for r in train)>=sum(r['heldout']['heavy']['passed'] for r in train) else 'heavy'
   z={'models':{},'fixedSelectedOnTrain':fixed,'bestFixedHeldout':avg(r['heldout'][fixed]['passed'] for r in test),
      'regimeOracleHeldout':avg(r['heldout']['heavy' if r['mode']==3 else 'light']['passed'] for r in test),
      'originalHeldout':avg(r['heldout']['baseline']['passed'] for r in test),
      'breakdownRate':avg(int(r['breakdown']) for r in test),'beforePublic':avg(r['before']['passed'] for r in test),'afterShockPublic':avg(r['shocked']['passed'] for r in test),
      'swap':{}}
   item['testBreakdowns'][route]=sum(r['breakdown'] for r in test)
   for f in features:
    predictions=[decide(models[f],vector(r,f)) for r in test]
    z['models'][f]={'accuracy':avg(int(a==r['mode']) for a,r in zip(predictions,test)),
       'heldoutCases':avg(choice(r,a) for a,r in zip(predictions,test))}
   # Transfer probe: train only on the other seven world-origin lineages.
   otherTrain=[r for other in plan['lineages'] if other!=lid for r in shards[other][0]['rows']
               if r['partition']=='train' and r['route']==route and r['gain']==gain]
   z['leaveOneLineageOut']={}
   for f in ('house','pfm','last4'):
    model=fit(otherTrain,f);predictions=[decide(model,vector(r,f)) for r in test]
    z['leaveOneLineageOut'][f]={'accuracy':avg(int(a==r['mode']) for a,r in zip(predictions,test)),
       'heldoutCases':avg(choice(r,a) for a,r in zip(predictions,test))}
   for f in ('house','pfm'):
    swap={'pairs':len(test),'componentDiffered':0,'decisionChanged':0,'futurePathChanged':0,'recipientRewardDifferenceSum':0}
    for r in test:
     q=r['swaps'][f];before=decide(models[f],vector(r,f));after=decide(models[f],q['donorFeatures'])
     swap['componentDiffered']+=int(q['recipientHash']!=q['donorHash']);swap['decisionChanged']+=int(before!=after);swap['futurePathChanged']+=int(q['pathChanged'])
     swap['recipientRewardDifferenceSum']+=choice(r,before)-choice(r,after)
    swap['meanRecipientRewardCorrectVsSwapped']=swap['recipientRewardDifferenceSum']/len(test);z['swap'][f]=swap
    for k in ('pairs','componentDiffered','decisionChanged','futurePathChanged'):totalSwap[f'{gain}:{route}:{f}:{k}']+=swap[k]
   item['routes'][route]=z
  a=item['routes']['warp']['models'];b=item['routes']['control']['models'];item['routeAccuracy']=a['house']['accuracy']-b['house']['accuracy']
  item['routeRecovery']=a['house']['heldoutCases']-b['house']['heldoutCases'];item['recentRecovery']=a['house']['heldoutCases']-a['last4']['heldoutCases']
  item['warpHouseVsChance']=a['house']['accuracy']-0.5;lineageItems.append(item)

def contrast(vals):
 v=list(vals.values());obs=sum(v);extreme=sum(sum(x*s for x,s in zip(v,sg))>=obs-1e-12 for sg in itertools.product((-1,1),repeat=8))
 return {'perLineage':vals,'mean':avg(v),'conditionalOneSidedP':extreme/256,'assignments':256,'extreme':extreme}
prim={}
for gain in plan['cueWeights']:
 ls=[x for x in lineageItems if x['gain']==gain];assert len(ls)==8
 for name in ('routeAccuracy','routeRecovery','recentRecovery'):
  prim[f'{gain}:{name}']=contrast({x['lineage']:x[name] for x in ls})
ranked=sorted(prim,key=lambda k:prim[k]['conditionalOneSidedP']);run=0
for i,k in enumerate(ranked):
 run=max(run,min(1.0,prim[k]['conditionalOneSidedP']*(len(ranked)-i)));prim[k]['holmAdjustedP']=run
for gain in plan['cueWeights']:
 ls=[x for x in lineageItems if x['gain']==gain];special=all(y['met'] for x in ls for y in x['trainSpecialization'].values())
 checks={}
 for name,threshold in [('routeAccuracy',plan['accuracyPractical']),('routeRecovery',plan['recoveryPracticalCases']),('recentRecovery',plan['recoveryPracticalCases'])]:
  c=prim[f'{gain}:{name}'];c['practicalThreshold']=threshold;c['practicalThresholdMet']=c['mean']>=threshold;c['holmThresholdMet']=c['holmAdjustedP']<=0.05;checks[name]=c['practicalThresholdMet'] and c['holmThresholdMet']
 tab={}
 for route in ('warp','control'):
  tab[route]={'models':{f:{'accuracy':avg(x['routes'][route]['models'][f]['accuracy'] for x in ls),'heldoutCases':avg(x['routes'][route]['models'][f]['heldoutCases'] for x in ls)} for f in features},
   'leaveOneLineageOut':{f:{'accuracy':avg(x['routes'][route]['leaveOneLineageOut'][f]['accuracy'] for x in ls),'heldoutCases':avg(x['routes'][route]['leaveOneLineageOut'][f]['heldoutCases'] for x in ls)} for f in ('house','pfm','last4')},
   'bestFixedHeldout':avg(x['routes'][route]['bestFixedHeldout'] for x in ls),'regimeOracleHeldout':avg(x['routes'][route]['regimeOracleHeldout'] for x in ls),
   'originalHeldout':avg(x['routes'][route]['originalHeldout'] for x in ls),'breakdownRate':avg(x['routes'][route]['breakdownRate'] for x in ls),
   'beforePublic':avg(x['routes'][route]['beforePublic'] for x in ls),'afterShockPublic':avg(x['routes'][route]['afterShockPublic'] for x in ls)}
 gainResults[str(gain)]={'trainingSpecializationMet':special,'classification':'INCONCLUSIVE_TASK_SPECIALIZATION' if not special else ('EXPLORATORY_WARP_MECHANISM_LEAD' if all(checks.values()) else 'NO_REGISTERED_WARP_ADVANTAGE_OBSERVED'),
  'checks':checks,'summaryByRoute':tab,'warpHouseVsChanceExploratory':contrast({x['lineage']:x['warpHouseVsChance'] for x in ls})}
summary.update({'status':'COMPLETE','exploratory':True,'gains':gainResults,'primaryContrasts':prim,'lineageResults':lineageItems,'trainedModels':allModels,'swapCounts':dict(totalSwap),
 'interpretation':'Labels and task outcomes are synthetic. Decoders are externally trained using separate training histories, not native Oracle decision policies. Both routes receive the same feedback; the later world streams were shared across lineages. Sign-flip p values require conditional exchangeability.'})
(out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps({'status':summary['status'],'gains':gainResults,'primaryContrasts':prim,'swapCounts':dict(totalSwap)}))
