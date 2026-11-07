"""Independently audit and aggregate the House relay experiment by world origin."""
import hashlib,itertools,json,re,statistics,subprocess,sys
from collections import defaultdict
from pathlib import Path
if len(sys.argv)!=7:raise SystemExit('Usage: aggregate.py PLAN SCRIPT ADAPTER AUDITOR ARTIFACT_ROOT OUTPUT_DIR')
plan_path,script_path,adapter_path,audit_path=map(Path,sys.argv[1:5]);root=Path(sys.argv[5]);out=Path(sys.argv[6]);here=Path(__file__).parent
H=lambda b:hashlib.sha256(b).hexdigest();plan_bytes=plan_path.read_bytes();plan=json.loads(plan_bytes)
for k,p in [('scriptSha256',script_path),('adapterSha256',adapter_path),('auditSha256',audit_path),('aggregatorSha256',Path(__file__)),('prepareSha256',here/'prepare.mjs'),('relaySha256',here/'relay.mjs'),('runtimeAuditSha256',here/'audit-runtime.mjs')]:assert H(p.read_bytes())==plan[k],k
out.mkdir(parents=True,exist_ok=True);shards={};problems=[]
for p in sorted(root.rglob('result.json')):
 try:
  raw=p.read_bytes();d=json.loads(raw);i=d.get('history')
  if i in shards:raise ValueError('duplicate history')
  if d.get('status')!='COMPLETE':raise ValueError(f"status {d.get('status')}: {d.get('error')}")
  runtime=json.loads((p.parent/'runtime-audit.json').read_text())
  assert runtime['schema']=='amelia.oracle-house-relay-runtime-audit/v1' and runtime['status']=='VERIFIED'
  assert runtime['history']==i and runtime['lineage']==d['lineage'] and runtime['resultSha256']==H(raw)
  assert runtime['planSha256']==H(plan_bytes) and runtime['auditSha256']==plan['runtimeAuditSha256']
  a=subprocess.run([sys.executable,str(audit_path),str(plan_path),str(script_path),str(p)],capture_output=True,text=True)
  if a.returncode:raise ValueError('task/prompt audit failed: '+a.stderr[-800:])
  shards[i]=(d,raw,json.loads(a.stdout),runtime)
 except Exception as e:problems.append({'path':str(p),'error':str(e)})
expected={h['id'] for h in plan['histories']};missing=sorted(expected-set(shards))
summary={'schema':'amelia.oracle-house-relay-summary/v1','planSha256':H(plan_bytes),'historiesExpected':len(expected),
 'historiesComplete':len(shards),'missingHistories':missing,'problems':problems,'worldOriginLineages':8}
for i,(_,raw,_,runtime) in shards.items():
 (out/f'history-{i:02}.json').write_bytes(raw);(out/f'runtime-audit-{i:02}.json').write_text(json.dumps(runtime,indent=2)+'\n')
if missing or problems or set(shards)!=expected:
 summary['status']='INCOMPLETE';(out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary));raise SystemExit(1)
route=('warp','control');house=('native','permuted');relays=('live','misaligned','masked');cells={};items=[]
totals={'modelCalls':0,'inputTokens':0,'outputTokens':0,'elapsedMs':0,'stalls':0,'invalidFinalCandidates':0,'gateSteps':0,'signalPivotalSteps':0,'runtimeReplayedGates':0,'runtimeRelaysChecked':0}
responsiveness={'firstPromptPairs':0,'sameAfterRedactingHouse':0,'firstCandidateLiveVsMaskedDifferent':0,'firstCandidateLiveVsMisalignedDifferent':0,'separatedReadouts':0,'minimumLiveMisalignedSeparation':None}
def avg(values):return statistics.mean(values)
def redact(p):return re.sub(r'House gate-learning contrast \(stay minus transition\): [^;]+;', 'House gate-learning contrast (stay minus transition): [REDACTED];',p)
for i in sorted(shards):
 d,_,audit,runtime=shards[i];runs={(x['route'],x['house'],x['relay']):x for x in d['runs']};assert len(runs)==12
 item={'history':i,'lineage':d['lineage'],'arms':{},'breakdown':runs[('warp','native','live')]['breakdown'],'auditResultSha256':audit['resultSha256']}
 totals['runtimeReplayedGates']+=runtime['gatesReplayed'];totals['runtimeRelaysChecked']+=runtime['relaysChecked']
 for k,r in runs.items():
  name=':'.join(k);item['arms'][name]={'heldout':r['finalHeldout']['passed'],'public':r['finalPublic']['passed'],'before':r['before']['passed'],'shocked':r['shocked']['passed'],'baselineHeldout':r['baselineHeldout']['passed'],'calls':len(r['rounds']),'steps':len(r['gates']),'stall':r['stall']}
  c=cells.setdefault(name,{'heldout':[],'public':[],'calls':0,'steps':0,'stalls':0})
  c['heldout'].append(r['finalHeldout']['passed']);c['public'].append(r['finalPublic']['passed']);c['calls']+=len(r['rounds']);c['steps']+=len(r['gates']);c['stalls']+=int(r['stall'])
  totals['stalls']+=int(r['stall']);totals['invalidFinalCandidates']+=int(r['finalHeldout']['invalid']);totals['gateSteps']+=len(r['gates']);totals['signalPivotalSteps']+=sum(g['pivotal'] for g in r['gates'])
  for x in r['rounds']:
   u=x.get('usage') or {};totals['modelCalls']+=1;totals['inputTokens']+=u.get('input_tokens',0);totals['outputTokens']+=u.get('output_tokens',0);totals['elapsedMs']+=x.get('elapsedMs',0)
   delta=abs(x['houseReadout']['live']-x['houseReadout']['misaligned']);responsiveness['separatedReadouts']+=int(delta>=plan['minHouseSeparation'])
   current=responsiveness['minimumLiveMisalignedSeparation'];responsiveness['minimumLiveMisalignedSeparation']=delta if current is None else min(current,delta)
 for rt,h in itertools.product(route,house):
  live,mis,masked=(runs[(rt,h,q)] for q in ('live','misaligned','masked'))
  if all(x['rounds'] for x in (live,mis,masked)):
   l,m,k=(x['rounds'][0] for x in (live,mis,masked));responsiveness['firstPromptPairs']+=1
   responsiveness['sameAfterRedactingHouse']+=int(redact(l['prompt'])==redact(m['prompt'])==redact(k['prompt']))
   responsiveness['firstCandidateLiveVsMaskedDifferent']+=int(l['candidate']!=k['candidate'])
   responsiveness['firstCandidateLiveVsMisalignedDifferent']+=int(l['candidate']!=m['candidate'])
 score=lambda r,h,q:runs[(r,h,q)]['finalHeldout']['passed']
 effect=lambda r,q:avg(score(r,h,'live')-score(r,h,q) for h in house)
 item['warpLiveVsMasked']=effect('warp','masked');item['warpLiveVsMisaligned']=effect('warp','misaligned')
 item['warpInteraction']=effect('warp','masked')-effect('control','masked')
 item['houseUnderLive']=avg(score(r,'native','live')-score(r,'permuted','live') for r in route)
 item['controlLiveVsMasked']=effect('control','masked');item['routeLive']=avg(score('warp',h,'live')-score('control',h,'live') for h in house)
 items.append(item)
