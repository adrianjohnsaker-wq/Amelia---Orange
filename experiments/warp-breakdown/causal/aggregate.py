"""Frozen intervention contrasts, matched baselines, and House crossover."""
import hashlib,itertools,json,math,statistics,subprocess,sys
from pathlib import Path
if len(sys.argv)!=8:raise SystemExit('Usage: aggregate.py REGISTRATION CHOICE RUN AUDITOR SUPPORT INPUT OUTPUT')
pp,cp,rp,ap,support,root,out=map(Path,sys.argv[1:]);pb,cb,rb=(x.read_bytes() for x in (pp,cp,rp));p,c,r=(json.loads(x) for x in (pb,cb,rb));H=lambda x:hashlib.sha256(x).hexdigest()
assert c['status']=='FROZEN' and c['registrationSha256']==H(pb) and r['registrationSha256']==H(pb) and r['choiceSha256']==H(cb)
assert r['pairsPerPartition']==p['pairsPerPartition'] and r['experimentSeed']!=p['calibrationSeed']
for k,f in [('aggregateSha256',Path(__file__)),('dataAuditSha256',ap),('auditSupportSha256',support)]:assert H(f.read_bytes())==p[k]
out.mkdir(parents=True,exist_ok=True);got={};bad=[]
for f in sorted(root.rglob('result.json')):
 try:
  raw=f.read_bytes();d=json.loads(raw);lid=d['lineage'];assert lid not in got
  re=json.loads((f.parent/'replay-audit.json').read_text());assert re['status']=='VERIFIED' and re['originalSha256']==H(raw) and re['registrationSha256']==H(pb) and re['replayScriptSha256']==p['replaySha256']
  q=subprocess.run([sys.executable,str(ap),str(pp),str(cp),str(rp),str(f),str(support)],capture_output=True,text=True)
  if q.returncode:raise ValueError('audit '+q.stderr[-1000:])
  got[lid]=(d,raw,re)
 except Exception as ex:bad.append({'path':str(f),'error':str(ex)})
missing=sorted(set(p['lineages'])-set(got));summary={'schema':'amelia.warp-gate-causal-summary/v1','registrationSha256':H(pb),'choiceSha256':H(cb),'runSha256':H(rb),'lineagesComplete':len(got),'missing':missing,'problems':bad}
for i,lid in enumerate(p['lineages']):
 if lid in got:(out/f'lineage-{i+1:02}.json').write_bytes(got[lid][1]);(out/f'replay-audit-{i+1:02}.json').write_text(json.dumps(got[lid][2],indent=2)+'\n')
if missing or bad or set(got)!=set(p['lineages']):
 summary['status']='INCOMPLETE';(out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary));raise SystemExit(1)
avg=statistics.mean
def fit(samples):
 X=[x for x,y in samples];assert X and len({len(x) for x in X})==1;dims=len(X[0]);mu=[avg(v[j] for v in X) for j in range(dims)]
 sd=[math.sqrt(avg((v[j]-mu[j])**2 for v in X)) for j in range(dims)];sd=[v if v>1e-12 else 1 for v in sd]
 z=lambda v:[(v[j]-mu[j])/sd[j] for j in range(dims)];a=[z(x) for x,y in samples if y==1];b=[z(x) for x,y in samples if y==3];assert a and b
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
  a=m['success3'] if v['ok'] else 1-m['success3'];b=m['success1'] if v['ok'] else 1-m['success1'];z=z*a/(z*a+(1-z)*b);out.append(3 if z>.5 else 1)
 return out
def signflip(vals):
 ob=sum(vals);return sum(sum(x*s for x,s in zip(vals,sg))>=ob-1e-12 for sg in itertools.product((-1,1),repeat=8))/256
