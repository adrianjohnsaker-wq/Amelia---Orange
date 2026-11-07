"""Independent audit and world-origin blocked factorial aggregation."""
import hashlib,itertools,json,statistics,subprocess,sys
from collections import defaultdict
from pathlib import Path
if len(sys.argv)!=7:raise SystemExit('Usage: aggregate.py PLAN SCRIPT ADAPTER AUDITOR ARTIFACT_ROOT OUTPUT_DIR')
plan_path,script_path,adapter_path,audit_path=map(Path,sys.argv[1:5]);root=Path(sys.argv[5]);out=Path(sys.argv[6]);here=Path(__file__).parent
H=lambda b:hashlib.sha256(b).hexdigest();plan_bytes=plan_path.read_bytes();plan=json.loads(plan_bytes)
for k,p in [('scriptSha256',script_path),('adapterSha256',adapter_path),('auditSha256',audit_path),('aggregatorSha256',Path(__file__)),('prepareSha256',here/'prepare.mjs')]:assert H(p.read_bytes())==plan[k],k
out.mkdir(parents=True,exist_ok=True);shards={};problems=[]
for p in sorted(root.rglob('result.json')):
 try:
  raw=p.read_bytes();d=json.loads(raw);i=d.get('history')
  if i in shards:raise ValueError('duplicate history')
  if d.get('status')!='COMPLETE':raise ValueError(f"status {d.get('status')}: {d.get('error')}")
  a=subprocess.run([sys.executable,str(audit_path),str(plan_path),str(script_path),str(p)],capture_output=True,text=True)
  if a.returncode:raise ValueError('audit failed: '+a.stderr[-700:])
  shards[i]=(d,raw,json.loads(a.stdout))
 except Exception as e:problems.append({'path':str(p),'error':str(e)})
expected={h['id'] for h in plan['histories']};missing=sorted(expected-set(shards))
summary={'schema':'amelia.oracle-house-prompt-factorial-summary/v1','planSha256':H(plan_bytes),'historiesExpected':len(expected),
 'historiesComplete':len(shards),'missingHistories':missing,'problems':problems,'worldOriginLineages':8}
for i,(_,raw,_) in shards.items():(out/f'history-{i:02}.json').write_bytes(raw)
if missing or problems or set(shards)!=expected:
 summary['status']='INCOMPLETE';(out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary));raise SystemExit(1)
route=('warp','control');readout=('warp_tape','control_tape');house=('native','permuted');feedback=('correct','unrelated')
cells={};items=[];totals={'modelCalls':0,'inputTokens':0,'outputTokens':0,'elapsedMs':0,'stalls':0,'invalidFinalCandidates':0,'gateSteps':0,'signalPivotalSteps':0}
def avg(values):return statistics.mean(values)
for i in sorted(shards):
 d,_,audit=shards[i];runs={(x['route'],x['readout'],x['house'],x['feedbackCondition']):x for x in d['runs']};assert len(runs)==16
 item={'history':i,'lineage':d['lineage'],'arms':{},'breakdown':runs[('warp','warp_tape','native','correct')]['breakdown'],'auditResultSha256':audit['resultSha256']}
 for k,r in runs.items():
  proposal=3 if r['route']=='warp' else 2
  name=':'.join(k);item['arms'][name]={'heldout':r['finalHeldout']['passed'],'public':r['finalPublic']['passed'],'calls':len(r['rounds']),'steps':len(r['gates']),'stall':r['stall'],
    'searchSteps':sum(g['phase']=='search' for g in r['gates']),'searchDwells':sum(g['phase']=='search' and g['from']==proposal and g['to']==proposal for g in r['gates'])}
  c=cells.setdefault(name,{'heldout':[],'public':[],'calls':0,'steps':0,'stalls':0,'signalPivotalSteps':0})
  c['heldout'].append(r['finalHeldout']['passed']);c['public'].append(r['finalPublic']['passed']);c['calls']+=len(r['rounds']);c['steps']+=len(r['gates']);c['stalls']+=int(r['stall']);c['signalPivotalSteps']+=sum(g['pivotal'] for g in r['gates'])
  totals['stalls']+=int(r['stall']);totals['invalidFinalCandidates']+=int(r['finalHeldout']['invalid']);totals['gateSteps']+=len(r['gates']);totals['signalPivotalSteps']+=sum(g['pivotal'] for g in r['gates'])
  for x in r['rounds']:
   u=x.get('usage') or {};totals['modelCalls']+=1;totals['inputTokens']+=u.get('input_tokens',0);totals['outputTokens']+=u.get('output_tokens',0);totals['elapsedMs']+=x.get('elapsedMs',0)
 score=lambda r,p,h,f:runs[(r,p,h,f)]['finalHeldout']['passed']
 item['route']=avg(score('warp',p,h,f)-score('control',p,h,f) for p,h,f in itertools.product(readout,house,feedback))
 item['prompt']=avg(score(r,'warp_tape',h,f)-score(r,'control_tape',h,f) for r,h,f in itertools.product(route,house,feedback))
 item['house']=avg(score(r,p,'native',f)-score(r,p,'permuted',f) for r,p,f in itertools.product(route,readout,feedback))
 item['interaction']=avg((score('warp','warp_tape',h,f)-score('control','warp_tape',h,f))-(score('warp','control_tape',h,f)-score('control','control_tape',h,f)) for h,f in itertools.product(house,feedback))
 item['feedback']=avg(score(r,p,h,'correct')-score(r,p,h,'unrelated') for r,p,h in itertools.product(route,readout,house))
 def metric(r,p,h,f,k):return item['arms'][':'.join((r,p,h,f))][k]
 for field,name in [('searchSteps','houseSearchSteps'),('searchDwells','houseSearchDwells'),('calls','houseModelCalls')]:
  item[name]=avg(metric(r,p,'permuted',f,field)-metric(r,p,'native',f,field) for r,p,f in itertools.product(route,readout,feedback))
 items.append(item)
