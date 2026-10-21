/** DEV-1 synthetic B-only baseline calibration. NEVER fetches live data. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {AmeliaNumogramSubstrateRuntime} from '../../src/substrate/ameliaNumogramSubstrateRuntime';

const ROOT='experiments/dev1/';
const C=JSON.parse(readFileSync(ROOT+'DEV1_CONSTANTS.json','utf8'));
assert.equal(C.schema,'DEV1_STAGE1_SYNTHETIC_CONSTANTS_V1');
assert.equal(C.syntheticOnly,true);
assert.equal(C.liveInflowProhibited,true);
assert.equal(process.env.DEV1_CONSTANTS_RFC3161_VERIFIED,'true','MUST_SEAL_CONSTANTS_FIRST');
assert.equal(process.env.DEV1_IDENTITY_PASS,'true','PINNED_SOURCE_IDENTITY_GATE');
assert.equal(process.env.DRIFT_C1_ENABLE_LIVE,'false','LIVE_CHANNEL_PROHIBITED');
assert.equal(C.baseline.maxStepsPerTape,10000);
assert.equal(C.baseline.numberOfTapes,32);
const hex=(v:string)=>createHash('sha256').update(v).digest('hex');
function tape(k:number,i:number){return hex('DEV1-TAPE-'+k+'|'+i);}
type Result={tape:number;absorptionStep:number|null;status:string;
   movingExitChoices:number;movingBranchChoices:number;memoryTermChangedExit:number;
   memoryTermChangedBranch:number;lastZone:number;firstZones:number[]};
function runTape(k:number):Result {
  const rt=new AmeliaNumogramSubstrateRuntime();
  rt.setSuppressRelaySteering(true);
  let firstAbsorption:number|null=null;
  let moving=0,branched=0,changed=0,changedBranch=0;
  const firstZones=[rt.getCurrentZone()];
  for(let i=0;i<10000;i++){
    const beforeZone=rt.getCurrentZone();
    const input=tape(k,i);
    const choiceBias=rt.getMemory().readMemoryBias().biasVector;
    const inputHash=hex(input);
    const inputZone=parseInt(inputHash.slice(0,2),16)%10;
    rt.step(input);
    const afterZone=rt.getCurrentZone();
    if(i<8)firstZones.push(afterZone);
    const gates=rt.getQabbala().getGates().filter(g=>g.isOpen&&g.source===beforeZone);
    if(gates.length){
      moving++;
      if(gates.length>1)branched++;
      const z=rt.getQabbala().getZones();
      const pick=(withBias:boolean)=>{
        let target=beforeZone,score=-Infinity;
        for(const g of gates){
          const zz=z[g.target];
          const s=g.flux*(1-g.resistance)+(withBias?(choiceBias[g.target]||0)*0.4:0)
            +zz.activation*0.2+Math.cos(zz.phaseAngle)*0.1
            +(inputZone===g.target?0.35:0);
          if(s>score){score=s;target=g.target;}
        }
        return target;
      };
      assert.equal(pick(true),afterZone,'CANONICAL_EXIT_SELECTOR_REPRODUCTION');
      if(pick(false)!==pick(true)){
        changed++;
        if(gates.length>1)changedBranch++;
      }
    } else if(firstAbsorption===null){
      // Entry at previous step is detected below; no fabricated exit.
      assert.equal(afterZone,beforeZone);
    }
    if(firstAbsorption===null && rt.getQabbala().getGates().filter(g=>g.isOpen&&g.source===afterZone).length===0){
      firstAbsorption=i+1;
    }
  }
  return {tape:k,absorptionStep:firstAbsorption,
    status:firstAbsorption===null?'right-censored at 10000':'absorbed',
    movingExitChoices:moving,movingBranchChoices:branched,
    memoryTermChangedExit:changed,memoryTermChangedBranch:changedBranch,
    lastZone:rt.getCurrentZone(),firstZones};
}
const rows:Result[]=[];
for(let k=1;k<=32;k++){
  const r=runTape(k);rows.push(r);
  console.log('DEV1_BASELINE_TAPE',JSON.stringify({k,absorptionStep:r.absorptionStep,changed:r.memoryTermChangedExit,choices:r.movingExitChoices}));
}
const observed=rows.map(x=>x.absorptionStep).filter((x):x is number=>x!==null).sort((a,b)=>a-b);
const n=observed.length;
const median=n===0?null:(n%2?observed[(n-1)/2]:(observed[n/2-1]+observed[n/2])/2);
const changed=rows.reduce((n,r)=>n+r.memoryTermChangedExit,0);
const total=rows.reduce((n,r)=>n+r.movingExitChoices,0);
const branchChanged=rows.reduce((n,r)=>n+r.memoryTermChangedBranch,0);
const branches=rows.reduce((n,r)=>n+r.movingBranchChoices,0);
const payload={
 schema:'DEV1_BASELINE_CALIBRATION_V1',arm:'B',syntheticOnly:true,
 tapeExpression:"SHA256('DEV1-TAPE-'+k+'|'+i), k=1..32, i=0..9999",
 maxStepsPerTape:10000,totalStepsExecuted:320000,
 reproductionReference:{tapes:24,allAbsorbed:true,median:1134,min:56,max:7116,
   matchingTapeDomainNotAssumed:true,constantTuningPerformed:false},
 absorptionSteps:rows.map(x=>({tape:x.tape,step:x.absorptionStep,censor:x.status})),
 allAbsorbed:n===32,absorbedCount:n,rightCensored:32-n,
 medianAbsorptionStep:median,range:n?[observed[0],observed.at(-1)]:null,
 localSelectorMemoryAblation:{changedExitChoices:changed,exitChoices:total,share:total?changed/total:null,
 changedBranchChoices:branchChanged,branchChoices:branches,branchShare:branches?branchChanged/branches:null,
 method:C.baseline.choiceAblationDefinition},
 source:'unchanged AmeliaNumogramSubstrateRuntime; suppressRelaySteering(true) as PF1; 32 separate fresh states',
 rows
};
const body=JSON.stringify(payload,null,2)+'\n';
writeFileSync(ROOT+'DEV1_BASELINE_CALIBRATION.json',body);
const sha=hex(body);
const fmt=x=>x===null?'not estimable':String(x);
const md=[
 '# DEV-1 Stage 1 — baseline calibration B (synthetic only)',
 '',
 '**Status:** Baseline-only gate. No D1–D4, Y, L, LY, L0 arms were run.',
 '',
 '- 32 separate synthetic SHA-256 tapes, 10,000 unchanged runtime steps per tape (320,000 executed).',
 '- Absorbed by 10,000: **'+n+'/32**; censored: **'+(32-n)+'**.',
 '- Absorption median (observed): **'+fmt(median)+'** steps.',
 '- Absorption range (observed): **'+(n?observed[0]+'–'+observed.at(-1):'not estimable')+'**.',
 '- Selector-only memory ablation changed **'+changed+'/'+total+'** moving exits ('+(total?(100*changed/total).toFixed(4):'NA')+'%).',
 '- At branch choices: **'+branchChanged+'/'+branches+'** ('+(branches?(100*branchChanged/branches).toFixed(4):'NA')+'%).',
 '- Prior 24-tape probe: all absorbed, median 1,134, range 56–7,116. This is context; no constants were fitted.',
 '- Calibration JSON SHA256: `'+sha+'`.',
 '',
 '## Reproduction verdict',
 '',
 'This is an independent 32-tape baseline, not an exact replication of the prior 24 tapes unless their domains/indices are identified and matched. Discrepancies must be reported, not used to change constants.',
 '',
 '## Identity and scope',
 '',
 'Synthetic only: no live inflow, no PF-1 or C1 dispatch, no genesis; frozen science and operational source files unchanged. Identity and externally signed constants gates are enforced by the workflow.',
 '',
 '## Next gate',
 '',
 'Assess this B calibration and its replay/identity evidence **before** starting any developmental arm. The Stage 1 arm analyses, primary permutation tests and transplant test remain NOT RUN.',
 ''
].join('\n');
writeFileSync(ROOT+'DEV1_STAGE1_REPORT.md',md);
console.log('DEV1_BASELINE_CALIBRATION_COMPLETE',JSON.stringify({median,n,range:payload.range,share:payload.localSelectorMemoryAblation.share,sha256:sha}));
