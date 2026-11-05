import test from 'node:test';
import assert from 'node:assert/strict';
import { bornAmelia } from '../../src/core/fullNumogram';
import { advanceLiveField,captureLiveField,createLiveField } from '../../src/outside/LiveFieldLoop';
import { inspectCheckpoint } from './checkpoint_preflight';

function fresh() { const runtime=bornAmelia();runtime.step();return runtime; }
function capsule(runtime:any,field:any=null) { return {version:2,state:structuredClone(runtime.exportState()),fieldCheckpoint:field,writerId:'synthetic-test-device'}; }

test('a newborn runtime without a saved field is not a continuing-body assay',()=>{
 const result=inspectCheckpoint(capsule(fresh()));
 assert.equal(result.matchesNewborn,true);assert.equal(result.processEvents,1);assert.equal(result.fieldValid,false);
 assert.equal(result.canStartFromSavedBody,false);assert.equal(result.blockers.length,3);
});

test('a full saved field and runtime can be restored and an event prefix compared',()=>{
 const r=fresh();let body=createLiveField(r,{seed:101,depth:288,preset:'SYZYGETIC_GRID',size:12});
 body=advanceLiveField(body).state;const previous=capsule(r,captureLiveField(body,false));
 body=advanceLiveField(body).state;const current=capsule(r,captureLiveField(body,false));
 const result=inspectCheckpoint({records:[{store:'runtime',record_id:'live-checkpoint',payload:current}]},previous);
 assert.equal(result.canStartFromSavedBody,true);assert.equal(result.fieldStep,2);assert.equal(result.prefixContinuity,true);assert.equal(result.sameWriter,true);
});

test('a corrupt, mismatched or divergent field is not accepted',()=>{
 const r=fresh();const body=advanceLiveField(createLiveField(r,{seed:101,depth:288,preset:'SYZYGETIC_GRID',size:12})).state;
 const current=capsule(r,captureLiveField(body,false));
 const corrupted=structuredClone(current);corrupted.fieldCheckpoint.payload+=' ';
 assert.throws(()=>inspectCheckpoint(corrupted),/checksum mismatch/);
 const mismatched=structuredClone(current);mismatched.fieldCheckpoint.runtimeStep++;
 assert.throws(()=>inspectCheckpoint(mismatched),/not saved at the same/);
 const divergent=structuredClone(current);divergent.state.memoryState.events[0].eventDigest='a'.repeat(64);
 const result=inspectCheckpoint(current,divergent);assert.equal(result.prefixContinuity,false);assert.equal(result.canStartFromSavedBody,false);
});
