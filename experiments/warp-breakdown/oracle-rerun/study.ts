/** Multi-lineage Oracle-native Warp breakdown and recovery study. */
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {OracleAdapter} from './adapter.mjs';
type Ast = number|string|[string,Ast,Ast];
type Cell = {open:boolean,cost:number};
type Grid = {cells:Cell[];n:number};
type Diag = {passed:number;failed:number;meanExpanded:number;invalid:boolean};
const [statePath,planPath,outputDir]=process.argv.slice(2);
if(!statePath||!planPath||!outputDir)throw Error('Usage: study.ts ORACLE_STATE PLAN NEW_OUTPUT_DIRECTORY');
const H=(x:string|Buffer)=>createHash('sha256').update(x).digest('hex');
const raw=readFileSync(statePath),saved=JSON.parse(raw.toString()).amelias;
const plan=JSON.parse(readFileSync(planPath,'utf8'));
assert.equal(H(raw),plan.checkpointSha256);assert.equal(plan.schema,'amelia.oracle-warp-multilineage/v1');
assert.equal(plan.histories.length,16);assert.equal(plan.rounds,3);assert.equal(plan.followSteps,24);
assert.equal(plan.scriptSha256,H(readFileSync(process.argv[1])));
const mode=process.env.WBD_MODEL_MODE??'anthropic';if(!['anthropic','fixture'].includes(mode))throw Error('Invalid mode');
const historyId=Number(process.env.WBD_HISTORY_ID),selected=plan.histories.filter((h:any)=>h.id===historyId);
assert.equal(selected.length,1);mkdirSync(outputDir,{recursive:false});
const output=join(outputDir,'result.json'),clone=<T>(v:T):T=>structuredClone(v);
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


