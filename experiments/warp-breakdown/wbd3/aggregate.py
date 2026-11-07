"""Audit and aggregate the sealed WBD-3 single-founder model feasibility study."""
import hashlib,json,statistics,subprocess,sys
from pathlib import Path
if len(sys.argv)!=6:raise SystemExit('Usage: aggregate.py PLAN SCRIPT AUDITOR ARTIFACT_ROOT OUTPUT_DIR')
plan_path,script_path,audit_path=map(Path,sys.argv[1:4]);root=Path(sys.argv[4]);out=Path(sys.argv[5])
plan_bytes=plan_path.read_bytes();plan=json.loads(plan_bytes);H=lambda b:hashlib.sha256(b).hexdigest()
assert H(script_path.read_bytes())==plan['scriptSha256']
assert H(audit_path.read_bytes())==plan['auditSha256']
assert H(Path(__file__).read_bytes())==plan['aggregatorSha256']
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
summary={'schema':'amelia.wbd3-model-feasibility-summary/v1','planSha256':H(plan_bytes),'historiesExpected':len(expected),
         'historiesComplete':len(shards),'missingHistories':missing,'problems':problems,'founders':1}
for i,(_,raw,_) in shards.items():(out/f'history-{i:02}.json').write_bytes(raw)
if missing or problems or set(shards)!=expected:
 summary['status']='INCOMPLETE';(out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
 print(json.dumps({'status':'INCOMPLETE','missing':missing,'problems':problems}));raise SystemExit(1)
means={};items=[];memory=[];totals={'modelCalls':0,'inputTokens':0,'outputTokens':0,'elapsedMs':0,'stalls':0,'invalidFinalCandidates':0}
for i in sorted(shards):
 d,_,audit=shards[i];runs={(x['route'],x['disruption'],x['feedbackCondition']):x for x in d['runs']};assert len(runs)==12
 item={'history':i,'arms':{},'breakdown':runs[('warp','acute','correct')]['breakdown'],'auditResultSha256':audit['resultSha256']}
 for (route,disruption,kind),r in runs.items():
  k=f'{route}_{disruption}_{kind}';item['arms'][k]={'heldout':r['finalHeldout']['passed'],'public':r['finalPublic']['passed'],
   'baselineHeldout':r['baselineHeldout']['passed'],'before':r['before']['passed'],'shocked':r['shocked']['passed'],
   'calls':len(r['rounds']),'steps':len(r['gates']),'stall':r['stall']}
  group=means.setdefault(k,{'heldout':[],'public':[],'calls':0,'steps':0,'stalls':0,'pivotalSteps':0,'appliedAdmissions':0})
  group['heldout'].append(r['finalHeldout']['passed']);group['public'].append(r['finalPublic']['passed']);group['calls']+=len(r['rounds']);group['steps']+=len(r['gates']);group['stalls']+=int(r['stall'])
  group['pivotalSteps']+=sum(g['pivotal'] for g in r['gates'])
  group['appliedAdmissions']+=sum(sum(x['disposition']=='ATTEND' and x['applied'] for x in g['decisions']) for g in r['gates'])
  totals['stalls']+=int(r['stall']);totals['invalidFinalCandidates']+=int(r['finalHeldout']['invalid'])
  for x in r['rounds']:
   u=x.get('usage') or {};totals['modelCalls']+=1;totals['inputTokens']+=u.get('input_tokens',0);totals['outputTokens']+=u.get('output_tokens',0);totals['elapsedMs']+=x.get('elapsedMs',0)
 item['routeDifference']=item['arms']['warp_acute_correct']['heldout']-item['arms']['control_acute_correct']['heldout']
 item['feedbackDifference']=item['arms']['warp_acute_correct']['heldout']-item['arms']['warp_acute_unrelated']['heldout']
 item['acuteGradualInteraction']=item['routeDifference']-(item['arms']['warp_gradual_correct']['heldout']-item['arms']['control_gradual_correct']['heldout'])
 m={'history':i}
 for route in ('warp','control'):
  for background in ('correct','masked'):
   a=d['memoryIntervention'][f'{route}:{background}:correct'];b=d['memoryIntervention'][f'{route}:{background}:masked']
   m[f'{route}_{background}_dwellDifference']=a['dwell']-b['dwell']
   m[f'{route}_{background}_transferDifference']=a['finalHeldout']['passed']-b['finalHeldout']['passed']
 for x in d['memoryIntervention'].values():
  u=x.get('usage') or {};totals['modelCalls']+=1;totals['inputTokens']+=u.get('input_tokens',0);totals['outputTokens']+=u.get('output_tokens',0);totals['elapsedMs']+=x.get('elapsedMs',0)
 items.append(item);memory.append(m)
for v in means.values():
 v['meanHeldoutOutOf8']=statistics.mean(v.pop('heldout'));v['meanPublicOutOf6']=statistics.mean(v.pop('public'))
def contrast(key):
 values=[x[key] for x in items];return {'differencesOutOf8':values,'meanDifferenceOutOf8':statistics.mean(values),'meanFractionDifference':statistics.mean(values)/8}
route=contrast('routeDifference');feedback=contrast('feedbackDifference');interaction=contrast('acuteGradualInteraction')
breakdowns=sum(x['breakdown'] for x in items);calibration=breakdowns>=plan['minimumBreakdownHistories']
meets=all(x['meanFractionDifference']>=plan['practicalFraction'] for x in (route,feedback,interaction))
classification='INCONCLUSIVE_DISRUPTION_CALIBRATION' if not calibration else ('EXPLORATORY_THREE_CONTRAST_LEAD' if meets else 'NO_THREE_CONTRAST_ADVANTAGE_OBSERVED')
summary.update({'status':'COMPLETE','classification':classification,'feasibilityOnly':True,
 'breakdownHistories':breakdowns,'breakdownMinimum':plan['minimumBreakdownHistories'],'breakdownCalibrationMet':calibration,
 'routeComparison':route,'feedbackComparison':feedback,'acuteGradualInteraction':interaction,
 'practicalFraction':plan['practicalFraction'],'allThreeDescriptiveThresholdsMet':meets,
 'armSummaries':means,'memoryInterventions':memory,'histories':items,'totals':totals,
 'interpretation':'Eight seeded task histories conditional on one preserved receiver founder. Exploratory descriptive contrasts; no independent-founder replication or confirmatory inference.'})
(out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps({'status':summary['status'],'classification':classification,'histories':len(items),'breakdownHistories':breakdowns,
 'route':route,'feedback':feedback,'interaction':interaction,'totals':totals}))
