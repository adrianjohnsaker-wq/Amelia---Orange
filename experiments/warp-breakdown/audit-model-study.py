"""Independent evaluation of recorded matched model study candidates and gates."""
import hashlib
import json
import math
import os
import re
import sys
from pathlib import Path

if len(sys.argv)!=4: raise SystemExit('Usage: audit-model-pilot.py PLAN SCRIPT RESULT')
plan_bytes=Path(sys.argv[1]).read_bytes();script=Path(sys.argv[2]).read_bytes();data=Path(sys.argv[3]).read_bytes()
plan=json.loads(plan_bytes);result=json.loads(data);H=lambda b:hashlib.sha256(b).hexdigest()
assert H(plan_bytes)==result['planSha256'] and H(script)==result['scriptSha256']==plan['scriptSha256']
assert result['status']=='COMPLETE'
if os.environ.get('WBD_AUDIT_ALLOW_FIXTURE')=='1':
    assert result['mode']=='fixture' and result['model']=='fixture'
else:
    assert result['mode']=='anthropic' and result['model']==plan['model']
assert len(result['runs'])==6 and len(plan['histories'])==16
assert result['schema']=='amelia.warp-model-study-result/v1'

def rand(seed,n):return int(hashlib.sha256(seed.encode()).hexdigest()[:8],16)%n
def grid(seed,weighted):
    n=9;cells=[]
    for i in range(n*n):
        opened=rand(f'{seed}:wall:{i}',100)>=26;cost=1+rand(f'{seed}:cost:{i}',9)
        cells.append([opened,cost if weighted else 1])
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

history={h['id']:h for h in plan['histories']};seen=set();gates=rounds=0
assert len(result['burnIn'])>=plan['burnInSteps']
burn_offers=0
for g in result['burnIn']:
    for c in g['gates']:assert math.isclose(c['base']+c['attention'],c['score'],abs_tol=1e-12)
    if g['gates']:
        assert max(g['gates'],key=lambda c:c['score'])['target']==g['to']
        assert max(g['gates'],key=lambda c:c['base'])['target']==g['withoutAttention']
    for dec in g['decisions']:
        if dec['eventId'].startswith('model-study-burn-'):
            burn_offers+=1;v=dec['attentionVector']
            assert math.isclose(abs(v[3]-v[6]),0.06,abs_tol=1e-12)
assert burn_offers==plan['burnInSteps']
for r in result['runs']:
    key=(r['history'],r['route'],r['feedbackCondition']);assert key not in seen;seen.add(key)
    h=history[r['history']];seed=h['seed']
    base=[grid(f'{seed}:public:{i}',False) for i in range(6)]
    shock=[grid(f'{seed}:public:{i}',True) for i in range(6)]
    held=[grid(f'{seed}:heldout:{i}',True) for i in range(8)]
    yoke=[grid(f'{seed}:unrelated:{i}',True) for i in range(6)]
    initial=['add','g',['mul',2,'d']]
    assert r['before']==evaluate(initial,base)
    assert r['shocked']==evaluate(initial,shock)
    assert r['baselineHeldout']==evaluate(initial,held)
    assert r['finalPublic']==evaluate(r['finalCandidate'],shock)
    assert r['finalHeldout']==evaluate(r['finalCandidate'],held)
    last=initial
    for q in r['rounds']:
        rounds+=1;actual=evaluate(last,shock);assert q['actualFeedback']==actual
        expected=feedback(actual) if r['feedbackCondition']=='correct' else feedback(evaluate(['add','g',0],yoke)) if r['feedbackCondition']=='unrelated' else 'p=??;e=???;v=?'
        assert q['deliveredFeedback']==expected and expected in q['prompt']
        assert seed not in q['prompt'] and ':heldout:' not in q['prompt']
        text=re.sub(r'^```(?:json)?\s*','',q['rawModelResponse'].strip(),flags=re.I)
        text=re.sub(r'\s*```$','',text)
        try:
            parsed=json.loads(text)
            if isinstance(parsed,dict):parsed=parsed.get('ast')
        except ValueError:parsed=None
        last=parsed if valid(parsed) else None
        assert last==q['candidate']
    if r['rounds']:assert last==r['finalCandidate']
    assert r['queue']==0 and r['hardLimitViolations']==0
    for g in r['gates']:
        gates+=1
        for c in g['gates']:assert math.isclose(c['base']+c['attention'],c['score'],abs_tol=1e-12)
        if g['gates']:
            actual=max(g['gates'],key=lambda c:c['score'])['target']
            unweighted=max(g['gates'],key=lambda c:c['base'])['target']
            assert actual==g['to'] and unweighted==g['withoutAttention']
            attended=any(d['disposition']=='ATTEND' and d['applied'] for d in g['decisions'])
            assert g['pivotal']==(attended and actual!=unweighted)
assert len(seen)==6
for route in ('warp','control'):
    m=result['memoryIntervention'][route]
    aa=m['correctBackgroundCorrectMemory'];ab=m['correctBackgroundMaskedMemory']
    ba=m['maskedBackgroundCorrectMemory'];bb=m['maskedBackgroundMaskedMemory']
    assert aa['nonMemorySha256']==ab['nonMemorySha256']
    assert ba['nonMemorySha256']==bb['nonMemorySha256']
    assert aa['donorMemorySha256']==ba['donorMemorySha256']
    assert ab['donorMemorySha256']==bb['donorMemorySha256']
    proposal=3 if route=='warp' else 2
    for item in (aa,ab,ba,bb):
        assert len(item['steps'])==plan['followSteps']
        assert item['dwell']==sum(x['from']==proposal and x['to']==proposal for x in item['steps'])
    for r in result['runs']:
        if r['route']!=route:continue
        for g in r['gates']:
            for dec in g['decisions']:
                if dec['eventId'].startswith('feedback-'):
                    v=dec['attentionVector']
                    if r['feedbackCondition']=='masked':assert all(math.isclose(x,0.1,abs_tol=1e-12) for x in v)
                    else:
                        diag=6 if route=='warp' else 7
                        assert math.isclose(abs(v[proposal]-v[diag]),0.06,abs_tol=1e-12)
print(json.dumps({'status':'VERIFIED','runs':len(seen),'modelResponsesReevaluated':rounds,
    'gateStepsChecked':gates,'burnInOffers':burn_offers,'resultSha256':H(data),'history':result['history']}))