for c in cells.values():c['meanHeldoutOutOf8']=avg(c.pop('heldout'));c['meanPublicOutOf6']=avg(c.pop('public'))
def contrast(key,two_sided=False):
 groups=defaultdict(list)
 for x in items:groups[x['lineage']].append(x[key])
 assert len(groups)==8 and all(len(v)==2 for v in groups.values())
 per={k:avg(v) for k,v in sorted(groups.items())};vals=list(per.values());obs=sum(vals)
 sums=[sum(v*s for v,s in zip(vals,signs)) for signs in itertools.product((-1,1),repeat=8)]
 extreme=sum(abs(z)>=abs(obs)-1e-12 for z in sums) if two_sided else sum(z>=obs-1e-12 for z in sums)
 result={'perLineageDifference':per,'meanDifference':avg(vals),'conditionalSignFlipP':extreme/256,
  'sides':'two' if two_sided else 'one_positive','extremeAssignments':extreme,'assignments':256}
 if key in ('houseSearchSteps','houseSearchDwells','houseModelCalls'):
  result['units']='model calls per arm' if key=='houseModelCalls' else 'search gate steps per arm'
 else:
  result['meanDifferenceOutOf8']=avg(vals);result['meanFractionDifference']=avg(vals)/8;result['units']='held-out cases out of 8'
 return result
contrasts={k:contrast(k,k=='house') for k in ('route','prompt','house')}
ranked=sorted(contrasts,key=lambda k:contrasts[k]['conditionalSignFlipP']);running=0
for i,k in enumerate(ranked):
 running=max(running,min(1.0,contrasts[k]['conditionalSignFlipP']*(len(ranked)-i)));contrasts[k]['holmAdjustedP']=running
breakdowns=sum(x['breakdown'] for x in items);calibration=breakdowns>=plan['minimumBreakdownHistories']
for k,c in contrasts.items():
 magnitude=abs(c['meanFractionDifference']) if k=='house' else c['meanFractionDifference']
 c['practicalThresholdMet']=magnitude>=plan['practicalFraction'];c['holmThresholdMet']=c['holmAdjustedP']<=0.05
 c['classification']='INCONCLUSIVE_DISRUPTION_CALIBRATION' if not calibration else ('EXPLORATORY_SIGNAL' if c['practicalThresholdMet'] and c['holmThresholdMet'] else 'NO_CLEAR_SIGNAL_AT_REGISTERED_THRESHOLD')
summary.update({'status':'COMPLETE','exploratory':True,'breakdownHistories':breakdowns,'breakdownMinimum':plan['minimumBreakdownHistories'],'breakdownCalibrationMet':calibration,
 'primaryContrasts':contrasts,'secondaryContrasts':{'interaction':contrast('interaction',True),'feedback':contrast('feedback',True),
   'houseSearchSteps':contrast('houseSearchSteps',True),'houseSearchDwells':contrast('houseSearchDwells',True),'houseModelCalls':contrast('houseModelCalls',True)},
 'practicalFraction':plan['practicalFraction'],'armSummaries':cells,'histories':items,'totals':totals,
 'interpretation':'Two task histories for each of eight separately raised world-origin lineages, with later shared world input. Conditional sign flips require world-level sign exchangeability. The House intervention is a synthetic rearrangement and prompt tapes are fixed shadow readouts.'})
(out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps({'status':summary['status'],'breakdownHistories':breakdowns,'primaryContrasts':contrasts,'secondaryContrasts':summary['secondaryContrasts'],'totals':totals}))
