import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {OracleAdapter} from '../oracle-rerun/adapter.mjs';
import {prepare,permuteHouse,houseBonus} from './prepare.mjs';
const [input,output]=process.argv.slice(2),raw=readFileSync(input),data=JSON.parse(raw).amelias;
const H=x=>createHash('sha256').update(x).digest('hex'),rows=[];
for(const [id,source] of Object.entries(data)){
 const p=prepare(source),r=new OracleAdapter(p.native),trace=[];
 for(let t=0;t<32;t++){
  const pre=r.fullState(),alt=permuteHouse(pre),cue=t%2?6:3,n=new OracleAdapter(pre).step(cue),x=new OracleAdapter(alt.state).step(cue),actual=r.step(cue);
  assert.equal(n.to,actual.to);trace.push({t,cue,from:n.from,native:n.to,permuted:x.to,pivotal:n.to!==x.to,
   nativeGap:alt.nativeGap,permutedGap:alt.permutedGap});
 }
 rows.push({id,entry:p.entry,burn:p.burn,house:p.house,promptWarp:p.promptWarp,promptControl:p.promptControl,trace});
}
const result={schema:'amelia.house-prompt-calibration/v1',snapshotSha256:H(raw),rows,
 note:'Synthetic and reversible reassignment of saved House edge triplets; fixed prompt tapes are generated from no-cue shadow trajectories.'};
writeFileSync(output,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(rows.map(x=>({id:x.id,gateGapChange:x.house.permutedGap-x.house.nativeGap,pivotal:x.trace.filter(z=>z.pivotal).length,
 warpTape:x.promptWarp.pairs,controlTape:x.promptControl.pairs}))));
