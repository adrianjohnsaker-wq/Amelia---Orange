/**
 * PF4 v2 G3+ independent positive control.
 * Frozen PF2 receiver, rather than Studio bootstrap runner.
 * Reads only archived synthetic "LOOP|lineage|tick" source and archived Vstar.
 * Does not access Quicknet, future beacon, or change any signed science.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {PF2ReceiverLineage,PF2_EDGES,PF2_ARMS} from '../pf2/PF2_RECEIVER_CORE.mjs';
const EDGES=PF2_EDGES,ACTIVE=EDGES.filter(e=>e!=='3>6');
const raw=readFileSync('experiments/studio/outputs/loop/Vstar.json');
const sha=b=>createHash('sha256').update(b).digest('hex');
assert.equal(sha(raw),'de0d86764a300abe5187b06a379be1beefed859942784d12cd6a672f81702925');
const code=JSON.parse(raw.toString('utf8'));
const TICKS=20160;
const expected={
  vstar:{R_mean:3.1609607795199834e-6,R_all:0.0002844864701567985,deaths:0,zone4:434},
  vstar_shift1:{R_mean:0.014442524171301629,R_all:0.1448428348979172,deaths:3,zone4:389}
};
const report={schema:'PF4_G3E_INDEPENDENT_POSITIVE_CONTROL_V1',source:'LOOP|k|tick',ticks:TICKS,
  futureSourceSeen:false,livePF2Mutated:false,codeSha256:sha(raw),arms:{}};
for(const kind of Object.keys(expected)){
  const lineages=[];
  let deaths=0,visits=0;
  for(let k=0;k<9;k++){
    const init=code[kind==='vstar'?k:(k+1)%9];
    const lineage=new PF2ReceiverLineage({armId:PF2_ARMS[k],k,mode:'learner'});
    lineage.V={...init};
    const trace=createHash('sha256');
    let dd=0,z4=0;
    for(let t=1;t<=TICKS;t++){
      const evt=lineage.process('LOOP|'+k+'|'+t,t,t);
      trace.update(t+':'+evt.toZone+';');
      dd+=Number(!!evt.death);
      z4+=Number(evt.fromZone===4);
    }
    let d=[];for(const e of EDGES)d.push(Math.abs(lineage.V[e]-init[e]));
    const mean=ACTIVE.reduce((v,e)=>v+Math.abs(lineage.V[e]-init[e]),0)/10;
    lineages.push({k,traceSha256:trace.digest('hex'),R_all:Math.max(...d),
      R_mean:mean,deaths:dd,zone4Visits:z4,finalCodeSha256:sha(JSON.stringify(lineage.V))});
    deaths+=dd;visits+=z4;
  }
  // Lineage-major then canonical edge-major order exactly matches reference Python.
  const diffs=[],active=[];
  for(let k=0;k<9;k++){
    const s=code[kind==='vstar'?k:(k+1)%9], l=lineages[k];
    // recompute from lineage metrics without lossy aggregation:
    // each lineage R_mean is its active 10-edge mean.
    active.push(l.R_mean);
    diffs.push(l.R_all);
  }
  const result={R_mean:active.reduce((a,b)=>a+b,0)/9,R_all:Math.max(...diffs),
    deaths,zone4Visits:visits,lineages};
  const want=expected[kind];
  // Floating-sum order differs by < machine epsilon due to grouping;
  // no numerical tolerance is applied to death or route counts.
  assert(Math.abs(result.R_mean-want.R_mean)<5e-15,kind+' Rmean');
  assert(Math.abs(result.R_all-want.R_all)<1e-14,kind+' Rall');
  assert.equal(result.deaths,want.deaths,kind+' deaths');
  assert.equal(result.zone4Visits,want.zone4,kind+' zone4');
  report.arms[kind]=result;
}
const A=report.arms.vstar_shift1.R_mean-report.arms.vstar.R_mean;
report.pairedAdvantage=A;
const out=resolve(process.argv[2]||'/tmp/pf4-v2-pos');
assert(out.startsWith('/tmp/')||out.startsWith('/mnt/data/'));
mkdirSync(out,{recursive:true});
writeFileSync(join(out,'PF4_V2_INDEPENDENT_POSITIVE_CONTROL.json'),JSON.stringify(report,null,2)+'\n');
console.log('PF4_V2_G3E_INDEPENDENT_POSITIVE_CONTROL_PASS',JSON.stringify({
  Vstar:{R_mean:report.arms.vstar.R_mean,R_all:report.arms.vstar.R_all,
    deaths:report.arms.vstar.deaths,zone4Visits:report.arms.vstar.zone4Visits},
  shifted:{R_mean:report.arms.vstar_shift1.R_mean,R_all:report.arms.vstar_shift1.R_all,
    deaths:report.arms.vstar_shift1.deaths,zone4Visits:report.arms.vstar_shift1.zone4Visits},
  advantage:A
}));
