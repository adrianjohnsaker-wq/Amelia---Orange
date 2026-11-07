/** Fresh changing grid challenges; latent targets are never passed to an agent. */
import assert from 'node:assert/strict';
import {sha,randi,grid,evaluate,LIGHT,HEAVY} from '../dynamic/common.ts';
export function generate(master:string,lineage:string,partition:string,n:number,flip:number,rounds:number,which:string){
 let seed='',sw:boolean[]=[],attempt=0;
 do{
  seed=sha(`${master}:${lineage}:${partition}:${n}:${which}:${attempt++}`);sw=[];let since=999;
  for(let t=0;t<rounds;t++){
   const hit=t>=6&&t<=rounds-5&&since>=6&&randi(`${seed}:switch:${t}`,8)===0;
   sw.push(hit);since=hit?0:since+1;
  }
 }while(!sw.some(Boolean)&&attempt<100);
 assert.ok(sw.some(Boolean));let mode=(randi(`${seed}:initial`,2)^flip)?3:1,age=-1;const rows:any[]=[];
 for(let t=0;t<rounds;t++){
  if(sw[t]){mode=mode===1?3:1;age=0;}else if(age>=0)age++;
  const cases=[0,1].map(j=>grid(`${seed}:grid:${t}:${j}`,mode));
  const light=evaluate(LIGHT,cases).passed,heavy=evaluate(HEAVY,cases).passed;
  rows.push({t,mode,age,switched:sw[t],payoffs:[light,heavy]});
 }
 return {seedHash:sha(seed),attempts:attempt,rows};
}
