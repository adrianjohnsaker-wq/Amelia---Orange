"""Regenerate calibration inputs and verify each presealed selection."""
import hashlib,importlib.util,json,sys,itertools
from pathlib import Path
if len(sys.argv)!=4:raise SystemExit('Usage: audit-cal.py REGISTRATION SHARD SUPPORT')
pb=Path(sys.argv[1]).read_bytes();rb=Path(sys.argv[2]).read_bytes();p=json.loads(pb);d=json.loads(rb);H=lambda x:hashlib.sha256(x).hexdigest()
spec=importlib.util.spec_from_file_location('support',sys.argv[3]);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
assert d['schema']=='amelia.warp-dynamic-calibration-shard/v1' and d['status']=='COMPLETE'
assert d['registrationSha256']==H(pb) and d['checkpointSha256']==p['checkpointSha256'] and d['scriptSha256']==p['calibrateSha256']
assert d['lineage']==p['lineages'][d['index']] and len(d['episodes'])==2*p['calibrationPairs']
counts={f'{g}:{rt}':{'steps':0,'sensitive':0,'pivotal':0} for g,rt in itertools.product(p['cueWeights'],('warp','control'))};seen=set()
for e in d['episodes']:
 k=(e['index'],e['flip']);assert k not in seen;seen.add(k);seed,obs=m.observations(p['calibrationSeed'],d['lineage'],'calibration',e['index'],e['flip'],p['steps'])
 assert e['seedHash']==m.sha(seed) and e['observations']==obs and len(e['arms'])==4
 for arm in e['arms']:
  key=f"{arm['gain']}:{arm['route']}";pr,di=(3,6) if arm['route']=='warp' else (2,7);path=arm['path']
  assert len(path)==p['steps'] and path[0][0]==pr and all(a[1]==b[0] for a,b in zip(path,path[1:]))
  assert all(tuple(x) in ((pr,pr),(pr,di),(di,pr)) for x in path)
  assert 0<=arm['pivotal']<=p['steps'] and 0<=arm['sensitive']<=p['steps']
  counts[key]['steps']+=p['steps'];counts[key]['sensitive']+=arm['sensitive'];counts[key]['pivotal']+=arm['pivotal']
assert counts==d['counts']
for g in p['cueWeights']:
 a=counts[f'{g}:warp'];b=counts[f'{g}:control'];assert a['steps']==b['steps']
 assert d['selected'][str(g)]==('warp' if a['sensitive']>b['sensitive'] else 'control')
print(json.dumps({'status':'VERIFIED','lineage':d['lineage'],'sha256':H(rb),'episodes':len(seen)}))
