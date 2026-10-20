/** PF1 prospective genesis *identity* freezer, never creates/activates a genesis.
 * All nine arms are deterministic fresh instances of the frozen runtime.
 * No C1 network input or PF1 live intake. The reference tape prefix is PF1-specific.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {AmeliaNumogramSubstrateRuntime} from '../../src/substrate/ameliaNumogramSubstrateRuntime';
import {pf1InputForArm} from './PF1_REFERENCE_INPUT.mjs';
import {load} from './PF1_A1_R2_SCORER.mjs';

const root='experiments/pf1/';
const dir=root+'registration-identities/';
mkdirSync(dir,{recursive:true});
const raw=x=>createHash('sha256').update(x).digest('hex');
const sourceFiles=[
 'experiments/pf1/PF1_REFERENCE_INPUT.mjs',
 'experiments/pf1/PF1_PRODUCTION_ARCHIVED_STAGE.ts',
 'experiments/pf1/PF1_PRODUCTION_ARCHIVED_BLS.py',
 'experiments/pf1/PF1_SAFE_LEASE.py',
 'experiments/pf1/PF1_PRODUCTION_SEAL.sh',
 'experiments/pf1/PF1_A1_R2_SCORER.mjs',
 'experiments/pf1/core.mjs',
 'experiments/pf1/a1-r2-graph-only/EXACT_NULL_CURVES.json',
 'experiments/pf1/pandemonium-45.json',
 'experiments/pf1/PF1_A1_R2_CONSTANTS.json'
];
const scope=load();
assert.equal(scope.constants.provenance.liveStartAuthorized,false);
const normal=rt=>{
 const s=JSON.parse(JSON.stringify(rt.exportState()));
 for(const x of s.snapshots||[])delete x.timestamp;
 return s;
};
const names=['C',...Array.from({length:8},(_,i)=>'R'+String(i+1).padStart(2,'0'))];
const arms=names.map(id=>{
 const rt=new AmeliaNumogramSubstrateRuntime();
 rt.setSuppressRelaySteering(true);
 assert.deepEqual(rt.getQabbala().getGates().filter(e=>e.isOpen).map(e=>[e.source,e.target]),
 scope.eligibility.directedEdges);
 const state=normal(rt);
 assert.equal(rt.getMemory().getEvents().length,0);
 return {id,initialMemoryEvents:0,state};
});
assert.equal(new Set(names).size,9);
const init={
 schema:'PF1_NINE_ARM_PROSPECTIVE_INITIAL_STATE_V1',
 sourceSubstrateCommit:scope.constants.sourceCommit,
 memoryLaw:'src/substrate/IntegratedMemorySystem.ts',
 referenceInflow:'PF1-REF-i| (ASCII) + 32 raw verified randomness bytes; i=1..8',
 inputIndexing:'C=0, R01..R08=i=1..8',
 numberOfArms:9,
 scientificTick:0,
 liveGenesis:false,
 liveRoundsAdmitted:0,
 arms
};
const json=JSON.stringify(init,null,2)+'\n';
const initialPath=dir+'PF1_NINE_ARM_INITIAL_STATE.json';
writeFileSync(initialPath,json);
const testHex='00'.repeat(32);
const tests=names.map((id,i)=>({arm:id,fromRawZeroBytes:pf1InputForArm(testHex,i)}));
assert.equal(tests[0].fromRawZeroBytes,testHex);
assert.equal(new Set(tests.map(x=>x.fromRawZeroBytes)).size,9);
const independent=arms.map(x=>x.state.memoryState);
assert(independent.every(s=>s.events.length===0));
const identities={
 schema:'PF1_PROSPECTIVE_IDENTITIES_V1',
 status:'SOURCE_IDENTITY_PROPOSAL_FOR_OPERATOR_REVIEW_NOT_GENESIS',
 generator:'experiments/pf1/PF1_FREEZE_GENESIS_IDENTITIES.ts',
 initialNineArmStateFile:initialPath,
 initialNineArmStateSHA256:raw(Buffer.from(json,'utf8')),
 scannerArtifact:'experiments/pf1/core.mjs',
 scannerArtifactSHA256:raw(readFileSync(root+'core.mjs')),
 exactNullCurveFile:root+'a1-r2-graph-only/EXACT_NULL_CURVES.json',
 analyticNullCurveSHA256:raw(readFileSync(root+'a1-r2-graph-only/EXACT_NULL_CURVES.json')),
 constantsSHA256:raw(readFileSync(root+'PF1_A1_R2_CONSTANTS.json')),
 referenceInputModule:'experiments/pf1/PF1_REFERENCE_INPUT.mjs',
 referenceSeparator:'PF1-REF-i|',
 referenceDomainFixture:tests,
 sourceFileSHA256:sourceFiles.map(path=>({path,sha256:raw(readFileSync(path))})),
 nineArmsInitiallyMemoryEmpty:true,
 noLiveGenesis:true,
 noLiveRounds:true,
 encounterNotificationChannels:[],
 validatedWithFrozenScope:true
};
assert.equal(identities.constantsSHA256,'ecabf3e40023faa0be0749908cfe6ffd3a8b9e42ab7c8a9a7c2ea5827ae63610');
writeFileSync(dir+'PF1_SOURCE_IDENTITIES.json',JSON.stringify(identities,null,2)+'\n');
console.log('PF1_PROSPECTIVE_IDENTITIES',JSON.stringify({
  nineArmInitial:identities.initialNineArmStateSHA256,
  scanner:identities.scannerArtifactSHA256,
  nullCurves:identities.analyticNullCurveSHA256,
  referencePrefix:identities.referenceSeparator,
  arms:names
}));
