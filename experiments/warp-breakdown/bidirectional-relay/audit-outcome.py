"""Independently reconstruct origin curves and registered contrasts from raw records."""
import hashlib,itertools,json,math,statistics,sys
from pathlib import Path
if len(sys.argv)!=6:raise SystemExit('audit-outcome.py REG RUN PRIOR DATA OUTCOME')
pb,rb,mb=(Path(x).read_bytes() for x in sys.argv[1:4]);p,r,model=(json.loads(x) for x in (pb,rb,mb));root=Path(sys.argv[4]);path=Path(sys.argv[5]);out=json.loads(path.read_text());H=lambda x:hashlib.sha256(x).hexdigest();assert H(pb)==r['registrationSha256']==out['registrationSha256'] and H(rb)==out['runSha256'] and H(mb)==out['priorModelSha256'];assert H(Path(__file__).read_bytes())==p['scripts']['audit-outcome.py']
mean=statistics.mean
keys=[f'{route}|{mode}' for route in ('warp','matched27') for mode in ('natural','global','read_only','bidirectional','sham_write','reverse_write','entry')]+['direct','fullHistory','fixed0','fixed1']
def model_actions(e):
 c=model['calibratedTaskModel'];h=c['hazard'];mu=c['meanSuccess'];like=c['likelihood'];b=.5;actions=[]
 def step(b,row):
  a=int((1-b)*mu['1'][1]+b*mu['3'][1]>(1-b)*mu['1'][0]+b*mu['3'][0]);y=row[a];post=b*like['3'][a][y]/((1-b)*like['1'][a][y]+b*like['3'][a][y]);return a,post*(1-h)+(1-post)*h
 for row in e['env']['trainRows']:_,b=step(b,row['real'])
 for t in range(sum(e['lengths'])):
  j=sum(z<=t for z in e['boundaries'])-1;scen='reversed' if j%2==0 else 'same';a,b=step(b,e['env']['postRows'][t][scen]);actions.append(a)
 return actions
def val(a,s,mode):return {'optimal':int(s[a]>=s[1-a]),'preferred':int(a==(0 if mode==1 else 1)),'grid':s[a]/2}
def cross(curve,h):return next((i+1 for i,v in enumerate(curve) if v>=h-1e-12),p['window']+1)
all_curves={k:{f:[[] for _ in range(p['window'])] for f in ('optimal','preferred','grid')} for k in keys};times={}
for lid,o in zip(p['lineages'],out['origins']):
 data=json.loads((root/lid/'result.json').read_text());assert data['lineage']==lid==o['lineage'];ep_cache=[]
 for e in data['episodes']:
  arms={(a['route'],a['mode'],a['shock']):a['steps'] for a in e['post']};ep_cache.append((e,arms,model_actions(e)))
 times[lid]={}
 for key in keys:
  curve={f:[] for f in ('optimal','preferred','grid')};first={f:[] for f in curve}
  for lag in range(p['window']):
   episode_vals={f:[] for f in curve};first_vals={f:[] for f in curve}
   for e,arms,mod in ep_cache:
    segments={f:[] for f in curve};first_seg=None
    for seg,b in enumerate(e['boundaries']):
     t=b+lag;scen='reversed' if seg%2==0 else 'same';regime=e['env']['other'] if scen=='reversed' else e['env']['mode'];pay=e['env']['postRows'][t][scen]
     if '|' in key:
      route,typ=key.split('|');zz=[val(arms[(route,typ,shock)][t]['action'],pay,regime) for shock in e['shocks']];z={f:mean(v[f] for v in zz) for f in curve}
     else:
      action=e['direct'][t]['action'] if key=='direct' else mod[t] if key=='fullHistory' else int(key[-1]);z=val(action,pay,regime)
     for f in curve:segments[f].append(z[f])
     if seg==0:first_seg=z
    for f in curve:episode_vals[f].append(mean(segments[f]));first_vals[f].append(first_seg[f])
   for f in curve:curve[f].append(mean(episode_vals[f]));first[f].append(mean(first_vals[f]));assert abs(curve[f][-1]-o['curves'][key][f][lag])<1e-12 and abs(first[f][-1]-o['firstReversalCurves'][key][f][lag])<1e-12;all_curves[key][f][lag].append(curve[f][-1])
  times[lid][key]={'t50':cross(curve['optimal'],.5),'t80':cross(curve['optimal'],.8)};assert times[lid][key]==o['times'][key]
for key in keys:
 for f in ('optimal','preferred','grid'):
  for lag in range(p['window']):assert abs(mean(all_curves[key][f][lag])-out['curves'][key][f][lag])<1e-12
 for th,h in (('t50',.5),('t80',.8)):
  result=out['times'][key][th];z=[times[lid][key][th] for lid in p['lineages']];assert abs(mean(z)-result['meanRestrictedLag'])<1e-12 and sum(v==p['window']+1 for v in z)==result['originsCensored'] and cross(out['curves'][key]['optimal'],h)==result['crossingOfPooledCurve']
raw={};diffs={}
for comp in ('matched27|bidirectional','warp|read_only','warp|global','direct'):
 for th in ('t50','t80'):
  k=f'warp_bidir_vs_{comp}_{th}';z=[times[lid][comp][th]-times[lid]['warp|bidirectional'][th] for lid in p['lineages']];obs=sum(z);raw[k]=sum(sum(a*b for a,b in zip(signs,z))>=obs for signs in itertools.product((-1,1),repeat=len(z)))/2**len(z);diffs[k]=z
ordered=sorted(raw,key=raw.get);adjusted={};floor=0
for i,k in enumerate(ordered):floor=max(floor,min(1,(len(raw)-i)*raw[k]));adjusted[k]=floor
passes=[]
for k,z in diffs.items():
 q=out['comparisons'][k];ok=mean(z)>=p['minimumAdvantageDecisions'] and adjusted[k]<=.05;assert z==q['originDifferences'] and abs(mean(z)-q['meanAdvantageDecisions'])<1e-12 and raw[k]==q['rawP'] and adjusted[k]==q['holmP'] and ok==q['passes'];passes.append(ok)
expected='REGISTERED_WARP_SPECIFIC_VELOCITY_ADVANTAGE' if all(passes) else 'NO_REGISTERED_WARP_SPECIFIC_VELOCITY_ADVANTAGE';assert out['classification']==expected
result={'status':'VERIFIED','outcomeSha256':H(path.read_bytes()),'classification':expected,'scope':'Independently rebuilt all per-lag origin curves from raw action and payoff records, threshold crossings, paired exact sign flips and Holm correction. Oracle trajectories and grid generation audited separately.'};target=path.with_name('outcome-audit.json');target.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
