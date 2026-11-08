"""Independent recomputation of origin contrasts and ten Holm tests."""
import hashlib,itertools,json,math,statistics,sys
from pathlib import Path
if len(sys.argv)!=3:raise SystemExit('audit-outcome.py OUTCOME OUTPUT')
p=Path(sys.argv[1]);x=json.loads(p.read_text());orig=x['origins'];assert len(orig)==8
for k,v in x['means'].items():assert math.isclose(v,statistics.mean(o['means'][k] for o in orig),abs_tol=1e-14)
def g(o,route,typ,mem='retain'):return o['means'][f'{route}|{typ}|same|{mem}|recovered']
V={'phase_vs_natural':[g(o,'warp','focus_phase')-g(o,'warp','natural') for o in orig],'phase_vs_global':[g(o,'warp','focus_phase')-g(o,'warp','global') for o in orig],'phase_vs_matched27':[g(o,'warp','focus_phase')-g(o,'matched27','focus_phase') for o in orig],'phase_vs_yoked_phase':[g(o,'warp','focus_phase')-g(o,'warp','phase_yoked') for o in orig],'phase_vs_plain':[g(o,'warp','focus_phase')-g(o,'warp','focus_plain') for o in orig],'phase_retained_vs_reset':[g(o,'warp','focus_phase')-g(o,'warp','focus_phase','reset') for o in orig],'phase_retained_vs_donor':[g(o,'warp','focus_phase')-g(o,'warp','focus_phase','donor') for o in orig],'entry_vs_sham':[g(o,'warp','entry')-g(o,'warp','sham_entry') for o in orig],'entry_specificity':[(g(o,'warp','entry')-g(o,'warp','sham_entry'))-(g(o,'matched27','entry')-g(o,'matched27','sham_entry')) for o in orig],'entry_vs_global':[g(o,'warp','entry')-g(o,'warp','global') for o in orig]};raw=[]
for k,ds in V.items():
 v=x['comparisons'][k];avg=statistics.mean(ds);assert math.isclose(avg,v['meanDifference'],abs_tol=1e-14) and all(math.isclose(a,b,abs_tol=1e-14) for a,b in zip(ds,v['originDifferences']));q=sum(statistics.mean(s*z for s,z in zip(pat,ds))>=avg-1e-14 for pat in itertools.product((-1,1),repeat=8))/256;assert q==v['oneSidedSignFlipP'];raw.append(q)
order=sorted(range(len(V)),key=lambda i:raw[i]);adj=[0]*len(V);last=0
for j,i in enumerate(order):last=max(last,min(1,(len(V)-j)*raw[i]));adj[i]=last
for i,k in enumerate(V):
 v=x['comparisons'][k];assert v['holmP']==adj[i] and v['passes']==(v['meanDifference']>=v['threshold'] and adj[i]<=.05)
phase='REGISTERED_PHASE_CHANNEL_SPECIFIC_ADVANTAGE' if all(x['comparisons'][k]['passes'] for k in list(V)[:7]) else 'NO_REGISTERED_PHASE_CHANNEL_SPECIFIC_ADVANTAGE';entry='REGISTERED_ENGINEERED_ENTRY_SPECIFIC_ADVANTAGE' if all(x['comparisons'][k]['passes'] for k in list(V)[7:]) else 'NO_REGISTERED_ENGINEERED_ENTRY_SPECIFIC_ADVANTAGE';assert x['classification']=={'phase':phase,'entry':entry}
out={'status':'VERIFIED','outcomeSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'scope':'Independently recomputed aggregate origin means, contrasts, sign-flip/Holm tests and recorded classifications; does not independently regenerate Oracle state trajectories.','classification':x['classification']};Path(sys.argv[2]).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
