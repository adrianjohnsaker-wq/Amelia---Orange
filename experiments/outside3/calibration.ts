/** OUTSIDE-3 synthetic calibration. NEVER generates real targets; no tlock API here.
 * Design constants must be committed before this file is executed.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import { Outside3Reader,rng,randomCast,digest,type Cast,type Constants } from './reader';
import {pValues} from './exact';
type Frozen={constants:Constants;syntheticSeeds:Record<string,number>;thresholds:any;schema:string};
const frozen=JSON.parse(readFileSync('experiments/outside3/design-output/constants.frozen.json','utf8')) as Frozen;
if(frozen.schema!=='OUTSIDE3_DESIGN_FROZEN_V1')throw Error('NO_FROZEN_DESIGN');
const constants=frozen.constants;
const mode=process.argv[2]||'K1',shard=Number(process.argv[3]||0),count=Number(process.argv[4]||1);
if(!['K1','K2','K3','K4','K5','CURVE'].includes(mode)||!Number.isInteger(shard)||!Number.isInteger(count)||count<1)throw Error('BAD_CALIBRATION_ARGS');
type Sample={target:number;rank2:{C:number[];Raw:number[];M:number[]}};
function syntheticWorkingRecords(seriesSeed:number,condition:'NULL'|'CAST_PLANT'|'MEMORY_PLANT',rate=1) {
 const cr=rng(seriesSeed*397+11),targets=rng(seriesSeed*397+29),plantChoice=rng(seriesSeed*397+37),reader=new Outside3Reader(constants);
 const records:Sample[]=[],mr:Sample[]=[];
 for(let w=0;w<88;w++) {
   const target=Math.floor(targets()*64);
   let cast=randomCast(cr);
   const plant=condition!=='NULL'&&plantChoice()<rate;
   if(plant &&condition==='CAST_PLANT'){
     const line=Math.floor(plantChoice()*6),bit=(target>>line)&1;
     cast=[...cast] as Cast;cast[line]=bit?7:8;
   }
   if(plant&&condition==='MEMORY_PLANT'){
     const saved=reader.export();
     const memory=saved.C.memoryState as {events:any[],zoneStrainHistory:number[],hysteresisTension:number};
     for(let i=0;i<6;i++)if((target>>i)&1){
       const z=[1,2,4,8,7,5][i];
       const ev={blockIndex:(saved.C.stepCount as number)??0,depth:(saved.C.stepCount as number)??0,
         targetZone:z,fluxDelta:constants.magnitude,phaseCoherence:0.95,strainRelaxation:0.025,
         eventDigest:digest({kind:'SYNTHETIC_PLANTED_MEMORY',i,w,z}),
         timestamp:w,kind:'OTHER',seed:0};
       memory.events.push(ev);
       memory.zoneStrainHistory[z]=Math.min(1,
         memory.zoneStrainHistory[z]*(1-ev.strainRelaxation)+ev.fluxDelta*1.5);
       memory.hysteresisTension=Math.min(.95,
         memory.hysteresisTension*.96+(1-ev.phaseCoherence)*.15+ev.fluxDelta*.1);
     }
     // Transplant synthetic history only into C (the M arm resets memory before this working).
     // No target index is passed into reader.run().
     reader.importCStateForSyntheticCalibration(saved.C);
   }
   const r=reader.run(cast);
   records.push({target,rank2:{C:r.rank2.C,Raw:r.rank2.Raw,M:r.rank2.M}});
   mr.push({target,rank2:{C:r.rank2.M,Raw:r.rank2.Raw,M:r.rank2.M}});
 }
 const c=pValues(records),m=pValues(mr);
 return {p1:c.p1,p2:c.p2,p1M:m.p1,meanC:c.meanRankC,meanM:m.meanRankC};
}
function k1(){
 const lines=1000,next=rng(frozen.syntheticSeeds.k1),casts=Array.from({length:lines},()=>randomCast(next));
 const series=[10,20,30].map(step=>{
   const reader=new Outside3Reader({...constants,steps:step});
   const bands=Array.from({length:64},()=>[0,0,0,0]);
   const patterns=new Set<string>();
   let ties=0;
   const means=new Array(64).fill(0);
   for(const cast of casts) {
     const r=reader.run(cast);const rr=r.rank2.C;
     patterns.add(digest(rr));for(let h=0;h<64;h++){const band=Math.min(3,Math.floor(((rr[h]-2)/2)/16));bands[h][band]++;means[h]+=rr[h]/2/lines;}
     ties+=new Set(rr).size===64?0:1;
   }
   const entropy=(()=>{
     const f=[0,0,0,0];for(const band of bands)for(let i=0;i<4;i++)f[i]+=band[i];
     return -f.map(x=>x/(64*lines)).filter(x=>x>0).reduce((s,p)=>s+p*Math.log2(p),0);
   })();
   const bias=Math.max(...means)-Math.min(...means);
   return {step,casts:lines,distinctRankings:patterns.size,
     tieCastRate:ties/lines,meanRankBiasRange:bias,rankBandEntropy:entropy,
     rankCoverage:bands,meanRankByHexagram:means};
 });
 return {checks:series};
}
function k2(){
 const out=[];
 for(let i=0;i<count;i++){
  const series=frozen.syntheticSeeds.k2+shard*count+i;
  const r=syntheticWorkingRecords(series,'NULL');
  out.push({series,p1:r.p1,p2:r.p2,rejectP1:r.p1<=.05,rejectP2:r.p2<=.05});
  if((i+1)%10===0)console.log('K2_PROCESSED',shard,i+1);
 }
 return {series:out,total:count,shard};
}
function kPlant(type:'CAST_PLANT'|'MEMORY_PLANT',name:'K3'|'K4'){
 const out=[];
 for(let i=0;i<count;i++){
  const seed=frozen.syntheticSeeds[name.toLowerCase()]+shard*count+i;
  const r=syntheticWorkingRecords(seed,type);
  out.push({series:seed,p1:r.p1,p1M:r.p1M,
    rejectC:r.p1<=.05,rejectM:r.p1M<=.05,meanC:r.meanC,meanM:r.meanM});
  if((i+1)%10===0)console.log(name+'_PROCESSED',shard,i+1);
 }
 return {series:out,total:count,shard};
}
function k5(){
 const out=[];const levels=[10,44,88];
 for(let rep=0;rep<count;rep++){
  const rngCast=rng(frozen.syntheticSeeds.k5+shard*count+rep);
  const normal=new Outside3Reader(constants),perturbed=new Outside3Reader(constants);
  const saved=perturbed.export(),mem=saved.C.memoryState as any;
  const event={blockIndex:0,depth:0,targetZone:9,fluxDelta:constants.magnitude,
    phaseCoherence:0.95,strainRelaxation:0.025,seed:0,kind:'OTHER',
    eventDigest:digest('STAGE1_K5_SYNTHETIC_ONLY'),timestamp:0};
  mem.events.push(event);mem.zoneStrainHistory[9]=Math.min(1,mem.zoneStrainHistory[9]*.975+event.fluxDelta*1.5);
  mem.hysteresisTension=Math.min(.95,mem.hysteresisTension*.96+.0075+event.fluxDelta*.1);
  perturbed.importCStateForSyntheticCalibration(saved.C);
  const checks=[];const divergence=[];
  for(let w=1;w<=88;w++){
    const c=randomCast(rngCast),base=normal.run(c),changed=perturbed.run(c);
    const rankDifference=base.rank2.C.reduce((s,x,i)=>s+Math.abs(x-changed.rank2.C[i]),0)/64/2;
    const cm=base.rank2.C.reduce((s,x,i)=>s+Math.abs(x-base.rank2.M[i]),0)/64/2;
    divergence.push({w,cm});
    if(levels.includes(w))checks.push({working:w,perturbationRankDifference:rankDifference});
  }
  out.push({rep,checks,cmAtCheckpoints:levels.map(w=>divergence[w-1])});
 }
 return {series:out};
}
function curve(){
 const rates=[.10,.20,.30,.45,.60],reps=count;
 const rows=[];
 for(let ri=0;ri<rates.length;ri++){
   let hits=0;
   for(let i=0;i<reps;i++){
     const seed=frozen.syntheticSeeds.curve+shard*10000+ri*1000+i;
     const r=syntheticWorkingRecords(seed,'CAST_PLANT',rates[ri]);
     if(r.p1<=.05)hits++;
   }
   rows.push({fraction:rates[ri],series:reps,rejections:hits,rate:hits/reps});
 }
 return {curve:rows};
}
let result:unknown;
if(mode==='K1')result=k1();
if(mode==='K2')result=k2();
if(mode==='K3')result=kPlant('CAST_PLANT','K3');
if(mode==='K4')result=kPlant('MEMORY_PLANT','K4');
if(mode==='K5')result=k5();
if(mode==='CURVE')result=curve();
const outdir='experiments/outside3/calibration-output';
mkdirSync(outdir,{recursive:true});
const path=outdir+'/'+mode+'-'+String(shard).padStart(3,'0')+'.json';
writeFileSync(path,JSON.stringify({kind:'OUTSIDE3_SYNTHETIC_CALIBRATION',mode,shard,count,
 frozenConstantsDigest:digest(frozen),result},null,2)+'\n');
console.log('CALIBRATION_'+mode+'_COMPLETE',path);
