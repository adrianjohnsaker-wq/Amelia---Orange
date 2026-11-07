/** Deterministic replay of learner, gate paths and relay readouts; no model calls. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {OracleAdapter} from '../oracle-rerun/adapter.mjs';
import {prepare} from './prepare.mjs';
import {houseContrast,formatContrast,maskedContrast} from './relay.mjs';
const [statePath,planPath,resultPath,out]=process.argv.slice(2),raw=readFileSync(statePath),pb=readFileSync(planPath),rb=readFileSync(resultPath);
const H=x=>createHash('sha256').update(x).digest('hex'),plan=JSON.parse(pb),d=JSON.parse(rb),states=JSON.parse(raw).amelias;
assert.equal(H(raw),plan.checkpointSha256);assert.equal(H(pb),d.planSha256);assert.equal(d.status,'COMPLETE');
const h=plan.histories.find(x=>x.id===d.history);assert.ok(h&&h.lineage===d.lineage);const p=prepare(states[h.lineage]);
assert.deepEqual(d.preflight.promptTape.pairs,p.promptWarp.pairs);assert.equal(d.runs.length,12);
let gates=0,relays=0;
function close(a,b){assert.ok(Math.abs(a-b)<=1e-11,`${a} != ${b}`)}
function compare(a,b){
 for(const k of ['selfEdge','diagnosticEdge','donorEdge'])assert.equal(a[k],b[k]);
 for(const k of ['self','diagnostic','donor'])for(let i=0;i<3;i++)close(a[k][i],b[k][i]);
 close(a.live,b.live);close(a.misaligned,b.misaligned);
}
for(const a of d.runs){
 const base=new OracleAdapter(a.house==='native'?p.native:p.permuted),r=a.route==='warp'?base:base.makeControl();
 const proposal=a.route==='warp'?3:2,diagnostic=a.route==='warp'?6:7;
 for(const g of a.gates){
  const pre=r.fullState(),info=houseContrast(pre,proposal,diagnostic);compare(info,g.houseReadout);
  const q=r.step(g.cue);assert.equal(q.from,g.from);assert.equal(q.to,g.to);assert.equal(q.snapshot.step,g.step);gates++;
 }
 assert.equal(r.fullState().runtime.currentZone,a.finalZone);assert.equal(r.fullState().runtime.governorState.hardLimitViolations,a.hardLimitViolations);
 for(const x of a.rounds){
  const g=a.gates.find(g=>g.round===x.round&&g.phase==='search'&&g.from===proposal&&g.to===diagnostic);
  assert.ok(g);compare(x.houseReadout,g.houseReadout);assert.ok(Math.abs(x.houseReadout.live-x.houseReadout.misaligned)>=plan.minHouseSeparation);
  const expected=a.relay==='live'?formatContrast(g.houseReadout.live):a.relay==='misaligned'?formatContrast(g.houseReadout.misaligned):maskedContrast;
  assert.equal(x.displayedHouse,expected);assert.deepEqual(x.displayedMemory,p.promptWarp.pairs[x.round-1]);relays++;
 }
}
const output={schema:'amelia.oracle-house-relay-runtime-audit/v1',status:'VERIFIED',history:d.history,lineage:d.lineage,
 resultSha256:H(rb),planSha256:H(pb),auditSha256:H(readFileSync(process.argv[1])),gatesReplayed:gates,relaysChecked:relays};
writeFileSync(out,JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify(output));
