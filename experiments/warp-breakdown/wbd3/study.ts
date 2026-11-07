/**
 * WBD-3 single-founder 2 × 2 × 3 model feasibility study. A model revises a bounded JSON expression;
 * the trusted interpreter evaluates it without eval, shell, or generated code.
 * Every Amelia state is a copy of a pinned saved receiver checkpoint.
 */
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {OutsideRecoveryRuntime} from '../../../src/outside/OutsideRecoveryRuntime.ts';
import {fullNumogramGates} from '../../../src/core/fullNumogram.ts';

type Ast = number|string|[string,Ast,Ast];
type Cell = {open:boolean,cost:number};
type Grid = {cells:Cell[];n:number};
type Diag = {passed:number;failed:number;meanExpanded:number;invalid:boolean};
const [statePath,planPath,outputDir]=process.argv.slice(2);
if(!statePath||!planPath||!outputDir)throw Error('Usage: model-pilot.ts STATE PLAN NEW_OUTPUT_DIRECTORY');
const H=(x:string|Buffer)=>createHash('sha256').update(x).digest('hex');
const raw=readFileSync(statePath),saved=JSON.parse(raw.toString()).runtimeState;
const plan=JSON.parse(readFileSync(planPath,'utf8'));
assert.equal(H(raw),plan.checkpointSha256);
assert.equal(plan.schema,'amelia.wbd3-model-feasibility/v1');
assert.ok(plan.histories.length===8&&plan.rounds===3&&plan.maxDiagnosticTicks<=12);
assert.equal(plan.burnInSteps,8);assert.equal(plan.followSteps,24);
assert.equal(plan.scriptSha256,H(readFileSync(process.argv[1])));
const mode=process.env.WBD_MODEL_MODE??'anthropic';
if(!['anthropic','fixture'].includes(mode))throw Error('Invalid model mode');
const historyId=Number(process.env.WBD_HISTORY_ID);
const selected=plan.histories.filter((h:any)=>h.id===historyId);
assert.equal(selected.length,1,'Set WBD_HISTORY_ID to one locked history');
mkdirSync(outputDir,{recursive:false});
const output=join(outputDir,'result.json');
const clone=<T>(x:T):T=>structuredClone(x);
const vector=(target:number)=>Array.from({length:10},(_,i)=>Number(i===target));
const offer=(id:string,attentionVector:number[],body:unknown)=>({eventId:id,channel:'SYNTHETIC_FIELD' as const,
  sourceDigest:H(JSON.stringify(body)),attentionVector});
function runtime(state:any){const r=new OutsideRecoveryRuntime();r.importState(clone(state));return r;}
const augmented=clone(saved);augmented.qabbalaGates=fullNumogramGates(augmented.qabbalaGates);
const entry=runtime(augmented);
for(const [i,z] of [2,3].entries()){
  const s=entry.step(undefined,offer(`wbd3-entry-${i}`,vector(z),{entry:z}));
  assert.deepEqual([s.lastTransition?.from,s.lastTransition?.to],i===0?[1,2]:[2,3]);
}
const founder=entry.exportState() as any;assert.equal(founder.currentZone,3);

