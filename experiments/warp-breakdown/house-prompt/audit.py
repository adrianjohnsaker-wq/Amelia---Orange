"""Independently replay all recorded task scores, prompts, feedback and gate arithmetic."""
import hashlib,json,math,os,re,sys,itertools
from pathlib import Path
if len(sys.argv)!=4: raise SystemExit('Usage: audit.py PLAN SCRIPT RESULT')
plan_bytes=Path(sys.argv[1]).read_bytes();script=Path(sys.argv[2]).read_bytes();data=Path(sys.argv[3]).read_bytes()
plan=json.loads(plan_bytes);result=json.loads(data);H=lambda b:hashlib.sha256(b).hexdigest()
assert H(plan_bytes)==result['planSha256'] and H(script)==result['scriptSha256']==plan['scriptSha256']
assert result['checkpointSha256']==plan['checkpointSha256'] and result['status']=='COMPLETE'
if os.environ.get('WBD_AUDIT_ALLOW_FIXTURE')=='1': assert result['mode']=='fixture' and result['model']=='fixture'
else: assert result['mode']=='anthropic' and result['model']==plan['model']
assert len(result['runs'])==16 and len(plan['histories'])==16
assert result['schema']=='amelia.oracle-house-prompt-factorial-result/v1'
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


histories={h['id']:h for h in plan['histories']};h=histories[result['history']];seed=h['seed']
assert result['lineage']==h['lineage']
assert [f"{r['route']}:{r['readout']}:{r['house']}:{r['feedbackCondition']}" for r in result['runs']]==h['executionOrder']
expected=set(itertools.product(('warp','control'),('warp_tape','control_tape'),('native','permuted'),('correct','unrelated')))
assert len(set(h['executionOrder']))==16
pre=result['preflight'];house=pre['house']
assert house['nativeHash']!=house['permutedHash'] and house['controlNativeHash']!=house['controlPermutedHash']
assert abs(house['nativeGap']-house['permutedGap'])>=0.1
for i in range(3):assert pre['promptWarp']['pairs'][i]!=pre['promptControl']['pairs'][i]
initial=['add','g',['mul',2,'d']]
def parse_response(q):
 text=re.sub(r'^```(?:json)?\s*','',q.strip(),flags=re.I);text=re.sub(r'\s*```$','',text)
 try:
  x=json.loads(text)
  if isinstance(x,dict):x=x.get('ast')
 except ValueError:x=None
 return x if valid(x) else None
seen=set();gates=rounds=0
for r in result['runs']:
 key=(r['route'],r['readout'],r['house'],r['feedbackCondition']);assert key in expected and key not in seen;seen.add(key);assert r['lineage']==h['lineage'] and r['history']==h['id']
 public=lambda level:[grid(f'{seed}:public:{i}',level) for i in range(6)]
 other=[grid(f'{seed}:unrelated:{i}',3) for i in range(6)]
 held=[grid(f'{seed}:heldout:{i}',3) for i in range(8)]
 assert r['before']==evaluate(initial,public(0)) and r['shocked']==evaluate(initial,public(3))
 assert r['breakdown']==(r['before']['passed']-r['shocked']['passed']>=2)
 assert r['baselineHeldout']==evaluate(initial,held) and r['finalPublic']==evaluate(r['finalCandidate'],public(3)) and r['finalHeldout']==evaluate(r['finalCandidate'],held)
 proposal,diagnostic=(3,6) if r['route']=='warp' else (2,7)
 tape=pre['promptWarp' if r['readout']=='warp_tape' else 'promptControl']['pairs']
 last=initial;previous=json.dumps(initial,separators=(',',':'));round_map={q['round']:q for q in r['rounds']};diag_map={}
 assert len(round_map)==len(r['rounds'])
 for q in r['diagnostics']:
  actual=evaluate(last,public(3));unrelated=evaluate(['add','g',0],other)
  assert q['actual']==actual and q['unrelated']==unrelated
  selected=actual if r['feedbackCondition']=='correct' else unrelated
  assert q['cue']==(diagnostic if selected['failed']%2 else proposal);diag_map[q['round']]=q
  if q['round'] in round_map:
   x=round_map[q['round']];rounds+=1;delivered=feedback(selected)
   assert x['actualFeedback']==actual and x['unrelatedFeedback']==unrelated and x['deliveredFeedback']==delivered and delivered in x['prompt']
   assert x['displayedMemory']==tape[q['round']-1]
   mem=x['displayedMemory']
   previous_slice=previous.encode('utf-16-le','surrogatepass')[:2048].decode('utf-16-le','surrogatepass')
   expected_prompt=('Revise this priority expression for weighted grid search. Smaller priority is explored first. '
    'Choose a JSON value: number in [-16,16], variable g (cost so far), d (Manhattan distance), '
    'w (next cell cost), x or y, or [op,left,right] where op is add, sub, mul, min, max. '
    f"Depth <=4, at most 31 nodes. A case passes when a path within {plan['expansionCap']} expansions "
    f"costs no more than {plan['maxCostRatio']} times optimum. There are 6 public cases. "
    f'Previous expression: {previous_slice}. '
    f'Feedback {delivered} where p is passed cases, e is mean expansions, and v is validity (1 or 0). '
    f'Numogram local memory [proposal,diagnosis]: [{mem[0]:.4f},{mem[1]:.4f}]. '
    'Return only the revised JSON expression.')
   assert x['prompt']==expected_prompt
   assert seed not in x['prompt'] and ':heldout:' not in x['prompt']
   previous=x['rawModelResponse'];last=parse_response(previous);assert last==x['candidate']
  else:assert r['stall'] and q==r['diagnostics'][-1]
 assert last==r['finalCandidate'] and len(r['rounds'])<=plan['rounds'] and r['hardLimitViolations']==0
 for g in r['gates']:
  gates+=1;assert g['round'] in diag_map
  if g['phase']=='search':assert g['cue']==diag_map[g['round']]['cue']
  else:assert g['phase']=='return' and g['cue'] is None
  c=g['candidates']
  for z in c:
   assert math.isclose(z['base']+z['house'],z['without'],abs_tol=1e-12)
   assert math.isclose(z['without']+z['signal'],z['total'],abs_tol=1e-12)
   assert math.isclose(z['signal'],plan['cueWeight'] if z['target']==g['cue'] else 0.0,abs_tol=1e-12)
  actual=max(c,key=lambda x:x['total'])['target'] if c else g['from']
  without=max(c,key=lambda x:x['without'])['target'] if c else g['from']
  assert actual==g['to'] and without==g['withoutSignal']
  assert g['pivotal']==(g['cue'] is not None and actual!=without)
assert seen==expected
print(json.dumps({'status':'VERIFIED','history':result['history'],'lineage':h['lineage'],'runs':len(seen),
                  'modelResponses':rounds,'gateStepsChecked':gates,'resultSha256':H(data)}))
