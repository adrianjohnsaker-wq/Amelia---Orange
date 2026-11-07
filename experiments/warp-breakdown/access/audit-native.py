"""Independent path/cue accounting and replay check for native exploratory probe."""
import collections,hashlib,json,statistics,sys
from pathlib import Path
x,y=(Path(p).read_bytes() for p in sys.argv[1:3]);assert x==y;d=json.loads(x);assert d['status']=='EXPLORATORY' and len(d['rows'])==256
h=lambda s:hashlib.sha256(s.encode()).hexdigest();rows=d['rows'];summary={};keys=set()
for r in rows:
 k=(r['id'],r['strength'],r['seed'],r['route']);assert k not in keys;keys.add(k)
 z=(3,6) if r['route']=='warp' else (2,7);path=r['path'];assert len(path)==64 and path[0]['from']==z[0]
 for t,q in enumerate(path):
  assert q['t']==t and q['cue']==z[int(h(f"native-access-explore:{r['id']}:{r['seed']}:{t}")[:8],16)%2]
  if t:assert path[t-1]['to']==q['from']
  if q['from']==3:assert q['to'] in (3,6)
  if q['from']==6:assert q['to']==3
  if q['from']==2:assert q['to'] in (3,4,5,7)
  if q['from']==7:assert q['to'] in (1,2,5,8)
 first=next((q['t'] for q in path if q['to'] not in z),None);assert first==r['firstExit']
 assert r['chosen']==sum(q['to']==q['cue'] for q in path)
 assert r['bothZones']==(len({z[0]}|{q['to'] for q in path if q['to'] in z})==2)
 for q in r['probes']:assert q['from'] in z and q['from']==path[q['t']]['from']
for strength in (.054,.35):
 for route in ('warp','native27'):
  a=[r for r in rows if r['strength']==strength and r['route']==route];assert len(a)==64
  c=collections.Counter(f"{q['from']}>{q['to']}" for r in a for q in r['path']);probes=[q for r in a for q in r['probes']]
  summary[f'{strength}:{route}']={'episodes':len(a),'completeRetention':sum(r['firstExit'] is None for r in a),'bothZones':sum(r['bothZones'] for r in a),'cueMatches':sum(r['chosen'] for r in a),'transitions':len(a)*64,'sameStateCueChanges':sum(q['targets'][0]!=q['targets'][1] for q in probes),'sameStateComparisons':len(probes),'firstExitMean':statistics.mean(64 if r['firstExit'] is None else r['firstExit']+1 for r in a),'warpDwellCount':c['3>3']}
print(json.dumps({'status':'VERIFIED','scope':'Raw native paths, public cue construction, paired input and aggregate counts; deterministic byte-identical replay.','originalSha256':hashlib.sha256(x).hexdigest(),'summary':summary},indent=2))
