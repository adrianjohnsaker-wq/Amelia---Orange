/** Synthetic-only D1 dual readout/unit replay tests: never generates hidden targets. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {castFromPrimaryAndMoving,encodeCastToPFM} from './castEncoding';
import {freshRuntime,runtimeClone,appendAndDevelop,observable,moments,
 standardized,rankingFromState,type SixVector} from './d1DualReader';

const params={yin:0.008,yang:0.04,movement:0.012,phaseCoherence:0.95,strainRelaxation:0.025};
const signatures=new Set<string>(),freshStrains=new Set<string>();
const afterOneStrains=new Set<string>(),afterOneRankings=new Set<string>();
let strainsClamped=0;
for(let primary=0;primary<64;primary++)for(let mask=0;mask<64;mask++){
 const cast=castFromPrimaryAndMoving(primary,mask);
 const events=encodeCastToPFM(cast,params,0);
 const stream=JSON.stringify(events.map(x=>x.descriptor));
 assert(!signatures.has(stream));
 signatures.add(stream);
 const rt=freshRuntime();
 for(const event of events)rt.getMemory().append(event.event);
 const pre=JSON.stringify(observable(rt,'PFM_STRAIN'));
 assert(!freshStrains.has(pre),'D1_FRESH_PFM_STRAIN_COLLISION '+primary+'/'+mask);
 freshStrains.add(pre);
 rt.step();
 const after=observable(rt,'PFM_STRAIN');
 const serialized=JSON.stringify(after);
 afterOneStrains.add(serialized);
 strainsClamped+=after.filter(x=>x>=1).length;
}
assert.equal(signatures.size,4096);
assert.equal(freshStrains.size,4096);
// Post-step effects under the actual model are DIAGNOSTIC; do not require
// uniqueness when histories/saturation or endogenous steps may collapse states.
const sample=castFromPrimaryAndMoving(31,21);
const a=freshRuntime();
appendAndDevelop(a,sample,params,3);
const saved=a.exportState();
const b=runtimeClone(saved);
assert.deepEqual(observable(a,'PFM_STRAIN'),observable(b,'PFM_STRAIN'));
assert.deepEqual(observable(a,'ACTIVATION'),observable(b,'ACTIVATION'));
const identicalRows:[SixVector,SixVector]=[
 observable(a,'PFM_STRAIN'),observable(runtimeClone(saved),'PFM_STRAIN')
];
assert.throws(()=>moments(identicalRows),/ZERO_REFERENCE_SIGMA/);
const ref={
 mean:[0,0,0,0,0,0] as SixVector,
 sigma:[1,1,1,1,1,1] as SixVector
};
const ranked=rankingFromState(a,'PFM_STRAIN',ref);
assert.equal(ranked.rank2.length,64);
assert.equal(ranked.rank2.reduce((s,x)=>s+x,0),64*65);
assert.equal(ranked.standardized.length,6);
assert(ranked.minHamming1ScoreMargin>=0);
const beforeA=JSON.stringify(observable(a,'PFM_STRAIN'));
const beforeB=JSON.stringify(observable(b,'PFM_STRAIN'));
a.step();b.step();
assert.equal(JSON.stringify(observable(a,'PFM_STRAIN')),
 JSON.stringify(observable(b,'PFM_STRAIN')));
assert.equal(beforeA,beforeB);
console.log('D1_PFM_STRAIN_INJECTIVITY_PASS '+JSON.stringify({
 castStreams:signatures.size,freshPFMFeatureVectors:freshStrains.size,
 distinctAfterOneStepPFMFeatureVectors:afterOneStrains.size,
 postStepFeatureCollisions:4096-afterOneStrains.size,
 clampedZoneObservationsAfterOneStep:strainsClamped,
 replayParity:true,directRealPFMFeature:true,
 noRealTargets:true,calibration:false,registrationClosed:true
}));
