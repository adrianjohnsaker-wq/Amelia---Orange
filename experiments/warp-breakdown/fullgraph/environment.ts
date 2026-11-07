/** Fixed-regime training and same/reversed fresh held-out grid sequences. */
import {sha,randi,grid,evaluate,LIGHT,HEAVY} from '../dynamic/common.ts';
export function generate(master:string,id:string,partition:string,n:number,flip:number,train:number,post:number){
 const seed=sha(`${master}:${id}:${partition}:${n}`),mode=(randi(`${seed}:mode`,2)^flip)?3:1,other=mode===1?3:1;
 const cases=(phase:string,t:number,level:number)=>{const g=[0,1].map(j=>grid(`${seed}:${phase}:${t}:${j}`,level));return [evaluate(LIGHT,g).passed,evaluate(HEAVY,g).passed];};
 const trainRows=Array.from({length:train},(_,t)=>({t,real:cases('train',t,mode),donor:cases('train',t,other)}));
 const postRows=Array.from({length:post},(_,t)=>({t,same:cases('post',t,mode),reversed:cases('post',t,other)}));
 return {seedHash:sha(seed),mode,other,shockOffset:randi(`${seed}:shock`,3),trainRows,postRows};
}
