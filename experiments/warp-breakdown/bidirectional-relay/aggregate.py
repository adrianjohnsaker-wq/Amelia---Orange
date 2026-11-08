"""Predeclared first-passage recovery analysis over repeated reversals."""
import hashlib,itertools,json,statistics,sys
from pathlib import Path
if len(sys.argv)!=6:raise SystemExit('aggregate.py REG RUN PRIOR DATA OUTPUT')
pb,rb,mb=(Path(x).read_bytes() for x in sys.argv[1:4]);p,r,m=(json.loads(x) for x in (pb,rb,mb));H=lambda x:hashlib.sha256(x).hexdigest();assert H(pb)==r['registrationSha256'] and H(mb)==p['priorModelSha256'] and H(Path(__file__).read_bytes())==p['scripts']['aggregate.py'];root=Path(sys.argv[4]);D=[]
for i,lid in enumerate(p['lineages']):
 b=(root/lid/'result.json').read_bytes();d=json.loads(b);a=json.loads((root/lid/'audit.json').read_text());v=json.loads((root/lid/'replay-proof.json').read_text());assert d['lineage']==lid and d['index']==i and d['runSha256']==H(rb) and a['status']=='VERIFIED' and a['resultSha256']==H(b) and v['status']=='VERIFIED' and v['originalSha256']==H(b);D.append(d)
mean=statistics.mean;ROUTES=('warp','matched27');MODES=('natural','global','read_only','bidirectional','sham_write','reverse_write','entry');keys=[f'{r}|{z}' for r in ROUTES for z in MODES]+['direct','fullHistory','fixed0','fixed1'];fields=('optimal','preferred','grid')
def values(action,row,scen,mode):
 s=row[scen];return {'optimal':int(s[action]==max(s)),'preferred':int(action==({1:0,3:1}[mode])),'grid':s[action]/2}
def model(e):
 c=m['calibratedTaskModel'];h=c['hazard'];mu=c['meanSuccess'];like=c['likelihood'];belief=.5
 def pick(b):return int((1-b)*mu['1'][1]+b*mu['3'][1]>(1-b)*mu['1'][0]+b*mu['3'][0])
 def update(b,a,y):
  p1=like['1'][a][y];p3=like['3'][a][y];post=b*p3/((1-b)*p1+b*p3);return post*(1-h)+(1-post)*h
 for row in e['env']['trainRows']:
  a=pick(belief);belief=update(belief,a,row['real'][a])
 out=[]
 for t in range(sum(e['lengths'])):
  seg=max(i for i,b in enumerate(e['boundaries']) if b<=t);scen='reversed' if seg%2==0 else 'same';a=pick(belief);out.append(a);belief=update(belief,a,e['env']['postRows'][t][scen][a])
 return out
def crossing(curve,threshold):return next((i+1 for i,v in enumerate(curve) if v>=threshold-1e-12),p['window']+1)
def signp(v):
 ob=mean(v);return sum(mean(s*x for s,x in zip(z,v))>=ob-1e-14 for z in itertools.product((-1,1),repeat=len(v)))/2**len(v)
def holm(ps):
 order=sorted(range(len(ps)),key=lambda i:ps[i]);out=[0]*len(ps);last=0
 for j,i in enumerate(order):last=max(last,min(1,ps[i]*(len(ps)-j)));out[i]=last
 return out
