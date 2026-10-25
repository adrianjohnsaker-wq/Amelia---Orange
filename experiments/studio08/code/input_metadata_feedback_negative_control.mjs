/**
 * Studio08 E0c: closed-loop negative control showing archival input metadata
 * CAN be promoted to a causal choice difference through a sensitive self-cue.
 * SYNTHETIC TEST ONLY: neither the historical Studio07 self-cue nor a house.
 *
 * Two *unmodified cue mappings* are compared. In both, the original input
 * +0.35 is disabled and a separate +0.35 endogenous bonus is introduced.
 * The new bonus is calculated BEFORE each choice:
 *   sensitive: SHA256(PFM event-digest-history hash), including source labels;
 *   projected: SHA256(last 24 target zones), excluding all input labels.
 * Same initial runtime state, the three V/K/N input types. At most one
 * input-derived causal path is varied. No future lookahead.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {AmeliaNumogramSubstrateRuntime as Original} from '../../studio/runtime_mirror/substrate/ameliaNumogramSubstrateRuntime.ts';
import {AmeliaNumogramSubstrateRuntime as Mirror} from '../runtime_mirror/substrate/ameliaNumogramSubstrateRuntime.ts';

const sha=s=>createHash('sha256').update(s).digest('hex');
const zone=s=>parseInt(sha(s).slice(0,8),16)%10;
function cueOf(runtime,method) {
  const m=runtime.getMemory();
  if(method==='sensitive')return zone(m.computeMemoryDigest());
  if(method==='trajectory')return zone(JSON.stringify(m.getEvents().slice(-24).map(x=>x.targetZone)));
  throw Error('unknown method');
}
const original=new Original();
for(let t=0;t<32;t++)original.step(sha('STUDIO08-E0C-PREFIX|'+t));
const checkpoint=original.exportState();

function run(method) {
  const forks=Array.from({length:3},()=>new Mirror());
  forks.forEach(f=>{f.importState(checkpoint);f.inputCueEnabled=false});
  const paths=[[],[],[]],cuePaths=[[],[],[]];
  for(let i=0;i<192;i++){
    const inputs=[sha('STUDIO08-E0C-VARY|'+i),'STUDIO08-E0C-CONSTANT',undefined];
    forks.forEach((f,k)=>{
      const cue=cueOf(f,method);
      cuePaths[k].push(cue);
      f.exitBonus=(_from,to)=>to===cue ? 0.35:0;
      const result=f.step(inputs[k]);
      paths[k].push(result.lastTransition.to);
    });
  }
  return {paths,cuePaths};
}
const sensitive=run('sensitive');
const trajectory=run('trajectory');
assert.deepEqual(trajectory.paths[0],trajectory.paths[1],
 'source-excluded readout changed path under constant input');
assert.deepEqual(trajectory.paths[0],trajectory.paths[2],
 'source-excluded readout changed path under absent input');
assert.deepEqual(trajectory.cuePaths[0],trajectory.cuePaths[1]);
assert.deepEqual(trajectory.cuePaths[0],trajectory.cuePaths[2]);
const countMismatch=(values)=>values[0].filter((x,i)=>x!==values[1][i]||x!==values[2][i]).length;
const sensitiveCueDiff=countMismatch(sensitive.cuePaths);
const sensitivePathDiff=countMismatch(sensitive.paths);
assert(sensitiveCueDiff>0,'sensitive cues unexpectedly identical');
assert(sensitivePathDiff>0,'sensitive cues never changed any choices in this fixture');
assert.equal(countMismatch(trajectory.paths),0);
console.log(JSON.stringify({
 schema:'STUDIO08_FEEDBACK_INPUT_HASH_NEGATIVE_CONTROL_V1',
 status:'PASS_SYNTHETIC_CAUSAL_FEEDBACK_QA_NOT_STONE_TAPE',
 steps:192, sourceForks:3, fixedCueWeight:0.35,
 sourceBearingPFMCueMismatchSteps:sensitiveCueDiff,
 sourceBearingPFMChoiceMismatchSteps:sensitivePathDiff,
 sourceExcludedTrajectoryCueMismatchSteps:countMismatch(trajectory.cuePaths),
 sourceExcludedTrajectoryChoiceMismatchSteps:countMismatch(trajectory.paths),
 noGenuineQuicknet:true,noStoneTapeHouse:true,
 implication:'Apparent endogenous feedback from PFM history hash can be an indirect conduit for currently arriving external input even with original cue off'
}));
