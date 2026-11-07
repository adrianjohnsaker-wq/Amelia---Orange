"""Independently regenerate calibration inputs and the frozen offset rule."""
import hashlib,importlib.util,itertools,json,sys
from pathlib import Path
if len(sys.argv)!=4:raise SystemExit('Usage: audit-cal.py REGISTRATION SHARD SUPPORT')
pb,db=Path(sys.argv[1]).read_bytes(),Path(sys.argv[2]).read_bytes();p,d=json.loads(pb),json.loads(db);H=lambda x:hashlib.sha256(x).hexdigest()
spec=importlib.util.spec_from_file_location('support',sys.argv[3]);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
assert d['schema']=='amelia.warp-gate-causal-calibration/v1' and d['status']=='COMPLETE'
assert d['registrationSha256']==H(pb) and d['checkpointSha256']==p['checkpointSha256'] and d['scriptSha256']==p['calibrateSha256'] and d['lineage']==p['lineages'][d['index']]
counts={r:{str(b):{'steps':0,'sensitive':0} for b in p['offsets']} for r in ('warp','control')};seen=set()
for e in d['episodes']:
 k=(e['index'],e['flip']);assert k not in seen;seen.add(k);seed,obs=m.observations(p['calibrationSeed'],d['lineage'],'causal-calibration',e['index'],e['flip'],p['steps']);assert e['seedHash']==m.sha(seed) and e['observations']==obs
 assert {a['route'] for a in e['arms']}=={'warp','control'} and len(e['arms'])==2
 for a in e['arms']:
  r=a['route'];pr,di=(3,6) if r=='warp' else (2,7);path=a['path'];assert len(path)==p['steps'] and path[0][0]==pr and all(x[1]==y[0] for x,y in zip(path,path[1:]))
  assert all(tuple(x) in ((pr,pr),(pr,di),(di,pr)) for x in path);contested=sum(x[0]==pr for x in path);assert set(a['sensitive'])=={str(b) for b in p['offsets']}
  for b in p['offsets']:
   q=a['sensitive'][str(b)];assert 0<=q<=contested;counts[r][str(b)]['steps']+=p['steps'];counts[r][str(b)]['sensitive']+=q
assert seen==set(itertools.product(range(p['calibrationPairs']),(0,1))) and d['counts']==counts
n=2*p['calibrationPairs']*p['steps'];combos=[]
for wl,wh,cl,ch in itertools.product(p['offsets'],repeat=4):
 dw=counts['warp'][str(wh)]['sensitive']-counts['warp'][str(wl)]['sensitive'];dc=counts['control'][str(ch)]['sensitive']-counts['control'][str(cl)]['sensitive']
 if dw<0 or dc<0:continue
 combos.append({'warp':{'low':wl,'high':wh},'control':{'low':cl,'high':ch},'warpGain':dw/n,'controlGain':dc/n,'minGain':min(dw,dc),'gap':abs(dw-dc),'cost':abs(wl)+abs(wh)+abs(cl)+abs(ch)})
combos.sort(key=lambda a:(-a['minGain'],a['gap'],a['cost'],a['warp']['low'],a['warp']['high'],a['control']['low'],a['control']['high']));assert d['chosen']==combos[0]
print(json.dumps({'status':'VERIFIED','lineage':d['lineage'],'sha256':H(db),'episodes':len(seen)}))
