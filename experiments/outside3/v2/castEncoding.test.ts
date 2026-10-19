/**
 * OUTSIDE-3 v2 exhaustive synthetic encoding tests (NOT a calibration).
 * Covers all 64 primary hexagrams × 64 movement masks = 4,096 casts.
 * Any numbers below are UNIT-TEST FIXTURES, NOT DESIGN/FROZEN CONSTANTS.
 */
import assert from 'node:assert/strict';
import {IntegratedMemorySystem} from '../../../src/substrate/IntegratedMemorySystem';
import {
  LINE_ZONES_V2,bitsFromCast,castFromPrimaryAndMoving,encodeCastToPFM,
  canonicalInputSignature,validateMagnitudes,type PFMEncodingMagnitudes
} from './castEncoding';

const p:PFMEncodingMagnitudes={
  yin:0.011,yang:0.031,movement:0.008,phaseCoherence:0.95,strainRelaxation:0.025
};
const signatures=new Set<string>(),readouts=new Set<string>(),snapshots=new Set<string>();
const noMovement=new Set<string>();
let eventsChecked=0;
let effectiveFail=0;
for(let primary=0;primary<64;primary++)for(let mask=0;mask<64;mask++){
  const cast=castFromPrimaryAndMoving(primary,mask);
  assert.deepEqual(bitsFromCast(cast),{primary,movingMask:mask,resulting:primary^mask});
  const entries=encodeCastToPFM(cast,p,0);
  const second=encodeCastToPFM(cast,p,0);
  assert.equal(canonicalInputSignature(entries),canonicalInputSignature(second));
  assert.deepEqual(entries.map(x=>x.event),second.map(x=>x.event));
  const movingLines=Array.from({length:6},(_,i)=>i).filter(i=>!!(mask&(1<<i))).length;
  assert.equal(entries.length,6+movingLines);
  assert.equal(entries.filter(x=>x.descriptor.eventKind==='CAST_MOVEMENT').length,movingLines);
  const base=entries.filter(x=>x.descriptor.eventKind!=='CAST_MOVEMENT');
  assert.equal(base.length,6);
  assert.deepEqual(base.map(x=>x.descriptor.mappedZone),[...LINE_ZONES_V2]);
  const tags=new Set(entries.map(x=>x.event.eventDigest));
  assert.equal(tags.size,entries.length,'event digests must be distinct in one cast');
  // Every line has a mandatory base event. Each old line has one *additional*
  // distinguishable event adjacent to its base at the SAME zone.
  for(let i=0;i<6;i++){
    const own=entries.filter(x=>x.descriptor.line===i+1);
    const originalYang=cast[i]===7||cast[i]===9;
    const moving=cast[i]===6||cast[i]===9;
    const resultingYang=!!((primary^mask)&(1<<i));
    assert.equal(resultingYang,moving?!originalYang:originalYang);
    assert.equal(own.length,moving?2:1);
    assert.equal(own[0].descriptor.eventKind,resultingYang?'CAST_POLARITY_YANG':'CAST_POLARITY_YIN');
    assert.equal(own[0].descriptor.primaryBit,originalYang?1:0);
    assert.equal(own[0].descriptor.resultingBit,resultingYang?1:0);
    assert.equal(own[0].descriptor.movementFlag,moving);
    assert.equal(own[0].event.fluxDelta,resultingYang?p.yang:p.yin);
    assert(own.every(x=>x.descriptor.mappedZone===LINE_ZONES_V2[i]));
    if(moving){
      assert.equal(own[1].descriptor.eventKind,'CAST_MOVEMENT');
      assert.notEqual(own[0].event.eventDigest,own[1].event.eventDigest);
    }
  }
  const signature=canonicalInputSignature(entries);
  assert(!signatures.has(signature),'NON_INJECTIVE_PFM_INPUT '+primary+' '+mask);
  signatures.add(signature);
  if(mask===0)noMovement.add(signature);
  // Option A must preserve the resulting hexagram even for old-line casts.
  const resulting=primary^mask;
  for(let i=0;i<6;i++){
    const requiredPolarity=!!(resulting&(1<<i));
    const base=entries.find(e=>e.descriptor.line===i+1&&e.descriptor.eventKind!=='CAST_MOVEMENT');
    assert(base);
    assert.equal(base.descriptor.resultingBit,requiredPolarity?1:0);
    assert.equal(base.descriptor.eventKind,requiredPolarity?'CAST_POLARITY_YANG':'CAST_POLARITY_YIN');
  }
  // Effective-state check exercises the EXISTING PFM append law, not merely
  // metadata tags. This does not establish resistance to saturated carryover
  // histories; future design gate must test those separately.
  const memory=new IntegratedMemorySystem();
  for(const item of entries)memory.append(item.event);
  const exportState=memory.exportState();
  const states=JSON.stringify(exportState.zoneStrainHistory);
  const readout=JSON.stringify(memory.readMemoryBias().biasVector);
  if(snapshots.has(states)||readouts.has(readout))effectiveFail++;
  snapshots.add(states);
  readouts.add(readout);
  // State export/import parity; explicit separate PFM histories.
  const restored=new IntegratedMemorySystem();
  restored.importState(exportState);
  assert.deepEqual(restored.exportState(),exportState);
  assert.equal(restored.exportHistoryDigest(),memory.exportHistoryDigest());
  eventsChecked+=entries.length;
}
// Explicit old-line reversal: old yin 6 becomes resulting yang, old yang 9 becomes resulting yin.
const reversals=encodeCastToPFM([6,9,8,7,6,9],p,0);
assert.equal(reversals.find(e=>e.descriptor.line===1)?.descriptor.eventKind,'CAST_POLARITY_YANG');
assert.equal(reversals.find(e=>e.descriptor.line===2)?.descriptor.eventKind,'CAST_POLARITY_YIN');
assert.equal(reversals.find(e=>e.descriptor.line===5)?.descriptor.eventKind,'CAST_POLARITY_YANG');
assert.equal(reversals.find(e=>e.descriptor.line===6)?.descriptor.eventKind,'CAST_POLARITY_YIN');
assert.equal(signatures.size,4096);
assert.equal(noMovement.size,64);
assert.equal(snapshots.size,4096,'PFM effective strains must distinguish all casts in fresh-state fixture');
assert.equal(readouts.size,4096,'PFM bias must distinguish all casts in fresh-state fixture');
assert.equal(effectiveFail,0);
assert.throws(()=>validateMagnitudes({...p,yin:0.01,yang:0.02,movement:0.01}),/NONINJECTIVE/);
assert.throws(()=>validateMagnitudes({...p,yin:0.02,yang:0.02}),/NONINJECTIVE/);
assert.throws(()=>bitsFromCast([6,7,8]),/INVALID/);
console.log('V2_SYNTHETIC_ENCODING_PASS '+JSON.stringify({
  casts:4096,hexagrams:64,movementMasksPerHexagram:64,
  uniqueEventStreams:signatures.size,
  uniqueFreshPFMStrainStates:snapshots.size,
  uniqueFreshPFMBiasVectors:readouts.size,
  eventsChecked,fixtureOnly:true,noRealTarget:true,
  stage:'ENCODER_UNIT_TEST_NOT_CALIBRATION'
}));
