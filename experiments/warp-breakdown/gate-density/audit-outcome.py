"""Independent reconstruction of accuracies, trace accounting and Holm tests."""
import hashlib,itertools,json,sys
from pathlib import Path
from statistics import mean
if len(sys.argv)!=5:raise SystemExit('audit-outcome.py REG RUN DATA OUTCOME')
pb,rb=(Path(x).read_bytes() for x in sys.argv[1:3]);p,r=(json.loads(x) for x in (pb,rb));root=Path(sys.argv[3]);path=Path(sys.argv[4]);x=json.loads(path.read_text());H=lambda b:hashlib.sha256(b).hexdigest();assert H(pb)==r['registrationSha256']==x['registrationSha256'] and H(rb)==x['runSha256'] and H(Path(__file__).read_bytes())==p['scripts']['audit-outcome.py'];configs=('sham29','A','B','C','D','A_direct','B_direct','C_direct','D_direct','matched27','direct_host','direct_standalone');means=[];allDrift=[];allResources=[]
for lid,o in zip(p['lineages'],x['origins']):
 d=json.loads((root/lid/'result.json').read_text());assert d['lineage']==lid==o['lineage'];m={}
 for cfg in configs:
  for kind in ('retain','reset','donor'):
   for ctx in ('old','new'):
    for phase in ('switched','unchanged'):
     per=[]
     for e in d['episodes']:
      if e['switched']!=(phase=='switched'):continue
      aa=e['direct'] if cfg=='direct_standalone' else [a for a in e['arms'] if a['config']==cfg];zs=[]
      for a in aa:
       s=next(s for s in a['results'] if s['kind']==kind);vs=[]
       for q in s['probes']:
        if q['context']!=ctx:continue
        seq=e['old'] if ctx=='old' else e['next'];target=int(seq.index(q['left'])>seq.index(q['right']));assert q['target']==target;vs.append(int(q['action']==target))
       assert len(vs)==2;zs.append(mean(vs))
      assert len(zs)==3;per.append(mean(zs))
     assert len(per)==2*p['pairs'];key=f'{cfg}|{kind}|{ctx}|{phase}';m[key]=mean(per);assert abs(m[key]-o['means'][key])<1e-12
 means.append(m);dr={};res={}
 for cfg in configs[:-1]:
  rec={k:0 for k in o['resources'][cfg]};vv={'V':[],'D':[]}
  for e in d['episodes']:
   if not e['switched']:continue
   for arm in (a for a in e['arms'] if a['config']==cfg):
    rec['switchedBranches']+=1;events=[q for s in arm['second'] for q in s['path']];rec['phase2GateEvents']+=len(events);rec['phase2Deaths']+=sum(q['died'] for q in events);focus=(2,7) if cfg=='matched27' else (3,6);rec['phase2FocusReturns']+=int(any(q['to'] in focus or q['postZone'] in focus for q in events))
    for f,idx in (('V',0),('D',3)):vv[f].append(mean(mean(abs(q['after'][idx+j]-q['written'][idx+j]) for j in range(3)) for q in arm['second']))
    state=next(s for s in arm['results'] if s['kind']=='retain')
    for q in state['probes']:
     if q['context']=='old':rec['oldProbes']+=1;rec['oldGateEvents']+=len(q['path']);rec['oldProbeDeaths']+=sum(t['died'] for t in q['path']);rec['gateMatchesDecoder']+=int(q['gateAction']==q['readout']['action'])
  assert rec==o['resources'][cfg];res[cfg]=rec
  for f in ('V','D'):dr[f'{cfg}|{f}']=mean(vv[f]);assert abs(dr[f'{cfg}|{f}']-o['meanPhase2SlotDrift'][f'{cfg}|{f}'])<1e-12
 allDrift.append(dr);allResources.append(res)
for key,v in x['means'].items():assert abs(mean(m[key] for m in means)-v)<1e-12
for key,v in x['meanPhase2SlotDrift'].items():assert abs(mean(m[key] for m in allDrift)-v)<1e-12
for cfg,vals in x['resources'].items():
 for k,v in vals.items():assert v==sum(z[cfg][k] for z in allResources)
def P(z):
 obs=sum(z);return sum(sum(a*b for a,b in zip(signs,z))>=obs-1e-12 for signs in itertools.product((-1,1),repeat=len(z)))/2**len(z)
def family(spec,stored):
 vectors={k:[m[a]-m[b] for m in means] for k,(a,b) in spec.items()};raw={k:P(z) for k,z in vectors.items()};order=sorted(raw,key=raw.get);corr={};last=0
 for i,k in enumerate(order):last=max(last,min(1,(len(order)-i)*raw[k]));corr[k]=last
 for k,z in vectors.items():
  q=stored[k];ok=mean(z)>0 and corr[k]<.05;assert q['originDifferences']==z and abs(q['meanDifference']-mean(z))<1e-12 and q['rawP']==raw[k] and q['holmP']==corr[k] and q['passes']==ok
 return stored
primary=family({key:value for mask in ('A','B','C','D') for key,value in ((f'{mask}_vs_matched27',(f'{mask}|retain|old|switched','matched27|retain|old|switched')),(f'{mask}_vs_direct',(f'{mask}|retain|old|switched',f'{mask}_direct|retain|old|switched')))},x['primary']);family({f'{mask}_vs_sham29':(f'{mask}|retain|old|switched','sham29|retain|old|switched') for mask in ('A','B','C','D')},x['secondaryDensity']);family({'A_retained_vs_reset':('A|retain|old|switched','A|reset|old|switched'),'A_retained_vs_donor':('A|retain|old|switched','A|donor|old|switched')},x['secondaryMemory']);winners=[mask for mask in ('A','B','C','D') if primary[f'{mask}_vs_matched27']['passes'] and primary[f'{mask}_vs_direct']['passes']];expected='REGISTERED_WARP_DENSITY_MASK_ADVANTAGE' if winners else 'NO_REGISTERED_WARP_DENSITY_MASK_ADVANTAGE';assert winners==x['winningMasks'] and expected==x['classification']
out={'status':'VERIFIED','outcomeSha256':H(path.read_bytes()),'classification':expected,'scope':'Independently reconstructed all origin accuracies, House-slot drift and path counts from raw records, then recomputed all three Holm families and the classification; input and legal paths audited separately.'};path.with_name('outcome-audit.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