function step(r:any,cue:number|null){
 const pre=r.fullState();const without=cue===null?null:new OracleAdapter(pre).step(null);
 const q=r.step(cue),tele=q.snapshot.governor;
 if(tele.hardLimitViolationCount>pre.runtime.governorState.hardLimitViolations)throw Error('Governor hard-limit violation');
 const bias=r.r.getMemoryConsumptionLog().at(-1)?.appliedBiasVector;assert.ok(bias);
 const zones=r.r.getQabbala().getZones();
 const candidates=r.r.getQabbala().getGates().filter((g:any)=>g.isOpen&&g.source===q.from).map((g:any)=>{
  const z=zones[g.target],edge=`${q.from}>${g.target}`,L=pre.L;
  const base=g.flux*(1-g.resistance)+(bias[g.target]||0)*0.4+z.activation*0.2+Math.cos(z.phaseAngle)*0.1;
  const house=0.5*(L.V[edge]??0)+0.35*Math.tanh((L.S[edge]??0)+(L.D[edge]??0)),signal=cue===g.target?pre.cueWeight:0;
  return {target:g.target,base,house,signal,without:base+house,total:base+house+signal};
 });
 const winner=(k:'without'|'total')=>candidates.length?candidates.reduce((a:any,b:any)=>b[k]>a[k]?b:a).target:q.from;
 assert.equal(winner('total'),q.to);assert.equal(winner('without'),without?without.to:q.to);
 return {step:q.snapshot.step,from:q.from,to:q.to,cue,withoutSignal:without?without.to:q.to,candidates,
  pivotal:cue!==null&&q.to!==without!.to,governorTension:tele.deformationFieldTension,
  hardLimitViolationCount:tele.hardLimitViolationCount};
}
function prepareHistory(h:any){
 const source=saved[h.lineage];assert.ok(source);assert.equal(source.runtime.qabbalaGates.length,29);
 const r=new OracleAdapter({...source,cueWeight:plan.cueWeight}),entry:any[]=[];
 if(r.fullState().runtime.currentZone===6)entry.push(step(r,null));
 assert.equal(r.fullState().runtime.currentZone,3);
 const burn=[];for(let t=0;t<plan.burnInSteps;t++)burn.push(step(r,randi(`${h.seed}:burn:${t}`,2)===0?3:6));
 if(r.fullState().runtime.currentZone===6)burn.push(step(r,null));
 const state=r.fullState();assert.equal(state.runtime.currentZone,3);
 return {state,entry,burn,houseSha256:H(JSON.stringify(state.L)),pfmSha256:H(JSON.stringify(state.runtime.memoryState))};
}
async function run(h:any,route:'warp'|'control',disruption:'acute'|'gradual',kind:'correct'|'unrelated'|'masked',prepared:any){
 const original=new OracleAdapter(prepared),r=route==='warp'?original:original.makeControl(),proposal=route==='warp'?3:2,diagnostic=route==='warp'?6:7;
 const pub=(level:number)=>Array.from({length:6},(_,i)=>grid(`${h.seed}:public:${i}`,level));
 const other=(level:number)=>Array.from({length:6},(_,i)=>grid(`${h.seed}:unrelated:${i}`,level));
 const baseAst:Ast=['add','g',['mul',2,'d']];let candidate:unknown=baseAst,previousRaw=JSON.stringify(baseAst);
 const before=evaluate(candidate,pub(0)),shocked=evaluate(candidate,pub(3)),rounds:any[]=[],diagnostics:any[]=[],gates:any[]=[];let stall=false;
 for(let round=1;round<=plan.rounds;round++){
  const level=disruption==='acute'?3:round,actual=evaluate(candidate,pub(level)),unrelated=evaluate(['add','g',0],other(level));
  const selected=kind==='correct'?actual:kind==='unrelated'?unrelated:null;
  const cue=selected?(selected.failed%2===1?diagnostic:proposal):null;diagnostics.push({round,level,actual,unrelated,cue});let reached=false;
  for(let tick=0;tick<plan.maxDiagnosticTicks;tick++){
   const q=step(r,cue);gates.push({...q,round,phase:'search',tick});if(q.from===proposal&&q.to===diagnostic){reached=true;break;}
  }
  if(!reached){stall=true;break;}
  const bias=r.r.getMemory().readMemoryBias().biasVector,delivered=selectedFeedback(kind,actual,unrelated);
  const prompt=`Revise this priority expression for weighted grid search. Smaller priority is explored first. `+
   `Choose a JSON value: number in [-16,16], variable g (cost so far), d (Manhattan distance), `+
   `w (next cell cost), x or y, or [op,left,right] where op is add, sub, mul, min, max. `+
   `Depth <=4, at most 31 nodes. A case passes when a path within ${plan.expansionCap} expansions `+
   `costs no more than ${plan.maxCostRatio} times optimum. There are 6 public cases. `+
   `Previous expression: ${previousRaw.slice(0,1024)}. `+
   `Feedback ${delivered} where p is passed cases, e is mean expansions, and v is validity (1 or 0). `+
   `Numogram local memory [proposal,diagnosis]: [${bias[proposal].toFixed(4)},${bias[diagnostic].toFixed(4)}]. `+
   `Return only the revised JSON expression.`;
  const response=await generate(prompt,round),parsed=parse(response.text);candidate=validAst(parsed)?parsed:null;previousRaw=response.text;
  rounds.push({round,level,actualFeedback:actual,unrelatedFeedback:unrelated,deliveredFeedback:delivered,prompt,
   rawModelResponse:response.text,usage:response.usage,elapsedMs:response.elapsedMs,requestId:response.requestId??null,candidate});
  const back=step(r,null);gates.push({...back,round,phase:'return'});assert.deepEqual([back.from,back.to],[diagnostic,proposal]);
 }
 const frozenCandidate=clone(candidate),hidden=Array.from({length:8},(_,i)=>grid(`${h.seed}:heldout:${i}`,3));
 const finalPublic=evaluate(frozenCandidate,pub(3)),finalHeldout=evaluate(frozenCandidate,hidden),baselineHeldout=evaluate(baseAst,hidden);
 const state=r.fullState();
 const record={history:h.id,lineage:h.lineage,route,disruption,feedbackCondition:kind,before,shocked,
  breakdown:before.passed-shocked.passed>=2,rounds,diagnostics,gates,stall,finalCandidate:frozenCandidate,
  finalPublic,finalHeldout,baselineHeldout,finalZone:state.runtime.currentZone,
  hardLimitViolations:state.runtime.governorState.hardLimitViolations};
 return {record,state};
}
async function memoryContinuation(h:any,background:any,donor:any,route:'warp'|'control',component:'house'|'pfm',label:string){
 const s=clone(background);
 if(component==='house')s.L=clone(donor.L);else s.runtime.memoryState=clone(donor.runtime.memoryState);
 const nonComponent=(v:any)=>{const x=clone(v);if(component==='house')delete x.L;else delete x.runtime.memoryState;return H(JSON.stringify(x));};
 assert.equal(nonComponent(s),nonComponent(background));
 const r=new OracleAdapter(s),proposal=route==='warp'?3:2,diagnostic=route==='warp'?6:7,steps:any[]=[];let dwell=0;
 for(let t=0;t<plan.followSteps;t++){const x=step(r,null);steps.push({from:x.from,to:x.to});if(x.from===proposal&&x.to===proposal)dwell++;}
 const baseAst:Ast=['add','g',['mul',2,'d']],pub=Array.from({length:6},(_,i)=>grid(`${h.seed}:transfer-public:${i}`,3));
 const current=evaluate(baseAst,pub),bias=r.r.getMemory().readMemoryBias().biasVector;
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
 const frozen=clone(candidate),hidden=Array.from({length:8},(_,i)=>grid(`${h.seed}:transfer-hidden:${i}`,3));
 return {label,component,dwell,steps,nonComponentSha256:nonComponent(s),donorComponentSha256:H(JSON.stringify(component==='house'?donor.L:donor.runtime.memoryState)),
  prompt,diagnostic:current,rawModelResponse:response.text,usage:response.usage,elapsedMs:response.elapsedMs,requestId:response.requestId??null,candidate:frozen,
  finalPublic:evaluate(frozen,pub),finalHeldout:evaluate(frozen,hidden)};
}
const result:any={schema:'amelia.oracle-warp-multilineage-result/v1',mode,model:mode==='fixture'?'fixture':plan.model,
 planSha256:H(readFileSync(planPath)),checkpointSha256:H(raw),scriptSha256:H(readFileSync(process.argv[1])),runs:[]};
try{
 const h=selected[0],prepared=prepareHistory(h),states:any={};result.history=h.id;result.lineage=h.lineage;
 result.entry=prepared.entry;result.burnIn=prepared.burn;result.preparedHouseSha256=prepared.houseSha256;result.preparedPfmSha256=prepared.pfmSha256;
 for(const spec of h.executionOrder){const [route,disruption,kind]=spec.split(':');const x=await run(h,route,disruption,kind,prepared.state);
  result.runs.push(x.record);states[spec]=x.state;console.log('Completed',h.id,h.lineage,spec);}
 result.memoryIntervention={};
 for(const spec of h.memoryOrder){const [route,component,background,donor]=spec.split(':'),a=states[`${route}:acute:${background}`],b=states[`${route}:acute:${donor}`];
  result.memoryIntervention[spec]=await memoryContinuation(h,a,b,route,component,spec);console.log('Memory',h.id,spec);}
 result.status='COMPLETE';
}catch(e){result.status='INCOMPLETE';result.error=e instanceof Error?e.message:String(e);}
writeFileSync(output,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,runs:result.runs.length,memories:Object.keys(result.memoryIntervention??{}).length,error:result.error??null}));
if(result.status!=='COMPLETE')process.exitCode=1;
