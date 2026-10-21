/** DEV-1 AM4 §5 all five constructed lineage mechanism tests.
 * Tests compare literal frozen AM4 definition with operator's separately
 * registered expected observations. Never turn failure into passing fixture.
 * No live or synthetic cohort run.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {am4TerminalMarks,applyAM4DistinctMarks,am4LiteralFinalExcursion}
 from '../../../../src/developmental/DEV1AM4LiteralLineage';
import {beginLSGeneration,newStoneLineagePlace} from '../../../../src/developmental/DEV1StoneLineage';
import {d1ChooseExit,d1EdgeKey} from '../../../../src/developmental/DEV1D1EdgeSelector';
import {AmeliaNumogramSubstrateRuntime} from '../../../../src/substrate/ameliaNumogramSubstrateRuntime';

const m=JSON.parse(readFileSync('experiments/dev1/DEV1_CONSTANTS_MANIFEST_AM4.json','utf8'));
const receipt=JSON.parse(readFileSync('experiments/dev1/amendments/am4/seal/receipt.json','utf8'));
assert.equal(receipt.status,'PASS');
assert.equal(receipt.lineageResultsBeforeSeal,0);
assert.equal(m.recognizedConflict.blockLineage,true);
const verdict:{test:number;status:'PASS'|'FAIL';details:string}[]=[];
function unit(n:number, f:()=>unknown){
 try{f();verdict.push({test:n,status:'PASS',details:'expected invariant confirmed'});console.log('AM4_TEST_'+n+'_PASS')}
 catch(err){verdict.push({test:n,status:'FAIL',details:String(err)});console.error('AM4_TEST_'+n+'_FAIL',String(err))}
}
const z=[0,9,1];
for(let k=0;k<8;k++)z.push(8,9,1);
const line=[...z,2,4,5];
unit(1,()=>{
 const x=am4TerminalMarks(line);
 assert.deepEqual([...x.excursion.finalExcursionEdges].sort(),
   ['1->2','2->4','4->5'].sort(),
   'REQUIRED_1_PITWARD_FINAL_EXCURSION_VERSUS_LITERAL_LAST_DEPARTURE');
 for(const e of ['1->8','8->9','9->1'])assert.equal(x.V[e],0);
 for(const e of ['1->2','2->4','4->5'])assert.equal(x.V[e],-0.125);
});
const z2=[0,9,1,2,7,8,9,1,2,7,8,9,1,2,4,5];
unit(2,()=>{
 const x=am4LiteralFinalExcursion(z2);
 assert.deepEqual([...x.finalExcursionEdges].sort(),['2->4','4->5'].sort(),
   'REQUIRED_2_ZONE_2_ALREADY_TERRITORY_VERSUS_LITERAL_LAST_DEPARTURE');
});
unit(3,()=>{
 const marks=applyAM4DistinctMarks(['1->2','2->4','1->2','4->5','2->4']);
 assert.equal(marks.V['1->2'],-0.125);
 assert.equal(marks.V['2->4'],-0.125);
 assert.equal(marks.V['4->5'],-0.125);
});
unit(4,()=>{
 for(const trace of [line,z2]){
  const x=am4TerminalMarks(trace);
  for(const [id,v] of Object.entries(x.V))
   assert.equal(x.T['gate-'+id.replace('->','-')],v);
  for(const e of ['1->8','8->9','9->1'])assert.equal(x.V[e],0);
 }
});
unit(5,()=>{
 // Exercise AM1 LS lineage birth isolation (fixture, not cohort).
 const birth=beginLSGeneration(1,2,newStoneLineagePlace());
 const x=am4TerminalMarks(line);
 assert.equal(x.V['1->8'],0);
 assert.equal(birth.personalV['1->8'],0);
 assert.equal(birth.runtime.getMemory().getEvents().length,0);
 const rt=new AmeliaNumogramSubstrateRuntime();rt.setSuppressRelaySteering(true);
 const g=rt.getQabbala().getGates(),zones=rt.getQabbala().getZones();
 const bias=Array(10).fill(0);
 const control=d1ChooseExit(1,g,zones,bias,null,{});
 const successor=d1ChooseExit(1,g,zones,bias,null,x.V);
 // AM4 expectation: inherited loop V0 leaves zone1 choice unchanged from B.
 assert.equal(successor,control);
});
const fail=verdict.filter(x=>x.status==='FAIL');
const raw=am4LiteralFinalExcursion(line);
console.log('AM4_FIVE_UNIT_VERDICTS',JSON.stringify({verdict,
 literalFinalDeparture:raw.lastQualifyingDeparture,
 lastEdge:raw.finalExcursionEdges,
 operatorExpected:['1->2','2->4','4->5'],
 lineageCohortsRun:0,failCount:fail.length}));
if(fail.length)throw Error('AM4_LINEAGE_ELIGIBILITY_GATE_FAIL_'+fail.map(x=>x.test).join('_'));
console.log('AM4_LINEAGE_TEST_GATE_PASS');
