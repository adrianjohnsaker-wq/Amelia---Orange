/** Re-run all AM4 §5 mandatory tests against prospectively corrected AM5 t*.
 * Constructed fixtures + fresh LS successor only, NO lineage cohort. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {am5TerminalMarks,am5EarliestNonreturningExcursion}
 from '../../../../src/developmental/DEV1AM5FinalExcursion';
import {applyAM4DistinctMarks} from '../../../../src/developmental/DEV1AM4LiteralLineage';
import {beginLSGeneration,newStoneLineagePlace}
 from '../../../../src/developmental/DEV1StoneLineage';
import {d1ChooseExit} from '../../../../src/developmental/DEV1D1EdgeSelector';
import {AmeliaNumogramSubstrateRuntime} from '../../../../src/substrate/ameliaNumogramSubstrateRuntime';
const receipt=JSON.parse(readFileSync('experiments/dev1/amendments/am5/seal/receipt.json','utf8'));
const m=JSON.parse(readFileSync('experiments/dev1/DEV1_CONSTANTS_MANIFEST_AM5.json','utf8'));
assert.equal(receipt.status,'PASS');
assert.deepEqual(receipt.onlyExistingDevelopmentalDataAtSeal,['B','D1','D1″']);
assert.equal(m.schema,'DEV1_AM5_ADDITIVE_SEALED_MANIFEST_V1');
function expectEdges(path:number[],expected:string[],n:number){
 const r=am5TerminalMarks(path);
 assert.deepEqual([...r.distinctFinalExcursionEdges].sort(),[...expected].sort(),'AM5_UNIT_'+n+'_EXPECTED_EXCURSION');
 assert.deepEqual([...Object.entries(r.V).filter(([,v])=>v!==0).map(([k])=>k)].sort(),[...expected].sort());
 for(const e of expected){
  assert.equal(r.V[e],-0.125);
  assert.equal(r.T['gate-'+e.replace('->','-')],-0.125);
 }
 for(const e of ['1->8','8->9','9->1']){
   assert.equal(r.V[e],0);
   assert.equal(r.T['gate-'+e.replace('->','-')],0);
 }
 return r;
}
// 1 Long enough established circuit: territory {1,8,9} within 24.
const z1=[0,9,1];for(let k=0;k<11;k++)z1.push(8,9,1);
const first=expectEdges([...z1,2,4,5],['1->2','2->4','4->5'],1);
assert.equal(first.tStar,z1.length-1);
console.log('AM5_RERUN_AM4_UNIT_1_PASS',JSON.stringify({tStar:first.tStar,marks:first.distinctFinalExcursionEdges}));
// 2 prior circuit departure 1->2->7->8 recent enough for zone2 in Theta.
const z2=[0,9,1];for(let k=0;k<4;k++)z2.push(8,9,1);
z2.push(2,7,8,9,1);
for(let k=0;k<2;k++)z2.push(8,9,1);
const second=expectEdges([...z2,2,4,5],['2->4','4->5'],2);
assert.equal(second.tStar,z2.length);
console.log('AM5_RERUN_AM4_UNIT_2_PASS',JSON.stringify({tStar:second.tStar,marks:second.distinctFinalExcursionEdges}));
// 3 purely constructed repeated-edge credit (can traverse more than once), once.
{
 const z=applyAM4DistinctMarks(['1->2','2->4','1->2','2->4','4->5']);
 assert.equal(z.V['1->2'],-1/8);
 assert.equal(z.V['2->4'],-1/8);
 assert.equal(z.V['4->5'],-1/8);
 console.log('AM5_RERUN_AM4_UNIT_3_PASS');
}
// 4 both V and T agree for each of the two corrected traces, on all gates.
for(const t of [[...z1,2,4,5],[...z2,2,4,5]]){
 const r=am5TerminalMarks(t);
 for(const [e,v] of Object.entries(r.V))
  assert.equal(r.T['gate-'+e.replace('->','-')],v);
}
console.log('AM5_RERUN_AM4_UNIT_4_PASS');
// 5 emulate one death's personal V copied into a fresh successor and compare
// exact static uncued selection at zone1; no experimental individuals run.
{
 const parent=am5TerminalMarks([...z1,2,4,5]);
 const newBirth=beginLSGeneration(1,2,newStoneLineagePlace());
 const rt=new AmeliaNumogramSubstrateRuntime();
 const gates=rt.getQabbala().getGates(),zones=rt.getQabbala().getZones();
 const equalBias=Array(10).fill(0);
 const base=d1ChooseExit(1,gates,zones,equalBias,null,{});
 const successor=d1ChooseExit(1,gates,zones,equalBias,null,parent.V);
 assert.equal(parent.V['1->8'],0);
 assert.equal(newBirth.personalV['1->8'],0);
 assert.equal(base,successor);
 assert.equal(newBirth.runtime.getMemory().getEvents().length,0);
 console.log('AM5_RERUN_AM4_UNIT_5_PASS',JSON.stringify({zone1BaseExit:base,successorExit:successor}));
}
console.log('AM5_CORRECTED_AM4_ALL_FIVE_PASS_NO_LINEAGE_DATA');
