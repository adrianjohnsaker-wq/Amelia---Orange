/** Factorial Oracle route, fixed model-readout and House intervention study. */
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {OracleAdapter} from '../oracle-rerun/adapter.mjs';
import {prepare} from './prepare.mjs';
import {houseContrast,formatContrast,maskedContrast} from './relay.mjs';
type Ast = number|string|[string,Ast,Ast];
type Cell = {open:boolean,cost:number};
type Grid = {cells:Cell[];n:number};
type Diag = {passed:number;failed:number;meanExpanded:number;invalid:boolean};
const [statePath,planPath,outputDir]=process.argv.slice(2);
if(!statePath||!planPath||!outputDir)throw Error('Usage: study.ts ORACLE_STATE PLAN NEW_OUTPUT_DIRECTORY');
const H=(x:string|Buffer)=>createHash('sha256').update(x).digest('hex');
const raw=readFileSync(statePath),saved=JSON.parse(raw.toString()).amelias;
const plan=JSON.parse(readFileSync(planPath,'utf8'));
assert.equal(H(raw),plan.checkpointSha256);assert.equal(plan.schema,'amelia.oracle-house-relay/v1');
assert.equal(plan.histories.length,16);assert.equal(plan.rounds,3);assert.equal(plan.scriptSha256,H(readFileSync(process.argv[1])));
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
  if(mode==='fixture'){const x=prompt.match(/House gate-learning contrast \(stay minus transition\): ([^;]+);/);const k=x&&x[1].startsWith('-0.3')?3:x&&x[1].includes('?')?2:1;return {text:JSON.stringify(['add','g',['mul',k,'d']]),usage:null,elapsedMs:Date.now()-started};}
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


function step(r:any,cue:number|null,proposal:number,diagnostic:number){
 const pre=r.fullState(),houseReadout=houseContrast(pre,proposal,diagnostic),without=cue===null?null:new OracleAdapter(pre).step(null),q=r.step(cue),tele=q.snapshot.governor;
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
  pivotal:cue!==null&&q.to!==without!.to,houseReadout,governorTension:tele.deformationFieldTension,hardLimitViolationCount:tele.hardLimitViolationCount};
}

async function run(h:any,route:'warp'|'control',house:'native'|'permuted',relay:'live'|'misaligned'|'masked',p:any){
 const r0=new OracleAdapter(house==='native'?p.native:p.permuted),r=route==='warp'?r0:r0.makeControl();
 const proposal=route==='warp'?3:2,diagnostic=route==='warp'?6:7,tape=p.promptWarp.pairs;
 const pub=()=>Array.from({length:6},(_,i)=>grid(`${h.seed}:public:${i}`,3));
 const base=Array.from({length:6},(_,i)=>grid(`${h.seed}:public:${i}`,0));
 const initial:Ast=['add','g',['mul',2,'d']];let candidate:unknown=initial,previousRaw=JSON.stringify(initial);
 const before=evaluate(candidate,base),shocked=evaluate(candidate,pub()),rounds:any[]=[],diagnostics:any[]=[],gates:any[]=[];let stall=false;
 for(let round=1;round<=plan.rounds;round++){
  const actual=evaluate(candidate,pub()),cue=actual.failed%2===1?diagnostic:proposal;
  diagnostics.push({round,actual,cue});let accepted:any=null;
  for(let tick=0;tick<plan.maxDiagnosticTicks;tick++){
   const q=step(r,cue,proposal,diagnostic);gates.push({...q,round,phase:'search',tick});
   if(q.from===proposal&&q.to===diagnostic){accepted=q;break;}
  }
  if(!accepted){stall=true;break;}
  const info=accepted.houseReadout;assert.ok(Math.abs(info.live-info.misaligned)>=plan.minHouseSeparation);
  const shown=relay==='live'?formatContrast(info.live):relay==='misaligned'?formatContrast(info.misaligned):maskedContrast;
  const live=r.r.getMemory().readMemoryBias().biasVector,mem=tape[round-1],delivered=feedback(actual);
  const prompt=`Revise this priority expression for weighted grid search. Smaller priority is explored first. `+
   `Choose a JSON value: number in [-16,16], variable g (cost so far), d (Manhattan distance), `+
   `w (next cell cost), x or y, or [op,left,right] where op is add, sub, mul, min, max. `+
   `Depth <=4, at most 31 nodes. A case passes when a path within ${plan.expansionCap} expansions `+
   `costs no more than ${plan.maxCostRatio} times optimum. There are 6 public cases. `+
   `Previous expression: ${previousRaw.slice(0,1024)}. `+
   `Feedback ${delivered} where p is passed cases, e is mean expansions, and v is validity (1 or 0). `+
   `Numogram local memory [proposal,diagnosis]: [${mem[0].toFixed(4)},${mem[1].toFixed(4)}]. `+
   `House gate-learning contrast (stay minus transition): ${shown}; ? means unavailable. `+
   `Return only the revised JSON expression.`;
  const response=await generate(prompt,round),parsed=parse(response.text);candidate=validAst(parsed)?parsed:null;previousRaw=response.text;
  rounds.push({round,actualFeedback:actual,deliveredFeedback:delivered,displayedMemory:mem,liveMemory:[live[proposal],live[diagnostic]],
   houseReadout:info,displayedHouse:shown,prompt,rawModelResponse:response.text,usage:response.usage,
   elapsedMs:response.elapsedMs,requestId:response.requestId??null,candidate});
  const back=step(r,null,proposal,diagnostic);gates.push({...back,round,phase:'return'});assert.deepEqual([back.from,back.to],[diagnostic,proposal]);
 }
 const frozen=clone(candidate),hidden=Array.from({length:8},(_,i)=>grid(`${h.seed}:heldout:${i}`,3)),end=r.fullState();
 return {history:h.id,lineage:h.lineage,route,house,relay,before,shocked,breakdown:before.passed-shocked.passed>=2,
  rounds,diagnostics,gates,stall,finalCandidate:frozen,finalPublic:evaluate(frozen,pub()),finalHeldout:evaluate(frozen,hidden),
  baselineHeldout:evaluate(initial,hidden),finalZone:end.runtime.currentZone,hardLimitViolations:end.runtime.governorState.hardLimitViolations};
}
const result:any={schema:'amelia.oracle-house-relay-result/v1',mode,model:mode==='fixture'?'fixture':plan.model,
 planSha256:H(readFileSync(planPath)),checkpointSha256:H(raw),scriptSha256:H(readFileSync(process.argv[1])),runs:[]};
try{
 const h=selected[0],source=saved[h.lineage];assert.ok(source);const p=prepare(source);
 result.history=h.id;result.lineage=h.lineage;result.preflight={entry:p.entry,burn:p.burn,house:p.house,promptTape:p.promptWarp};
 for(const spec of h.executionOrder){const [route,house,relay]=spec.split(':');
  result.runs.push(await run(h,route,house,relay,p));console.log('Completed',h.id,h.lineage,spec);}
 result.status='COMPLETE';
}catch(e){result.status='INCOMPLETE';result.error=e instanceof Error?e.message:String(e);}
writeFileSync(output,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,runs:result.runs.length,error:result.error??null}));if(result.status!=='COMPLETE')process.exitCode=1;
