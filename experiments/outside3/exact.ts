/* Exact finite 64-target null laws evaluated by numerical polynomial convolution.
 * Ties and per-working C/raw concordance are retained; no normal approximation.
 * Fitted to integer DOUBLE mid-ranks. Numerical FFT error bound recorded in output.
 */
export function fft(re:Float64Array,im:Float64Array,invert=false) {
  const n=re.length;
  for(let i=1,j=0;i<n;i++){let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){let t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t;}}
  for(let len=2;len<=n;len<<=1){const angle=(invert?-2:2)*Math.PI/len,wr0=Math.cos(angle),wi0=Math.sin(angle);
    for(let i=0;i<n;i+=len){let wr=1,wi=0;for(let j=0;j<len/2;j++){
      const a=i+j,b=a+len/2,vr=re[b]*wr-im[b]*wi,vi=re[b]*wi+im[b]*wr;
      const ur=re[a],ui=im[a];re[a]=ur+vr;im[a]=ui+vi;re[b]=ur-vr;im[b]=ui-vi;
      const nr=wr*wr0-wi*wi0;wi=wr*wi0+wi*wr0;wr=nr;}}}
  if(invert)for(let i=0;i<n;i++){re[i]/=n;im[i]/=n;}
}
export type Polynomial = {lowest:number,coeff:Float64Array};
export function convolve(a:Polynomial,b:Polynomial):Polynomial {
  const total=a.coeff.length+b.coeff.length-1;
  // For small supports direct convolution is more accurate and cheaper.
  if(a.coeff.length*b.coeff.length<=14000) {
    const c=new Float64Array(total);for(let i=0;i<a.coeff.length;i++)if(a.coeff[i])
      for(let j=0;j<b.coeff.length;j++)c[i+j]+=a.coeff[i]*b.coeff[j];
    return {lowest:a.lowest+b.lowest,coeff:c};
  }
  let n=1;while(n<total)n<<=1;
  const reA=new Float64Array(n),imA=new Float64Array(n),reB=new Float64Array(n),imB=new Float64Array(n);
  reA.set(a.coeff);reB.set(b.coeff);fft(reA,imA);fft(reB,imB);
  for(let i=0;i<n;i++){const x=reA[i]*reB[i]-imA[i]*imB[i],y=reA[i]*imB[i]+imA[i]*reB[i];reA[i]=x;imA[i]=y;}
  fft(reA,imA,true);
  let z=0;const out=new Float64Array(total);for(let i=0;i<total;i++){out[i]=Math.max(0,reA[i]);z+=out[i];}
  if(Math.abs(z-1)>1e-7)throw Error('FFT_PROBABILITY_MASS_LOSS '+z);
  for(let i=0;i<total;i++)out[i]/=z;
  return {lowest:a.lowest+b.lowest,coeff:out};
}
export function finiteDistribution(lists:number[][]):Polynomial {
  const factors=lists.map(xs=>{
    if(xs.length!==64||xs.some(n=>!Number.isInteger(n)))throw Error('BAD_NULL_SPECTRUM');
    const low=Math.min(...xs),high=Math.max(...xs),c=new Float64Array(high-low+1);
    for(const x of xs)c[x-low]+=1/64;
    return {lowest:low,coeff:c};
  });
  if(!factors.length)throw Error('NO_FACTORS');
  let pool=factors;
  while(pool.length>1){const next:Polynomial[]=[];for(let i=0;i<pool.length;i+=2)next.push(i+1<pool.length?convolve(pool[i],pool[i+1]):pool[i]);pool=next;}
  return pool[0];
}
export function probabilityTail(distribution:Polynomial,observed:number,direction:'lower'|'upper') {
  const {lowest,coeff}=distribution;
  const endpoint=observed-lowest;let prob=0;
  for(let i=0;i<coeff.length;i++)if(direction==='lower'?i<=endpoint:i>=endpoint)prob+=coeff[i];
  return Math.max(0,Math.min(1,prob));
}
export function pValues(records:{target:number,rank2:{C:number[],Raw:number[]}}[]) {
  const cs=records.map(r=>r.rank2.C);
  const ds=records.map(r=>r.rank2.Raw.map((raw,i)=>raw-r.rank2.C[i]));
  const observedC=records.reduce((s,r)=>s+r.rank2.C[r.target],0);
  const observedD=records.reduce((s,r)=>s+r.rank2.Raw[r.target]-r.rank2.C[r.target],0);
  const C=finiteDistribution(cs),D=finiteDistribution(ds);
  return {p1:probabilityTail(C,observedC,'lower'),
    p2:probabilityTail(D,observedD,'upper'),observedC,observedDifference:observedD,
    meanRankC:observedC/records.length/2,
    numericalMethod:'finite distribution convolution of 64 candidate doubled mid-ranks (FFT rounding, no normal approximation)',
    massErrorBound:1e-7};
}
