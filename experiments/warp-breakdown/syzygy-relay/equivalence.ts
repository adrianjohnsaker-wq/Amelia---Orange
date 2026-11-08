/** Check zero-relay trajectories against the original full-graph implementation. */
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {prepare} from '../dynamic/prepare.mjs';
import {initialize,decision as oldDecision,reward} from '../fullgraph/controller.mjs';
import {decision as newDecision} from './controller.mjs';
const [checkpoint,out]=process.argv.slice(2),states=JSON.parse(readFileSync(checkpoint,'utf8')).amelias,rows:any[]=[];
const norm=(s:any)=>{let z=structuredClone(s);for(const q of z.runtime.snapshots??[])q.timestamp=0;return z;};
for(let i=17;i<=24;i++)for(const route of ['warp','native27','matched27']){
 const id=`S05W${i}|0`,pre=prepare(states[id]).native,a=initialize(pre,route),b=initialize(pre,route);
 for(let t=0;t<8;t++){
  const x=oldDecision(a),y=newDecision(b,route,'natural',.5);assert.equal(x.action,y.action);assert.deepEqual(x.selected,y.selected);assert.deepEqual(x.path,y.path.map(({from,to,rank,options,postZone,died}:any)=>({from,to,rank,options,postZone,died})));
  const outcome=(t+i)%3;assert.deepEqual(reward(a,x,outcome),reward(b,y,outcome));assert.deepEqual(norm(a.fullState()),norm(b.fullState()));
 }
 rows.push({id,route,decisions:8,transitions:32,status:'MATCH'});
}
writeFileSync(out,JSON.stringify({schema:'amelia.syzygy-relay-equivalence/v1',status:'VERIFIED',rows,normalization:'runtime snapshot wall-clock timestamps only'},null,2)+'\n');console.log(JSON.stringify({status:'VERIFIED',checks:rows.length,transitionsPerImplementation:rows.length*32}));
