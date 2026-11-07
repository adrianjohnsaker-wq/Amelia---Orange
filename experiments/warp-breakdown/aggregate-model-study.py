"""Verify and aggregate 16 independently seeded, paired model-study histories."""
import hashlib
import itertools
import json
import statistics
import subprocess
import sys
from pathlib import Path

if len(sys.argv)!=6:
    raise SystemExit('Usage: aggregate-model-study.py PLAN SCRIPT AUDITOR ARTIFACT_ROOT OUTPUT_DIR')
plan_path,script_path,audit_path=map(Path,sys.argv[1:4]);root=Path(sys.argv[4]);out=Path(sys.argv[5])
plan_bytes=plan_path.read_bytes();plan=json.loads(plan_bytes)
assert hashlib.sha256(script_path.read_bytes()).hexdigest()==plan['scriptSha256']
assert hashlib.sha256(audit_path.read_bytes()).hexdigest()==plan['auditSha256']
assert hashlib.sha256(Path(__file__).read_bytes()).hexdigest()==plan['aggregatorSha256']
out.mkdir(parents=True,exist_ok=True)
shards={};problems=[]
for p in sorted(root.rglob('result.json')):
    try:
        d=json.loads(p.read_bytes());i=d.get('history')
        if i in shards:raise ValueError('duplicate history')
        if d.get('status')!='COMPLETE':raise ValueError(f"status {d.get('status')}: {d.get('error')}")
        check=subprocess.run([sys.executable,str(audit_path),str(plan_path),str(script_path),str(p)],capture_output=True,text=True)
        if check.returncode:raise ValueError('independent audit failed: '+check.stderr[-400:])
        shards[i]=(d,p.read_bytes(),json.loads(check.stdout))
    except Exception as e:problems.append({'path':str(p),'error':str(e)})
expected={h['id'] for h in plan['histories']};missing=sorted(expected-set(shards))
summary={'schema':'amelia.warp-model-study-summary/v1','planSha256':hashlib.sha256(plan_bytes).hexdigest(),
         'historiesExpected':len(expected),'historiesComplete':len(shards),'missingHistories':missing,'problems':problems}
for i,(_,raw,_) in shards.items():(out/f'history-{i:02}.json').write_bytes(raw)
if missing or problems or set(shards)!=expected:
    summary['status']='INCOMPLETE';(out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
    print(json.dumps({'status':summary['status'],'missing':missing,'problems':problems}));raise SystemExit(1)

histories=[];gate_counts={};memory=[]
for i in sorted(shards):
    d,_,audit=shards[i];runs={(x['route'],x['feedbackCondition']):x for x in d['runs']}
    assert len(runs)==6
    values={f'{route}_{kind}':runs[(route,kind)]['finalHeldout']['passed'] for route in ('warp','control') for kind in ('correct','unrelated','masked')}
    item={'history':i,'heldout':values,'routeDifference':values['warp_correct']-values['control_correct'],
          'feedbackDifference':values['warp_correct']-values['warp_unrelated'],
          'baselineHeldout':runs[('warp','correct')]['baselineHeldout']['passed'],
          'modelCalls':sum(len(x['rounds']) for x in d['runs']),'stalls':sum(x['stall'] for x in d['runs']),
          'auditResultSha256':audit['resultSha256']}
    histories.append(item)
    for r in d['runs']:
        k=f"{r['route']}_{r['feedbackCondition']}";c=gate_counts.setdefault(k,{'attended':0,'pivotal':0,'steps':0,'stalledHistories':0})
        c['steps']+=len(r['gates']);c['pivotal']+=sum(x['pivotal'] for x in r['gates']);c['stalledHistories']+=int(r['stall'])
        c['attended']+=sum(sum(v['disposition']=='ATTEND' and v['applied'] for v in x['decisions']) for x in r['gates'])
    entry={'history':i}
    for route in ('warp','control'):
        m=d['memoryIntervention'][route]
        entry[route+'_correctBackgroundDwellDifference']=m['correctBackgroundCorrectMemory']['dwell']-m['correctBackgroundMaskedMemory']['dwell']
        entry[route+'_maskedBackgroundDwellDifference']=m['maskedBackgroundCorrectMemory']['dwell']-m['maskedBackgroundMaskedMemory']['dwell']
    memory.append(entry)

def exact(values):
    observed=sum(values);extreme=sum(sum(v*s for v,s in zip(values,signs))>=observed for signs in itertools.product((-1,1),repeat=len(values)))
    return {'meanDifferenceOfEight':sum(values)/(len(values)*8),'exactOneSidedP':extreme/(2**len(values)),
            'extremeAssignments':extreme,'assignments':2**len(values),'perHistory':values}
route=exact([h['routeDifference'] for h in histories]);feedback=exact([h['feedbackDifference'] for h in histories])
rule=lambda x:x['meanDifferenceOfEight']>=1/8 and x['exactOneSidedP']<=0.05
summary.update({'status':'COMPLETE','histories':histories,'routeComparison':route,'feedbackComparison':feedback,
  'registeredCriterionMet':rule(route) and rule(feedback),'gateCounts':gate_counts,'memoryInterventions':memory,
  'modelCalls':sum(h['modelCalls'] for h in histories),'stalls':sum(h['stalls'] for h in histories),
  'interpretation':'Conditional sign-flip tests assume exchangeability across independent synthetic histories sharing one founder; this is not an Outside-source test.'})
(out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps({'status':'COMPLETE','histories':len(histories),'modelCalls':summary['modelCalls'],
  'routeComparison':route,'feedbackComparison':feedback,'criterionMet':summary['registeredCriterionMet']}))
