import {grid,evaluate,LIGHT,HEAVY} from '../dynamic/common.ts';
for(const mode of [1,3])for(const [name,policy] of [['light',LIGHT],['heavy',HEAVY]] as const){
 const scores:number[]=[];for(let j=0;j<128;j++)scores.push(evaluate(policy,[grid(`internal-feedback-calibration:pilot:${mode}:${j}`,mode)]).passed);
 console.log(JSON.stringify({mode,policy:name,n:scores.length,passed:scores.reduce((a,b)=>a+b,0)}));
}
