"""Post-outcome descriptive sensitivity: exclude decisions with equal action scores."""
import json,statistics
from pathlib import Path
p=json.load(open('warp_access/experiments/warp-breakdown/bidirectional-relay/registration.json'));root=Path('warp_bidir_data/evaluation');keys=('warp|bidirectional','warp|read_only','warp|global','warp|entry','matched27|bidirectional','matched27|entry','direct');allcurves={k:[[] for _ in range(p['window'])] for k in keys};counts={k:[0,0] for k in keys}
for lid in p['lineages']:
 d=json.loads((root/lid/'result.json').read_text());eplen=len(d['episodes'])
 for key in keys:
  for lag in range(p['window']):
   num=den=0.0
   for e in d['episodes']:
    arms={(a['route'],a['mode'],a['shock']):a for a in e['post']}
    for seg,b in enumerate(e['boundaries']):
     t=b+lag;scen='reversed' if seg%2==0 else 'same';scores=e['env']['postRows'][t][scen];win=scores.index(max(scores)) if scores[0]!=scores[1] else None
     if win is None:continue
     if key=='direct':actions=[e['direct'][t]['action']]*len(e['shocks'])
     else:
      route,mode=key.split('|');actions=[arms[(route,mode,shock)]['steps'][t]['action'] for shock in e['shocks']]
     weight=1/(eplen*p['reversals']*len(e['shocks']));den+=weight*len(actions);num+=weight*sum(a==win for a in actions)
     counts[key][0]+=len(actions);counts[key][1]+=1
   allcurves[key][lag].append(num/den if den else None)
curves={k:[statistics.mean(v for v in z if v is not None) if any(v is not None for v in z) else None for z in vals] for k,vals in allcurves.items()}
out={'status':'EXPLORATORY_POST_OUTCOME','scope':'At each lag, omit score-tied two-grid challenges, then average conditional correct rates equally across origins. Eligibility is based on both independently scored strategies, never shown to the controller.','curves':curves,'originCurves':allcurves,'eligibilityCounts':counts};Path('warp_bidir_data/tie-excluded.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'status':out['status'],'curves':curves}))
