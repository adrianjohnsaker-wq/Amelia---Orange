/** Integer-exact, conditional finite null for D1, including doubled midrank ties. */
import assert from 'node:assert/strict';
export type Tail={hit:boolean;numerator:string;denominator:string;observed:number};
const cache=new Map<string,bigint[]>();
const DEN=64n**88n;
const spectrum=(r:number[])=>{
 assert.equal(r.length,64);
 assert(r.every(x=>Number.isInteger(x)&&x>=2&&x<=128));
 assert.equal(r.reduce((s,x)=>s+x,0),64*65);
 return [...r].sort((a,b)=>a-b).join(',');
};
function convolveRows(rows:number[][],cap:number){
 let dp:bigint[]=[1n];
 for(const row of rows){
  const freq=new Map<number,bigint>();
  for(const x of row)freq.set(x,(freq.get(x)||0n)+1n);
  const next=Array<bigint>(Math.min(cap,dp.length-1+128)+1).fill(0n);
  for(let i=0;i<dp.length;i++)if(dp[i]!==0n)
   for(const [r,n] of freq)if(i+r<=cap)next[i+r]+=dp[i]*n;
  dp=next;
 }
 return dp;
}
function repeatedLaw(row:number[]){
 const distinct=[...row].sort((a,b)=>a-b).every((x,i)=>x===2*(i+1));
 if(distinct){
  let dp:bigint[]=[1n];
  // Use ordinary (half) ranks, 1..64. BigInt running-window convolution.
  for(let n=1;n<=88;n++){
   const next=Array<bigint>(64*n+1).fill(0n);
   let running=0n;
   for(let sum=1;sum<next.length;sum++){
    if(sum>=1&&sum-1<dp.length)running+=dp[sum-1];
    if(sum>=65&&sum-65<dp.length)running-=dp[sum-65];
    next[sum]=running;
   }
   dp=next;
  }
  const full=Array<bigint>(11265).fill(0n);
  for(let s=0;s<dp.length;s++)full[s*2]=dp[s];
  return full;
 }
 return convolveRows(Array.from({length:88},()=>row),11264);
}
function tail(dp:bigint[],observed:number){
 let total=0n;for(let i=0;i<dp.length&&i<=observed;i++)total+=dp[i];
 assert(total>=0n&&total<=DEN);
 return {hit:total*20n<=DEN,numerator:total.toString(),denominator:DEN.toString(),observed};
}
export function exactP1(rows:number[][],targets:number[]):Tail {
 assert.equal(rows.length,88);assert.equal(targets.length,88);
 let obs=0;const keys:string[]=[];
 for(let i=0;i<88;i++){
  assert(Number.isInteger(targets[i])&&targets[i]>=0&&targets[i]<64);
  keys.push(spectrum(rows[i]));obs+=rows[i][targets[i]];
 }
 const repeated=keys.every(k=>k===keys[0]);
 if(repeated){
  const k=keys[0];let law=cache.get(k);
  if(!law){law=repeatedLaw(rows[0]);cache.set(k,law);}
  return tail(law,obs);
 }
 return tail(convolveRows(rows,obs),obs);
}
export function assertExactTinyCases(){
 const r=Array.from({length:64},(_,i)=>2*(i+1));
 const one=convolveRows([r],128);
 assert.equal(one.reduce((a,x)=>a+x,0n),64n);
 const tied=convolveRows([Array(64).fill(65)],65);
 assert.equal(tied[65],64n);
 const two=convolveRows([r,r],256);
 assert.equal(two.reduce((a,x)=>a+x,0n),4096n);
 const result=repeatedLaw(r);
 assert.equal(result.reduce((a,x)=>a+x,0n),DEN);
 const tied88=repeatedLaw(Array(64).fill(65));
 assert.equal(tied88.reduce((a,x)=>a+x,0n),DEN);
}