items=[];models={};breakdown={'switches':0,'twoCaseLoss':0,'beforeSum':0,'afterSum':0};swapCount={'warp':{'changed':0,'total':0},'control':{'changed':0,'total':0}}
for lid in p['lineages']:
 episodes=got[lid][0]['episodes'];train=[e for e in episodes if e['partition']=='train'];test=[e for e in episodes if e['partition']=='test'];assert len(train)==len(test)==2*p['pairsPerPartition']
 arm=lambda e,route,name:next(a for a in e['arms'] if a['route']==route and a['name']==name)
 regular=('sham','low','high','reverse','release','lowYoked','highYoked')
 mm={rt:{name:{f:fit([(arm(e,rt,name)['features'][t][f],v['mode']) for e in train for t,v in enumerate(e['observations'])]) for f in ('house','pfm')} for name in regular} for rt in ('warp','control')}
 short=fit([(recent(e['observations'],t),v['mode']) for e in train for t,v in enumerate(e['observations'])]);hmm=hmm_fit(train)
 fixedScores={k:sum(e['heldout'][t][k] for e in train for t,v in enumerate(e['observations']) if v['age']==0) for k in ('light','heavy')};fixed='light' if fixedScores['light']>=fixedScores['heavy'] else 'heavy'
 scorekeys=[r+n for r in ('warp','control') for n in ('Sham','Low','High','Reverse','Release','LowYoked','HighYoked','HighLowReadout','LowHighReadout','HighPFM','LowPFM')]+['last4','fullHMM','fixed','oracle']
 buckets={k:{q:[] for q in scorekeys} for k in ('first','four','lateFirst')};extra={rt:{n:[] for n in ('highHouseFromLow','lowHouseFromHigh')} for rt in ('warp','control')};sensitivity={rt:{state:{'steps':0,'lowSensitive':0,'highSensitive':0,'sameStateWinnerChanged':0} for state in ('low','high')} for rt in ('warp','control')}
 for e in test:
  hp=hmm_predictions(e,hmm)
  for q in e['shocks']:breakdown['switches']+=1;breakdown['twoCaseLoss']+=int(q['breakdown']);breakdown['beforeSum']+=q['before'];breakdown['afterSum']+=q['after']
  for q in e['swapChecks']:swapCount[q['route']]['total']+=1;swapCount[q['route']]['changed']+=int(q['changed'])
  for route in ('warp','control'):
   for state in ('low','high'):
    dst=sensitivity[route][state]
    for pr in arm(e,route,state)['probes']:
     dst['steps']+=1;dst['lowSensitive']+=int(pr[1]!=pr[2]);dst['highSensitive']+=int(pr[3]!=pr[4]);dst['sameStateWinnerChanged']+=int(pr[1]!=pr[3])+int(pr[2]!=pr[4])
  for t,v in enumerate(e['observations']):
   if not 0<=v['age']<p['recoveryWindow']:continue
   predictions={}
   for route in ('warp','control'):
    for name in regular:
     a=arm(e,route,name);predictions[route+name[0].upper()+name[1:]]=decide(mm[route][name]['house'],a['features'][t]['house'])
    for src,dst in [('high','low'),('low','high')]:
     a=arm(e,route,src);predictions[route+src.title()+dst.title()+'Readout']=decide(mm[route][dst]['house'],a['features'][t]['house'])
    for name in ('low','high'):
     a=arm(e,route,name);predictions[route+name.title()+'PFM']=decide(mm[route][name]['pfm'],a['features'][t]['pfm'])
   predictions.update({'last4':decide(short,recent(e['observations'],t)),'fullHMM':hp[t],'fixed':1 if fixed=='light' else 3,'oracle':v['mode']})
   for bucket,eligible in [('first',v['age']==0),('four',True),('lateFirst',v['age']==0 and t>=p['releaseAt'])]:
    if eligible:
     for key,decision in predictions.items():buckets[bucket][key].append(e['heldout'][t]['light' if decision==1 else 'heavy']/p['heldoutCases'])
   if v['age']==0 and t>=p['releaseAt']:
    for route in ('warp','control'):
     for name,host in [('highHouseFromLow','high'),('lowHouseFromHigh','low')]:
      a=arm(e,route,name);decision=decide(mm[route][host]['house'],a['features'][t-p['releaseAt']]['house']);extra[route][name].append(e['heldout'][t]['light' if decision==1 else 'heavy']/p['heldoutCases'])
 assert all(all(x for x in b.values()) for b in buckets.values()) and all(all(v for v in s.values()) for s in extra.values())
 means={bucket:{k:avg(v) for k,v in d.items()} for bucket,d in buckets.items()};first=means['first']
 q={'lineage':lid,'offsets':c['lineages'][lid]['chosen'],'counts':{k:len(v['warpHigh']) for k,v in buckets.items()},'means':means,'houseSwapLateFirst':{rt:{k:avg(v) for k,v in d.items()} for rt,d in extra.items()},'sensitivity':sensitivity}
 q['warpHighLowEffect']=first['warpHigh']-first['warpLow'];q['controlHighLowEffect']=first['controlHigh']-first['controlLow'];q['interaction']=q['warpHighLowEffect']-q['controlHighLowEffect'];q['warpVsControl']=first['warpHigh']-first['controlHigh'];q['warpVsFull']=first['warpHigh']-first['fullHMM']
 for rt in ('warp','control'):
  for state in ('low','high'):
   s=sensitivity[rt][state];s['gain']=(s['highSensitive']-s['lowSensitive'])/s['steps'];s['winnerChangeFraction']=s['sameStateWinnerChanged']/(2*s['steps'])
 items.append(q);models[lid]={'housePFM':mm,'last4':short,'hmm':hmm,'fixed':fixed}
