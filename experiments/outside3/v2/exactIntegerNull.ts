/**
 * OUTSIDE-3 v2 exact finite randomization null.
 * Every working contributes one of 64 equally likely target-dependent doubled midranks.
 * BigInt throughout. No FFT, renormalization or floating p-value decisions.
 */
import assert from 'node:assert/strict';

export type ExactTail = {
  numerator:string; denominator:string; pDisplay:number; rejectAt005:boolean;
  observedSum:number; workings:number; untiedWorkings:number; tiedWorkings:number;
  supportMassVerified:boolean;
};

function histogram(rank2:readonly number[]):[number,number][] {
  if(rank2.length!==64||rank2.some(x=>!Number.isInteger(x)||x<2||x>128))
    throw Error('INVALID_64_HEXAGRAM_DOUBLED_MIDRANKS');
  if(rank2.reduce((s,x)=>s+x,0)!==64*65)
    throw Error('RANK_MIDRANK_SUM_INVARIANT_FAILED');
  const m=new Map<number,number>();
  for(const x of rank2)m.set(x,(m.get(x)||0)+1);
  return [...m.entries()].sort((a,b)=>a[0]-b[0]);
}
function isUntied(h:[number,number][]):boolean {
  return h.length===64&&h.every(([r,c],i)=>r===2*(i+1)&&c===1);
}
const uniformCache=new Map<number,{point:bigint[];cdf:bigint[];mass:bigint}>();
/** Distribution of sum of n fair discrete variables in [0,63].
 * Sliding-window BigInt convolution is O(n^2*64) instead of O(n^2*64^2).
 */
function uniform(n:number) {
 const cached=uniformCache.get(n);
 if(cached)return cached;
 assert(n>=0&&Number.isInteger(n));
 let point=[1n];
 for(let i=0;i<n;i++){
  const next=new Array<bigint>(point.length+63).fill(0n);
  let running=0n;
  for(let j=0;j<next.length;j++){
   if(j<point.length)running+=point[j];
   if(j>=64)running-=point[j-64];
   next[j]=running;
  }
  point=next;
 }
 const cdf=new Array<bigint>(point.length);
 let mass=0n;
 for(let j=0;j<point.length;j++){mass+=point[j];cdf[j]=mass;}
 assert.equal(mass,64n**BigInt(n),'UNIFORM_INTEGER_MASS_FAILURE');
 const result={point,cdf,mass};
 uniformCache.set(n,result);
 return result;
}
function decimalProbability(numerator:bigint,denominator:bigint){
 return Number((numerator*1_000_000_000_000n)/denominator)/1_000_000_000_000;
}
const tiedCache=new Map<string,Map<number,bigint>>();
export function exactP1LowerTail(
 ranksByWorking:readonly (readonly number[])[],
 observedRank2:readonly number[]
):ExactTail{
 const n=ranksByWorking.length;
 if(n<1||observedRank2.length!==n)throw Error('EXACT_NULL_WORKING_COUNT_MISMATCH');
 const observed=observedRank2.reduce((s,x)=>s+x,0);
 if(observedRank2.some(x=>!Number.isInteger(x)))throw Error('NON_INTEGER_RANK_OBSERVED');
 let untiedCount=0;
 const tiedHistograms:[number,number][][]=[];
 for(const ranks of ranksByWorking){
  const hist=histogram(ranks);
  if(isUntied(hist))untiedCount++;
  else tiedHistograms.push(hist);
 }
 // Only tied distributions need the general BigInt convolution.
 const tiedSignature=JSON.stringify(tiedHistograms);
 let tiedDistribution=tiedCache.get(tiedSignature);
 if(!tiedDistribution){
  let dist=new Map<number,bigint>([[0,1n]]);
  for(const hist of tiedHistograms){
   const next=new Map<number,bigint>();
   for(const [score,count] of dist)for(const [rank,multiplicity] of hist){
    const key=score+rank;
    next.set(key,(next.get(key)||0n)+count*BigInt(multiplicity));
   }
   dist=next;
  }
  tiedDistribution=dist;
  if(tiedCache.size>=32)tiedCache.clear();
  tiedCache.set(tiedSignature,dist);
 }
 const untied=uniform(untiedCount);
 let numerator=0n,verifiedTiedMass=0n;
 for(const [tiedSum,multiplicity] of tiedDistribution) {
  verifiedTiedMass+=multiplicity;
  const uMax=Math.floor((observed-tiedSum)/2)-untiedCount;
  const ways=uMax<0?0n:uMax>=untied.cdf.length?untied.mass:untied.cdf[uMax];
  numerator+=ways*multiplicity;
 }
 const denominator=64n**BigInt(n);
 assert.equal(verifiedTiedMass,64n**BigInt(tiedHistograms.length),'TIED_INTEGER_MASS_FAILURE');
 assert(numerator>=0n&&numerator<=denominator,'TAIL_BOUNDS_FAILURE');
 return {
  numerator:numerator.toString(),denominator:denominator.toString(),
  pDisplay:decimalProbability(numerator,denominator),
  rejectAt005:20n*numerator<=denominator,
  observedSum:observed,workings:n,
  untiedWorkings:untiedCount,tiedWorkings:tiedHistograms.length,
  supportMassVerified:true
 };
}
/** General exact signed null for P2: each of 64 targets contributes the paired
 * raw-minus-reader doubled rank. Upper tail is favorable to C.
 * Suitable for small-scale tests and later K2 calibration; D1 scores P1 only.
 */
export function exactPairedP2UpperTail(
 raw:readonly (readonly number[])[],reader:readonly (readonly number[])[],
 targetIndices:readonly number[]
):{numerator:string;denominator:string;pDisplay:number;rejectAt005:boolean;observed:number}{
 const n=raw.length;
 if(n<1||reader.length!==n||targetIndices.length!==n)throw Error('P2_WORKING_MISMATCH');
 let observed=0,dist=new Map<number,bigint>([[0,1n]]);
 for(let i=0;i<n;i++){
  histogram(raw[i]); histogram(reader[i]);
  const target=targetIndices[i];
  if(!Number.isInteger(target)||target<0||target>63)throw Error('INVALID_TARGET_INDEX');
  observed+=raw[i][target]-reader[i][target];
  const hist=new Map<number,number>();
  for(let h=0;h<64;h++){
   const difference=raw[i][h]-reader[i][h];
   hist.set(difference,(hist.get(difference)||0)+1);
  }
  const next=new Map<number,bigint>();
  for(const [sum,c] of dist)for(const [offset,mult] of hist)
    next.set(sum+offset,(next.get(sum+offset)||0n)+c*BigInt(mult));
  dist=next;
 }
 const denominator=64n**BigInt(n);
 let numerator=0n,mass=0n;
 for(const [score,count] of dist){mass+=count;if(score>=observed)numerator+=count;}
 assert.equal(mass,denominator,'P2_INTEGER_MASS_FAILURE');
 return {numerator:numerator.toString(),denominator:denominator.toString(),
  pDisplay:decimalProbability(numerator,denominator),
  rejectAt005:20n*numerator<=denominator,observed};
}
