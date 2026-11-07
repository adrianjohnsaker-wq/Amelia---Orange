"""Regenerate challenge/feedback/scoring streams and audit intervention boundaries."""
import hashlib,importlib.util,itertools,json,math,sys
from pathlib import Path
if len(sys.argv)!=6:raise SystemExit('Usage: audit-data.py REGISTRATION CHOICE RUN DATA SUPPORT')
pb,cb,rb,db=(Path(x).read_bytes() for x in sys.argv[1:5]);p,c,r,d=(json.loads(x) for x in (pb,cb,rb,db));H=lambda x:hashlib.sha256(x).hexdigest()
spec=importlib.util.spec_from_file_location('support',sys.argv[5]);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
assert d['schema']=='amelia.warp-gate-causal-dataset/v1' and d['status']=='COMPLETE'
assert d['registrationSha256']==H(pb) and d['choiceSha256']==H(cb) and d['runSha256']==H(rb) and d['checkpointSha256']==p['checkpointSha256'] and d['scriptSha256']==p['datasetSha256']
assert c['status']=='FROZEN' and c['registrationSha256']==H(pb) and r['registrationSha256']==H(pb) and r['choiceSha256']==H(cb)
assert r['pairsPerPartition']==p['pairsPerPartition'] and r['experimentSeed']!=p['calibrationSeed'] and d['lineage']==p['lineages'][d['index']]
seen=set();switches=0;witnesses=0;changed=0
names=('sham','low','high','reverse','release','lowYoked','highYoked','highHouseFromLow','lowHouseFromHigh')
for e in d['episodes']:
 k=(e['partition'],e['index'],e['flip']);assert k not in seen;seen.add(k)
 seed,obs=m.observations(r['experimentSeed'],d['lineage'],e['partition'],e['index'],e['flip'],p['steps']);assert e['seedHash']==m.sha(seed) and e['observations']==obs and len(e['heldout'])==p['steps']
 yseed,yobs=m.observations(r['experimentSeed'],d['lineage'],'causal-yoked:'+e['partition'],e['index'],e['flip'],p['steps']);assert e['yoked']=={'seedHash':m.sha(yseed),'observations':yobs}
 shockmap={q['t']:q for q in e['shocks']};assert len(shockmap)==len(e['shocks'])
 for v,held in zip(obs,e['heldout']):
  gs=[m.grid(f"{seed}:heldout:{v['t']}:{j}",v['mode']) for j in range(p['heldoutCases'])]
  assert held=={'light':m.evaluate(m.LIGHT,gs)['passed'],'heavy':m.evaluate(m.HEAVY,gs)['passed']}
  if v['switched']:
   switches+=1;old=3 if v['mode']==1 else 1;candidate=m.LIGHT if old==1 else m.HEAVY
   a=m.evaluate(candidate,[m.grid(f"{seed}:shock:{v['t']}:{j}",old) for j in range(p['shockCases'])])['passed'];b=m.evaluate(candidate,[m.grid(f"{seed}:shock:{v['t']}:{j}",v['mode']) for j in range(p['shockCases'])])['passed']
   assert shockmap[v['t']]=={'t':v['t'],'oldMode':old,'newMode':v['mode'],'before':a,'after':b,'breakdown':a-b>=2}
 assert len(shockmap)==sum(v['switched'] for v in obs)
 arms={(a['route'],a['name']):a for a in e['arms']};assert len(arms)==18 and set(arms)==set(itertools.product(('warp','control'),names))
 for route in ('warp','control'):
  pr,di=(3,6) if route=='warp' else (2,7);regular=('sham','low','high','reverse','release','lowYoked','highYoked')
  assert e['orders'][route]==sorted(regular,key=lambda name:m.sha(f'{seed}:{route}:order:{name}'))
  for name in names:
   a=arms[(route,name)];start=p['releaseAt'] if 'HouseFrom' in name else 0;assert a['start']==start and len(a['path'])==len(a['features'])==p['steps']-start
   assert a['path'][0][0]==(pr if start==0 else arms[(route,'high' if name=='highHouseFromLow' else 'low')]['path'][start][0])
   assert all(x[1]==y[0] for x,y in zip(a['path'],a['path'][1:])) and all(tuple(x) in ((pr,pr),(pr,di),(di,pr)) for x in a['path'])
   assert all(len(z['house'])==9 and len(z['pfm'])==3 and all(math.isfinite(q) for q in z['house']+z['pfm']) for z in a['features'])
   expected=p['steps'] if e['partition']=='test' and name in ('low','high') else 0;assert len(a['probes'])==expected
   for t,row in enumerate(a['probes']):
    assert len(row)==5 and row[0]==a['path'][t][0] and all(q in (pr,di) for q in row[1:])
    if row[0]==di:assert row[1:]==[pr,pr,pr,pr]
    pair=row[1:3] if name=='low' else row[3:5];assert a['path'][t][1]==pair[0 if obs[t]['ok'] else 1]
  for name in ('release','reverse'):
   assert arms[(route,name)]['path'][:p['releaseAt']]==arms[(route,'high')]['path'][:p['releaseAt']]
   assert arms[(route,name)]['features'][:p['releaseAt']]==arms[(route,'high')]['features'][:p['releaseAt']]
 checks={(q['route'],q['name']):q for q in e['swapChecks']};assert len(checks)==4
 for route,name in itertools.product(('warp','control'),('highHouseFromLow','lowHouseFromHigh')):
  q=checks[(route,name)];assert q['afterHouseHash']==q['donorHouseHash'] and q['hostOtherHash']==q['afterOtherHash'] and q['changed']==(q['hostHouseHash']!=q['donorHouseHash']);changed+=int(q['changed'])
  assert (q['host'],q['donor'])==(('high','low') if name=='highHouseFromLow' else ('low','high'))
  witness=q['witness'];needed=e['partition']=='test' and e['index']==0 and e['flip']==0;assert (witness is not None)==needed
  if witness:
   h,a=witness['host'],witness['after'];assert a['L']==witness['donorHouse'] and {k:v for k,v in h.items() if k!='L'}=={k:v for k,v in a.items() if k!='L'} and (h['L']!=a['L'])==q['changed'];witnesses+=1
assert seen==set(itertools.product(('train','test'),range(p['pairsPerPartition']),(0,1))) and witnesses==4
print(json.dumps({'status':'VERIFIED','lineage':d['lineage'],'episodes':len(seen),'switches':switches,'changedSwapBoundaries':changed,'witnesses':witnesses,'resultSha256':H(db)}))
