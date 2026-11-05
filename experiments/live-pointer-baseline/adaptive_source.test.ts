import test from 'node:test';
import assert from 'node:assert/strict';
import { bornAmelia } from '../../src/core/fullNumogram';
import { advanceLiveField,captureLiveField,createLiveField,observeLiveField,restoreLiveField,syntheticSourceOfferDigest } from '../../src/outside/LiveFieldLoop';
import { respondToBody,startSource } from './adaptive_source';

function fields() {
 const runtime=bornAmelia();runtime.step();const base=createLiveField(runtime,{seed:101,depth:256,preset:'SYZYGETIC_GRID',size:12});
 const make=(left:boolean)=>({...base,cells:base.cells.map((c,i)=>({...c,B:(i%base.width<base.width/2)===left?0.9:0.1}))});
 return {left:make(true),right:make(false)};
}
test('the source reads the actual current body and changes address in a controlled contrast',()=>{
 const b=fields(),left=observeLiveField(b.left),right=observeLiveField(b.right);
 const a=respondToBody(left,startSource(),'live'),c=respondToBody(right,startSource(),'live');
 assert.equal(a.after.address,0);assert.equal(c.after.address,1);
 assert.notDeepEqual(a.offer.attentionVector,c.offer.attentionVector);
 assert.equal(a.offer.bodyDigest,left.sourceDigest);assert.equal(c.offer.bodyDigest,right.sourceDigest);
});
test('shuffled and live responses have the same weight distribution; uniform has the same total',()=>{
 const obs=observeLiveField(fields().left),live=respondToBody(obs,startSource(),'live');
 const shuffled=respondToBody(obs,startSource(),'shuffled'),uniform=respondToBody(obs,startSource(),'uniform');
 assert.deepEqual([...live.offer.attentionVector].sort((a,b)=>a-b),[...shuffled.offer.attentionVector].sort((a,b)=>a-b));
 assert.notDeepEqual(live.offer.attentionVector,shuffled.offer.attentionVector);
 for(const r of [live,shuffled,uniform]) assert.ok(Math.abs(r.offer.attentionVector.reduce((a,b)=>a+b,0)-1)<1e-9);
});
test('the shared Governor and PFM receive a source offer bound to the observed field',()=>{
 const b=fields().left,obs=observeLiveField(b),source=respondToBody(obs,startSource(),'live');
 const stepped=advanceLiveField(b,{source:source.offer});
 const decision=stepped.snapshot.encounterDecisions?.at(-1);
 assert.equal(decision?.sourceDigest,syntheticSourceOfferDigest(source.offer));
 assert.deepEqual(decision?.attentionVector,source.offer.attentionVector);
 assert.equal(decision?.disposition,'ATTEND');
 assert.ok((b.nativeRuntime.getMemory().getEvents().at(-1) as any).encounters.some((e:any)=>e.sourceDigest===decision.sourceDigest));
});
test('a stale source response is refused before advancing Amelia',()=>{
 const b=fields().left,obs=observeLiveField(b),source=respondToBody(obs,startSource(),'live');
 const altered={...b,cells:b.cells.map((c,i)=>i===0?{...c,B:0.2}:c)};
 const step=b.nativeRuntime.exportState().stepCount;
 assert.throws(()=>advanceLiveField(altered,{source:source.offer}),/stale synthetic source offer/);
 assert.equal(b.nativeRuntime.exportState().stepCount,step);
});
test('the source, full runtime and field continue identically after serialized restoration',()=>{
 const runtime=bornAmelia();runtime.step();let body=createLiveField(runtime,{seed:101,depth:256,preset:'SYZYGETIC_GRID',size:12});
 let source=startSource();
 for(let i=0;i<3;i++){const reading=respondToBody(observeLiveField(body),source,'live');source=reading.after;body=advanceLiveField(body,{source:reading.offer}).state;}
 const capsule=JSON.parse(JSON.stringify({state:runtime.exportState(),field:captureLiveField(body,false),source}));
 const restoredRuntime=bornAmelia();restoredRuntime.importState(capsule.state);
 const restoredBody=restoreLiveField(capsule.field,restoredRuntime);
 const a=respondToBody(observeLiveField(body),source,'live'),b=respondToBody(observeLiveField(restoredBody),capsule.source,'live');
 assert.deepEqual(a,b);
 const x=advanceLiveField(body,{source:a.offer}),y=advanceLiveField(restoredBody,{source:b.offer});
 assert.deepEqual(x.state.cells,y.state.cells);
 assert.equal(runtime.getMemory().exportHistoryDigest(),restoredRuntime.getMemory().exportHistoryDigest());
});
