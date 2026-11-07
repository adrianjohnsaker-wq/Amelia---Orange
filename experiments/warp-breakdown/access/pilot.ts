/** Exploratory: verify entry, occupancy lock, and order response, not recovery. */
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {OracleAdapter} from '../oracle-rerun/adapter.mjs';
import {prepare} from '../dynamic/prepare.mjs';
import {makeRoute,installQuota,features} from './quota.mjs';
const [path,out]=process.argv.slice(2);assert.ok(out);const source=JSON.parse(readFileSync(path,'utf8')).amelias,records:any[]=[];
const dist=(x:number[],y:number[])=>Math.sqrt(x.reduce((s,v,i)=>s+(v-y[i])**2,0));
for(let index=17;index<=24;index++){
 const id=`S05W${index}|0`,state=prepare(source[id]).native,entry:any={};
 for(const gain of [0.054,0.35])for(const cue of [null,3]){
  const x=structuredClone(state);x.runtime.currentZone=2;x.z[x.z.length-1]=2;const r=new OracleAdapter({...x,cueWeight:gain});const q=r.step(cue);entry[`${gain}:${cue}`]=[q.from,q.to];
 }
 const byRoute:any={};
 for(const route of ['warp','matched']){
  const initial=makeRoute(state,route).fullState(),vals:any={};
  for(const bits of [[0,0],[0,1],[1,0],[1,1]]){
   const r=new OracleAdapter(initial),house=structuredClone(r.L),pfm=r.r.getMemory().readMemoryBias(),ctl=installQuota(r,route),blocks=[];
   for(const b of bits)blocks.push(ctl.block(b));const f=features(r,route,house,pfm);
   vals[bits.join('')]={feature:f,paths:blocks.map(b=>b.path),maxAbsOffset:blocks.at(-1).maxAbsOffset};
  }
  byRoute[route]={values:vals,orderDistance:{house:dist(vals['01'].feature.house,vals['10'].feature.house),pfm:dist(vals['01'].feature.pfm,vals['10'].feature.pfm),phase:dist(vals['01'].feature.phase,vals['10'].feature.phase)}};
 }
 for(const bits of ['00','01','10','11'])for(let j=0;j<2;j++){
  const w=byRoute.warp.values[bits].paths[j].map(([a,b]:number[])=>[a===3?0:1,b===3?0:1]);
  const c=byRoute.matched.values[bits].paths[j].map(([a,b]:number[])=>[a===2?0:1,b===2?0:1]);assert.deepEqual(w,c);
 }
 records.push({id,entry,byRoute});
}
const A=([x,y]:number[])=>[x^1,y],B=([x,y]:number[])=>[y,x];assert.notDeepEqual(B(A([0,0])),A(B([0,0])));
writeFileSync(out,JSON.stringify({status:'EXPLORATORY_PILOT',operators:{AB:B(A([0,0])),BA:A(B([0,0]))},records},null,2)+'\n');
for(const r of records)console.log(JSON.stringify({id:r.id,entry:r.entry,warp:r.byRoute.warp.orderDistance,matched:r.byRoute.matched.orderDistance}));
