"""Select a single feedback learning rate pooled over routes and founders."""
import hashlib,json,statistics,sys
from pathlib import Path
if len(sys.argv)!=5:raise SystemExit('calibrate.py REGISTRATION CAL_RUN DATA_DIR OUTPUT')
pb,rb=(Path(x).read_bytes() for x in sys.argv[1:3]);p,r=(json.loads(x) for x in (pb,rb));H=lambda b:hashlib.sha256(b).hexdigest();root=Path(sys.argv[3]);assert r['registrationSha256']==H(pb) and r['phase']=='calibration';assert H(Path(__file__).read_bytes())==p['scripts']['calibrate.py']
D=[]
for i,lid in enumerate(p['lineages']):
 b=(root/lid/'result.json').read_bytes();d=json.loads(b);audit=json.loads((root/lid/'audit.json').read_text());replay=json.loads((root/lid/'replay-proof.json').read_text());assert d['lineage']==lid and d['index']==i and d['runSha256']==H(rb) and audit['status']=='VERIFIED' and audit['resultSha256']==H(b) and replay['originalSha256']==H(b) and replay['status']=='VERIFIED';D.append(d)
def arm(e,eta,route,kind):return next(a for a in e['arms'] if a['eta']==eta and a['route']==route and a['kind']==kind)
rows=[]
for eta in p['candidateEta']:
 vals=[];controls=[]
 for d in D:
  for route in ('warp','matched'):
   score={'real':[],'yoked':[]}
   for e in d['episodes']:
    for kind in score:
     for o,s in zip(e['real']['rows'],arm(e,eta,route,kind)['steps']):
      if 0<=o['age']<5:score[kind].append(s['actualPayoff']/2)
   assert score['real'] and len(score['real'])==len(score['yoked']);vals.append(statistics.mean(score['real']));controls.append(statistics.mean(score['yoked']))
 real=statistics.mean(vals);yoked=statistics.mean(controls);rows.append({'eta':eta,'real':real,'yoked':yoked,'feedbackDifference':real-yoked,'qualifies':real-yoked>=p['calibrationMinFeedback']})
qual=[x for x in rows if x['qualifies']]
if qual:best=max(qual,key=lambda x:(x['real'],-x['eta']));rule='best_pooled_recovery_among_feedback_qualified'
else:best=max(rows,key=lambda x:(x['feedbackDifference'],x['real'],-x['eta']));rule='fallback_highest_pooled_feedback_difference'
# Privileged, calibrated task model for an explicit full-history comparator.
counts={str(m):[[1,1,1] for _ in range(2)] for m in (1,3)}
for d in D:
 for e in d['episodes']:
  for o in e['real']['rows']:
   for a,y in enumerate(o['payoffs']):counts[str(o['mode'])][a][y]+=1
lik={};means={}
for mode in ('1','3'):
 lik[mode]=[];means[mode]=[]
 for a in (0,1):
  c=counts[mode][a];probs=[v/sum(c) for v in c];lik[mode].append(probs);means[mode].append(sum(j*v for j,v in enumerate(probs))/2)
fixed_scores=[sum(means[m][a] for m in ('1','3'))/2 for a in (0,1)];fixed=int(fixed_scores[1]>fixed_scores[0])
out={'schema':'amelia.warp-feedback-selection/v1','status':'FROZEN','registrationSha256':H(pb),'calibrationRunSha256':H(rb),'calibrationSeed':r['seed'],'candidateResults':rows,'chosenEta':best['eta'],'selectionRuleApplied':rule,'calibratedTaskModel':{'countsIncludingLaplacePrior':counts,'likelihood':lik,'meanSuccess':means,'hazard':0.125,'fixedPolicy':fixed},'caveat':'Task model was fitted with mode labels and both strategy outcomes during calibration; internal learners are not given these labels or tables.'}
Path(sys.argv[4]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'chosenEta':best['eta'],'selectionRuleApplied':rule,'candidates':rows,'modelMeans':means,'fixedPolicy':fixed}))