origins=[]
for d in D:
 curves={key:{f:[[] for _ in range(p['window'])] for f in fields} for key in keys};bysegment={key:{f:[[ ] for _ in range(p['window'])] for f in fields} for key in keys};counts={f'{route}|{mode}':{'decisions':0,'localUpdates':0,'focusLocalUpdates':0,'remoteWrites':0,'remoteSkips':0,'remoteDirectional':0,'remoteEdgesTouched':0,'remoteEdgesChanged':0,'signals':0,'virtualEvents':0} for route in ROUTES for mode in MODES};shockCount=0
 for e in d['episodes']:
  shockCount+=len(e['shocks']);modelActions=model(e);arm={(a['route'],a['shock'],a['mode']):a for a in e['post']}
  for key in keys:
   ep={f:[[] for _ in range(p['window'])] for f in fields};epseg={f:[[] for _ in range(p['window'])] for f in fields}
   for seg,b in enumerate(e['boundaries']):
    scen='reversed' if seg%2==0 else 'same';mode=e['env']['other'] if scen=='reversed' else e['env']['mode']
    for k in range(p['window']):
     t=b+k;row=e['env']['postRows'][t]
     if '|' in key:
      route,typ=key.split('|');steps=[arm[(route,shock,typ)]['steps'][t] for shock in e['shocks']];vs=[values(s['action'],row,scen,mode) for s in steps];z={f:mean(v[f] for v in vs) for f in fields}
      for s in steps:
       co=counts[key];co['decisions']+=1;ch=s['change'];co['localUpdates']+=1;co['focusLocalUpdates']+=int(ch['local']['source'] in ((3,6) if route=='warp' else (2,7)));co['signals']+=4*int(typ in ('global','read_only','bidirectional','sham_write','reverse_write'));co['virtualEvents']+=sum(q['virtual'] for q in s['path'])
       for w in ch['writes']:
        if w['skippedLocal']:co['remoteSkips']+=1;continue
        co['remoteWrites']+=1;co['remoteDirectional']+=int(w['usedScore']!=1);co['remoteEdgesTouched']+=len(w['options']);co['remoteEdgesChanged']+=sum(abs(a-b)>1e-12 for a,b in zip(w['before'],w['after']))
     else:
      a=e['direct'][t]['action'] if key=='direct' else modelActions[t] if key=='fullHistory' else int(key[-1]);z=values(a,row,scen,mode)
     for f in fields:ep[f][k].append(z[f]);epseg[f][k].append(z[f]) if seg==0 else None
   for f in fields:
    for k in range(p['window']):curves[key][f][k].append(mean(ep[f][k]));bysegment[key][f][k].append(mean(epseg[f][k]))
 final={key:{f:[mean(v) for v in curves[key][f]] for f in fields} for key in keys};first={key:{f:[mean(v) for v in bysegment[key][f]] for f in fields} for key in keys};times={key:{'t50':crossing(final[key]['optimal'],.5),'t80':crossing(final[key]['optimal'],.8)} for key in keys};origins.append({'lineage':d['lineage'],'episodes':len(d['episodes']),'shockBranches':shockCount,'curves':final,'firstReversalCurves':first,'times':times,'resources':counts})
contrasts={}
for comp in ('matched27|bidirectional','warp|read_only','warp|global','direct'):
 for th in ('t50','t80'):
  contrasts[f'warp_bidir_vs_{comp}_{th}']=[o['times'][comp][th]-o['times']['warp|bidirectional'][th] for o in origins]
raw=[signp(v) for v in contrasts.values()];adj=holm(raw);tests={k:{'meanAdvantageDecisions':mean(v),'originDifferences':v,'rawP':raw[i],'holmP':adj[i],'passes':mean(v)>=p['minimumAdvantageDecisions'] and adj[i]<=.05} for i,(k,v) in enumerate(contrasts.items())}
allcurves={key:{f:[mean(o['curves'][key][f][t] for o in origins) for t in range(p['window'])] for f in fields} for key in keys};alltimes={key:{th:{'meanRestrictedLag':mean(o['times'][key][th] for o in origins),'originsCensored':sum(o['times'][key][th]==p['window']+1 for o in origins),'crossingOfPooledCurve':crossing(allcurves[key]['optimal'],.5 if th=='t50' else .8)} for th in ('t50','t80')} for key in keys};resources={key:{field:sum(o['resources'][key][field] for o in origins) for field in origins[0]['resources'][key]} for key in origins[0]['resources']};classification='REGISTERED_WARP_SPECIFIC_VELOCITY_ADVANTAGE' if all(v['passes'] for v in tests.values()) else 'NO_REGISTERED_WARP_SPECIFIC_VELOCITY_ADVANTAGE'
out={'schema':'amelia.bidir-outcome/v1','registrationSha256':H(pb),'runSha256':H(rb),'priorModelSha256':H(mb),'classification':classification,'curves':allcurves,'times':alltimes,'comparisons':tests,'resources':resources,'origins':origins,'notes':['First threshold crossing may fall back on later lags; 11 denotes not reached during the ten-decision window.','Per-grid optimum is the higher observed score among two tested strategies; both count optimal when tied.','Full-history model has prior labelled calibration.','Eight reused origin lineages later shared input.']};Path(sys.argv[5]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'classification':classification,'times':alltimes,'comparisons':tests,'resources':resources}))
