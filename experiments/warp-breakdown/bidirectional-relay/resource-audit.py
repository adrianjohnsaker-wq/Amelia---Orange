"""Additional post-registration reaggregation of feedback and gate-resource counts."""
import json,hashlib,sys
from pathlib import Path
p=json.load(open('warp_access/experiments/warp-breakdown/bidirectional-relay/registration.json'));root=Path('warp_bidir_data/evaluation');out_path=Path('warp_bidir_data/outcome.json');out=json.loads(out_path.read_text());computed={k:{f:0 for f in v} for k,v in out['resources'].items()}
for lid in p['lineages']:
 d=json.loads((root/lid/'result.json').read_text())
 for e in d['episodes']:
  for a in e['post']:
   route,mode=a['route'],a['mode'];co=computed[f'{route}|{mode}'];pair=(3,6) if route=='warp' else (2,7)
   for b in e['boundaries']:
    for s in a['steps'][b:b+p['window']]:
     co['decisions']+=1;co['localUpdates']+=1;co['focusLocalUpdates']+=int(s['change']['local']['source'] in pair);co['signals']+=4*int(mode in ('global','read_only','bidirectional','sham_write','reverse_write'));co['virtualEvents']+=sum(x['virtual'] for x in s['path'])
     for w in s['change']['writes']:
      if w['skippedLocal']:co['remoteSkips']+=1
      else:
       co['remoteWrites']+=1;co['remoteDirectional']+=int(w['usedScore']!=1);co['remoteEdgesTouched']+=len(w['options']);co['remoteEdgesChanged']+=sum(abs(a-b)>1e-12 for a,b in zip(w['before'],w['after']))
assert computed==out['resources']
r={'status':'VERIFIED','outcomeSha256':hashlib.sha256(out_path.read_bytes()).hexdigest(),'scope':'Post-registration independent aggregation of first-ten-window gate, feedback-source and remote-write resource counts.'};Path('warp_bidir_data/resource-audit.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