function routeState(route:'warp'|'control',prepared:any){
  const s=clone(prepared);
  if(route==='control'){
    // Explicit intervention: make 2/7 a reciprocal cycle with a corresponding
    // dwell and copy 3/6 gate parameters; retain zone-specific numeric state.
    const g=s.qabbalaGates;
    const warp33=g.find((x:any)=>x.source===3&&x.target===3);
    const warp36=g.find((x:any)=>x.source===3&&x.target===6);
    const warp63=g.find((x:any)=>x.source===6&&x.target===3);
    assert.ok(warp33&&warp36&&warp63);
    s.qabbalaGates=[...g.filter((x:any)=>x.source!==2&&x.source!==7),
      {...warp33,id:'pilot-control-2-2',source:2,target:2},
      {...warp36,id:'pilot-control-2-7',source:2,target:7},
      {...warp63,id:'pilot-control-7-2',source:7,target:2}];
    s.currentZone=2;
  }
  return s;
}
function randi(seed:string,n:number){return parseInt(H(seed).slice(0,8),16)%n;}
function grid(seed:string,level:number):Grid{
  const n=9,cells:Cell[]=[];
  for(let i=0;i<n*n;i++){
    const open=randi(`${seed}:wall:${i}`,100)>=26;
    const cost=1+randi(`${seed}:cost:${i}`,9);
    cells.push({open,cost:1+Math.floor((cost-1)*level/3)});
  }
  // Carve a reproducible monotone route so a solution exists.
  let x=0,y=0,turn=0;cells[0].open=true;
  while(x<n-1||y<n-1){
    if(x===n-1)y++;else if(y===n-1)x++;
    else if(randi(`${seed}:carve:${turn}`,2))x++;else y++;
    cells[y*n+x].open=true;turn++;
  }
  return {cells,n};
}
function validAst(ast:unknown,depth=0,count={n:0}):ast is Ast{
  if(++count.n>31||depth>4)return false;
  if(typeof ast==='number')return Number.isFinite(ast)&&Math.abs(ast)<=16;
  if(typeof ast==='string')return ['g','d','w','x','y'].includes(ast);
  return Array.isArray(ast)&&ast.length===3&&['add','sub','mul','min','max'].includes(ast[0])&&
    validAst(ast[1],depth+1,count)&&validAst(ast[2],depth+1,count);
}
function value(ast:Ast,v:Record<string,number>):number{
  if(typeof ast==='number')return ast;
  if(typeof ast==='string')return v[ast];
  const a=value(ast[1],v),b=value(ast[2],v);let c=0;
  if(ast[0]==='add')c=a+b;else if(ast[0]==='sub')c=a-b;else if(ast[0]==='mul')c=a*b;
  else if(ast[0]==='min')c=Math.min(a,b);else if(ast[0]==='max')c=Math.max(a,b);
  return Math.max(-1e6,Math.min(1e6,c));
}
function solve(g:Grid,ast:Ast,cap:number){
  const n=g.n,end=n*n-1,best=Array(n*n).fill(Infinity);best[0]=0;
  const q=[{id:0,g:0,rank:0,d:2*(n-1)}];let expanded=0;
  while(q.length&&expanded<cap){
    q.sort((a,b)=>a.rank-b.rank||a.d-b.d||a.id-b.id);
    const cur=q.shift()!;if(cur.g!==best[cur.id])continue;expanded++;
    if(cur.id===end)return {solved:true,cost:cur.g,expanded};
    const x=cur.id%n,y=Math.floor(cur.id/n);
    for(const [nx,ny] of [[x+1,y],[x,y+1],[x-1,y],[x,y-1]]){
      if(nx<0||ny<0||nx>=n||ny>=n)continue;
      const id=ny*n+nx,c=g.cells[id];if(!c.open)continue;
      const ng=cur.g+c.cost;if(ng>=best[id])continue;best[id]=ng;
      const d=(n-1-nx)+(n-1-ny),rank=value(ast,{g:ng,d,w:c.cost,x:nx,y:ny});
      q.push({id,g:ng,d,rank});
    }
  }
  return {solved:false,cost:null,expanded};
}
function evaluate(ast:unknown,cases:Grid[]):Diag{
  if(!validAst(ast))return {passed:0,failed:cases.length,meanExpanded:0,invalid:true};
  let passed=0,expanded=0;
  for(const g of cases){
    const best=solve(g,'g',10000),r=solve(g,ast,plan.expansionCap);
    assert.ok(best.solved&&best.cost!==null);
    if(r.solved&&r.cost!==null&&r.cost<=best.cost*plan.maxCostRatio)passed++;
    expanded+=r.expanded;
  }
  return {passed,failed:cases.length-passed,meanExpanded:Math.round(expanded/cases.length),invalid:false};
}
function feedback(d:Diag){return `p=${String(d.passed).padStart(2,'0')};e=${String(d.meanExpanded).padStart(3,'0')};v=${d.invalid?'0':'1'}`;}
const masked='p=??;e=???;v=?';
function selectedFeedback(kind:string,actual:Diag,yoked:Diag){
  const text=kind==='correct'?feedback(actual):kind==='unrelated'?feedback(yoked):masked;
  assert.equal(text.length,masked.length);return text;
}
function adaptiveVector(proposal:number,diagnostic:number,failed:number){
  const weights=[0.235,0.185,0.145,0.115,0.095,0.075,0.055,0.045,0.03,0.02];
  // Encode the parity of the selected failure count in the direction of a
  // 0.060 zone contrast, exactly matching the archived adaptive source.
  const towardDiagnostic=failed%2===1;
  const v=Array(10).fill(0);v[diagnostic]=towardDiagnostic?weights[3]:weights[6];
  v[proposal]=towardDiagnostic?weights[6]:weights[3];
  const remaining=weights.filter((_,i)=>i!==3&&i!==6);
  let j=0;for(let i=0;i<10;i++)if(i!==proposal&&i!==diagnostic)v[i]=remaining[j++];
  return v;
}
function scoredStep(r:OutsideRecoveryRuntime,input?:ReturnType<typeof offer>){
  const s=r.step(undefined,input) as any,from=s.lastTransition.from;
  const a=s.encounterDecisions.find((x:any)=>x.disposition==='ATTEND'&&x.applied);
  const bias=r.getMemoryConsumptionLog().at(-1)?.appliedBiasVector;assert.ok(bias);
  const zones=r.getQabbala().getZones();
  const gates=r.getQabbala().getGates().filter(g=>g.isOpen&&g.source===from).map(g=>{
    const z=zones[g.target],base=g.flux*(1-g.resistance)+(bias[g.target]||0)*0.4+
      z.activation*0.2+Math.cos(z.phaseAngle)*0.1,attention=(a?.attentionVector[g.target]??0)*0.9;
    return {id:g.id,target:g.target,base,attention,score:base+attention};
  });
  const best=(k:'base'|'score')=>gates.length?gates.reduce((x,y)=>y[k]>x[k]?y:x).target:from;
  assert.equal(best('score'),s.lastTransition.to);
  return {step:s.step,from,to:s.lastTransition.to,withoutAttention:best('base'),
    pivotal:!!a&&best('score')!==best('base'),decisions:s.encounterDecisions,gates,
    governorTension:s.governor.deformationFieldTension};
}
async function generate(prompt:string,round:number){
  const started=Date.now();
  if(mode==='fixture')return {text:JSON.stringify(round%2===0?['add','g',['mul',3,'d']]:['add','g','d']),usage:null,elapsedMs:Date.now()-started};
  const key=process.env.ANTHROPIC_API_KEY;if(!key)throw Error('ANTHROPIC_API_KEY is unavailable');
  const body={model:plan.model,max_tokens:plan.maxOutputTokens,temperature:0,
    system:'Return only a JSON expression. Never use markdown.',messages:[{role:'user',content:prompt}]};
  let response:Response|undefined;
  for(let attempt=0;attempt<3;attempt++){
    response=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',
      headers:{'content-type':'application/json','anthropic-version':'2023-06-01','x-api-key':key},
      body:JSON.stringify(body),signal:AbortSignal.timeout(90000)});
    if(response.status!==429&&response.status!==529)break;
    const requested=Number(response.headers.get('retry-after')??0);
    const pause=Number.isFinite(requested)&&requested>0?Math.min(60000,requested*1000):1500*(attempt+1);
    await new Promise(resolve=>setTimeout(resolve,pause));
  }
  assert.ok(response);if(!response.ok)throw Error(`Model API returned HTTP ${response.status}`);
  const v:any=await response.json();return {text:v.content.filter((x:any)=>x.type==='text').map((x:any)=>x.text).join(''),usage:v.usage,elapsedMs:Date.now()-started,requestId:v.id??null};
}
function parse(text:string):unknown{
  try{const s=text.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
    const x=JSON.parse(s);return x&&typeof x==='object'&&!Array.isArray(x)?x.ast:x;
  }catch{return null;}
}

