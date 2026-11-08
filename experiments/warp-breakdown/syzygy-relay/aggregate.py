"""Sealed actual-action recovery, transition budget and route comparisons."""
import hashlib,itertools,json,statistics,sys,importlib.util
from pathlib import Path
if len(sys.argv)!=7:raise SystemExit('aggregate.py REGISTRATION PRIOR_MODEL RUN DATA_ROOT DISTANCE OUTPUT')
pb,mb,rb=(Path(x).read_bytes() for x in sys.argv[1:4]);p,m,r=(json.loads(x) for x in (pb,mb,rb));H=lambda b:hashlib.sha256(b).hexdigest();assert r['registrationSha256']==H(pb) and H(mb)==p['priorModelSha256'] and H(Path(__file__).read_bytes())==p['scripts']['aggregate.py'] and H(Path(sys.argv[5]).read_bytes())==p['scripts']['distance.py'];root=Path(sys.argv[4]);spec=importlib.util.spec_from_file_location('distance',sys.argv[5]);dist=importlib.util.module_from_spec(spec);spec.loader.exec_module(dist);D=[]
for i,lid in enumerate(p['lineages']):
 b=(root/lid/'result.json').read_bytes();d=json.loads(b);a=json.loads((root/lid/'audit.json').read_text());v=json.loads((root/lid/'replay-proof.json').read_text());assert d['lineage']==lid and d['index']==i and d['runSha256']==H(rb) and a['status']=='VERIFIED' and a['resultSha256']==H(b) and v['status']=='VERIFIED' and v['originalSha256']==H(b);D.append(d)
mean=statistics.mean;TYPES=('natural','global','focus_plain','focus_phase','phase_yoked','entry','sham_entry')
means=m['calibratedTaskModel']['meanSuccess'];preferred={int(z):int(means[z][1]>means[z][0]) for z in ('1','3')};assert preferred=={1:0,3:1}
def metric(steps,target):
 a=[s['action'] for s in steps[:p['primaryDecisions']]];t=next((j+1 for j in range(1,len(a)) if a[j-1]==a[j]==target),None);cap=4*p['primaryDecisions'];return {'recovered':int(t is not None),'restrictedTransitions':4*t if t is not None else cap,'gridAccuracy':sum(s['score'] for s in steps[:p['primaryDecisions']])/(2*p['primaryDecisions']),'preferredActionFraction':sum(z==target for z in a)/len(a)}
def modelSteps(e,model,scenario):
 belief=.5;h=model['hazard'];mu=model['meanSuccess'];like=model['likelihood']
 def pick(b):return int((1-b)*mu['1'][1]+b*mu['3'][1]>(1-b)*mu['1'][0]+b*mu['3'][0])
 def update(b,a,y):
  p1=like['1'][a][y];p3=like['3'][a][y];post=b*p3/((1-b)*p1+b*p3);return post*(1-h)+(1-post)*h
 for row in e['env']['trainRows']:
  a=pick(belief);belief=update(belief,a,row['real'][a])
 out=[]
 for row in e['env']['postRows']:
  a=pick(belief);y=row[scenario][a];out.append({'action':a,'score':y});belief=belief*(1-h)+(1-belief)*h if row['t']<p['withholdRounds'] else update(belief,a,y)
 return out
def signp(v):
 ob=mean(v);return sum(mean(s*x for s,x in zip(z,v))>=ob-1e-14 for z in itertools.product((-1,1),repeat=len(v)))/2**len(v)
def holm(ps):
 order=sorted(range(len(ps)),key=lambda i:ps[i]);out=[0]*len(ps);last=0
 for j,i in enumerate(order):last=max(last,min(1,ps[i]*(len(ps)-j)));out[i]=last
 return out
