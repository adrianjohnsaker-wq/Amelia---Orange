"""Descriptive post-outcome, probe-level path and memory contrasts."""
import collections,json
from pathlib import Path
p=json.load(open('warp_access/experiments/warp-breakdown/gate-density/registration.json'));ans={k:collections.Counter() for k in ('A','B','C','D')}
for lid in p['lineages']:
 d=json.loads((Path('warp_density_data/evaluation')/lid/'result.json').read_text())
 for e in d['episodes']:
  if not e['switched']:continue
  arms={(a['config'],a['zone']):a for a in e['arms']}
  for zone in (1,4,8):
   sham=arms[('sham29',zone)];sp=next(x for x in sham['results'] if x['kind']=='retain')['probes'];sp=[q for q in sp if q['context']=='old'];spath=[(x['from'],x['to'],x['postZone']) for q in sham['second'] for x in q['path']]
   for name in ans:
    z=ans[name];a=arms[(name,zone)];q0=next(x for x in a['results'] if x['kind']=='retain')['probes'];probes=[q for q in q0 if q['context']=='old'];dp=next(x for x in arms[(name+'_direct',zone)]['results'] if x['kind']=='retain')['probes'];dp=[q for q in dp if q['context']=='old'];path=[(x['from'],x['to'],x['postZone']) for q in a['second'] for x in q['path']];diffs=[abs(x-y) for x,y in zip(a['postMemory'],sham['postMemory'])];z['branches']+=1;z['phase2PathDiffers']+=int(path!=spath);z['postMemoryAnyDiff']+=int(any(v>1e-12 for v in diffs));z['postVAnyDiff']+=int(any(v>1e-12 for v in diffs[:3]));z['postDAnyDiff']+=int(any(v>1e-12 for v in diffs[3:]));z['phase2DeathEvents']+=sum(s['died'] for q in a['second'] for s in q['path'])
    for q,base,direct in zip(probes,sp,dp):
     assert (q['left'],q['right'],q['target'])==(base['left'],base['right'],base['target'])==(direct['left'],direct['right'],direct['target']);z['probes']+=1;z['actionDiffersSham']+=int(q['action']!=base['action']);z['actionDiffersDirect']+=int(q['action']!=direct['action']);z['pathDiffersSham']+=int([(x['from'],x['to'],x['postZone']) for x in q['path']]!=[(x['from'],x['to'],x['postZone']) for x in base['path']]);num=sum(x['died'] for x in q['path']);z['probeDeathEvents']+=num;z['probesWithDeath']+=int(num>0)
out={'status':'EXPLORATORY_POST_OUTCOME','scope':'Paired descriptive counts across repeated switched history branches. Direct comparators share the exact masked pre-probe state; no independent founders or statistical significance are implied. Each probe runs in a fresh clone; deaths do not propagate to the saved post-sequence state.','masks':{k:dict(v) for k,v in ans.items()}};Path('warp_density_data/trace-summary.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
