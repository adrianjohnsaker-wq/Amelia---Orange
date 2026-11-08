"""Post-outcome descriptive checks on probe signal delivery and paired choices."""
import json
from pathlib import Path
p=json.load(open('warp_access/experiments/warp-breakdown/ordered-binding/registration.json'));z={};d={'warp_vs_direct_host':{'equal':0,'total':0},'warp_vs_matched27':{'equal':0,'total':0}}
for lid in p['lineages']:
 a=json.load(open(Path('warp_binding_data/evaluation')/lid/'result.json'))
 for e in a['episodes']:
  if not e['switched']:continue
  arms={(r['route'],r['zone']):r for r in e['arms']}
  for zone in (1,4,8):
   probes={}
   for route in ('warp','matched27','direct_host'):
    q=next(v for v in arms[(route,zone)]['results'] if v['kind']=='retain');q=[v for v in q['probes'] if v['context']=='old'];probes[route]=q
    cnt=z.setdefault(route,{'choices':0,'gateMatchesReadout':0,'correct':0,'nonzeroDecoder':0})
    for x in q:cnt['choices']+=1;cnt['gateMatchesReadout']+=int(x['gateAction']==x['readout']['action']);cnt['correct']+=x['correct'];cnt['nonzeroDecoder']+=int(abs(x['readout']['estimate'])>1e-12)
   for name,other in (('warp_vs_direct_host','direct_host'),('warp_vs_matched27','matched27')):
    for w,v in zip(probes['warp'],probes[other]):assert (w['left'],w['right'])==(v['left'],v['right']);d[name]['total']+=1;d[name]['equal']+=int(w['action']==v['action'])
out={'status':'EXPLORATORY_POST_OUTCOME','scope':'Unweighted descriptive counts across repeated branch-probes, not independent subjects or new hypothesis tests. Gate agreement compares the actual gate with its own externally supplied order decoder.','perRoute':z,'pairedActionAgreement':d};Path('warp_binding_data/trace-summary.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
