"""Post-hoc synthesis: same-state gate sensitivity and held-out lineage contrasts."""
import json,math,statistics,sys
from pathlib import Path
root=Path(sys.argv[1]);s=json.loads(Path(sys.argv[2]).read_text());paths=sorted(root.glob('posthoc-gate-[0-9][0-9].json'));assert len(paths)==8
rows=[]
for path in paths:
 x=json.loads(path.read_text());assert x['planSha256']==s['planSha256']
 item={'lineage':x['lineage'],'counts':x['counts'],'links':{}}
 for gain in ('0.054','0.35'):
  a=x['counts'][gain+':warp'];b=x['counts'][gain+':control'];c=s['primaryContrasts'][gain+':routeAccuracy'];r=s['primaryContrasts'][gain+':routeRecovery']
  item['links'][gain]={'cueSensitivityRateDifference':a['cueAlternativesDiffer']/a['steps']-b['cueAlternativesDiffer']/b['steps'],
    'appliedPivotalRateDifference':a['actualCuePivotal']/a['steps']-b['actualCuePivotal']/b['steps'],
    'housePredictionAccuracyDifference':c['perLineage'][x['lineage']],'houseRecoveryDifference':r['perLineage'][x['lineage']]}
 rows.append(item)
def pearson(a,b):
 ma=statistics.mean(a);mb=statistics.mean(b);num=sum((x-ma)*(y-mb) for x,y in zip(a,b));den=math.sqrt(sum((x-ma)**2 for x in a)*sum((y-mb)**2 for y in b));return num/den if den else None
relations={}
for gain in ('0.054','0.35'):
 x=[r['links'][gain]['cueSensitivityRateDifference'] for r in rows];y=[r['links'][gain]['housePredictionAccuracyDifference'] for r in rows];z=[r['links'][gain]['houseRecoveryDifference'] for r in rows]
 relations[gain]={'pearsonCueSensitivityVsPredictionDifference':pearson(x,y),'pearsonCueSensitivityVsRecoveryDifference':pearson(x,z)}
result={'schema':'amelia.warp-mechanism-posthoc-gate-summary/v1','status':'EXPLORATORY_POSTHOC','lineages':rows,'descriptiveCorrelations':relations,
 'note':'Gate sensitivity was recomputed on the same test histories after the registered results. Correlations are descriptive across eight partly dependent origin lineages, not validation or preregistered inference.'}
print(json.dumps(result,indent=2))
