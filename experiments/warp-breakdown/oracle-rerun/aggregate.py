"""Audit and aggregate Oracle-native multi-lineage Warp histories by world of origin."""
import hashlib,itertools,json,statistics,subprocess,sys
from collections import defaultdict
from pathlib import Path
if len(sys.argv)!=7:raise SystemExit('Usage: aggregate.py PLAN SCRIPT ADAPTER AUDITOR ARTIFACT_ROOT OUTPUT_DIR')
plan_path,script_path,adapter_path,audit_path=map(Path,sys.argv[1:5]);root=Path(sys.argv[5]);out=Path(sys.argv[6])
H=lambda b:hashlib.sha256(b).hexdigest();plan_bytes=plan_path.read_bytes();plan=json.loads(plan_bytes)
for k,p in [('scriptSha256',script_path),('adapterSha256',adapter_path),('auditSha256',audit_path),('aggregatorSha256',Path(__file__))]:assert H(p.read_bytes())==plan[k],k
out.mkdir(parents=True,exist_ok=True);shards={};problems=[]
for p in sorted(root.rglob('result.json')):
 try:
  raw=p.read_bytes();d=json.loads(raw);i=d.get('history')
  if i in shards:raise ValueError('duplicate history')
  if d.get('status')!='COMPLETE':raise ValueError(f"status {d.get('status')}: {d.get('error')}")
  a=subprocess.run([sys.executable,str(audit_path),str(plan_path),str(script_path),str(p)],capture_output=True,text=True)
  if a.returncode:raise ValueError('audit failed: '+a.stderr[-500:])
  shards[i]=(d,raw,json.loads(a.stdout))
 except Exception as e:problems.append({'path':str(p),'error':str(e)})
expected={h['id'] for h in plan['histories']};missing=sorted(expected-set(shards))
summary={'schema':'amelia.oracle-warp-multilineage-summary/v1','planSha256':H(plan_bytes),'historiesExpected':len(expected),
 'historiesComplete':len(shards),'missingHistories':missing,'problems':problems,'worldOriginLineages':8}
for i,(_,raw,_) in shards.items():(out/f'history-{i:02}.json').write_bytes(raw)
if missing or problems or set(shards)!=expected:
 summary['status']='INCOMPLETE';(out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps({'status':'INCOMPLETE','missing':missing,'problems':problems}));raise SystemExit(1)
means={};items=[];memory=[];totals={'modelCalls':0,'inputTokens':0,'outputTokens':0,'elapsedMs':0,'stalls':0,'invalidFinalCandidates':0}
for i in sorted(shards):
 d,_,audit=shards[i];runs={(x['route'],x['disruption'],x['feedbackCondition']):x for x in d['runs']};assert len(runs)==12
 item={'history':i,'lineage':d['lineage'],'arms':{},'breakdown':runs[('warp','acute','correct')]['breakdown'],'auditResultSha256':audit['resultSha256']}
 for (route,disruption,kind),r in runs.items():
  k=f'{route}_{disruption}_{kind}';item['arms'][k]={'heldout':r['finalHeldout']['passed'],'public':r['finalPublic']['passed'],
    'baselineHeldout':r['baselineHeldout']['passed'],'before':r['before']['passed'],'shocked':r['shocked']['passed'],
    'calls':len(r['rounds']),'steps':len(r['gates']),'stall':r['stall']}
  v=means.setdefault(k,{'heldout':[],'public':[],'calls':0,'steps':0,'stalls':0,'pivotalSteps':0,'codedSteps':0})
  v['heldout'].append(r['finalHeldout']['passed']);v['public'].append(r['finalPublic']['passed']);v['calls']+=len(r['rounds']);v['steps']+=len(r['gates']);v['stalls']+=int(r['stall'])
  v['pivotalSteps']+=sum(g['pivotal'] for g in r['gates']);v['codedSteps']+=sum(g['cue'] is not None for g in r['gates'])
  totals['stalls']+=int(r['stall']);totals['invalidFinalCandidates']+=int(r['finalHeldout']['invalid'])
  for x in r['rounds']:
   u=x.get('usage') or {};totals['modelCalls']+=1;totals['inputTokens']+=u.get('input_tokens',0);totals['outputTokens']+=u.get('output_tokens',0);totals['elapsedMs']+=x.get('elapsedMs',0)
 item['routeDifference']=item['arms']['warp_acute_correct']['heldout']-item['arms']['control_acute_correct']['heldout']
 item['feedbackDifference']=item['arms']['warp_acute_correct']['heldout']-item['arms']['warp_acute_unrelated']['heldout']
 item['acuteGradualInteraction']=item['routeDifference']-(item['arms']['warp_gradual_correct']['heldout']-item['arms']['control_gradual_correct']['heldout'])
 m={'history':i,'lineage':d['lineage']}
 for route in ('warp','control'):
  for component in ('house','pfm'):
   for background in ('correct','masked'):
    a=d['memoryIntervention'][f'{route}:{component}:{background}:correct'];b=d['memoryIntervention'][f'{route}:{component}:{background}:masked']
    m[f'{route}_{component}_{background}_dwellDifference']=a['dwell']-b['dwell']
    m[f'{route}_{component}_{background}_transferDifference']=a['finalHeldout']['passed']-b['finalHeldout']['passed']
 for x in d['memoryIntervention'].values():
  u=x.get('usage') or {};totals['modelCalls']+=1;totals['inputTokens']+=u.get('input_tokens',0);totals['outputTokens']+=u.get('output_tokens',0);totals['elapsedMs']+=x.get('elapsedMs',0)
 items.append(item);memory.append(m)
