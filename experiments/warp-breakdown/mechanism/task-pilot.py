import hashlib,math,statistics,json
plan={"expansionCap":50,"maxCostRatio":1.5}
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




choices=[['add','g',['mul',c,'d']] for c in (1,1.5,2,2.5,2.8,3.2,4,5,8)]
for lev in (0,1,2,3):
 cases=[grid(f'mechanism-pilot:{lev}:{i}',lev) for i in range(150)]
 print('level',lev,[(a[2][1],evaluate(a,cases)['passed']) for a in choices])
