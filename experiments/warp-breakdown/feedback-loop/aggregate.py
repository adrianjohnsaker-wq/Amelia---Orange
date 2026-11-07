"""Evaluate all decisions prequentially, with paired origin-level statistics."""
import hashlib,itertools,json,math,statistics,sys
from pathlib import Path
if len(sys.argv)!=6:raise SystemExit('aggregate.py REGISTRATION SELECTION EVAL_RUN DATA_DIR OUTPUT')
pb,sb,rb=(Path(x).read_bytes() for x in sys.argv[1:4]);p,s,r=(json.loads(x) for x in (pb,sb,rb));root=Path(sys.argv[4]);H=lambda b:hashlib.sha256(b).hexdigest();assert r['phase']=='evaluation' and r['registrationSha256']==H(pb) and r['selectionSha256']==H(sb) and r['seed']!=s['calibrationSeed'] and r['eta']==s['chosenEta'];assert H(Path(__file__).read_bytes())==p['scripts']['aggregate.py'];D=[]
for i,lid in enumerate(p['lineages']):
 b=(root/lid/'result.json').read_bytes();d=json.loads(b);audit=json.loads((root/lid/'audit.json').read_text());replay=json.loads((root/lid/'replay-proof.json').read_text());assert d['lineage']==lid and d['index']==i and d['runSha256']==H(rb) and audit['status']=='VERIFIED' and audit['resultSha256']==H(b) and replay['originalSha256']==H(b) and replay['status']=='VERIFIED';D.append(d)
def arm(e,route,kind):return next(a for a in e['arms'] if a['route']==route and a['kind']==kind)
def choose_full(p3,model):
 means=model['meanSuccess'];a0=(1-p3)*means['1'][0]+p3*means['3'][0];a1=(1-p3)*means['1'][1]+p3*means['3'][1];return int(a1>a0)
def baselines(e,model,eta):
 belief=.5;out=[]
 for o in e['real']['rows']:
  a=choose_full(belief,model)
  # Four-trial controller observes only its own rewards; see independent memory below.
  out.append({'full_history':a})
  y=o['payoffs'][a];l1=model['likelihood']['1'][a][y];l3=model['likelihood']['3'][a][y];den=(1-belief)*l1+belief*l3;posterior=belief*l3/den;h=model['hazard'];belief=posterior*(1-h)+(1-posterior)*h
 # A separate, causally updated recency policy; it never sees other agents' rewards.
 hist=[];values=[0.0,0.0]
 for t,o in enumerate(e['real']['rows']):
  recent=hist[-4:];q=[]
  for a in (0,1):
   obs=[y for k,y in recent if k==a];q.append((1+sum(obs))/(2+2*len(obs)))
  action=int(q[1]>q[0]);ewma=int(values[1]>values[0]);y=o['payoffs'][ewma];values=[max(-1,min(1,.75*values[j]+eta*(y-1)*(1 if j==ewma else -1))) for j in (0,1)];out[t].update({'last_four':action,'direct_house_rule':ewma,'fixed_0':0,'fixed_1':1,'fixed_selected':model['fixedPolicy']});hist.append((action,o['payoffs'][action]))
 return out
def signp(xs):
 v=statistics.mean(xs);return sum(statistics.mean(s*x for s,x in zip(sign,xs))>=v-1e-14 for sign in itertools.product((-1,1),repeat=len(xs)))/2**len(xs)
def holm(pv):
 order=sorted(range(len(pv)),key=lambda i:pv[i]);ans=[0]*len(pv);old=0
 for j,i in enumerate(order):old=max(old,min(1,pv[i]*(len(pv)-j)));ans[i]=old
 return ans
origins=[]
for d in D:
 names=('warp','matched','warp_yoked','matched_yoked','warp_frozen','matched_frozen','fixed_0','fixed_1','fixed_selected','last_four','direct_house_rule','full_history');acc={k:[0,0] for k in names};first={k:[0,0] for k in names};full={k:[0,0] for k in names};probes={k:{'differentValues':0,'gateChanged':0,'total':0} for k in ('warp','matched')};switches=0;feedbackDist=[]
 for e in d['episodes']:
  base=baselines(e,s['calibratedTaskModel'],s['chosenEta']);switches+=sum(o['switched'] for o in e['real']['rows']);agents={route:{kind:arm(e,route,kind)['steps'] for kind in ('real','yoked','frozen')} for route in ('warp','matched')}
  for route in ('warp','matched'):
   for q in arm(e,route,'sameStateHouseProbe')['probes']:
    z=probes[route];z['total']+=1;z['differentValues']+=int(any(abs(a-b)>1e-12 for a,b in zip(q['vBefore'],q['vDonor'])));z['gateChanged']+=int(q['realAction']!=q['donorAction'])
  for t,o in enumerate(e['real']['rows']):
   scores={route:agents[route]['real'][t]['actualPayoff'] for route in ('warp','matched')}
   scores.update({route+'_'+kind:agents[route][kind][t]['actualPayoff'] for route in ('warp','matched') for kind in ('yoked','frozen')});scores.update({name:o['payoffs'][action] for name,action in base[t].items()})
   for name,v in scores.items():
    for bucket,cond in ((acc,0<=o['age']<5),(first,o['age']==0),(full,True)):
     if cond:bucket[name][0]+=v;bucket[name][1]+=2
 assert all(v[1]>0 for v in acc.values()) and all(v[1]>0 for v in first.values());origins.append({'lineage':d['lineage'],'episodes':len(d['episodes']),'switches':switches,'fiveStepCounts':acc,'firstCounts':first,'allCounts':full,'fiveStep':{k:a/b for k,(a,b) in acc.items()},'first':{k:a/b for k,(a,b) in first.items()},'all':{k:a/b for k,(a,b) in full.items()},'houseSwapProbes':probes})
means={k:statistics.mean(o['fiveStep'][k] for o in origins) for k in origins[0]['fiveStep']};firstmeans={k:statistics.mean(o['first'][k] for o in origins) for k in origins[0]['first']};allmeans={k:statistics.mean(o['all'][k] for o in origins) for k in origins[0]['all']};contrasts={k:[o['fiveStep']['warp']-o['fiveStep'][k] for o in origins] for k in ('matched','warp_yoked')};raw=[signp(v) for v in contrasts.values()];hp=holm(raw);tests={k:{'meanDifference':statistics.mean(v),'originDifferences':v,'oneSidedSignFlipP':raw[i],'holmP':hp[i],'threshold':p['minimumAdvantage'],'passes':statistics.mean(v)>=p['minimumAdvantage'] and hp[i]<=0.05} for i,(k,v) in enumerate(contrasts.items())};status='REGISTERED_FEEDBACK_DRIVEN_WARP_ADVANTAGE_VS_MATCHED_LOOP' if all(x['passes'] for x in tests.values()) else 'NO_REGISTERED_FEEDBACK_DRIVEN_WARP_ADVANTAGE'
out={'schema':'amelia.warp-feedback-outcome/v1','classification':status,'registrationSha256':H(pb),'selectionSha256':H(sb),'runSha256':H(rb),'means':means,'firstMeans':firstmeans,'allMeans':allmeans,'primaryComparisons':tests,'origins':origins,'limitations':['Eight historical origins shared later input.','3/6 and adapted 2/7 have matched local loop topology but different original full state.','Feedback learning is an explicit added House update, not spontaneous self-modification.','The model-based baseline was calibrated with mode labels and counterfactual policy scores.']};Path(sys.argv[5]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'classification':status,'fiveStep':means,'first':firstmeans,'comparisons':tests,'switches':sum(o['switches'] for o in origins)}))
