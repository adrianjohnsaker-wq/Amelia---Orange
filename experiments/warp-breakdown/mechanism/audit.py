"""Independent recreation of deterministic challenges and integrity checks."""
import hashlib,json,math,sys,itertools
from pathlib import Path
if len(sys.argv)!=4:raise SystemExit('Usage: audit.py PLAN SCRIPT RESULT')
pb=Path(sys.argv[1]).read_bytes();sb=Path(sys.argv[2]).read_bytes();rb=Path(sys.argv[3]).read_bytes();plan=json.loads(pb);d=json.loads(rb)
H=lambda b:hashlib.sha256(b).hexdigest()
assert d['schema']=='amelia.warp-mechanism-transfer-result/v1' and d['status']=='COMPLETE'
assert d['planSha256']==H(pb) and d['scriptSha256']==H(sb)==plan['scriptSha256'] and d['checkpointSha256']==plan['checkpointSha256']
assert d['lineage']==plan['lineages'][d['index']]
def rand(seed,n):return int(hashlib.sha256(seed.encode()).hexdigest()[:8],16)%n
def grid(seed,level):
    n=9;cells=[]
    for i in range(n*n):
        opened=rand(f'{seed}:wall:{i}',100)>=26;cost=1+rand(f'{seed}:cost:{i}',9)
        cells.append([opened,1+((cost-1)*level)//3])
    x=y=t=0;cells[0][0]=True
    while x<n-1 or y<n-1:
        if x==n-1:y+=1
        elif y==n-1:x+=1
        elif rand(f'{seed}:carve:{t}',2):x+=1
        else:y+=1
        cells[y*n+x][0]=True;t+=1
    return cells
def valid(a,depth=0,c=None):
    if c is None:c=[0]
    c[0]+=1
    if c[0]>31 or depth>4:return False
    if isinstance(a,bool):return False
    if isinstance(a,(float,int)):return math.isfinite(a) and abs(a)<=16
    if isinstance(a,str):return a in ('g','d','w','x','y')
    return isinstance(a,list) and len(a)==3 and a[0] in ('add','sub','mul','min','max') and valid(a[1],depth+1,c) and valid(a[2],depth+1,c)
def value(a,v):
    if isinstance(a,(float,int)):return a
    if isinstance(a,str):return v[a]
    x,y=value(a[1],v),value(a[2],v)
    z={'add':lambda:x+y,'sub':lambda:x-y,'mul':lambda:x*y,'min':lambda:min(x,y),'max':lambda:max(x,y)}[a[0]]()
    return max(-1e6,min(1e6,z))
def solve(cells,ast,cap):
    n=9;best=[float('inf')]*(n*n);best[0]=0;q=[{'id':0,'g':0,'rank':0,'d':2*(n-1)}];expanded=0
    while q and expanded<cap:
        q.sort(key=lambda x:(x['rank'],x['d'],x['id']));cur=q.pop(0)
        if cur['g']!=best[cur['id']]:continue
        expanded+=1
        if cur['id']==n*n-1:return {'solved':True,'cost':cur['g'],'expanded':expanded}
        x=cur['id']%n;y=cur['id']//n
        for nx,ny in ((x+1,y),(x,y+1),(x-1,y),(x,y-1)):
            if not(0<=nx<n and 0<=ny<n):continue
            i=ny*n+nx;opened,cost=cells[i]
            if not opened:continue
            ng=cur['g']+cost
            if ng>=best[i]:continue
            best[i]=ng;d=(n-1-nx)+(n-1-ny);rank=value(ast,{'g':ng,'d':d,'w':cost,'x':nx,'y':ny})
            q.append({'id':i,'g':ng,'rank':rank,'d':d})
    return {'solved':False,'cost':None,'expanded':expanded}
def evaluate(ast,cases):
    if not valid(ast):return {'passed':0,'failed':len(cases),'meanExpanded':0,'invalid':True}
    passed=expanded=0
    for case in cases:
        optimum=solve(case,'g',10000);r=solve(case,ast,plan['expansionCap']);assert optimum['solved']
        if r['solved'] and r['cost']<=optimum['cost']*plan['maxCostRatio']:passed+=1
        expanded+=r['expanded']
    return {'passed':passed,'failed':len(cases)-passed,'meanExpanded':math.floor(expanded/len(cases)+0.5),'invalid':False}
def feedback(d):return f"p={d['passed']:02d};e={d['meanExpanded']:03d};v={0 if d['invalid'] else 1}"




initial=['add','g',['mul',2.5,'d']];light=['add','g',['mul',1.5,'d']];heavy=['add','g',['mul',4,'d']]
by={(x['partition'],x['index'],x['mode'],x['route'],x['gain']):x for x in d['rows']}
assert len(by)==len(d['rows'])==plan['pairsPerPartition']*2*2*2*2
count=0
for partition,index,mode in itertools.product(('train','test'),range(plan['pairsPerPartition']),(1,3)):
 seed=H(f"{plan['masterSeed']}:{d['lineage']}:{partition}:{index}".encode())
 egrid=lambda phase,n,level:[grid(f'{seed}:{phase}:{i}',level) for i in range(n)]
 before=evaluate(initial,egrid('breakdown',6,2));shock=evaluate(initial,egrid('breakdown',6,mode))
 feedback=[evaluate(light,[g])['passed'] for g in egrid('feedback',plan['observationSteps'],mode)]
 cases=egrid('heldout',plan['heldoutCases'],mode);held={'light':evaluate(light,cases),'heavy':evaluate(heavy,cases),'baseline':evaluate(initial,cases)}
 for route,gain in itertools.product(('warp','control'),plan['cueWeights']):
  row=by[(partition,index,mode,route,gain)];count+=1
  assert row['seedHash']==H(seed.encode()) and row['before']==before and row['shocked']==shock and row['heldout']==held
  assert row['breakdown']==(before['passed']-shock['passed']>=2) and row['feedback']==feedback
  p,z=(3,6) if route=='warp' else (2,7);path=row['path'];assert len(path)==plan['observationSteps']
  assert path[0][0]==p and all(a[1]==b[0] for a,b in zip(path,path[1:]))
  assert all(tuple(edge) in ((p,p),(p,z),(z,p)) for edge in path)
  assert row['features']['path']==[sum(e==[p,p] for e in path),sum(e==[p,z] for e in path),sum(e==[z,p] for e in path)]
  assert row['features']['last1']==[feedback[-1]] and row['features']['last4']==[sum(feedback[-4:])] and row['features']['all24']==[sum(feedback)]
  assert len(row['features']['house'])==9 and len(row['features']['pfm'])==3
  assert all(math.isfinite(v) for feature in row['features'].values() for v in feature)
  if partition=='test':
   swaps=row['swaps'];assert len(swaps['normalPath'])==plan['followSteps']
   for component,n in (('house',9),('pfm',3)):
    z0=swaps[component];assert z0['nonComponentHash']==z0['nonComponentHashAfter'] and len(z0['path'])==plan['followSteps']
    assert z0['pathChanged']==(swaps['normalPath']!=z0['path']) and len(z0['donorFeatures'])==n
    assert all(math.isfinite(v) for v in z0['donorFeatures'])
  else:assert 'swaps' not in row
print(json.dumps({'status':'VERIFIED','lineage':d['lineage'],'rows':count,'resultSha256':H(rb)}))
