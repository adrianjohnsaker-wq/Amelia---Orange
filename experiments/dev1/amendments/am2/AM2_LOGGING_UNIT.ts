/**
 * AM2 constructed-fixture unit checks only: NO B/D/lineage cohort, no
 * generated lineage data, no live PF1/C1 intake and no claim of P-AM2-1 result.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {AM2O8Recorder,classifyCue,summarizeExploration,lineageExplorationMean,
 readOnlyPF1EligibleCandidateKeys,armUsesGeneration,AM2_PERMUTATIONS,holmTwo}
 from '../../../../src/developmental/DEV1AM2Readouts';

const receipt=JSON.parse(readFileSync('experiments/dev1/amendments/am2/seal/receipt.json','utf8'));
assert.equal(receipt.status,'PASS');
assert.equal(receipt.noLineageDataAtSeal,true);
assert.equal(receipt.baseAndAM1OriginalSignedTokensReverified,true);
assert.equal(AM2_PERMUTATIONS,100000);
const pit=[{from:1,to:2,other:8},{from:2,to:4,other:7},{from:4,to:5,other:7}];
for(const x of pit){
 const pos=classifyCue(x.from,x.to,x.to);
 assert.equal(pos.choicePoint,true);
 assert.equal(pos.isCued,true);
 assert.equal(pos.cueClass,'pitward');
 assert.equal(pos.compliant,true);
 const neg=classifyCue(x.from,x.other,x.to);
 assert.equal(neg.cueClass,'pitward');
 assert.equal(neg.compliant,false);
 const other=classifyCue(x.from,x.other,x.other);
 assert.equal(other.cueClass,'other');
 assert.equal(other.compliant,true);
 const missed=classifyCue(x.from,x.to,x.other);
 assert.equal(missed.cueClass,'other');
 assert.equal(missed.compliant,false);
 assert.equal(classifyCue(x.from,x.to,9).isCued,false);
 assert.equal(classifyCue(x.from,x.to,null).isCued,false);
}
assert.equal(classifyCue(3,6,6).choicePoint,false);
assert.throws(()=>classifyCue(4,9,5),/NONCANONICAL_EXIT/);
console.log('DEV1_AM2_CUE_CLASSIFICATION_PASS',JSON.stringify({testedZones:[1,2,4],pitwardTargets:[2,4,5],otherTargets:[8,7,7],uncuedExcluded:true}));

const r=new AM2O8Recorder();
// Known constructed step sequence; 4 pit cues (2 matched), 4 other
// cues (3 matched), 3 uncued choice points, 1 non-choice point.
const observations=[
 [1,2,2],[1,8,2],[2,7,4],[4,5,5],
 [1,8,8],[2,7,7],[4,5,7],[1,8,8],
 [1,2,9],[2,4,null],[4,7,0],[3,6,6]
] as const;
observations.forEach(([from,to,cue],i)=>{
 r.observe({arm:'B',lineageId:1,generation:1,stepWithinLife:i+1,
  sourceZone:from,selectedZone:to,inputZone:cue});
});
const [first]=r.summary();
assert.equal(first.arm,'B');
assert.equal(first.windowType,'lifeBlock');
assert.equal(first.window,1);
assert.deepEqual(first.pitward,{cued:4,compliant:2,rate:0.5,sparse:true});
assert.deepEqual(first.other,{cued:4,compliant:3,rate:0.75,sparse:true});
assert.equal(first.uncuedChoices,3);
assert.equal(first.nonChoicePoints,1);
assert.equal(first.resistanceIndex,0.25);
assert.throws(()=>r.observe({arm:'B',lineageId:1,generation:1,stepWithinLife:1,
 sourceZone:1,selectedZone:2,inputZone:2}),/DUPLICATE_STEP/);
console.log('DEV1_AM2_CONSTRUCTED_COMPLIANCE_AND_UNCUED_EXCLUSION_PASS',JSON.stringify(first));

const blocks=new AM2O8Recorder();
blocks.observe({arm:'D1',lineageId:2,generation:1,stepWithinLife:1000,
 sourceZone:1,selectedZone:2,inputZone:2});
blocks.observe({arm:'D1',lineageId:2,generation:1,stepWithinLife:1001,
 sourceZone:1,selectedZone:8,inputZone:8});
assert.deepEqual(blocks.summary().map(x=>x.window),[1,2]);
assert(blocks.summary().every(x=>x.resistanceIndex===null&&x.pitward.sparse&&x.other.sparse));
const generations=new AM2O8Recorder();
generations.observe({arm:'LS',lineageId:3,generation:2,stepWithinLife:19,
 sourceZone:2,selectedZone:7,inputZone:4});
generations.observe({arm:'LS',lineageId:3,generation:3,stepWithinLife:19,
 sourceZone:2,selectedZone:7,inputZone:7});
assert.deepEqual(generations.summary().map(x=>x.window),[2,3]);
assert(generations.summary().every(x=>x.windowType==='generation'));
assert(armUsesGeneration('LSY')&&armUsesGeneration('L0')&&!armUsesGeneration('Y'));
console.log('DEV1_AM2_BLOCK_AND_GENERATION_SPARSE_AND_MISSING_PASS');

// Read-only P-AM2-1 arithmetic, no developmental arm input.
const zones=[0,9,1,8,9,1,2,4,5]; // 8 moving edges, 7 distinct
const fixture=summarizeExploration(1,2,zones,['1-8','1-8','2-4']);
assert.equal(fixture.movingSteps,8);
assert.equal(fixture.distinctDirectedEdges,7);
assert.equal(fixture.directedEdgesPer1000,875);
assert.equal(fixture.distinctEligiblePairs,2);
assert.equal(fixture.eligiblePairsPer1000,250);
assert.equal(fixture.totalPresentedCandidates,3);
const noMovement=summarizeExploration(1,3,[5,5,5],[]);
assert.equal(noMovement.movingSteps,0);
assert.equal(noMovement.directedEdgesPer1000,null);
const firstGen=summarizeExploration(1,1,zones,[]);
const summary=lineageExplorationMean([firstGen,fixture,noMovement]);
assert.equal(summary.excludedGeneration1,1);
assert.equal(summary.undefinedMovingSteps,1);
assert.equal(summary.generationsIncluded,1);
assert.equal(summary.distinctEdgesPer1000,875);
assert.equal(summary.eligiblePairsPer1000,250);
const empty=lineageExplorationMean([firstGen]);
assert.equal(empty.generationsIncluded,0);
assert.equal(empty.distinctEdgesPer1000,null);
assert.throws(()=>summarizeExploration(1,2,[0,5],[]),/NOT_CANONICAL_EDGE/);
// One scanner smoke call with constructed static trajectory, no PF1
// live intake and no confirmation forks; exact frozen PF1 module is used.
const candidateKeys=readOnlyPF1EligibleCandidateKeys(zones);
assert(Array.isArray(candidateKeys));
assert(candidateKeys.every(x=>/^\d-\d$/.test(x)));
assert.deepEqual(holmTwo(0.01,0.04).adjustedP,[0.02,0.04]);
assert.deepEqual(holmTwo(0.04,0.01).adjustedP,[0.04,0.02]);
console.log('DEV1_AM2_READONLY_SCANNER_AND_EXPLORATION_FIXTURE_PASS',JSON.stringify({
 movingSteps:8,distinctEdges:7,per1000:875,
 candidateDistinctPairs:2,pairPer1000:250,
 scannerUsesOriginalFrozenPF1Module:true,
 generationOneExcluded:true,undefinedZeroMovementExcluded:true}));
console.log('DEV1_AM2_ALL_CONSTRUCTED_LOGGING_UNIT_TESTS_PASS_NO_ARM_EXECUTED');
