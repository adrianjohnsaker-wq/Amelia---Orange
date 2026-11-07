import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
type Ast=number|string|[string,Ast,Ast];type Cell={open:boolean,cost:number};type Grid={cells:Cell[];n:number};type Diag={passed:number;failed:number;meanExpanded:number;invalid:boolean};
const H=(x:string|Buffer)=>createHash('sha256').update(x).digest('hex'),plan={expansionCap:50,maxCostRatio:1.0};
export function randi(seed:string,n:number){return parseInt(H(seed).slice(0,8),16)%n;}
export function grid(seed:string,level:number):Grid{
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
export function evaluate(ast:unknown,cases:Grid[]):Diag{
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

export const LIGHT:Ast=['add','g',['mul',1.5,'d']],HEAVY:Ast=['add','g',['mul',4,'d']];
export const sha=(x:string|Buffer)=>H(x);
export function observations(master:string,id:string,partition:string,index:number,flip:number,steps:number){
 const seed=H(`${master}:${id}:${partition}:${index}`),out:any[]=[];let mode=(randi(`${seed}:initial`,2)^flip)?3:1,age=-1;
 for(let t=0;t<steps;t++){
  const switched=t>0&&randi(`${seed}:switch:${t}`,8)===0;if(switched){mode=mode===1?3:1;age=0}else if(age>=0)age++;
  const ok=evaluate(LIGHT,[grid(`${seed}:feedback:${t}`,mode)]).passed;
  out.push({t,mode,switched,age,ok});
 }
 return {seed,observations:out};
}
export function houseFeatures(L:any,B:any,p:number,d:number){
 const edges=[`${p}>${p}`,`${p}>${d}`,`${d}>${p}`],v:number[]=[];
 for(const k of ['V','S','D'])for(const e of edges)v.push((L[k][e]??0)-(B[k][e]??0));return v;
}
export function pfmFeatures(a:any,b:any,p:number,d:number){return [a.biasVector[p]-b.biasVector[p],a.biasVector[d]-b.biasVector[d],a.hysteresisTension-b.hysteresisTension];}
