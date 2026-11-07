"""Post-hoc descriptive timing and gate-agreement summaries; not additional registered tests."""
import json,statistics,sys
from pathlib import Path
root=Path(sys.argv[1]);outcome=json.loads(Path(sys.argv[2]).read_text());D=[json.loads(p.read_text()) for p in sorted(root.glob('S05W*|0/result.json'))];assert len(D)==8
traces=[];agreement=[0,0];updated={'warp':[0,0],'matched':[0,0]};transitions={'warp':0,'matched':0};proposals={'warp':[0,0],'matched':[0,0]}
for d in D:
 series={}
 for route,kind in (('warp','real'),('matched','real'),('warp','yoked'),('warp','frozen')):
  xs=[[] for _ in range(5)]
  for e in d['episodes']:
   a=next(a for a in e['arms'] if a['route']==route and a['kind']==kind)
   for o,q in zip(e['real']['rows'],a['steps']):
    if 0<=o['age']<5:xs[o['age']].append(q['actualPayoff']/2)
  series[route+'_'+kind]=[statistics.mean(v) for v in xs]
 for e in d['episodes']:
  a={r:next(a for a in e['arms'] if a['route']==r and a['kind']=='real')['steps'] for r in ('warp','matched')}
  for w,c in zip(a['warp'],a['matched']):agreement[0]+=w['action']==c['action'];agreement[1]+=1
  for route in a:
   for q in a[route]:
    transitions[route]+=len(q['path']);proposals[route][0]+=q['action']==0;proposals[route][1]+=1;updated[route][0]+=int(any(abs(x-y)>1e-12 for x,y in zip(q['vAfterDecision'],q['vAfter'])));updated[route][1]+=1
 traces.append(series)
means={k:[statistics.mean(x[k][j] for x in traces) for j in range(5)] for k in traces[0]};directions={}
for period in ('fiveStep','all'):
 for comparator in ('warp_yoked','warp_frozen'):
  diffs=[o[period]['warp']-o[period][comparator] for o in outcome['origins']];directions[f'{period}:{comparator}']={'meanDifference':statistics.mean(diffs),'positiveOrigins':sum(x>0 for x in diffs),'negativeOrigins':sum(x<0 for x in diffs),'zeroOrigins':sum(x==0 for x in diffs)}
out={'status':'EXPLORATORY','scope':'Post-hoc descriptive decomposition; no inference or new registered contrast.','perStepRecoveryMean':means,'realWarpVsMatchedActionAgreement':agreement,'houseEntriesChangedAfterOutcome':updated,'realRouteTransitions':transitions,'proposalDwellCounts':proposals,'unregisteredContrasts':directions};Path(sys.argv[3]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
