import assert from 'node:assert/strict';
import {exactP1LowerTail,exactPairedP2UpperTail} from './exactIntegerNull';

const untied=Array.from({length:64},(_,i)=>2*(i+1));
const tied=new Array<number>(64).fill(65);
const raw=Array.from({length:64},(_,h)=>{
 const ones=h.toString(2).split('1').length-1;
 const sizes=[1,6,15,20,15,6,1];
 const better=sizes.slice(ones+1).reduce((a,b)=>a+b,0);
 return (better+1)+(better+sizes[ones]);
});
// Full exact enumeration for n = 1,2,3, mixed spectra and rank ties.
for(const n of [1,2,3]){
 const configs=[[...Array(n)].map(()=>untied),
   [...Array(n)].map((_,i)=>i%2?tied:untied),
   [...Array(n)].map((_,i)=>i%2?raw:tied)];
 for(const arrays of configs) {
  const targets=Array.from({length:n},(_,i)=>(i*17+3)%64);
  const exact=exactP1LowerTail(arrays,targets.map((h,i)=>arrays[i][h]));
  let favorable=0,total=0;
  function walk(depth:number,score:number) {
   if(depth===n){total++;if(score<=exact.observedSum)favorable++;return;}
   for(const rank of arrays[depth])walk(depth+1,score+rank);
  }
  walk(0,0);
  assert.equal(BigInt(total),64n**BigInt(n));
  assert.equal(BigInt(exact.numerator),BigInt(favorable));
  assert.equal(BigInt(exact.denominator),BigInt(total));
  assert.equal(exact.rejectAt005,20*favorable<=total);
 }
}
const allEqual=exactP1LowerTail(new Array(88).fill(tied),new Array(88).fill(65));
assert.equal(allEqual.numerator,allEqual.denominator);
assert.equal(allEqual.pDisplay,1);
const allUntied=exactP1LowerTail(new Array(88).fill(untied),new Array(88).fill(2));
assert.equal(allUntied.numerator,'1');
assert.equal(allUntied.denominator,(64n**88n).toString());
assert(allUntied.rejectAt005);
const halfway=exactP1LowerTail(new Array(88).fill(untied),new Array(88).fill(65));
assert(halfway.pDisplay>0.45&&halfway.pDisplay<0.55);
for(const n of [1,2]){
 const left=Array.from({length:n},(_,i)=>i%2?raw:untied);
 const right=Array.from({length:n},(_,i)=>i%2?tied:raw);
 const indices=Array.from({length:n},(_,i)=>(i*19+5)%64);
 const exact=exactPairedP2UpperTail(left,right,indices);
 let favorable=0,total=0;
 function walk(depth:number,score:number) {
  if(depth===n){total++;if(score>=exact.observed)favorable++;return;}
  for(let h=0;h<64;h++)walk(depth+1,score+left[depth][h]-right[depth][h]);
 }
 walk(0,0);
 assert.equal(BigInt(exact.numerator),BigInt(favorable));
 assert.equal(BigInt(exact.denominator),BigInt(total));
}
console.log('OUTSIDE3_EXACT_INTEGER_NULL_PASS '+JSON.stringify({
 tinyBruteForceWorkings:[1,2,3],signatures:['unique','tied','raw'],
 n88TiedMassVerified:true,n88UntiedExtremesVerified:true,
 numeratorAsBigInt:true,signedP2Checked:true,
 noTargetsGenerated:true,calibration:false
}));