for c in cells.values():c['meanHeldoutOutOf8']=avg(c.pop('heldout'));c['meanPublicOutOf6']=avg(c.pop('public'))
def contrast(key,two_sided=False):
 groups=defaultdict(list)
 for x in items:groups[x['lineage']].append(x[key])
 assert len(groups)==8 and all(len(v)==2 for v in groups.values())
 per={k:avg(v) for k,v in sorted(groups.items())};vals=list(per.values());obs=sum(vals)
 sums=[sum(v*s for v,s in zip(vals,signs)) for signs in itertools.product((-1,1),repeat=8)]
 extreme=sum(abs(z)>=abs(obs)-1e-12 for z in sums) if two_sided else sum(z>=obs-1e-12 for z in sums)
 return {'perLineageDifferenceOutOf8':per,'meanDifferenceOutOf8':avg(vals),'meanFractionDifference':avg(vals)/8,'conditionalSignFlipP':extreme/256,'sides':'two' if two_sided else 'one_positive','extremeAssignments':extreme,'assignments':256}
primary={k:contrast(k) for k in ('warpLiveVsMasked','warpLiveVsMisaligned','warpInteraction')}
ranked=sorted(primary,key=lambda k:primary[k]['conditionalSignFlipP']);running=0
for i,k in enumerate(ranked):
 running=max(running,min(1.0,primary[k]['conditionalSignFlipP']*(len(ranked)-i)));primary[k]['holmAdjustedP']=running
breakdowns=sum(x['breakdown'] for x in items);calibration=breakdowns>=plan['minimumBreakdownHistories']
for k,c in primary.items():
 c['practicalThresholdMet']=c['meanFractionDifference']>=plan['practicalFraction'];c['holmThresholdMet']=c['holmAdjustedP']<=0.05
 c['classification']='INCONCLUSIVE_DISRUPTION_CALIBRATION' if not calibration else ('EXPLORATORY_SIGNAL' if c['practicalThresholdMet'] and c['holmThresholdMet'] else 'NO_CLEAR_SIGNAL_AT_REGISTERED_THRESHOLD')
met=calibration and all(x['practicalThresholdMet'] and x['holmThresholdMet'] for x in primary.values())
summary.update({'status':'COMPLETE','classification':'INCONCLUSIVE_DISRUPTION_CALIBRATION' if not calibration else ('EXPLORATORY_HOUSE_RELAY_RECOVERY_LEAD' if met else 'NO_JOINT_HOUSE_RELAY_RECOVERY_ADVANTAGE_OBSERVED'),
 'exploratory':True,'breakdownHistories':breakdowns,'breakdownMinimum':plan['minimumBreakdownHistories'],'breakdownCalibrationMet':calibration,
 'primaryContrasts':primary,'secondaryContrasts':{k:contrast(k,True) for k in ('houseUnderLive','controlLiveVsMasked','routeLive')},
 'practicalFraction':plan['practicalFraction'],'armSummaries':cells,'histories':items,'responsiveness':responsiveness,'totals':totals,
 'interpretation':'House triplets are engineered permutations, the 2/7 route is adapted, and the comparison lineages later shared world input. The transmitted scalar is a gate-learning contrast, not a task-performance signal. World-level sign-flip p values require conditional exchangeability.'})
(out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps({'status':summary['status'],'classification':summary['classification'],'breakdownHistories':breakdowns,'primaryContrasts':primary,'secondaryContrasts':summary['secondaryContrasts'],'responsiveness':responsiveness,'totals':totals}))