async function run(h:any,route:'warp'|'control',disruption:'acute'|'gradual',kind:'correct'|'unrelated'|'masked',prepared:any){
  const r=runtime(routeState(route,prepared)),proposal=route==='warp'?3:2,diagnostic=route==='warp'?6:7;
  const publicCases=(level:number)=>Array.from({length:6},(_,i)=>grid(`${h.seed}:public:${i}`,level));
  const yokeCases=(level:number)=>Array.from({length:6},(_,i)=>grid(`${h.seed}:unrelated:${i}`,level));
  const baseAst:Ast=['add','g',['mul',2,'d']];let candidate:unknown=baseAst;
  let previousRaw=JSON.stringify(baseAst);
  const before=evaluate(candidate,publicCases(0)),shocked=evaluate(candidate,publicCases(3));
  const rounds:any[]=[],gates:any[]=[];let stall=false;
  for(let round=1;round<=plan.rounds;round++){
    const level=disruption==='acute'?3:round;
    const actual=evaluate(candidate,publicCases(level));
    const yoked=evaluate(['add','g',0],yokeCases(level));
    let reached=false;
    for(let tick=0;tick<plan.maxDiagnosticTicks;tick++){
      const id=`wbd3-feedback-${h.id}-${route}-${disruption}-${kind}-${round}-${tick}`;
      const selected=kind==='correct'?actual:kind==='unrelated'?yoked:null;
      const v=selected?adaptiveVector(proposal,diagnostic,selected.failed):Array(10).fill(0.1);
      const input=r.getDeferredInputs().length?undefined:offer(id,v,{history:h.id,round,tick,diagnostic:selected});
      const q=scoredStep(r,input);gates.push(q);
      if(q.from===proposal&&q.to===diagnostic){reached=true;break;}
    }
    if(!reached){stall=true;break;}
    const bias=r.getMemory().readMemoryBias().biasVector,delivered=selectedFeedback(kind,actual,yoked);
    const prompt=`Revise this priority expression for weighted grid search. Smaller priority is explored first. `+
      `Choose a JSON value: number in [-16,16], variable g (cost so far), d (Manhattan distance), `+
      `w (next cell cost), x or y, or [op,left,right] where op is add, sub, mul, min, max. `+
      `Depth <=4, at most 31 nodes. A case passes when a path within ${plan.expansionCap} expansions `+
      `costs no more than ${plan.maxCostRatio} times optimum. There are 6 public cases. `+
      `Previous expression: ${previousRaw.slice(0,1024)}. `+
      `Feedback ${delivered} where p is passed cases, e is mean expansions, and v is validity (1 or 0). `+
      `Numogram local memory [proposal,diagnosis]: [${bias[proposal].toFixed(4)},${bias[diagnostic].toFixed(4)}]. `+
      `Return only the revised JSON expression.`;
    const response=await generate(prompt,round),parsed=parse(response.text);
    candidate=validAst(parsed)?parsed:null;previousRaw=response.text;
    rounds.push({round,level,actualFeedback:actual,unrelatedFeedback:yoked,deliveredFeedback:delivered,prompt,
      rawModelResponse:response.text,usage:response.usage,elapsedMs:response.elapsedMs,requestId:response.requestId??null,candidate});
    const back=scoredStep(r);gates.push(back);assert.deepEqual([back.from,back.to],[diagnostic,proposal]);
  }
  let drain=0;while(r.getDeferredInputs().length){gates.push(scoredStep(r));if(++drain>512)throw Error('Final queue failed to drain');}
  // The final candidate is frozen before the independent hidden cases are constructed.
  const frozenCandidate=structuredClone(candidate);
  const hidden=Array.from({length:8},(_,i)=>grid(`${h.seed}:heldout:${i}`,3));
  const finalPublic=evaluate(frozenCandidate,publicCases(3)),finalHeldout=evaluate(frozenCandidate,hidden),baselineHeldout=evaluate(baseAst,hidden);
  const record={history:h.id,route,disruption,feedbackCondition:kind,before,shocked,breakdown:before.passed-shocked.passed>=2,
    rounds,gates,stall,finalCandidate:frozenCandidate,finalPublic,finalHeldout,baselineHeldout,
    finalZone:(r.exportState() as any).currentZone,queue:r.getDeferredInputs().length,
    hardLimitViolations:r.getGovernor().hardLimitViolationCount};
  return {record,state:r.exportState() as any};
}
function prepareHistory(h:any){
  const r=runtime(founder),trace:any[]=[];
  for(let t=0;t<plan.burnInSteps;t++){
    let n=0;while(r.getDeferredInputs().length){trace.push(scoredStep(r));if(++n>512)throw Error('Burn-in drain failed');}
    const direction=randi(`${h.seed}:burn:${t}`,2)===0?1:2;
    trace.push(scoredStep(r,offer(`wbd3-burn-${h.id}-${t}`,adaptiveVector(3,6,direction),{history:h.id,burn:t,direction})));
  }
  let n=0;while(r.getDeferredInputs().length){trace.push(scoredStep(r));if(++n>512)throw Error('Burn-in drain failed');}
  if((r.exportState() as any).currentZone===6)trace.push(scoredStep(r));
  const state=r.exportState() as any;assert.equal(state.currentZone,3);
  return {state,trace,memorySha256:H(JSON.stringify(state.memoryState))};
}
async function memoryContinuation(h:any,background:any,donor:any,route:'warp'|'control',label:string){
  const s=clone(background);s.memoryState=clone(donor.memoryState);
  const nonMemory=(v:any)=>{const x=clone(v);delete x.memoryState;return H(JSON.stringify(x));};
  assert.equal(nonMemory(s),nonMemory(background));
  const r=runtime(s),proposal=route==='warp'?3:2,diagnostic=route==='warp'?6:7,steps:any[]=[];let dwell=0;
  for(let t=0;t<plan.followSteps;t++){
    const x=scoredStep(r);steps.push({from:x.from,to:x.to});if(x.from===proposal&&x.to===proposal)dwell++;
  }
  const baseAst:Ast=['add','g',['mul',2,'d']],publicTransfer=Array.from({length:6},(_,i)=>grid(`${h.seed}:transfer-public:${i}`,3));
  const current=evaluate(baseAst,publicTransfer),bias=r.getMemory().readMemoryBias().biasVector;
  const prompt=`Revise this priority expression for weighted grid search. Smaller priority is explored first. `+
      `Choose a JSON value: number in [-16,16], variable g (cost so far), d (Manhattan distance), `+
      `w (next cell cost), x or y, or [op,left,right] where op is add, sub, mul, min, max. `+
      `Depth <=4, at most 31 nodes. A case passes when a path within ${plan.expansionCap} expansions `+
      `costs no more than ${plan.maxCostRatio} times optimum. There are 6 public cases. `+
      `Previous expression: ${JSON.stringify(baseAst)}. `+
      `Feedback ${feedback(current)} where p is passed cases, e is mean expansions, and v is validity (1 or 0). `+
      `Numogram local memory [proposal,diagnosis]: [${bias[proposal].toFixed(4)},${bias[diagnostic].toFixed(4)}]. `+
      `Return only the revised JSON expression.`;
  const response=await generate(prompt,1),parsed=parse(response.text),candidate=validAst(parsed)?parsed:null;
  // The one-shot candidate is frozen before generating the transfer held-out cases.
  const frozen=structuredClone(candidate),hidden=Array.from({length:8},(_,i)=>grid(`${h.seed}:transfer-hidden:${i}`,3));
  return {label,dwell,steps,nonMemorySha256:nonMemory(s),donorMemorySha256:H(JSON.stringify(donor.memoryState)),
    prompt,diagnostic:current,rawModelResponse:response.text,usage:response.usage,elapsedMs:response.elapsedMs,requestId:response.requestId??null,candidate:frozen,
    finalPublic:evaluate(frozen,publicTransfer),finalHeldout:evaluate(frozen,hidden),queue:r.getDeferredInputs().length};
}
const result:any={schema:'amelia.wbd3-model-feasibility-result/v1',mode,model:mode==='fixture'?'fixture':plan.model,
  planSha256:H(readFileSync(planPath)),checkpointSha256:H(raw),scriptSha256:H(readFileSync(process.argv[1])),
  methodology:'Pinned receiver copy; existing full graph plus documented entry and adapted 2/7 control; three feedback opportunities when reachable; bounded AST evaluator.',runs:[]};
try{
  const h=selected[0],prepared=prepareHistory(h),states:any={};
  result.history=h.id;result.burnIn=prepared.trace;result.preparedMemorySha256=prepared.memorySha256;
  for(const spec of h.executionOrder){
    const [route,disruption,kind]=spec.split(':');const x=await run(h,route,disruption,kind,prepared.state);
    result.runs.push(x.record);states[spec]=x.state;console.log('Completed',h.id,spec);
  }
  result.memoryIntervention={};
  for(const spec of h.memoryOrder){
    const [route,background,donor]=spec.split(':');
    const a=states[`${route}:acute:${background}`],b=states[`${route}:acute:${donor}`];
    const row=await memoryContinuation(h,a,b,route,spec);
    result.memoryIntervention[spec]=row;console.log('Memory',h.id,spec);
  }
  result.status='COMPLETE';
}catch(e){result.status='INCOMPLETE';result.error=e instanceof Error?e.message:String(e);}
writeFileSync(output,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,runs:result.runs.length,memories:Object.keys(result.memoryIntervention??{}).length,error:result.error??null}));
if(result.status!=='COMPLETE')process.exitCode=1;
