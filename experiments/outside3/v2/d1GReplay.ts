/** Synthetic D1 post-selection engineering replay against frozen degree-matched G. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {canonicalState,rewire,newRuntime,digest} from '../reader';
import {rng,cast,enter,observe,reference,standardizedRank,displacement,type D1Mode} from './d1Core';
const root='experiments/outside3/v2/d1-output';
const selection=JSON.parse(readFileSync(root+'/D1_DESIGN_RESULT.json','utf8'));
assert.equal(selection.schema,'OUTSIDE3_V2_D1_DESIGN_SELECTION_V1');
const old=JSON.parse(readFileSync('experiments/outside3/design-output/constants.frozen.json','utf8'));
assert.equal(old.schema,'OUTSIDE3_DESIGN_FROZEN_V1');
assert.equal(old.constants.rewireSeed,2609);
const selected=selection.selected as {mode:D1Mode;window:number;id:string}|null;
const hash=(v:unknown)=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
if(!selected){
 const result={schema:'OUTSIDE3_D1_FROZEN_G_ENGINEERING_V1',status:'NOT_RUN_NO_ELIGIBLE_D1_CANDIDATE',
  noRealTarget:true,registrationClosed:true};
 writeFileSync(root+'/D1_G_ENGINEERING.json',JSON.stringify(result,null,2)+'\n');
 writeFileSync(root+'/D1_G_ENGINEERING.md','# D1 frozen-G engineering check\n\nNo eligible D1 candidate: G replay not applicable. Registration closed.\n');
 console.log('D1_G_SKIPPED_NO_ELIGIBLE');
}else{
 assert(selected.window>=1);
 const base=newRuntime().getQabbala().getGates();
 const graph=rewire(base,old.constants.rewireSeed);
 const degrees=(edges:typeof base)=>Array.from({length:10},(_,z)=>[
  edges.filter(e=>e.source===z).length,edges.filter(e=>e.target===z).length]);
 assert.deepEqual(degrees(graph.edges),degrees(base));
 assert.notDeepEqual(graph.edges.map(e=>[e.source,e.target]),base.map(e=>[e.source,e.target]));
 const norm=reference(selected.window)[selected.mode];
 assert(norm.sigma.every(x=>x>0&&Number.isFinite(x)));
 function replay(){
  const C=newRuntime(),G=newRuntime();
  G.getQabbala().setGates(graph.edges);
  const random=rng(9604001);
  const rows:any[]=[];
  for(let w=1;w<=88;w++){
   const input=cast(random);
   enter(C,input,selected.window);enter(G,input,selected.window);
   const cr=standardizedRank(observe(C,selected.mode),norm);
   const gr=standardizedRank(observe(G,selected.mode),norm);
   rows.push({working:w,cast:input,C:cr,G:gr,rankDisplacement:displacement(cr,gr)});
  }
  return {traceDigest:hash(rows),
   stateC:digest(canonicalState(C)),stateG:digest(canonicalState(G)),
   memoryC:C.getMemory().exportHistoryDigest(),memoryG:G.getMemory().exportHistoryDigest(),
   rankChangedWorkings:rows.filter(x=>x.rankDisplacement>0).length,
   meanRankDisplacement:rows.reduce((s,x)=>s+x.rankDisplacement,0)/88,
   rows};
 }
 const a=replay(),b=replay();
 assert.equal(a.traceDigest,b.traceDigest,'G_REPLAY_TRACE_DIVERGENCE');
 assert.equal(a.stateC,b.stateC,'CANONICAL_REPLAY_STATE_DIVERGENCE');
 assert.equal(a.stateG,b.stateG,'G_REPLAY_STATE_DIVERGENCE');
 assert.equal(a.memoryC,b.memoryC);assert.equal(a.memoryG,b.memoryG);
 const result={
  schema:'OUTSIDE3_D1_FROZEN_G_ENGINEERING_V1',
  status:'PASS_DETERMINISTIC_G_REPLAY',selected,seed:9604001,
  rewireSeed:old.constants.rewireSeed,swaps:graph.swaps,
  baseGraphDigest:digest(base),rewiredGraphDigest:graph.digest,
  baseEdges:base,rewiredEdges:graph.edges,degreePreserved:true,
  replayTraceDigest:a.traceDigest,
  canonicalStateDigest:a.stateC,gStateDigest:a.stateG,
  canonicalPFMDigest:a.memoryC,gPFMDigest:a.memoryG,
  meanRankDisplacement:a.meanRankDisplacement,
  rankChangedWorkings:a.rankChangedWorkings,
  noRealTarget:true,registrationClosed:true,calibration:false,rows:a.rows
 };
 writeFileSync(root+'/D1_G_ENGINEERING.json',JSON.stringify(result,null,2)+'\n');
 writeFileSync(root+'/D1_G_ENGINEERING.md',[
 '# D1 frozen-G engineering replay','',
 '**Synthetic, not calibration. No real target.**','',
 'Candidate '+selected.id+'; '+selected.window+' steps; '+selected.mode+'.',
 'Frozen rewiring seed '+old.constants.rewireSeed+'; swaps '+graph.swaps+'.',
 'Graph digest '+graph.digest+'.',
 'Degree preserved: PASS. Two 88-working replay tapes: PASS.',
 'Replay trace '+a.traceDigest+'.',
 'Canonical state '+a.stateC+'.',
 'G state '+a.stateG+'.',
 'Mean rank displacement between C and G '+a.meanRankDisplacement+'.',
 'Workings with different C/G ranks '+a.rankChangedWorkings+'/88.',
 'D1 only nominates a design candidate. Registration remains closed.',''
 ].join('\n'));
 console.log('D1_G_ENGINEERING_COMPLETE',JSON.stringify({candidate:selected.id,rewireDigest:graph.digest,changed:a.rankChangedWorkings,deterministic:true}));
}
