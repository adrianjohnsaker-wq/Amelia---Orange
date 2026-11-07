"""Exploratory per-shock and House-vector diagnostics; not new confirmatory tests."""
from pathlib import Path
import collections,json,statistics,sys
root=Path(sys.argv[1]);D=[json.loads(p.read_text()) for p in sorted(root.glob('S05W*|0/result.json'))];assert len(D)==8
out={'status':'EXPLORATORY','byShock':{},'pretrainingHouseVectors':{},'pathCounts':{}};box=collections.defaultdict(list);vhash=collections.defaultdict(lambda:[0,0]);paths=collections.defaultdict(lambda:collections.Counter());counts=collections.Counter()
for d in D:
 for e in d['episodes']:
  for route,tr in e['training'].items():
   vhash[route][0]+=int(tr['realVHash']!=tr['baseVHash']);vhash[route][1]+=1
   for s in tr['tracks']['real']:
    for q in s['path']:paths['train:'+route][str(q['from'])+'>'+str(q['to'])]+=1
  for shock in e['shocks']:
   for route in ('warp','native27','matched27'):
    arms={a['memory']:a for a in e['post'] if a['route']==route and a['shockZone']==shock and a['scenario']=='same'}
    assert set(arms)=={'retain','reset','donor'};counts[(shock,route)]+=1
    for typ in ('gate','global'):
     key='score' if typ=='gate' else 'globalScore';r=sum(s[key] for s in arms['retain']['steps'][:5])/10;z=sum(s[key] for s in arms['reset']['steps'][:5])/10;box[(shock,route,typ)].append(r-z)
    for s in arms['retain']['steps'][:5]:
     for q in s['path']:paths['post:'+route][str(q['from'])+'>'+str(q['to'])]+=1
for (shock,route,typ),v in sorted(box.items()):out['byShock'][f'{shock}:{route}:{typ}']={'branchCount':len(v),'meanRetainMinusReset':statistics.mean(v)}
out['pretrainingHouseVectors']=dict(vhash);out['pathCounts']={k:dict(v) for k,v in paths.items()};Path(sys.argv[2]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'status':out['status'],'branchShockGroups':len(out['byShock']),'pretrainingHouseVectors':out['pretrainingHouseVectors']}))
