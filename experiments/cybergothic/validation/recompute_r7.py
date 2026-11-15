"""Independent recomputation of R7 headline counts and survival contrasts from population_summaries.json.gz."""
import json,gzip,random,sys,collections
P=json.load(gzip.open(sys.argv[1]))['populations']
nat=[p['branches']['natural']['classification'] for p in P]
print('populations',len(P),'seeds',min(p['seed'] for p in P),'-',max(p['seed'] for p in P))
print('verified viral deliveries',sum(c['verified_viral_delivery_events'] for c in nat),
      '| recipient hosts',sum(c['unique_viral_recipients'] for c in nat),
      '| populations with a delivery',sum(c['verified_viral_delivery_events']>0 for c in nat),
      '| per-population',dict(collections.Counter(c['verified_viral_delivery_events'] for c in nat)))
cats=collections.Counter()
for c in nat: cats.update({k:(v if isinstance(v,int) else 1) for k,v in c['categories'].items()})
print('natural secondary-carrier categories',dict(cats))
rng=random.Random(20261115)
def paired(a,b,n=10000):
    d=[float(p['branches'][a]['founder_survived'])-float(p['branches'][b]['founder_survived']) for p in P]
    m=sum(d)/len(d); k=len(d); bs=sorted(sum(rng.choice(d) for _ in range(k))/k for _ in range(n))
    return f"{a} - {b}: {100*m:+.1f} pp (95% {100*bs[249]:+.1f} to {100*bs[9749]:+.1f})"
for a in P[0]['branches']: print(a,'founder survived',sum(p['branches'][a]['founder_survived'] for p in P),'/',len(P))
for b in ['recipient_active','ruptured_08','ruptured_00','scramble']: print(paired('natural',b))
