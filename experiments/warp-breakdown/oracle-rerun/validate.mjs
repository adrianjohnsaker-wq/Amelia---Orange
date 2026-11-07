import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {OracleAdapter} from './adapter.mjs';
const [beforePath,afterPath,exchangePath,output]=process.argv.slice(2);
const H=x=>createHash('sha256').update(x).digest('hex');
const beforeBytes=readFileSync(beforePath),afterBytes=readFileSync(afterPath),traceBytes=readFileSync(exchangePath);
const before=JSON.parse(beforeBytes).amelias,after=JSON.parse(afterBytes).amelias,events=JSON.parse(traceBytes);
const instances=Object.fromEntries(Object.entries(before).map(([id,s])=>[id,new OracleAdapter(s)]));
let checked=0;const checks={};
for(const row of events){
 const a=instances[row.amelia];assert.ok(a);assert.equal(a.z.at(-1),row.query.zone);assert.equal(a.exchanges+1,row.n);
 assert.equal(a.cursor+row.query.zone,row.data[0].i);
 const observed=[];for(let i=0;i<3;i++){observed.push(a.step(row.reply.zone).to);checked++;}
 assert.deepEqual(observed,row.path);a.cursor+=row.query.zone+row.data.length;a.exchanges++;
 assert.equal(a.deaths,row.deaths);checks[row.amelia]=(checks[row.amelia]??0)+1;
}
const differences=[];let maxAbsDifference=0,comparedNumbers=0;
function compare(a,b,path){
 if(typeof a==='number'&&typeof b==='number'){
  if(path.includes('.snapshots[')&&path.endsWith('.timestamp')&&a>1e11&&b>1e11)return;
  if(path.includes('.snapshots[')&&path.endsWith('.governor.timestamp')&&a>1e11&&b>1e11)return;
  const delta=Math.abs(a-b);comparedNumbers++;if(delta>maxAbsDifference)maxAbsDifference=delta;
  if(delta>1e-12*Math.max(1,Math.abs(a),Math.abs(b)))differences.push({path,a,b,delta});return;
 }
 if(Array.isArray(a)&&Array.isArray(b)){if(a.length!==b.length){differences.push({path,lengths:[a.length,b.length]});return}for(let i=0;i<a.length;i++)compare(a[i],b[i],`${path}[${i}]`);return;}
 if(a&&b&&typeof a==='object'&&typeof b==='object'){
  const ak=Object.keys(a).sort(),bk=Object.keys(b).sort();if(JSON.stringify(ak)!==JSON.stringify(bk)){differences.push({path,keysA:ak,keysB:bk});return}
  for(const k of ak)compare(a[k],b[k],`${path}.${k}`);return;
 }
 if(a!==b)differences.push({path,a,b});
}
for(const id of Object.keys(after))compare(instances[id].officialState(),after[id],id);
const historicalDifferenceCount=differences.length,historicalMaxAbsDifference=maxAbsDifference,historicalComparedNumbers=comparedNumbers;
assert.equal(historicalDifferenceCount,0,'Historical final-state mismatch');
const replay=[];
for(const [id,start] of Object.entries(before)){
 let live=new OracleAdapter(start),full=new OracleAdapter(start),official=new OracleAdapter(start),direct=[],resumedFull=[],resumedOfficial=[];
 for(let t=0;t<48;t++){
  const cue=[3,6,6,3][t%4];direct.push(live.step(cue).to);resumedFull.push(full.step(cue).to);resumedOfficial.push(official.step(cue).to);
  if(t===23){full=new OracleAdapter(full.fullState());official=new OracleAdapter(official.officialState());}
 }
 assert.deepEqual(resumedFull,direct);assert.deepEqual(resumedOfficial,direct);
 let startAt=differences.length;compare(full.officialState(),live.officialState(),`fullResume.${id}`);
 assert.equal(differences.length,startAt,'Full-state save/restore mismatch');
 startAt=differences.length;compare(official.officialState(),live.officialState(),`officialResume.${id}`);
 const telemetry=differences.splice(startAt);
 assert.deepEqual(telemetry.map(x=>x.path.replace(`officialResume.${id}.`,'')),
  ['runtime.snapshots[0].memoryHistoryLength','runtime.traitEvolutionHistory[0].step']);
 replay.push({id,steps:48,splitAfter:24,fullResumePathAndSavedStateMatched:true,officialResumePathAndOtherSavedFieldsMatched:true,
  officialTelemetryDifferences:telemetry});
}
const result={schema:'amelia.oracle-adapter-validation/v1',beforeSha256:H(beforeBytes),afterSha256:H(afterBytes),
 exchangesSha256:H(traceBytes),exchanges:events.length,transitions:checked,perLineage:checks,
 historicalComparedNumbers,historicalMaxAbsDifference,historicalDifferenceCount,saveRestore:replay,
 ignored:'epoch timestamp fields within saved snapshots; official restart additionally changes the two specified telemetry counters'};
writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
if(historicalDifferenceCount)process.exitCode=1;
