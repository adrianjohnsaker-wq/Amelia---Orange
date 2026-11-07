"""Independent evaluation of recorded matched model study candidates and gates."""
import hashlib
import json
import math
import os
import re
import sys
from pathlib import Path

if len(sys.argv)!=4: raise SystemExit('Usage: audit.py PLAN SCRIPT RESULT')
plan_bytes=Path(sys.argv[1]).read_bytes();script=Path(sys.argv[2]).read_bytes();data=Path(sys.argv[3]).read_bytes()
plan=json.loads(plan_bytes);result=json.loads(data);H=lambda b:hashlib.sha256(b).hexdigest()
assert H(plan_bytes)==result['planSha256'] and H(script)==result['scriptSha256']==plan['scriptSha256']
assert result['status']=='COMPLETE'
if os.environ.get('WBD_AUDIT_ALLOW_FIXTURE')=='1':
    assert result['mode']=='fixture' and result['model']=='fixture'
else:
    assert result['mode']=='anthropic' and result['model']==plan['model']
assert len(result['runs'])==12 and len(plan['histories'])==16
assert result['schema']=='amelia.oracle-warp-multilineage-result/v1'

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
assert [f"{r['route']}:{r['disruption']}:{r['feedbackCondition']}" for r in result['runs']]==h['executionOrder']
assert len(set(h['executionOrder']))==12 and len(set(h['memoryOrder']))==16
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
 key=(r['route'],r['disruption'],r['feedbackCondition']);assert key not in seen;seen.add(key);assert r['lineage']==h['lineage']
 public=lambda level:[grid(f'{seed}:public:{i}',level) for i in range(6)]
 unrelated=lambda level:[grid(f'{seed}:unrelated:{i}',level) for i in range(6)]
 held=[grid(f'{seed}:heldout:{i}',3) for i in range(8)]
 assert r['before']==evaluate(initial,public(0)) and r['shocked']==evaluate(initial,public(3))
 assert r['breakdown']==(r['before']['passed']-r['shocked']['passed']>=2)
 assert r['baselineHeldout']==evaluate(initial,held) and r['finalPublic']==evaluate(r['finalCandidate'],public(3)) and r['finalHeldout']==evaluate(r['finalCandidate'],held)
 proposal,diagnostic=(3,6) if r['route']=='warp' else (2,7)
 last=initial;round_map={q['round']:q for q in r['rounds']};diag_map={}
 for q in r['diagnostics']:
  level=3 if r['disruption']=='acute' else q['round'];assert q['level']==level
  actual=evaluate(last,public(level));other=evaluate(['add','g',0],unrelated(level))
  assert q['actual']==actual and q['unrelated']==other
  selected=actual if r['feedbackCondition']=='correct' else other if r['feedbackCondition']=='unrelated' else None
  expectedcue=(diagnostic if selected['failed']%2 else proposal) if selected else None
  assert q['cue']==expectedcue;diag_map[q['round']]=q
  if q['round'] in round_map:
   x=round_map[q['round']];rounds+=1
   expected=feedback(actual) if r['feedbackCondition']=='correct' else feedback(other) if r['feedbackCondition']=='unrelated' else 'p=??;e=???;v=?'
   assert x['actualFeedback']==actual and x['unrelatedFeedback']==other and x['deliveredFeedback']==expected and expected in x['prompt']
   assert seed not in x['prompt'] and ':heldout:' not in x['prompt']
   last=parse_response(x['rawModelResponse']);assert last==x['candidate']
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
assert len(seen)==12
memory=result['memoryIntervention'];assert list(memory)==h['memoryOrder']
for route in ('warp','control'):
 for component in ('house','pfm'):
  for background in ('correct','masked'):
   a=memory[f'{route}:{component}:{background}:correct'];b=memory[f'{route}:{component}:{background}:masked']
   assert a['nonComponentSha256']==b['nonComponentSha256']
   for m in (a,b):
    assert m['component']==component and len(m['steps'])==plan['followSteps']
    proposal=3 if route=='warp' else 2
    assert m['dwell']==sum(x['from']==proposal and x['to']==proposal for x in m['steps'])
    public=[grid(f'{seed}:transfer-public:{i}',3) for i in range(6)]
    held=[grid(f'{seed}:transfer-hidden:{i}',3) for i in range(8)]
    assert m['diagnostic']==evaluate(initial,public) and feedback(m['diagnostic']) in m['prompt']
    assert seed not in m['prompt'] and ':transfer-hidden:' not in m['prompt']
    assert m['candidate']==parse_response(m['rawModelResponse'])
    assert m['finalPublic']==evaluate(m['candidate'],public) and m['finalHeldout']==evaluate(m['candidate'],held)
  for donor in ('correct','masked'):
   assert memory[f'{route}:{component}:correct:{donor}']['donorComponentSha256']==memory[f'{route}:{component}:masked:{donor}']['donorComponentSha256']
print(json.dumps({'status':'VERIFIED','history':result['history'],'lineage':h['lineage'],'runs':len(seen),
                  'modelResponses':rounds+16,'gateStepsChecked':gates,'resultSha256':H(data)}))
