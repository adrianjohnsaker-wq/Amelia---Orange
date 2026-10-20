/** OUTSIDE-3 D1: synthetic-only dual-readout injectivity and margin diagnostic. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
import {AmeliaNumogramSubstrateRuntime} from '../../../src/substrate/ameliaNumogramSubstrateRuntime';
import {castFromPrimaryAndMoving,encodeCastToPFM,canonicalInputSignature,LINE_ZONES_V2,type SixLineCast} from './castEncoding';
const P={yin:.008,yang:.040,movement:.012,phaseCoherence:.95,strainRelaxation:.025};
const ROOT='experiments/outside3/v2/d1-output';
const sha=(x:unknown)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const rng=(seed:number)=>{let x=seed>>>0;return ()=>{x=(x+0x6d2b79f5)>>>0;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;}};
const newRt=()=>{const r=new AmeliaNumogramSubstrateRuntime();r.setSuppressRelaySteering(true);return r};
const clone=(s:Record<string,unknown>)=>{const r=newRt();r.importState(s);return r};
const fresh=newRt().exportState();
function read(s:Record<string,unknown>,cast:SixLineCast,steps:number,mode:'ACTIVATION'|'PFM_STRAIN'){
 const rt=clone(s),at=rt.getSnapshots().at(-1)?.step??0;
 for(const e of encodeCastToPFM(cast,P,at))rt.getMemory().append(e.event);
 for(let i=0;i<steps;i++)rt.step();
 return mode==='ACTIVATION'?LINE_ZONES_V2.map(z=>rt.getQabbala().getZones()[z].activation):
 LINE_ZONES_V2.map(z=>rt.getMemory().exportState().zoneStrainHistory[z]);
}
const signatures=new Set<string>(),states=new Set<string>();
for(let primary=0;primary<64;primary++)for(let mask=0;mask<64;mask++){
 const cast=castFromPrimaryAndMoving(primary,mask),ev=encodeCastToPFM(cast,P,0);
 signatures.add(canonicalInputSignature(ev));
 const r=clone(fresh);for(const e of ev)r.getMemory().append(e.event);
 states.add(sha(r.getMemory().exportState().zoneStrainHistory));
}
assert.equal(signatures.size,4096,'DESCRIPTOR_NONINJECTIVE');
assert.equal(states.size,4096,'FRESH_PFM_NONINJECTIVE');
const histories:[string,Record<string,unknown>][]=[['FRESH',fresh]];
const h=newRt(),random=rng(9603001);
for(let w=1;w<=88;w++){
 const cast=Array.from({length:6},()=>{const v=Math.floor(random()*8);return v===0?6:v<4?7:v<7?8:9}) as SixLineCast;
 for(const e of encodeCastToPFM(cast,P,w))h.getMemory().append(e.event);
 for(let i=0;i<10;i++)h.step();
 if([1,10,44,88].includes(w))histories.push(['W'+w,h.exportState()]);
}
const results:any[]=[];
for(const window of [0,1,3,10,30])for(const mode of ['ACTIVATION','PFM_STRAIN'] as const){
 const random=rng(9602001+window*10000),refs:number[][]=[];
 for(let j=0;j<192;j++){
  const cast=Array.from({length:6},()=>{const v=Math.floor(random()*8);return v===0?6:v<4?7:v<7?8:9}) as SixLineCast;
  refs.push(read(fresh,cast,window,mode));
 }
 const mu=Array.from({length:6},(_,i)=>refs.reduce((s,v)=>s+v[i],0)/refs.length);
 const sigma=mu.map((m,i)=>Math.sqrt(refs.reduce((s,v)=>s+(v[i]-m)**2,0)/refs.length));
 const valid=sigma.every(s=>Number.isFinite(s)&&s>0);
 for(const [history,state] of histories){
  let minInput=Infinity,minScore=Infinity,nonfinite=0;
  if(valid)for(const mask of [0,21])for(let bit=0;bit<6;bit++)for(let hex=0;hex<64;hex++){
   if(hex&(1<<bit))continue;
   const a=read(state,castFromPrimaryAndMoving(hex^mask,mask),window,mode);
   const b=read(state,castFromPrimaryAndMoving((hex^(1<<bit))^mask,mask),window,mode);
   const av=a.map((x,i)=>(x-mu[i])/sigma[i]),bv=b.map((x,i)=>(x-mu[i])/sigma[i]);
   const changed=Math.abs(av[bit]-bv[bit]);
   const margin=2*Math.min(...av.map(Math.abs),...bv.map(Math.abs));
   if(!Number.isFinite(changed)||!Number.isFinite(margin))nonfinite++;
   minInput=Math.min(minInput,changed);minScore=Math.min(minScore,margin);
  }
  results.push({mode,window,history,referenceSigma:sigma,referenceMu:mu,valid,minimumChangedZoneStandardizedMargin:valid?minInput:null,minimumWithinOutputHamming1ScoreMargin:valid?minScore:null,nonfinite});
 }
}
mkdirSync(ROOT,{recursive:true});
const output={schema:'OUTSIDE3_D1_DUAL_READOUT_DIAGNOSTIC_V1',sourceCommit:process.env.GITHUB_SHA??'LOCAL',injectiveDescriptorCount:signatures.size,injectiveFreshPFMCount:states.size,syntheticOnly:true,calibration:false,registrationClosed:true,results};
writeFileSync(ROOT+'/D1_READOUT_DIAGNOSTIC.json',JSON.stringify(output,null,2)+'\n');
const lines=['# D1 dual readout diagnostic','', '**Synthetic only; not K3 calibration.**','',
'All 4,096 distinct cast/movement combinations: descriptor '+signatures.size+', fresh PFM '+states.size+'.','',
'| Readout | Window | History | Min changed-zone margin (σ) | Min within-score margin | Valid |',
'|---|---:|---|---:|---:|---|',
...results.map(x=>`| ${x.mode} | ${x.window} | ${x.history} | ${x.minimumChangedZoneStandardizedMargin??'N/A'} | ${x.minimumWithinOutputHamming1ScoreMargin??'N/A'} | ${x.valid&&x.nonfinite===0} |`),
'','2σ margins reported descriptively, not used to select D1.'];
writeFileSync(ROOT+'/D1_READOUT_DIAGNOSTIC.md',lines.join('\n')+'\n');
console.log('D1_DUAL_READOUT_DIAGNOSTIC_COMPLETE',JSON.stringify({groups:results.length,valid:results.filter(x=>x.valid&&x.nonfinite===0).length}));
