/** Post-hoc: reconstruct same-prestate feedback sensitivity for every held-out step. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {OracleAdapter} from '../oracle-rerun/adapter.mjs';
import {prepare} from './prepare.mjs';
const [statePath,planPath,resultPath,out]=process.argv.slice(2),raw=readFileSync(statePath),pb=readFileSync(planPath),rb=readFileSync(resultPath);
const H=x=>createHash('sha256').update(x).digest('hex'),plan=JSON.parse(pb),d=JSON.parse(rb),saved=JSON.parse(raw).amelias;
assert.equal(H(raw),plan.checkpointSha256);assert.equal(H(pb),d.planSha256);assert.equal(d.status,'COMPLETE');
const p=prepare(saved[d.lineage]),counts={};
for(const row of d.rows){
 if(row.partition!=='test')continue;
 const proposal=row.route==='warp'?3:2,diagnostic=row.route==='warp'?6:7,key=`${row.gain}:${row.route}`;
 const c=counts[key]??={histories:0,steps:0,cueAlternativesDiffer:0,actualCuePivotal:0,proposalZoneSteps:0,proposalZoneAlternativesDiffer:0};c.histories++;
 const x=new OracleAdapter({...p.native,cueWeight:row.gain}),r=row.route==='warp'?x:x.makeControl(),base=r.fullState();
 for(let i=0;i<row.feedback.length;i++){
  const pre=r.fullState(),yes=new OracleAdapter(pre).step(proposal),no=new OracleAdapter(pre).step(diagnostic),neutral=new OracleAdapter(pre).step(null);
  const q=r.step(row.feedback[i]?proposal:diagnostic);assert.deepEqual([q.from,q.to],row.path[i]);assert.equal(q.to,row.feedback[i]?yes.to:no.to);
  c.steps++;c.cueAlternativesDiffer+=Number(yes.to!==no.to);c.actualCuePivotal+=Number(q.to!==neutral.to);
  if(q.from===proposal){c.proposalZoneSteps++;c.proposalZoneAlternativesDiffer+=Number(yes.to!==no.to);}
 }
 const end=r.fullState(),edges=[`${proposal}>${proposal}`,`${proposal}>${diagnostic}`,`${diagnostic}>${proposal}`],arr=[];
 for(const f of ['V','S','D'])for(const e of edges)arr.push((end.L[f][e]??0)-(base.L[f][e]??0));
 for(let i=0;i<arr.length;i++)assert.ok(Math.abs(arr[i]-row.features.house[i])<1e-11);
}
const result={schema:'amelia.warp-mechanism-posthoc-gate-sensitivity/v1',lineage:d.lineage,planSha256:H(pb),resultSha256:H(rb),counts,
 note:'Exploratory follow-up: for each original pre-step state, compare both coded targets and no cue, then replay the actually delivered target. Not a preregistered endpoint.'};
writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({lineage:d.lineage,counts}));
