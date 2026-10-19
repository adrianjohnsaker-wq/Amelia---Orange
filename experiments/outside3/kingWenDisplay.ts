/** Display-only King Wen lookup for OUTSIDE-3.
 * NEVER imported into reader score, cast, memory or null-statistic modules.
 * Source for the top-bit-first binary -> King Wen permutation:
 * https://github.com/gzw1987-bit/iching-math/blob/main/README.md
 * Stage 1 scoring uses bottom-bit-first (line 1 = bit 0), hence reverseBits6.
 */
export const TOP_FIRST_TO_KING_WEN: readonly number[] = Object.freeze([
  2,23,8,20,16,35,45,12,15,52,39,53,62,56,31,33,
  7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44,
  24,27,3,42,51,21,17,25,36,22,63,37,55,30,49,13,
  19,41,60,61,54,38,58,10,11,26,5,9,34,14,43,1
]);
export function kingWenDisplay(bottomFirstIndex:number):number {
  if(!Number.isInteger(bottomFirstIndex)||bottomFirstIndex<0||bottomFirstIndex>63)
    throw Error('HEXAGRAM_INDEX_OUT_OF_RANGE');
  let topFirstIndex=0;
  for(let i=0;i<6;i++)if((bottomFirstIndex>>i)&1)topFirstIndex|=1<<(5-i);
  return TOP_FIRST_TO_KING_WEN[topFirstIndex];
}
export function verifyKingWenDisplayTable():void {
  if(new Set(TOP_FIRST_TO_KING_WEN).size!==64||
     Math.min(...TOP_FIRST_TO_KING_WEN)!==1||
     Math.max(...TOP_FIRST_TO_KING_WEN)!==64)throw Error('KING_WEN_TABLE_INVALID');
  if(kingWenDisplay(0)!==2||kingWenDisplay(63)!==1||
     kingWenDisplay(1)!==24||kingWenDisplay(32)!==23||
     kingWenDisplay(17)!==3||kingWenDisplay(34)!==4)
    throw Error('KING_WEN_BIT_ORDER_INVALID');
}
