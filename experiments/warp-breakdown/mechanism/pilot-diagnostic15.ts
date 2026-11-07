import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {OracleAdapter} from '../oracle-rerun/adapter.mjs';
import {prepare} from './prepare.mjs';
type Ast=number|string|[string,Ast,Ast];type Cell={open:boolean,cost:number};type Grid={cells:Cell[];n:number};type Diag={passed:number;failed:number;meanExpanded:number;invalid:boolean};
const H=(x:string|Buffer)=>createHash('sha256').update(x).digest('hex'),plan={expansionCap:50,maxCostRatio:1.0};
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

const saved=JSON.parse(readFileSync(process.argv[2],'utf8')).amelias,rows=[];
for(const [id,source] of Object.entries(saved)){
 const p=prepare(source);
 for(const gain of [0.054,0.35])for(const route of ['warp','control'])for(let seed=0;seed<12;seed++)for(const level of [1,3]){
  const init=new OracleAdapter({...p.native,cueWeight:gain}),r=route==='warp'?init:init.makeControl(),pr=route==='warp'?3:2,di=route==='warp'?6:7;
  const s0=r.fullState(),b0=r.r.getMemory().readMemoryBias().biasVector,pass=[],path=[];
  for(let t=0;t<24;t++){
   const g=grid(`pilot-house-learning:${seed}:${t}`,level),q=evaluate(['add','g',['mul',1.5,'d']],[g]);
   const passed=q.passed===1,cue=passed?pr:di,step=r.step(cue);pass.push(Number(passed));path.push([step.from,step.to]);
  }
  const s=r.fullState(),b=r.r.getMemory().readMemoryBias().biasVector,key=(x,y)=>`${x}>${y}`;
  const e1=key(pr,pr),e2=key(pr,di),e3=key(di,pr),diff=(k,e)=>s.L[k][e]-s0.L[k][e];
  rows.push({id,gain,route,seed,level,pass,path,features:{S:diff('S',e1)-diff('S',e2),D:diff('D',e1)-diff('D',e2),V:diff('V',e1)-diff('V',e2),P:(b[pr]-b[di])-(b0[pr]-b0[di]),X:diff('S',e3)}});
 }
 console.log(id,'completed');
}
writeFileSync(process.argv[3],JSON.stringify({schema:'exploratory-mechanism-pilot/v1',rows},null,2)+'\n');
