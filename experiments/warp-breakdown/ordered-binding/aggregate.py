"""Sealed order-recall accuracy under balanced switched histories."""
import hashlib,itertools,json,statistics,sys
from pathlib import Path
if len(sys.argv)!=5:raise SystemExit('aggregate.py REG RUN DATA OUTPUT')
pb,rb=(Path(x).read_bytes() for x in sys.argv[1:3]);p,r=(json.loads(x) for x in (pb,rb));H=lambda x:hashlib.sha256(x).hexdigest();assert H(pb)==r['registrationSha256'] and H(Path(__file__).read_bytes())==p['scripts']['aggregate.py'];root=Path(sys.argv[3]);mean=statistics.mean;origins=[]
for i,lid in enumerate(p['lineages']):
 b=(root/lid/'result.json').read_bytes();d=json.loads(b);a=json.loads((root/lid/'audit.json').read_text());v=json.loads((root/lid/'replay-proof.json').read_text());assert d['lineage']==lid and d['index']==i and d['runSha256']==H(rb) and a['status']=='VERIFIED' and a['resultSha256']==H(b) and v['status']=='VERIFIED' and v['originalSha256']==H(b)
 vals={};counts={}
 for e in d['episodes']:
  phase='switched' if e['switched'] else 'unchanged'
  for route in ('warp','matched27','direct_host','direct_standalone'):
   for kind in ('retain','reset','donor'):
    for ctx in ('old','new'):
     arms=[a for a in (e['direct'] if route=='direct_standalone' else e['arms']) if route=='direct_standalone' or a['route']==route];assert len(arms)==3
     z=[]
     for arm in arms:
      state=next(x for x in arm['results'] if x['kind']==kind);qs=[q for q in state['probes'] if q['context']==ctx];assert len(qs)==2;z.append(mean(q['correct'] for q in qs))
     vals.setdefault(f'{route}|{kind}|{ctx}|{phase}',[]).append(mean(z))
     counts[f'{route}|{kind}|{ctx}|{phase}']=counts.get(f'{route}|{kind}|{ctx}|{phase}',0)+6
 assert all(len(v)==2*p['pairs'] for v in vals.values())
 origins.append({'lineage':lid,'episodes':len(d['episodes']),'means':{k:mean(v) for k,v in vals.items()},'counts':counts})
def get(o,route,kind='retain',ctx='old',phase='switched'):return o['means'][f'{route}|{kind}|{ctx}|{phase}']
def signp(v):
 ob=mean(v);return sum(mean(s*x for s,x in zip(z,v))>=ob-1e-14 for z in itertools.product((-1,1),repeat=len(v)))/2**len(v)
def holm(ps):
 order=sorted(range(len(ps)),key=lambda i:ps[i]);out=[0]*len(ps);last=0
 for j,i in enumerate(order):last=max(last,min(1,ps[i]*(len(ps)-j)));out[i]=last
 return out
def family(vs):
 raw=[signp(v) for v in vs.values()];adj=holm(raw);return {k:{'meanDifference':mean(v),'originDifferences':v,'rawP':raw[i],'holmP':adj[i],'passes':mean(v)>0 and adj[i]<.05} for i,(k,v) in enumerate(vs.items())}
primary=family({'warp_vs_matched27':[get(o,'warp')-get(o,'matched27') for o in origins],'warp_vs_direct_recurrent':[get(o,'warp')-get(o,'direct_host') for o in origins]});secondary=family({'warp_retained_vs_reset':[get(o,'warp')-get(o,'warp','reset') for o in origins],'warp_retained_vs_donor':[get(o,'warp')-get(o,'warp','donor') for o in origins]});classification='REGISTERED_WARP_ORDER_BINDING_ADVANTAGE' if all(v['passes'] for v in primary.values()) else 'NO_REGISTERED_WARP_ORDER_BINDING_ADVANTAGE';means={k:mean(o['means'][k] for o in origins) for k in origins[0]['means']};probeCounts={k:sum(o['counts'][k] for o in origins) for k in origins[0]['counts']}
out={'schema':'amelia.order-outcome/v1','registrationSha256':H(pb),'runSha256':H(rb),'classification':classification,'primary':primary,'secondaryBinding':secondary,'means':means,'probeCounts':probeCounts,'origins':origins,'notes':['All three hosted arms have 10 Numogram zones, 30 values in each of V, S and D, six task-visible memory values and two focus nodes; 3/6 and direct host have 29 open gates, while the adapted 2/7 graph has 24.','Direct recurrent comparator shares the complete Oracle host capacity but bypasses gate selection for its response; a separate six-scalar standalone recurrent comparator has no full Oracle host.','The two-timescale recurrence and order decoder are explicitly engineered rather than learned or emergent.','Eight reused origin checkpoints later shared world input.']};Path(sys.argv[4]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'classification':classification,'primary':primary,'secondary':secondary,'means':means,'probeCounts':probeCounts}))
