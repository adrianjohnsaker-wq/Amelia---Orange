"""Independently reconstruct origin accuracies and prespecified tests from raw choices."""
import hashlib,itertools,json,sys
from pathlib import Path
from statistics import mean
if len(sys.argv)!=5:raise SystemExit('audit-outcome.py REG RUN DATA OUTCOME')
pb,rb=(Path(x).read_bytes() for x in sys.argv[1:3]);p,r=(json.loads(x) for x in (pb,rb));root=Path(sys.argv[3]);path=Path(sys.argv[4]);x=json.loads(path.read_text());H=lambda b:hashlib.sha256(b).hexdigest();assert H(pb)==r['registrationSha256']==x['registrationSha256'] and H(rb)==x['runSha256'] and H(Path(__file__).read_bytes())==p['scripts']['audit-outcome.py']
means=[]
for lid,o in zip(p['lineages'],x['origins']):
 d=json.loads((root/lid/'result.json').read_text());assert d['lineage']==lid==o['lineage'];m={}
 for route in ('warp','matched27','direct_host','direct_standalone'):
  for kind in ('retain','reset','donor'):
   for ctx in ('old','new'):
    for phase in ('switched','unchanged'):
     per=[]
     for e in d['episodes']:
      if e['switched']!=(phase=='switched'):continue
      aa=e['direct'] if route=='direct_standalone' else [a for a in e['arms'] if a['route']==route];zs=[]
      for a in aa:
       q=next(q for q in a['results'] if q['kind']==kind);z=[]
       for probe in q['probes']:
        if probe['context']!=ctx:continue
        seq=e['old'] if ctx=='old' else e['next'];target=int(seq.index(probe['left'])>seq.index(probe['right']));assert target==probe['target'];z.append(int(probe['action']==target))
       assert len(z)==2;zs.append(mean(z))
      assert len(zs)==3;per.append(mean(zs))
     assert len(per)==2*p['pairs'];key=f'{route}|{kind}|{ctx}|{phase}';m[key]=mean(per);assert abs(m[key]-o['means'][key])<1e-12
 means.append(m)
for key,v in x['means'].items():assert abs(mean(m[key] for m in means)-v)<1e-12
def P(z):
 target=sum(z);return sum(sum(s*v for s,v in zip(signs,z))>=target-1e-12 for signs in itertools.product((-1,1),repeat=len(z)))/2**len(z)
def family(spec,stored):
 vectors={k:[m[a]-m[b] for m in means] for k,(a,b) in spec.items()};raw={k:P(z) for k,z in vectors.items()};order=sorted(raw,key=raw.get);corrected={};last=0
 for i,k in enumerate(order):last=max(last,min(1,raw[k]*(len(order)-i)));corrected[k]=last
 for k,z in vectors.items():
  q=stored[k];ok=mean(z)>0 and corrected[k]<.05;assert q['originDifferences']==z and abs(q['meanDifference']-mean(z))<1e-12 and q['rawP']==raw[k] and q['holmP']==corrected[k] and q['passes']==ok
 return all(stored[k]['passes'] for k in spec)
w='warp|retain|old|switched';family({'warp_retained_vs_reset':(w,'warp|reset|old|switched'),'warp_retained_vs_donor':(w,'warp|donor|old|switched')},x['secondaryBinding']);positive=family({'warp_vs_matched27':(w,'matched27|retain|old|switched'),'warp_vs_direct_recurrent':(w,'direct_host|retain|old|switched')},x['primary']);expected='REGISTERED_WARP_ORDER_BINDING_ADVANTAGE' if positive else 'NO_REGISTERED_WARP_ORDER_BINDING_ADVANTAGE';assert x['classification']==expected
out={'status':'VERIFIED','outcomeSha256':H(path.read_bytes()),'classification':expected,'scope':'Independently reconstructed all origin accuracies from raw choices and labels, paired exact sign-flip tests and Holm adjustment; input, target and legal paths independently checked separately.'};target=path.with_name('outcome-audit.json');target.write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
