/** Exploratory order-information probe under matched, 1/27 dwell geometry. */
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {OracleAdapter} from '../oracle-rerun/adapter.mjs';
import {prepare} from '../dynamic/prepare.mjs';
import {randi,sha} from '../dynamic/common.ts';
import {makeRoute,installQuota,features} from './quota.mjs';
const [path,out,seed,nStr]=process.argv.slice(2);assert.ok(nStr);const n=Number(nStr),source=JSON.parse(readFileSync(path,'utf8')).amelias,records:any[]=[];
for(let index=17;index<=24;index++){
 const id=`S05W${index}|0`,prepared=prepare(source[id]).native,rows:any[]=[];
 for(let k=0;k<n;k++){
  const prefix=Array.from({length:1+randi(`${seed}:${id}:${k}:len`,4)},(_,j)=>randi(`${seed}:${id}:${k}:bit:${j}`,2)),routes:any={};
  for(const route of ['warp','matched']){
   const r=makeRoute(prepared,route),ctl=installQuota(r,route);for(const bit of prefix)ctl.block(bit);const pre=r.fullState(),h=structuredClone(pre.L),base=r.r.getMemory().readMemoryBias(),outcomes:any={};
   for(const [name,bits] of [['AB',[0,1]],['BA',[1,0]]] as const){
    const z=new OracleAdapter(pre),c=installQuota(z,route),paths=[];for(const b of bits)paths.push(c.block(b).path);
    outcomes[name]={features:features(z,route,h,base),paths};
   }
   routes[route]=outcomes;
  }
  for(const order of ['AB','BA']){
   const w=routes.warp[order],c=routes.matched[order];
   for(let j=0;j<2;j++)assert.deepEqual(w.paths[j].map(([a,b]:number[])=>[a===3?0:1,b===3?0:1]),c.paths[j].map(([a,b]:number[])=>[a===2?0:1,b===2?0:1]));
  }
  rows.push({index:k,prefix,partition:k<n/2?'train':'test',routes});
 }
 records.push({lineage:id,rows});console.log(JSON.stringify({lineage:id,status:'COMPLETE'}));
}
writeFileSync(out,JSON.stringify({schema:'amelia.warp-access-probe/v1',status:'EXPLORATORY',seedHash:sha(seed),records})+'\n');
