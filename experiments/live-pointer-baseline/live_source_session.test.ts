import test from 'node:test';
import assert from 'node:assert/strict';
import { bornAmelia } from '../../src/core/fullNumogram';
import { captureLiveField,createLiveField,restoreLiveField } from '../../src/outside/LiveFieldLoop';
import { advanceWithLiveSource,getLiveSourceSession,setLiveSourceEnabled } from '../../src/outside/LiveSyntheticSourceSession';

test('the opt-in source records its body pointer and Governor decision in live process memory',()=>{
 const r=bornAmelia();r.step();let body=createLiveField(r,{seed:101,depth:256,preset:'SYZYGETIC_GRID',size:12});
 assert.equal(getLiveSourceSession(body),null);body=setLiveSourceEnabled(body,true);
 const step=advanceWithLiveSource(body),decision=step.currentSourceDecision;
 assert.ok(decision);assert.equal(decision.sourceContext?.bodyDigest,step.observation.sourceDigest);
 assert.equal(decision.sourceContext?.sourceStep,1);assert.deepEqual(decision.sourceContext?.pointerVector,step.observation.attentionVector);
 const event:any=r.getMemory().getEvents().at(-1);
 assert.deepEqual(event.encounters.find((e:any)=>e.sourceDigest===decision.sourceDigest).sourceContext,decision.sourceContext);
 assert.equal(getLiveSourceSession(step.state)?.sourceState.step,1);
});

test('the source and its application field resume together after a full checkpoint',()=>{
 const r=bornAmelia();r.step();let body=setLiveSourceEnabled(createLiveField(r,{seed:101,depth:256,preset:'SYZYGETIC_GRID',size:12}),true);
 for(let i=0;i<3;i++)body=advanceWithLiveSource(body).state;
 const saved=JSON.parse(JSON.stringify({state:r.exportState(),field:captureLiveField(body,false)}));
 const next=bornAmelia();next.importState(saved.state);const restored=restoreLiveField(saved.field,next);
 assert.equal(getLiveSourceSession(restored)?.enabled,true);assert.equal(getLiveSourceSession(restored)?.sourceState.step,3);
 const a=advanceWithLiveSource(body),b=advanceWithLiveSource(restored);
 assert.deepEqual(a.sourceReading,b.sourceReading);assert.deepEqual(a.state.cells,b.state.cells);
 assert.equal(r.getMemory().exportHistoryDigest(),next.getMemory().exportHistoryDigest());
 const paused=setLiveSourceEnabled(b.state,false),off=advanceWithLiveSource(paused);
 assert.equal(off.sourceReading,null);assert.equal(getLiveSourceSession(off.state)?.sourceState.step,4);
});

test('an invalid saved source session is refused instead of silently reinitialized',()=>{
 const r=bornAmelia();r.step();let body=setLiveSourceEnabled(createLiveField(r,{seed:101,depth:256,preset:'SYZYGETIC_GRID',size:12}),true);
 body={...body,syntheticSourceSession:{schema:'amelia.live-synthetic-source/v1',enabled:true,sourceState:{step:1,smoothedCentroid:2,address:0}}} as any;
 const checkpoint=captureLiveField(body,false);
 assert.throws(()=>restoreLiveField(checkpoint,r),/Invalid saved synthetic source session/);
});
