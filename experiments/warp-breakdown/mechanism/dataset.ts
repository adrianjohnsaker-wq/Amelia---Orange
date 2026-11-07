/** Offline challenge-history, Numogram memory and counterfactual transfer experiment. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {OracleAdapter} from '../oracle-rerun/adapter.mjs';
import {prepare} from './prepare.mjs';
type Ast=number|string|[string,Ast,Ast];type Cell={open:boolean,cost:number};type Grid={cells:Cell[];n:number};type Diag={passed:number;failed:number;meanExpanded:number;invalid:boolean};
const [statePath,planPath,outDir]=process.argv.slice(2);if(!outDir)throw Error('Usage: dataset.ts STATE PLAN OUTPUT_DIR');
const H=(x:string|Buffer)=>createHash('sha256').update(x).digest('hex');
const raw=readFileSync(statePath),saved=JSON.parse(raw.toString()).amelias,planBytes=readFileSync(planPath),plan=JSON.parse(planBytes.toString());
assert.equal(plan.schema,'amelia.warp-mechanism-transfer/v1');assert.equal(H(raw),plan.checkpointSha256);assert.equal(H(readFileSync(process.argv[1])),plan.scriptSha256);
const index=Number(process.env.MECH_LINEAGE_INDEX),id=plan.lineages[index];assert.ok(id&&saved[id]);
const output=join(outDir,'result.json');mkdirSync(outDir,{recursive:false});
const copy=<T>(v:T):T=>structuredClone(v),hashObj=(x:any)=>H(JSON.stringify(x));
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

const candidateBase:Ast=['add','g',['mul',2.5,'d']],candidateLight:Ast=['add','g',['mul',1.5,'d']],candidateHeavy:Ast=['add','g',['mul',4,'d']];
function egrid(root:string,phase:string,n:number,level:number){return Array.from({length:n},(_,i)=>grid(`${root}:${phase}:${i}`,level));}
function hfeatures(s:any,b:any,p:number,d:number){
 const edges=[`${p}>${p}`,`${p}>${d}`,`${d}>${p}`],out:number[]=[];
 for(const k of ['V','S','D'])for(const e of edges)out.push((s.L[k][e]??0)-(b.L[k][e]??0));return out;
}
function mfeatures(s:any,b:any,p:number,d:number){
 const a=new OracleAdapter(s).r.getMemory().readMemoryBias(),z=new OracleAdapter(b).r.getMemory().readMemoryBias();
 return [a.biasVector[p]-z.biasVector[p],a.biasVector[d]-z.biasVector[d],a.hysteresisTension-z.hysteresisTension];
}
function noHouse(s:any){const x=copy(s);delete x.L;return hashObj(x)}
function noPFM(s:any){const x=copy(s);delete x.runtime.memoryState;return hashObj(x)}
function follow(s:any,n:number){const r=new OracleAdapter(s),path=[],limit=s.runtime.governorState.hardLimitViolations;for(let i=0;i<n;i++){const q=r.step(null);assert.equal(q.snapshot.governor.hardLimitViolationCount,limit);path.push([q.from,q.to]);}return path;}
function swapCheck(recipient:any,donor:any,baseline:any,p:number,d:number){
 const house=copy(recipient);house.L=copy(donor.L);assert.equal(noHouse(house),noHouse(recipient));
 const memory=copy(recipient);memory.runtime.memoryState=copy(donor.runtime.memoryState);assert.equal(noPFM(memory),noPFM(recipient));
 const normalPath=follow(recipient,plan.followSteps),housePath=follow(house,plan.followSteps),memoryPath=follow(memory,plan.followSteps);
 return {house:{nonComponentHash:noHouse(recipient),nonComponentHashAfter:noHouse(house),recipientHash:hashObj(recipient.L),donorHash:hashObj(donor.L),
   donorFeatures:hfeatures(house,baseline,p,d),path:housePath,pathChanged:JSON.stringify(normalPath)!==JSON.stringify(housePath)},
  pfm:{nonComponentHash:noPFM(recipient),nonComponentHashAfter:noPFM(memory),recipientHash:hashObj(recipient.runtime.memoryState),donorHash:hashObj(donor.runtime.memoryState),
   donorFeatures:mfeatures(memory,baseline,p,d),path:memoryPath,pathChanged:JSON.stringify(normalPath)!==JSON.stringify(memoryPath)},normalPath};
}
const prep=prepare(saved[id]),rows:any[]=[],meta:any={schema:'amelia.warp-mechanism-transfer-result/v1',lineage:id,index,
 planSha256:H(planBytes),checkpointSha256:H(raw),scriptSha256:H(readFileSync(process.argv[1])),status:'INCOMPLETE'};
try{
 for(const partition of ['train','test'])for(let i=0;i<plan.pairsPerPartition;i++){
  const seed=H(`${plan.masterSeed}:${id}:${partition}:${i}`),cases:any={};
  for(const level of [1,3]){
   const before=evaluate(candidateBase,egrid(seed,'breakdown',6,2)),shocked=evaluate(candidateBase,egrid(seed,'breakdown',6,level));
   const feedback=egrid(seed,'feedback',plan.observationSteps,level).map(g=>evaluate(candidateLight,[g]).passed);
   cases[level]={before,shocked,feedback};
  }
  for(const gain of plan.cueWeights)for(const route of ['warp','control']){
   const pr=route==='warp'?3:2,di=route==='warp'?6:7,instances:any={};
   for(const level of [1,3]){
    const init=new OracleAdapter({...prep.native,cueWeight:gain}),r=route==='warp'?init:init.makeControl(),base=r.fullState(),path:any[]=[];
    for(const ok of cases[level].feedback){const q=r.step(ok?pr:di);assert.equal(q.snapshot.governor.hardLimitViolationCount,base.runtime.governorState.hardLimitViolations);path.push([q.from,q.to]);}
    const end=r.fullState(),counts=[path.filter(z=>z[0]===pr&&z[1]===pr).length,path.filter(z=>z[0]===pr&&z[1]===di).length,path.filter(z=>z[0]===di&&z[1]===pr).length];
    instances[level]={base,end,features:{house:hfeatures(end,base,pr,di),pfm:mfeatures(end,base,pr,di),path:counts,
      last1:[cases[level].feedback.at(-1)],last4:[cases[level].feedback.slice(-4).reduce((a:number,b:number)=>a+b,0)],
      all24:[cases[level].feedback.reduce((a:number,b:number)=>a+b,0)]},path};
   }
   assert.deepEqual(instances[1].base.L,instances[3].base.L);
   for(const level of [1,3]){
    const z=instances[level],other=instances[level===1?3:1];
    const row:any={partition,index:i,mode:level,route,gain,seedHash:H(seed),before:cases[level].before,shocked:cases[level].shocked,
      breakdown:cases[level].before.passed-cases[level].shocked.passed>=2,feedback:cases[level].feedback,path:z.path,features:z.features};
    if(partition==='test')row.swaps=swapCheck(z.end,other.end,z.base,pr,di);
    rows.push(row);
   }
  }
  // Held-out maps are generated only after all observer states have been frozen.
  for(const level of [1,3]){
   const held=egrid(seed,'heldout',plan.heldoutCases,level),scores={light:evaluate(candidateLight,held),heavy:evaluate(candidateHeavy,held),baseline:evaluate(candidateBase,held)};
   for(const row of rows.filter(x=>x.partition===partition&&x.index===i&&x.mode===level))row.heldout=scores;
  }
 }
 meta.status='COMPLETE';meta.rows=rows;
}catch(e){meta.error=e instanceof Error?e.message:String(e);meta.rows=rows;process.exitCode=1;}
writeFileSync(output,JSON.stringify(meta)+'\n');console.log(JSON.stringify({lineage:id,status:meta.status,rows:rows.length,error:meta.error??null}));
