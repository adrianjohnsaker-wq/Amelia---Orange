"""Exploratory route selection by cue sensitivity measured on training histories."""
import json,math,statistics,sys
from pathlib import Path
root=Path(sys.argv[1]);s=json.loads(Path(sys.argv[2]).read_text());out={}
def pearson(a,b):
 ma=statistics.mean(a);mb=statistics.mean(b);num=sum((x-ma)*(y-mb) for x,y in zip(a,b));den=math.sqrt(sum((x-ma)**2 for x in a)*sum((y-mb)**2 for y in b));return num/den if den else None
for gain in (0.054,0.35):
 rows=[]
 for i in range(1,9):
  p=root/f'posthoc-train-gate-{i:02}.json';d=json.loads(p.read_text());assert d['planSha256']==s['planSha256']
  a=d['counts'][f'{gain}:warp'];b=d['counts'][f'{gain}:control'];dA=a['cueAlternativesDiffer']/a['steps'];dB=b['cueAlternativesDiffer']/b['steps']
  choice='warp' if dA>dB else 'control'
  j=next(x for x in s['lineageResults'] if x['lineage']==d['lineage'] and x['gain']==gain)
  w=j['routes']['warp']['models']['house'];c=j['routes']['control']['models']['house'];raw=j['routes']['warp']['models']['last4']
  selected=j['routes'][choice]['models']['house']
  rows.append({'lineage':d['lineage'],'trainWarpSensitiveSteps':a['cueAlternativesDiffer'],'trainControlSensitiveSteps':b['cueAlternativesDiffer'],'stepsPerRoute':a['steps'],
   'selectedRoute':choice,'testWarpAccuracy':w['accuracy'],'testControlAccuracy':c['accuracy'],'testSelectedAccuracy':selected['accuracy'],
   'testWarpCases':w['heldoutCases'],'testControlCases':c['heldoutCases'],'testSelectedCases':selected['heldoutCases'],'testLast4Cases':raw['heldoutCases']})
 sensitivity=[(x['trainWarpSensitiveSteps']-x['trainControlSensitiveSteps'])/x['stepsPerRoute'] for x in rows]
 prediction=[x['testWarpAccuracy']-x['testControlAccuracy'] for x in rows];recovery=[x['testWarpCases']-x['testControlCases'] for x in rows]
 out[str(gain)]={'selectionRule':'Choose Warp when its training same-state cue sensitivity rate is strictly larger; otherwise choose control. Rule devised after inspecting main results.',
  'descriptiveTrainingSensitivityVsTestAccuracyPearson':pearson(sensitivity,prediction),'descriptiveTrainingSensitivityVsTestRewardPearson':pearson(sensitivity,recovery),
  'selectedWarp':sum(x['selectedRoute']=='warp' for x in rows),'meanSelectedAccuracy':statistics.mean(x['testSelectedAccuracy'] for x in rows),
  'meanWarpAccuracy':statistics.mean(x['testWarpAccuracy'] for x in rows),'meanControlAccuracy':statistics.mean(x['testControlAccuracy'] for x in rows),
  'meanSelectedCases':statistics.mean(x['testSelectedCases'] for x in rows),'meanWarpCases':statistics.mean(x['testWarpCases'] for x in rows),
  'meanControlCases':statistics.mean(x['testControlCases'] for x in rows),'meanLast4Cases':statistics.mean(x['testLast4Cases'] for x in rows),'lineages':rows}
print(json.dumps({'schema':'amelia.warp-mechanism-crossfold-posthoc/v1','status':'EXPLORATORY_POSTHOC','gains':out,
 'note':'Selection rule was devised after inspecting test results, although route sensitivity used training histories only. This is not an independently registered validation; repeat on fresh seeds and founders.'},indent=2))