for v in means.values():v['meanHeldoutOutOf8']=statistics.mean(v.pop('heldout'));v['meanPublicOutOf6']=statistics.mean(v.pop('public'))
def contrast(key):
 grouped=defaultdict(list)
 for x in items:grouped[x['lineage']].append(x[key])
 assert len(grouped)==8 and all(len(v)==2 for v in grouped.values())
 per={k:statistics.mean(v) for k,v in sorted(grouped.items())};values=list(per.values());observed=sum(values)
 extreme=sum(sum(v*s for v,s in zip(values,signs))>=observed-1e-12 for signs in itertools.product((-1,1),repeat=8))
 return {'perLineageDifferenceOutOf8':per,'meanDifferenceOutOf8':statistics.mean(values),'meanFractionDifference':statistics.mean(values)/8,
  'conditionalOneSidedSignFlipP':extreme/256,'extremeAssignments':extreme,'assignments':256}
route=contrast('routeDifference');feedback=contrast('feedbackDifference');interaction=contrast('acuteGradualInteraction')
breakdowns=sum(x['breakdown'] for x in items);calibration=breakdowns>=plan['minimumBreakdownHistories']
meets=all(x['meanFractionDifference']>=plan['practicalFraction'] and x['conditionalOneSidedSignFlipP']<=0.05 for x in (route,feedback,interaction))
classification='INCONCLUSIVE_DISRUPTION_CALIBRATION' if not calibration else ('EXPLORATORY_THREE_CONTRAST_LEAD' if meets else 'NO_THREE_CONTRAST_ADVANTAGE_OBSERVED')
summary.update({'status':'COMPLETE','classification':classification,'exploratory':True,'breakdownHistories':breakdowns,'breakdownMinimum':plan['minimumBreakdownHistories'],
 'breakdownCalibrationMet':calibration,'routeComparison':route,'feedbackComparison':feedback,'acuteGradualInteraction':interaction,
 'practicalFraction':plan['practicalFraction'],'allThreeThresholdsMet':meets,'armSummaries':means,'memoryInterventions':memory,'histories':items,'totals':totals,
 'interpretation':'Two fresh task histories for each of eight separately raised world-origin lineages; later world input was shared. World-level sign flips require conditional exchangeability and are exploratory, not independent confirmation.'})
(out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps({'status':summary['status'],'classification':classification,'histories':len(items),'breakdownHistories':breakdowns,
 'route':route,'feedback':feedback,'interaction':interaction,'totals':totals}))
