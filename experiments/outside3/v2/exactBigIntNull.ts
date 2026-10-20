/**
 * OUTSIDE-3 v2 exact finite null: integer multiplicity convolution.
 * Synthetic software validation only; NO calibration, registration or target access.
 *
 * All probabilities are EXACT BigInt integer ratios. Floating values are
 * optional display derivatives and are NEVER used to determine p<=1/20.
 */
export type Rank2 = number[];
export type PairedRanks = {Raw:Rank2;C:Rank2};
export type ExactSpectrum = {
  minimumSum:number;
  coefficientCounts:bigint[];
  denominator:bigint;
  workingCount:number;
};
export type ExactTail = {
  numerator:string; denominator:string;
  observedIntegerStatistic:number;
  direction:'lower'|'upper';
  rejectAtOneTwentieth:boolean;
  decimal12:string;
};
function assertRank2(rank:number[]) {
  if(!Array.isArray(rank)||rank.length!==64||rank.some(x=>!Number.isInteger(x)||x<2||x>128))
    throw Error('EXPECTED_64_DOUBLED_MIDRANKS');
  if(rank.reduce((a,b)=>a+b,0)!==64*65) throw Error('RANK_MIDRANK_SUM_NOT_4160');
}
function uniqueCounts(values:readonly number[]) {
  const frequencies=new Map<number,bigint>();
  for(const value of values) frequencies.set(value,(frequencies.get(value)??0n)+1n);
  return [...frequencies.entries()].sort((a,b)=>a[0]-b[0]);
}
export function buildExactSpectrum(contributions:readonly (readonly number[])[]):ExactSpectrum {
  let minimum=0;
  let counts=[1n];
  let denominator=1n;
  for(const values of contributions){
    if(values.length!==64||values.some(x=>!Number.isSafeInteger(x)))throw Error('BAD_FINITE_CONTRIBUTIONS');
    const frequencies=uniqueCounts(values);
    const smallest=frequencies[0][0],largest=frequencies[frequencies.length-1][0];
    const nextMin=minimum+smallest;
    const nextLength=(counts.length-1)+(largest-smallest)+1;
    const next=new Array<bigint>(nextLength).fill(0n);
    for(let i=0;i<counts.length;i++){
      const mass=counts[i];
      if(mass===0n)continue;
      for(const [value,n] of frequencies)next[i+value-smallest]+=mass*n;
    }
    minimum=nextMin;
    counts=next;
    denominator*=64n;
  }
  if(counts.reduce((a,b)=>a+b,0n)!==denominator)throw Error('EXACT_MASS_CONSERVATION_FAILURE');
  return {minimumSum:minimum,coefficientCounts:counts,denominator,workingCount:contributions.length};
}
export function exactTail(spectrum:ExactSpectrum,observed:number,direction:'lower'|'upper'):ExactTail {
  if(!Number.isSafeInteger(observed))throw Error('UNSAFE_INTEGER_STATISTIC');
  let numerator=0n;
  for(let k=0;k<spectrum.coefficientCounts.length;k++){
    const score=spectrum.minimumSum+k;
    if(direction==='lower'?score<=observed:score>=observed)numerator+=spectrum.coefficientCounts[k];
  }
  const denominator=spectrum.denominator;
  if(numerator<0n||numerator>denominator)throw Error('NULL_PROBABILITY_OUT_OF_RANGE');
  // Deterministic 12-decimal display; all decisions still use exact arithmetic.
  const twelve=10n**12n;
  const rounded=(numerator*twelve+denominator/2n)/denominator;
  const decimal12=(rounded/twelve).toString()+'.'+(rounded%twelve).toString().padStart(12,'0');
  return {
    numerator:numerator.toString(),denominator:denominator.toString(),
    observedIntegerStatistic:observed,direction,
    rejectAtOneTwentieth:20n*numerator<=denominator,
    decimal12
  };
}
export function exactP1(armCRanks:readonly Rank2[],targets:readonly number[]) {
  if(armCRanks.length!==targets.length||!armCRanks.length)throw Error('P1_WORKINGS_INVALID');
  for(const x of armCRanks)assertRank2(x);
  const observed=armCRanks.reduce((sum,row,w)=>{
    const t=targets[w];if(!Number.isInteger(t)||t<0||t>=64)throw Error('P1_TARGET_INDEX_INVALID');
    return sum+row[t];
  },0);
  return exactTail(buildExactSpectrum(armCRanks),observed,'lower');
}
export function exactP2(pairs:readonly PairedRanks[],targets:readonly number[]) {
  if(pairs.length!==targets.length||!pairs.length)throw Error('P2_WORKINGS_INVALID');
  const diffs=pairs.map(x=>{
    assertRank2(x.C);assertRank2(x.Raw);
    return x.Raw.map((r,i)=>r-x.C[i]);
  });
  const observed=diffs.reduce((sum,row,w)=>{
    const t=targets[w];if(!Number.isInteger(t)||t<0||t>=64)throw Error('P2_TARGET_INDEX_INVALID');
    return sum+row[t];
  },0);
  return exactTail(buildExactSpectrum(diffs),observed,'upper');
}
export function verifyExactMass(spectrum:ExactSpectrum){
  return spectrum.coefficientCounts.reduce((a,b)=>a+b,0n)===64n**BigInt(spectrum.workingCount)
    && spectrum.denominator===64n**BigInt(spectrum.workingCount);
}
