import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {OracleAdapter} from '../oracle-rerun/adapter.mjs';
import {prepare} from './prepare.mjs';
import {houseContrast,formatContrast,maskedContrast} from './relay.mjs';
const [input,output]=process.argv.slice(2),raw=readFileSync(input),saved=JSON.parse(raw).amelias;
const H=x=>createHash('sha256').update(x).digest('hex'),rows=[];
for(const [id,source] of Object.entries(saved)){
 const p=prepare(source),traces=[];
 for(const route of ['warp','control'])for(const house of ['native','permuted'])for(const target of ['proposal','diagnostic']){
  const x=new OracleAdapter(house==='native'?p.native:p.permuted),r=route==='warp'?x:x.makeControl();
  const proposal=route==='warp'?3:2,diagnostic=route==='warp'?6:7,cue=target==='proposal'?proposal:diagnostic,rounds=[];
  for(let round=1;round<=3;round++){
   let accepted=false;const path=[];
   for(let tick=0;tick<12;tick++){
    const pre=r.fullState(),info=houseContrast(pre,proposal,diagnostic),q=r.step(cue);path.push([q.from,q.to]);
    if(q.from===proposal&&q.to===diagnostic){
     assert.ok(Math.abs(info.live-info.misaligned)>=0.1);assert.notEqual(formatContrast(info.live),formatContrast(info.misaligned));
     assert.equal(formatContrast(info.live).length,maskedContrast.length);rounds.push({round,path,info,live:formatContrast(info.live),misaligned:formatContrast(info.misaligned),masked:maskedContrast});accepted=true;break;
    }
   }
   assert.ok(accepted,`unreached gate ${id} ${route} ${house} ${target} ${round}`);
   const back=r.step(null);assert.deepEqual([back.from,back.to],[diagnostic,proposal]);
  }
  traces.push({route,house,target,rounds});
 }
 rows.push({id,house:p.house,promptTape:p.promptWarp.pairs,traces});
}
const data={schema:'amelia.oracle-house-relay-calibration/v1',snapshotSha256:H(raw),rows,
 note:'Live is the actual learner gate-bonus gap before the diagnostic decision. Misaligned substitutes the donor-edge triplet in the readout only; neither relay modifies House.'};
writeFileSync(output,JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({lineages:rows.length,calibratedCases:rows.length*8*3,minGapSeparation:Math.min(...rows.flatMap(x=>x.traces.flatMap(y=>y.rounds.map(z=>Math.abs(z.info.live-z.info.misaligned)))))}));
