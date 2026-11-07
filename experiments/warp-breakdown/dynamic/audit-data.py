"""Regenerate the complete feedback, challenge, disruption and scoring stream."""
import hashlib,importlib.util,itertools,json,math,sys
from pathlib import Path
if len(sys.argv)!=6:raise SystemExit('Usage: audit-data.py REGISTRATION SELECTION RUN DATA SUPPORT')
pb,sb,rb,db=(Path(x).read_bytes() for x in sys.argv[1:5]);p,s,r,d=(json.loads(x) for x in (pb,sb,rb,db));H=lambda x:hashlib.sha256(x).hexdigest()
spec=importlib.util.spec_from_file_location('support',sys.argv[5]);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
assert d['schema']=='amelia.warp-dynamic-dataset/v1' and d['status']=='COMPLETE'
assert d['registrationSha256']==H(pb) and d['selectionSha256']==H(sb) and d['runSha256']==H(rb) and d['checkpointSha256']==p['checkpointSha256'] and d['scriptSha256']==p['datasetSha256']
assert r['registrationSha256']==H(pb) and r['selectionSha256']==H(sb) and s['status']=='FROZEN' and d['lineage']==p['lineages'][d['index']]
assert r['pairsPerPartition']==p['pairsPerPartition'] and r['experimentSeed']!=p['calibrationSeed']
assert len(d['episodes'])==4*r['pairsPerPartition'];seen=set();switches=0
for e in d['episodes']:
 k=(e['partition'],e['index'],e['flip']);assert k not in seen;seen.add(k)
 seed,obs=m.observations(r['experimentSeed'],d['lineage'],e['partition'],e['index'],e['flip'],p['steps'])
 assert e['seedHash']==m.sha(seed) and e['observations']==obs and len(e['arms'])==4 and len(e['heldout'])==p['steps']
 shockmap={x['t']:x for x in e['shocks']}
 for v,held in zip(obs,e['heldout']):
  grids=[m.grid(f"{seed}:heldout:{v['t']}:{j}",v['mode']) for j in range(p['heldoutCases'])]
  assert held=={'light':m.evaluate(m.LIGHT,grids)['passed'],'heavy':m.evaluate(m.HEAVY,grids)['passed']}
  if v['switched']:
   switches+=1;old=3 if v['mode']==1 else 1;candidate=m.LIGHT if old==1 else m.HEAVY
   before=[m.grid(f"{seed}:shock:{v['t']}:{j}",old) for j in range(p['shockCases'])]
   after=[m.grid(f"{seed}:shock:{v['t']}:{j}",v['mode']) for j in range(p['shockCases'])]
   a=m.evaluate(candidate,before)['passed'];b=m.evaluate(candidate,after)['passed']
   assert shockmap[v['t']]=={'t':v['t'],'oldMode':old,'newMode':v['mode'],'before':a,'after':b,'breakdown':a-b>=2}
 assert len(shockmap)==sum(v['switched'] for v in obs)
 combinations=set()
 for a in e['arms']:
  key=(a['gain'],a['route']);assert key not in combinations;combinations.add(key)
  pr,di=(3,6) if a['route']=='warp' else (2,7);path=a['path'];assert len(path)==p['steps'] and path[0][0]==pr and all(x[1]==y[0] for x,y in zip(path,path[1:]))
  assert all(tuple(x) in ((pr,pr),(pr,di),(di,pr)) for x in path) and len(a['features'])==p['steps']
  for f in a['features']:
   assert len(f['house'])==9 and len(f['pfm'])==3 and all(math.isfinite(z) for z in f['house']+f['pfm'])
 assert combinations==set(itertools.product(p['cueWeights'],('warp','control')))
print(json.dumps({'status':'VERIFIED','lineage':d['lineage'],'episodes':len(seen),'switches':switches,'resultSha256':H(db)}))