primary={}
for key,field,threshold in [('interaction','interaction',p['interactionPractical']),('warpVsControl','warpVsControl',p['directPractical']),('warpVsFull','warpVsFull',p['fullPractical'])]:
 vals=[q[field] for q in items];primary[key]={'effect':avg(vals),'rawP':signflip(vals),'practical':threshold}
ranked=sorted(primary,key=lambda k:primary[k]['rawP']);running=0
for i,k in enumerate(ranked):
 q=primary[k];running=max(running,min(1,q['rawP']*(len(ranked)-i)));q['holmAdjustedP']=running;q['practicalMet']=q['effect']>=q['practical'];q['statisticalMet']=running<=0.05
wg=avg(q['sensitivity']['warp']['low']['gain'] for q in items);cg=avg(q['sensitivity']['control']['low']['gain'] for q in items);wpos=sum(q['sensitivity']['warp']['low']['gain']>0 for q in items);cpos=sum(q['sensitivity']['control']['low']['gain']>0 for q in items)
manip={'warpGain':wg,'controlGain':cg,'betweenRouteGainGap':abs(wg-cg),'warpPositiveOrigins':wpos,'controlPositiveOrigins':cpos}
manip['pass']=wg>=p['sensitivityMinimum'] and cg>=p['sensitivityMinimum'] and abs(wg-cg)<=p['sensitivityBalanceMax'] and min(wpos,cpos)>=p['sensitivityPositiveOrigins']
success=all(q['practicalMet'] and q['statisticalMet'] for q in primary.values())
classification='INCONCLUSIVE_MANIPULATION' if not manip['pass'] else 'EXPLORATORY_CAUSAL_WARP_ADVANTAGE' if success else 'NO_REGISTERED_CAUSAL_WARP_ADVANTAGE'
means={bucket:{k:avg(q['means'][bucket][k] for q in items) for k in items[0]['means'][bucket]} for bucket in ('first','four','lateFirst')}
swaps={rt:{k:avg(q['houseSwapLateFirst'][rt][k] for q in items) for k in ('highHouseFromLow','lowHouseFromHigh')} for rt in ('warp','control')}
summary.update({'status':'COMPLETE','classification':classification,'manipulation':manip,'primary':primary,'means':means,'houseSwapLateFirst':swaps,'swapCount':swapCount,'breakdown':breakdown,'lineages':items,'models':models,
 'interpretation':'Within-route intervention uses fixed cue-independent score offsets calibrated on independent sham prestates; both possible cue winners are compared on each identical low- or high-history test prestate. Yoked cues come from independently seeded synthetic histories. House swaps replace full learner L only, retain host runtime/PFM and treatment, and affect subsequent passage. Shared later origin inputs and a single synthetic task limit generalisation.'})
(out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps({'status':'COMPLETE','classification':classification,'manipulation':manip,'primary':primary,'means':means,'houseSwapLateFirst':swaps,'swapCount':swapCount,'breakdown':breakdown}))
