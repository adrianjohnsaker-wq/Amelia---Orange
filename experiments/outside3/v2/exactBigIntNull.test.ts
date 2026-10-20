/** Synthetic unit tests only for exact BigInt OUTSIDE-3 v2 null. */
import assert from 'node:assert/strict';
import {buildExactSpectrum,exactTail,exactP1,exactP2,verifyExactMass} from './exactBigIntNull';

const ordered=Array.from({length:64},(_,i)=>2*(i+1));
const reversed=[...ordered].reverse();
const rolled=Array.from({length:64},(_,i)=>ordered[(i+17)%64]);
const allTie=new Array<number>(64).fill(65);
const paired=[
 {Raw:ordered,C:reversed},
 {Raw:rolled,C:ordered},
 {Raw:reversed,C:allTie},
 {Raw:allTie,C:rolled}
];
function brute(rows:readonly number[][],n:number) {
 const frequency=new Map<number,bigint>();
 function visit(level:number,sum:number){
  if(level===n){frequency.set(sum,(frequency.get(sum)??0n)+1n);return;}
  for(const r of rows[level])visit(level+1,sum+r);
 }
 visit(0,0);return frequency;
}
function checkEnumerated(rows:number[][],n:number){
 const e=buildExactSpectrum(rows.slice(0,n));
 assert(verifyExactMass(e));
 const b=brute(rows,n);
 assert.equal(e.coefficientCounts.reduce((x,y)=>x+y,0n),64n**BigInt(n));
 for(let i=0;i<e.coefficientCounts.length;i++){
  const v=e.minimumSum+i;
  assert.equal(e.coefficientCounts[i],b.get(v)??0n,'EXACT_ENUMERATION_MISMATCH '+v);
 }
 for(const observed of [e.minimumSum,e.minimumSum+11,e.minimumSum+Math.floor(e.coefficientCounts.length/2),
   e.minimumSum+e.coefficientCounts.length-1]){
  for(const direction of ['lower','upper'] as const){
   const p=exactTail(e,observed,direction);
   const num=[...b.entries()].filter(([sum])=>direction==='lower'?sum<=observed:sum>=observed)
    .reduce((x,[,mass])=>x+mass,0n);
   assert.equal(BigInt(p.numerator),num);
   assert.equal(BigInt(p.denominator),64n**BigInt(n));
   assert.equal(p.rejectAtOneTwentieth,20n*num<=64n**BigInt(n));
  }
 }
}
for(let n=1;n<=3;n++){
 checkEnumerated([ordered,reversed,rolled],n);
 checkEnumerated([allTie,ordered,reversed],n);
 checkEnumerated(paired.map(p=>p.Raw.map((r,i)=>r-p.C[i])),n);
}
const allTieP1=exactP1([allTie,allTie],[0,63]);
assert.equal(allTieP1.numerator,allTieP1.denominator);
assert.equal(allTieP1.rejectAtOneTwentieth,false);
const p1=exactP1([ordered,ordered],[0,0]);
assert.equal(BigInt(p1.numerator),1n);
assert.equal(BigInt(p1.denominator),4096n);
const p2=exactP2(paired,[0,11,23,63]);
assert(BigInt(p2.numerator)>=0n&&BigInt(p2.numerator)<=BigInt(p2.denominator));
assert.equal(p2.denominator,(64n**4n).toString());
const start=performance.now();
const long=buildExactSpectrum(Array.from({length:88},()=>ordered));
const elapsed=performance.now()-start;
assert(verifyExactMass(long));
assert.equal(long.denominator,64n**88n);
assert.equal(long.workingCount,88);
assert.equal(long.minimumSum,176);
assert.equal(long.coefficientCounts.reduce((a,b)=>a+b,0n),64n**88n);
const longP=exactTail(long,176,'lower');
assert.equal(BigInt(longP.numerator),1n);
assert.equal(longP.denominator,(64n**88n).toString());
console.log('OUTSIDE3_V2_EXACT_BIGINT_NULL_PASS',JSON.stringify({
  enumeratedN:[1,2,3],enumerationTypes:['untied','all-tied','paired signed'],
  P1BestTwoProbability:'1/4096',
  massAt88:(64n**88n).toString(),
  supportAt88:long.coefficientCounts.length,
  runtimeMsRounded:Math.round(elapsed),
  allDecisionsExactBigInt:true,
  syntheticOnly:true,noRealTarget:true,calibrationExecuted:false,registrationClosed:true
}));
