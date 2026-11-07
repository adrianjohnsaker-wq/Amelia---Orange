/** Check the allocation-only step shim against the unchanged adapter. */
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {OracleAdapter} from '../oracle-rerun/adapter.mjs';
import {prepare} from '../dynamic/prepare.mjs';
import {makeRoute,installQuota} from './quota.mjs';
const [path,out]=process.argv.slice(2);assert.ok(out);const source=JSON.parse(readFileSync(path,'utf8')).amelias,rows:any[]=[];
const normalize=(s:any)=>{const x=structuredClone(s);for(const q of x.runtime.snapshots??[])q.timestamp=0;return x;};
for(let i=17;i<=24;i++)for(const route of ['warp','matched']){
 const id=`S05W${i}|0`,pre=prepare(source[id]).native,initial=makeRoute(pre,route).fullState(),a=new OracleAdapter(initial),b=new OracleAdapter(initial),ac=installQuota(a,route,true),bc=installQuota(b,route,false);
 for(const bit of [0,1,1,0,1]){const x=ac.block(bit),y=bc.block(bit);assert.deepEqual(x,y);assert.deepEqual(normalize(a.fullState()),normalize(b.fullState()));}
 rows.push({lineage:id,route,blocks:5,transitions:135,status:'MATCH'});console.log(JSON.stringify(rows.at(-1)));
}
writeFileSync(out,JSON.stringify({schema:'amelia.warp-access-fast-equivalence/v1',status:'VERIFIED',normalization:'runtime.snapshots wall-clock timestamp only',rows},null,2)+'\n');
