/** OUTSIDE-3 Stage 1: synthetic-only E-jing encoding and mechanical rank calculation. */
export const LINE_ZONES = [1,2,4,8,7,5] as const;
export type Cast = readonly [number,number,number,number,number,number];
export function encodeCast(values: readonly number[]) {
  if(values.length!==6 || values.some(v=>![6,7,8,9].includes(v))) throw Error('Expected six bottom-first values 6/7/8/9');
  let primary=0, movingMask=0;
  for(let i=0;i<6;i++){
    if(values[i]===7 || values[i]===9) primary|=1<<i;
    if(values[i]===6 || values[i]===9) movingMask|=1<<i;
  }
  return {primary,movingMask,resulting:primary^movingMask};
}
export function doubledMidRanks(scores:readonly number[]):number[]{
  if(scores.length!==64 || scores.some(x=>!Number.isFinite(x))) throw Error('Expected 64 finite scores');
  const order=Array.from({length:64},(_,i)=>i).sort((a,b)=>scores[b]-scores[a] || a-b);
  const ranks=new Array<number>(64);
  for(let start=0;start<64;){
    let end=start+1;
    while(end<64 && scores[order[start]]===scores[order[end]]) end++;
    const doubled=(start+1)+end;
    for(let j=start;j<end;j++) ranks[order[j]]=doubled;
    start=end;
  }
  return ranks;
}
export function linearReadout(activations:readonly number[],reference:readonly number[]):number[]{
  if(activations.length!==10||reference.length!==10)throw Error('Expected ten zones');
  return doubledMidRanks(Array.from({length:64},(_,h)=>{
    let score=0;
    for(let i=0;i<6;i++)score+=((h>>i)&1?1:-1)*(activations[LINE_ZONES[i]]-reference[LINE_ZONES[i]]);
    return score;
  }));
}
export function rawCastReadout(resulting:number):number[]{
  if(!Number.isInteger(resulting)||resulting<0||resulting>63)throw Error('Invalid hexagram');
  return doubledMidRanks(Array.from({length:64},(_,h)=>{
    let matches=0;
    for(let i=0;i<6;i++)if(((h>>i)&1)===((resulting>>i)&1))matches++;
    return matches;
  }));
}