origins=[]
for d in D:
 v={};routeStats={k:{'focusReturn':0,'branches':0,'virtualEvents':0,'existingNativeEndpoint':0,'nonzeroPhasePulses':0} for k in ('warp','native27','matched27')};resources={f'{route}|{typ}':{'branches':0,'unaugmentedGateTransitions':0,'augmentedTransitions':0,'newEndpointEvents':0,'existingEndpointForcedEvents':0,'deliveredSignals':0,'nonzeroSignals':0,'declaredSignalHouseReads':0,'instrumentationHouseReads':0,'phasePulses':0,'nonzeroPhasePulses':0,'focusReturns':0,'firstFocusTransitionTotal':0} for route in ('warp','native27','matched27') for typ in TYPES};pre={k:{'everWarp':0,'endsWarp':0,'episodes':0} for k in routeStats};offsets=[]
 for e in d['episodes']:
  for route in routeStats:
   tr=e['training'][route]['tracks']['real'];pre[route]['everWarp']+=int(any(q['to'] in (3,6) for s in tr for q in s['path']));pre[route]['endsWarp']+=int(e['origins'][route] in (3,6));pre[route]['episodes']+=1
   for typ in TYPES:
    for scenario in ('same','reversed'):
     for mem in (('retain','reset','donor') if scenario=='same' and typ in ('natural','global','focus_phase','entry') else ('retain',)):
      arms=[a for a in e['post'] if (a['route'],a['type'],a['scenario'],a['memory'])==(route,typ,scenario,mem)];assert len(arms)==len(e['shocks']);target=preferred[e['env']['mode' if scenario=='same' else 'other']];ms=[metric(a['steps'],target) for a in arms]
      for field in ('recovered','restrictedTransitions','gridAccuracy','preferredActionFraction'):v.setdefault(f'{route}|{typ}|{scenario}|{mem}|{field}',[]).append(mean(x[field] for x in ms))
   for a in e['post']:
    if a['route']!=route or a['scenario']!='same' or a['memory']!='retain':continue
    typ=a['type'];seq=[q for step in a['steps'][:p['primaryDecisions']] for q in step['path']];target=(3,6) if route=='warp' else (2,7);rr=resources[f'{route}|{typ}'];rr['branches']+=1;rr['augmentedTransitions']+=sum(q['virtual'] for q in seq);rr['unaugmentedGateTransitions']+=sum(not q['virtual'] for q in seq);rr['newEndpointEvents']+=sum(q['virtual'] and not q['wasNative'] for q in seq);rr['existingEndpointForcedEvents']+=sum(q['virtual'] and q['wasNative'] for q in seq);rr['deliveredSignals']+=len(seq) if typ in ('global','focus_plain','focus_phase','phase_yoked') else 0;rr['nonzeroSignals']+=sum(q['appliedSignal']!=0 for q in seq);rr['declaredSignalHouseReads']+=sum(sum(q['globalCounts']) if typ=='global' else sum(q['focusCounts']) if typ in ('focus_plain','focus_phase','phase_yoked') else 0 for q in seq);rr['instrumentationHouseReads']+=sum(sum(q['globalCounts'])+sum(q['focusCounts'])*(2 if typ in ('focus_phase','phase_yoked') else 1) for q in seq);rr['phasePulses']+=sum(q['pulse'] is not None for q in seq);rr['nonzeroPhasePulses']+=sum(q['pulse'] is not None and q['pulse']['delta']!=0 for q in seq);first=next((j+1 for j,q in enumerate(seq) if q['to'] in target or q['postZone'] in target),None);rr['focusReturns']+=int(first is not None);rr['firstFocusTransitionTotal']+=0 if first is None else first
   for a in e['post']:
    if a['route']!=route or a['type']!='focus_phase' or a['scenario']!='same' or a['memory']!='retain':continue
    seq=[q for s in a['steps'][:p['primaryDecisions']] for q in s['path']];target=(3,6) if route=='warp' else (2,7);t=routeStats[route];t['branches']+=1;t['focusReturn']+=int(any(q['to'] in target or q['postZone'] in target for q in seq));t['nonzeroPhasePulses']+=sum(q['pulse'] is not None and q['pulse']['delta']!=0 for q in seq)
   for a in e['post']:
    if a['route']==route and a['type']=='entry' and a['scenario']=='same' and a['memory']=='retain':
     first=a['steps'][0]['path'][0];routeStats[route]['virtualEvents']+=int(first['virtual']);routeStats[route]['existingNativeEndpoint']+=int(first['wasNative'])
  for scenario in ('same','reversed'):
   target=preferred[e['env']['mode' if scenario=='same' else 'other']]
   for mem in ('retain','reset','donor'):
    a=next(x for x in e['directPost'] if x['memory']==mem and x['scenario']==scenario);z=metric(a['steps'],target)
    for f in ('recovered','gridAccuracy','preferredActionFraction'):v.setdefault(f'direct|{scenario}|{mem}|{f}',[]).append(z[f])
   z=metric(modelSteps(e,m['calibratedTaskModel'],scenario),target)
   for f in ('recovered','gridAccuracy'):v.setdefault(f'fullHistory|{scenario}|{f}',[]).append(z[f])
   for action in (0,1):
    a=[{'action':action,'score':q[scenario][action]} for q in e['env']['postRows']];z=metric(a,target)
    for f in ('recovered','gridAccuracy'):v.setdefault(f'fixed{action}|{scenario}|{f}',[]).append(z[f])
 origins.append({'lineage':d['lineage'],'episodes':len(d['episodes']),'means':{k:mean(x) for k,x in v.items()},'routeStats':routeStats,'resources':resources,'pretraining':pre})
