/** Synthetic parity reversals and ordered, noncommuting A/B transformations. */
import assert from 'node:assert/strict';
import {randi,sha} from '../dynamic/common.ts';
export const FAMILIES=['parity','ordered'] as const;
export function task(master:string,id:string,family:string,partition:string,index:number,flip:number,rounds:number){
 assert.ok(FAMILIES.includes(family as any));assert.equal(rounds,16);assert.ok(flip===0||flip===1);
 const seed=sha(`${master}:${id}:${family}:${partition}:${index}`),first=3+randi(`${seed}:switch1`,3),second=10+randi(`${seed}:switch2`,2);
 assert.ok(first+4<second&&second+4<rounds);
 let parity=randi(`${seed}:initial`,2)^flip,x=0,y=0,age=-1;const observations:any[]=[];
 for(let t=0;t<rounds;t++){
  const event=randi(`${seed}:event:${t}`,2);
  // A toggles the first bit, B swaps the two bits: B(A(00)) != A(B(00)).
  if(family==='ordered'){if(event===0)x^=1;else [x,y]=[y,x];}
  const switched=t===first||t===second;if(switched){parity^=1;age=0;}else if(age>=0)age++;
  const target=parity^(family==='ordered'?x:0),noise=Number(randi(`${seed}:noise:${t}`,4)===0),feedback=target^noise;
  observations.push({t,event,switched,age,target,feedback,parity,x,y,noise});
 }
 return {seed,first,second,observations};
}
