"""Independent recomputation of R1 (initial + confirmation), R2 (echo), R3 (promoter) from per-seed records.
Seed-weighted paired means; 10,000 seed-cluster percentile bootstrap with this script's own RNG."""
import json,glob,random,sys,os
B=sys.argv[1]
def seeds(d): return [json.load(open(p)) for p in sorted(glob.glob(os.path.join(B,d,'seed_*.json')))]
def boot(means,level,n=10000,rng=random.Random(20261115)):
    k=len(means); bs=sorted(sum(rng.choice(means) for _ in range(k))/k for _ in range(n))
    a=(1-level)/2; return bs[int(a*n)], bs[int((1-a)*n)-1]
def contrast(S,f,a,b,level):
    means=[]; nenc=0
    for s in S:
        diffs=[f(t['outcomes'][a])-f(t['outcomes'][b]) for t in s['trials']]
        if diffs: means.append(sum(diffs)/len(diffs)); nenc+=len(diffs)
    m=sum(means)/len(means); lo,hi=boot(means,level)
    return f"{a}-{b}: {m:+.5f} [{lo:+.5f}, {hi:+.5f}] ({level*100:g}%, {len(means)} seeds, {nenc} enc)"
def armmean(S,f,a):
    ms=[sum(f(t['outcomes'][a]) for t in s['trials'])/len(s['trials']) for s in S if s['trials']]; return sum(ms)/len(ms)
def count(S,f,a): return sum(bool(f(t['outcomes'][a])) for s in S for t in s['trials'])
R1='AMELIA_RANDOMIZED_HOST_ENCOUNTER_EVIDENCE_2026-11-14/results'
S=seeds(R1+'/initial'); print('R1 initial', len(S),'seeds', sum(len(s['trials']) for s in S),'enc')
for f,n in [(lambda o:o['nutrient'],'nutrient'),(lambda o:float(o['survived']),'survival')]:
    for b in ['pointer','shuffled']: print(' ',n,contrast(S,f,'experienced',b,0.9875))
for a in ['experienced','pointer','shuffled']: print('  ',a,'nutrient',round(armmean(S,lambda o:o['nutrient'],a),4),'survived',count(S,lambda o:o['survived'],a))
S=seeds(R1+'/confirmation'); print('R1 confirmation', len(S),'seeds', sum(len(s['trials']) for s in S),'enc')
fi=lambda o:(o['first_intake'] or 0.0)
for b in ['pointer','shuffled']: print('  first-action',contrast(S,fi,'experienced',b,0.975))
for a in ['experienced','pointer','shuffled']: print('  ',a,'first',round(armmean(S,fi,a),5),'match',count(S,lambda o:o['first_digit_matches_payload'],a),'survived',count(S,lambda o:o['survived'],a))
S=seeds('CYBERGOTHIC_VIRAL_ECHO_EVIDENCE_2026-11-15/fresh_echo_34001'); print('R2 echo', len(S),'seeds', sum(len(s['trials']) for s in S),'enc')
ret=lambda o:float(bool(o['timepoints']['24']['intact'] if o['arm']!='natural' else o['timepoints']['24']['original_intact']))
print('  retention24',contrast(S,ret,'experienced_echo','natural',0.975))
print('  counts natural original',count(S,lambda o:o['timepoints']['24']['original_intact'],'natural'),'echo any',count(S,lambda o:o['timepoints']['24']['intact'],'experienced_echo'))
up=lambda o:o['timepoints']['24']['uptake']
print('  uptake24',contrast(S,up,'experienced_echo','shuffled_echo',0.975))
for a in ['experienced_echo','shuffled_echo']: print('  ',a,'uptake',round(armmean(S,up,a),4),'alive',count(S,lambda o:o['timepoints']['24']['alive'],a))
S=seeds('CYBERGOTHIC_PROMOTER_EVIDENCE_2026-11-15/fresh_promoter_35001'); print('R3 promoter', len(S),'seeds', sum(len(s['trials']) for s in S),'enc')
for b in ['open','rotated','zone_shuffled']: print('  uptake24',contrast(S,up,'zone',b,0.9833))
for a in ['open','zone','rotated','zone_shuffled','syzygy']:
    tp=lambda o:o['timepoints']['24']
    print('  ',a,'uptake',round(armmean(S,up,a),4),'alive',count(S,lambda o:tp(o)['alive'],a),'payload/rec',round(sum(tp(t['outcomes'][a])['payload_actions'] for s in S for t in s['trials'])/sum(len(s['trials']) for s in S),2))