def get(o,route,typ,mem='retain'):return o['means'][f'{route}|{typ}|same|{mem}|recovered']
contrasts={
 'phase_vs_natural':[get(o,'warp','focus_phase')-get(o,'warp','natural') for o in origins],
 'phase_vs_global':[get(o,'warp','focus_phase')-get(o,'warp','global') for o in origins],
 'phase_vs_matched27':[get(o,'warp','focus_phase')-get(o,'matched27','focus_phase') for o in origins],
 'phase_vs_yoked_phase':[get(o,'warp','focus_phase')-get(o,'warp','phase_yoked') for o in origins],
 'phase_vs_plain':[get(o,'warp','focus_phase')-get(o,'warp','focus_plain') for o in origins],
 'phase_retained_vs_reset':[get(o,'warp','focus_phase')-get(o,'warp','focus_phase','reset') for o in origins],
 'phase_retained_vs_donor':[get(o,'warp','focus_phase')-get(o,'warp','focus_phase','donor') for o in origins],
 'entry_vs_sham':[get(o,'warp','entry')-get(o,'warp','sham_entry') for o in origins],
 'entry_specificity':[(get(o,'warp','entry')-get(o,'warp','sham_entry'))-(get(o,'matched27','entry')-get(o,'matched27','sham_entry')) for o in origins],
 'entry_vs_global':[get(o,'warp','entry')-get(o,'warp','global') for o in origins]}
raw=[signp(x) for x in contrasts.values()];adj=holm(raw);tests={k:{'meanDifference':mean(xs),'originDifferences':xs,'oneSidedSignFlipP':raw[i],'holmP':adj[i],'threshold':p['minimumAdvantage'],'passes':mean(xs)>=p['minimumAdvantage'] and adj[i]<=.05} for i,(k,xs) in enumerate(contrasts.items())};phaseKeys=list(contrasts)[:7];entryKeys=list(contrasts)[7:];classes={'phase':'REGISTERED_PHASE_CHANNEL_SPECIFIC_ADVANTAGE' if all(tests[k]['passes'] for k in phaseKeys) else 'NO_REGISTERED_PHASE_CHANNEL_SPECIFIC_ADVANTAGE','entry':'REGISTERED_ENGINEERED_ENTRY_SPECIFIC_ADVANTAGE' if all(tests[k]['passes'] for k in entryKeys) else 'NO_REGISTERED_ENGINEERED_ENTRY_SPECIFIC_ADVANTAGE'}
allmeans={k:mean(o['means'][k] for o in origins) for k in origins[0]['means']};totals={route:{k:sum(o['routeStats'][route][k] for o in origins) for k in ('focusReturn','branches','virtualEvents','existingNativeEndpoint','nonzeroPhasePulses')} for route in ('warp','native27','matched27')};preTotal={route:{k:sum(o['pretraining'][route][k] for o in origins) for k in ('everWarp','endsWarp','episodes')} for route in totals};shortest={str(z):{'warp':dist.shortest(z,(3,6)),'native27':dist.shortest(z,(2,7)),'matched27':dist.shortest(z,(2,7),True)} for z in (1,4,8)}
resourceTotals={k:{f:sum(o['resources'][k][f] for o in origins) for f in ('branches','unaugmentedGateTransitions','augmentedTransitions','newEndpointEvents','existingEndpointForcedEvents','deliveredSignals','nonzeroSignals','declaredSignalHouseReads','instrumentationHouseReads','phasePulses','nonzeroPhasePulses','focusReturns','firstFocusTransitionTotal')} for k in origins[0]['resources']}
out={'schema':'amelia.syzygy-outcome/v1','resourceTotals':resourceTotals,'registrationSha256':H(pb),'priorModelSha256':H(mb),'runSha256':H(rb),'preferredActionsFromPrior':preferred,'classification':classes,'means':allmeans,'comparisons':tests,'origins':origins,'totals':totals,'pretraining':preTotal,'nativeShortestPaths':shortest,'limitations':['Remote scalar access and phase pulses are explicitly engineered; no literal higher-dimensional or naturally present shortcut has been shown.','Synthetic entry temporarily adds an edge and forces its target, and can duplicate an existing native target; it is not an unmodified native route.','Native 2/7-start can enter 3/6 during training.','The learned preferred action comes from prior calibration and need not be optimal for every individual grid.','Eight historical origins later shared input.']};Path(sys.argv[6]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'classification':classes,'comparisons':tests,'totals':totals,'pretraining':preTotal,'shortest':shortest}))
