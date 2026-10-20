/** Exact BigInt conditional P1 law for D1 synthetic design assays. */
import assert from 'node:assert/strict';
export type Tail={hit:boolean;numerator:string;denominator:string;observed:number};
const lawCache=new Map<string,bigint[]>();
const alphaN=1n,alphaD=20n;
function key(row:number[]):string{return [...row].sort((a,b)=>a-b).join(',');}
function exactLaw(rows:number[][],cap:number){
 let dp:bigint[]=[1n];
 for(const row of rows){
  assert.equal(row.length,64);
  const frequencies=new Map<number,bigint>();
  for(const r of row){
   assert(Number.isInteger(r)&&r>=2&&r<=128);
   frequencies.set(r,(frequencies.get(r)||0n)+1n);
  }
  const next=Array<bigint>(Math.min(cap,dp.length-1+128)+1).fill(0n);
  for(let j=0;j<dp.length;j++)if(dp[j]!==0n)for(const [r,m] of frequencies){
   if(j+r<=cap)next[j+r]+=dp[j]*m;
  }
  dp=next;
 }
 return dp;
}
/** Exact conditional P1, including all integer doubled-midrank ties. */
export function exactP1(rows:number[][],targets:number[]):Tail{
 assert.equal(rows.length,88);assert.equal(targets.length,88);
 let observed=0;
 for(let i=0;i<88;i++){assert(Number.isInteger(targets[i])&&targets[i]>=0&&targets[i]<64);observed+=rows[i][targets[i]];}
 const signature=rows.map(key);
 const uniform=signature.every(x=>x===signature[0]);
 const cacheKey=uniform?'88x'+signature[0]+'|'+observed:'';
 let dp:bigint[];
 if(cacheKey&&lawCache.has(cacheKey))dp=lawCache.get(cacheKey)!;
 else {dp=exactLaw(rows,observed);if(cacheKey)lawCache.set(cacheKey,dp);}
 let numerator=0n;for(const x of dp)numerator+=x;
 const denominator=64n**88n;
 assert(numerator>=0n&&numerator<=denominator);
 return {hit:numerator*alphaD<=denominator*alphaN,
  numerator:numerator.toString(),denominator:denominator.toString(),observed};
}
export function assertExactTinyCases(){
 const r=Array.from({length:64},(_,i)=>2*i+2);
 const a=exactLaw([r],128);
 assert.equal(a.reduce((s,v)=>s+v,0n),64n);
 const b=exactLaw([Array(64).fill(65)],65);
 assert.equal(b[65],64n);
 const c=exactLaw([r,r],256);
 assert.equal(c.reduce((s,v)=>s+v,0n),4096n);
}
