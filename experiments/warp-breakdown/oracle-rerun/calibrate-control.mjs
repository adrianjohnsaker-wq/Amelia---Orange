/** Verify the 2/7 control adapter and probe input sensitivity on all lineages. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {OracleAdapter} from './adapter.mjs';
const [input,output]=process.argv.slice(2),raw=readFileSync(input),data=JSON.parse(raw).amelias;
const H=x=>createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex'),rows=[];
for(const [id,source] of Object.entries(data)){
 const a=new OracleAdapter({...source,cueWeight:0.054});if(a.fullState().runtime.currentZone===6)a.step(null);
 const original=a.fullState(),b=a.makeControl(),adapted=b.fullState();assert.equal(original.runtime.currentZone,3);assert.equal(adapted.runtime.currentZone,2);
 for(const [dst,src] of [['2>2','3>3'],['2>7','3>6'],['7>2','6>3']])for(const f of ['V','S','D'])assert.equal(adapted.L[f][dst],original.L[f][src]??0);
 const edges=[[2,2,3,3],[2,7,3,6],[7,2,6,3]];
 for(const [x,y,u,v] of edges){const g=adapted.runtime.qabbalaGates.find(g=>g.source===x&&g.target===y),h=original.runtime.qabbalaGates.find(g=>g.source===u&&g.target===v);for(const k of ['flux','permeability','resistance','isOpen'])assert.equal(g[k],h[k]);}
 const strip=x=>{let s=structuredClone(x);delete s.runtime.qabbalaGates;delete s.runtime.currentZone;delete s.z;delete s.extraEdges;
  for(const f of ['V','S','D'])for(const e of ['2>2','2>7','7>2'])delete s.L[f][e];return H(s);};
 assert.equal(strip(original),strip(adapted),'Control changed an unregistered state component');
 const sequence=[];for(let t=0;t<32;t++){
  const pre=b.fullState(),u=new OracleAdapter(pre).step(null),x=new OracleAdapter(pre).step(2),y=new OracleAdapter(pre).step(7);
  const applied=t%2?7:2,actual=b.step(applied);assert.equal(actual.to,applied===2?x.to:y.to);
  sequence.push({t,from:u.from,without:u.to,target2:x.to,target7:y.to,target2Pivotal:x.to!==u.to,target7Pivotal:y.to!==u.to,applied,actual:actual.to});
 }
 rows.push({id,originalGates:original.runtime.qabbalaGates.length,controlGates:adapted.runtime.qabbalaGates.length,
  otherStateSha256:strip(original),sequence});
}
const result={schema:'amelia.oracle-control-calibration/v1',snapshotSha256:H(raw.toString()),cueWeight:0.054,lineages:rows};writeFileSync(output,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(rows.map(r=>({id:r.id,gateCount:r.controlGates,target2:r.sequence.filter(x=>x.target2Pivotal).length,target7:r.sequence.filter(x=>x.target7Pivotal).length}))));
