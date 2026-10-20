import test from 'node:test';
import assert from 'node:assert/strict';
import {
 loadMatrix,findCandidates,syntheticGraph,constructedTape,constructedFork,
 pairKey,probe,PILOT,recurrenceTape,recurringFork,distance
} from './core.mjs';
const names=loadMatrix();
const G=syntheticGraph();
test('CCRU matrix covers exactly the 45 unordered Numogram zone pairs',()=>{
 assert.equal(Object.keys(names).length,45);
 assert.equal(names['0-1'].name,'Lurgo');
 assert.equal(names['8-9'].name,'Ummnu');
 for(let i=0;i<10;i++)for(let j=i+1;j<10;j++){
  const entry=names[pairKey(i,j)];
  assert(entry);assert.equal(entry.zones[0],i);assert.equal(entry.zones[1],j);
 }
});
test('directed graph distances are finite for full positive challenge graph',()=>{
 for(let z=0;z<10;z++)for(let a=0;a<10;a++)assert(Number.isFinite(distance(G,z,a)));
});
test('constructed five goal pairs are detected and named with 100% accuracy',()=>{
 for(const [a,b] of [[0,2],[1,3],[2,4],[3,5],[4,6]]){
  const tape=constructedTape(G,a,b,6),scan=findCandidates(tape,G,120,3);
  const c=scan.candidates.find(x=>x.key===pairKey(a,b));
  assert(c,'missed constructed recurrence for '+a+'-'+b);
  const result=probe(c,G,constructedFork);
  assert(result.shamParity,'sham diverged from intact for '+a+'-'+b);
  assert(result.encounter,'positive control failed for '+a+'-'+b);
  assert(result.forks<=PILOT.forksPerCandidate);
  assert(result.intactRecoveries>=3);
  assert(result.distinctRoutes>=2);
  assert(names[c.key]);
 }
});
test('infeasible challenges never count as failed recoveries',()=>{
 const c={a:0,b:4,key:'0-4',path:[0,1,4,0],mostRecent:{path:[0,1,4,0]}};
 const isolated=[{source:0,target:1},{source:1,target:4},{source:4,target:0}];
 const result=probe(c,isolated,constructedFork);
 assert(result.notApplicable>0);
 assert(result.forks<=24);
});
test('pure recurrence with no PFM/Governor cannot qualify as an encounter',()=>{
 const real=[
  [0,9],[1,8],[2,7],[3,6],[4,5],[1,2],[2,4],[4,7],[7,8],[8,9],[9,1]
 ].map(([source,target])=>({source,target}));
 const scan=findCandidates(recurrenceTape(real,1500,1),real);
 assert(scan.candidates.length>0);
 for(const c of scan.candidates){
  const x=probe(c,real,(a,b,p)=>recurringFork(a,b,p));
  assert.equal(x.encounter,false);
  assert.equal(x.shamParity,true);
 }
});
