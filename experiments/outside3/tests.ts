import assert from 'node:assert/strict';
import { encode,ranks,rawRanks,newRuntime,rewire,Outside3Reader,randomCast,rng,digest,type Cast,type Constants } from './reader';

function expect(name:string,fn:()=>void) { fn();console.log('PASS '+name); }
const sample:Cast=[6,7,8,9,7,8];
expect('bottom-to-top bit order and changing lines',()=>{
 const x=encode(sample);
 assert.equal(x.primary,2+8+16);
 assert.equal(x.movingMask,1+8);
 assert.equal(x.resulting,(2+8+16)^(1+8));
});
expect('all 64 rank outputs are integer doubled mid-ranks',()=>{
 const one=ranks(Array.from({length:64},(_,h)=>h));
 assert.deepEqual(one,[...one].sort((a,b)=>b-a));
 assert.equal(one[63],2);assert.equal(one[0],128);
 assert.deepEqual(ranks(Array(64).fill(0)),Array(64).fill(65));
 assert.equal(rawRanks(0).length,64);
});
expect('three coin frequencies map eight equiprobable outcomes',()=>{
 const f=(j:number)=>randomCast(()=>((j+.5)/8))[0];
 assert.deepEqual(Array.from({length:8},(_,i)=>f(i)),[6,7,7,7,8,8,8,9]);
});
expect('degree sequences preserved on registered rewiring',()=>{
 const base=newRuntime().getQabbala().getGates();
 const r=rewire(base,0x0a31);
 const degrees=(edges:typeof base)=>Array.from({length:10},(_,i)=>[
   edges.filter(g=>g.source===i).length,edges.filter(g=>g.target===i).length
 ]);
 assert.deepEqual(degrees(r.edges),degrees(base));
 assert.notDeepEqual(r.edges.map(x=>x.target),base.map(x=>x.target));
});
const conf:Constants={
 delta:0.12,magnitude:0.045,steps:30,referenceSeed:1337,rewireSeed:0x0a31,
 meanReference:[.1,.2,.3,.4,.5,.6]
};
expect('same 12 casts replay identically including carried state',()=>{
 const a=new Outside3Reader(conf),b=new Outside3Reader(conf);
 const next=rng(2120);
 const casts=Array.from({length:12},()=>randomCast(next));
 const aa=casts.map(c=>a.run(c)),bb=casts.map(c=>b.run(c));
 assert.equal(digest(aa),digest(bb));
 assert.equal(digest(a.export()),digest(b.export()));
 assert.equal(aa[0].rank2.C.length,64);
 for(const x of aa){assert.equal(x.movingEvents.C,x.cast.filter(v=>v===6||v===9).length);
   for(const arm of ['Raw','C','M','G'] as const)
     assert(x.rank2[arm].every(v=>v>=2&&v<=128&&Number.isInteger(v)));}
});
expect('export/import continuity produces identical next working',()=>{
 const first=new Outside3Reader(conf);
 for(let i=0;i<5;i++)first.run(randomCast(rng(909+i)));
 const recovered=new Outside3Reader(conf,first.export());
 const cast:Cast=[6,9,8,7,6,9];
 assert.deepEqual(first.run(cast),recovered.run(cast));
 assert.equal(digest(first.export()),digest(recovered.export()));
});
expect('target-blind API',()=>{
 const code=String(new Outside3Reader(conf).run);
 assert(!/\btargetIndex\b/.test(code));
});
console.log('OUTSIDE3_READER_SMOKE_SUCCESS');
