/** PF1 live nine-arm observation and prospective R2 scanner/fork evaluator.
 * NO notification code. This CLI may be called only with a real C1-BLS-verified
 * inbox AFTER a remotely acknowledged PF1-only durable lease.
 * Every step, past scan exposure and fork disposition appears in silent ledger.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {AmeliaNumogramSubstrateRuntime} from '../../src/substrate/ameliaNumogramSubstrateRuntime';
import {pairKey,distance} from './core.mjs';
import {load,evaluate,inputsForTick} from './PF1_A1_R2_SCORER.mjs';
import {pf1InputForArm} from './PF1_REFERENCE_INPUT.mjs';

const ROOT='experiments/pf1/';
const LIVE=ROOT+'live/';
const sha=x=>createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const write=(p,obj)=>writeFileSync(p,JSON.stringify(obj,null,2)+'\n');
assert.equal(process.env.PF1_LIVE_ADMISSION_OPERATOR_AUTHORISED,'true',
  'OPERATOR_LIVE_AUTHORISATION_REQUIRED');
assert.equal(process.env.PF1_REMOTE_LEASE_ACKNOWLEDGED,'true','REMOTE_LEASE_REQUIRED');
assert.notEqual(process.env.DRIFT_C1_ENABLE_LIVE,'true','C1_DISPATCH_PROHIBITED');
const scope=load();
const initialManifest=read(ROOT+'PF1_GENESIS_MANIFEST_DRAFT.json');
const genesis=read(LIVE+'GENESIS.json');
assert.equal(genesis.schema,'PF1_LIVE_GENESIS_V1');
assert.equal(genesis.PF1ReferenceDomain,'PF1-REF-i|');
assert.equal(genesis.genesisDoesNotAdmitRound,true);
assert.equal(genesis.C1GridOffsetRounds,0);
assert.equal(genesis.approvedManifestSHA256,
  sha(readFileSync(ROOT+'PF1_GENESIS_MANIFEST_DRAFT.json')));
assert.equal(genesis.constantsSHA256,'ecabf3e40023faa0be0749908cfe6ffd3a8b9e42ab7c8a9a7c2ea5827ae63610');
for(const p of genesis.liveOperationalSourceHashes??[]){
 assert.equal(sha(readFileSync(p.path)),p.sha256,'RUNNING_CODE_CHANGED_SINCE_SEALED_GENESIS '+p.path);
}
assert.equal(initialManifest.incidentNotification.encounterJournalOnly,true);
assert.deepEqual(initialManifest.incidentNotification.encounterNotificationChannels,[]);

const original=read(LIVE+'STATE.json');
const ledger=read(LIVE+'SILENT_LEDGER.json');
const journal=read(LIVE+'JOURNAL.json');
const inbox=readFileSync(process.env.PF1_LIVE_INBOX!,'utf8');
const verified=JSON.parse(inbox);
assert.equal(original.schema,'PF1_LIVE_RUNTIME_STATUS_V1');
assert.equal(original.status,'running','PF1_OPEN_HALT_NO_AUTO_RESUME');
assert.equal(ledger.schema,'PF1_LIVE_SILENT_LEDGER_V1');
assert.equal(journal.schema,'PF1_LIVE_JOURNAL_V1');
assert.equal(original.admittedTicks,ledger.rows.length);
assert.equal(verified.schema,'PF1_VERIFIED_LIVE_INBOX_V1');
assert.equal(verified.genesisDigest,genesis.genesisDigest);
assert.equal(verified.startingTick,original.admittedTicks);
assert.equal(verified.receipts.length,verified.count);
assert.equal(verified.liveVerified,true);
assert(verified.receipts.every((r:any)=>r.source==='LIVE_DRAND_QUICKNET_REAL_BLS_C1_PINNED'));
const idSet=['C',...Array.from({length:8},(_,i)=>'R'+String(i+1).padStart(2,'0'))];
assert.deepEqual(original.arms.map((x:any)=>x.id),idSet);
const zero=()=>({scannedSteps:0,candidatesDetected:0,eligibleCandidates:0,
 forkInstancesProbed:0,confirmedEncounters:0});
const normals=(rt:any)=>{
 const s=JSON.parse(JSON.stringify(rt.exportState()));
 for(const x of s.snapshots??[])delete x.timestamp;
 return s;
};
const runtime=(state:any)=>{
 const rt=new AmeliaNumogramSubstrateRuntime();
 rt.setSuppressRelaySteering(true);
 rt.importState(state);
 assert.deepEqual(rt.getQabbala().getGates().filter((e:any)=>e.isOpen).map((e:any)=>[e.source,e.target]),
  scope.eligibility.directedEdges);
 return rt;
};
const state=structuredClone(original);
const pendingJournal:any[]=[];
function detect(arm:any,step:number){
 const z=arm.zones.at(-1),old=arm.lastSeenZones[String(z)];
 arm.lastSeenZones[String(z)]=step;
 if(old===undefined||step-old<2)return null;
 const path=arm.zones.slice(old,step+1);
 let b=null,best=-1;
 for(const mid of path.slice(1,-1)){
  if(mid===z)continue;
  const d=distance(scope.graph,mid,z);
  if(Number.isFinite(d)&&d>best){best=d;b=mid;}
 }
 if(b===null)return null;
 const key=pairKey(z,b);
 const recent=arm.excursionsByPair[key]??[];
 recent.push(step);
 arm.excursionsByPair[key]=recent.filter((t:number)=>t>=step-scope.constants.scanner.windowSteps+1);
 const last=arm.lastDetectedByPair[key];
 if(arm.excursionsByPair[key].length<scope.constants.scanner.recurrenceCount ||
   (last!==undefined&&step-last<scope.constants.scanner.windowSteps))return null;
 arm.lastDetectedByPair[key]=step;
 return {a:z,b,key,end:step,start:old,path,
   recurrences:arm.excursionsByPair[key].length,
   mostRecent:{a:z,b,key,start:old,end:step,path}};
}
function scoreReady(armIndex:number,exposure:any,step:number){
 const complete:any[]=[];
 for(const task of state.pendingForks){
  if(task.armIndex!==armIndex||task.confirmationTick>step)continue;
  assert.equal(task.confirmationTick,task.detectionTick+24);
  const future=ledger.rows.slice(task.detectionTick,task.detectionTick+24);
  assert.equal(future.length,24,'NO_UNVERIFIED_FUTURE_ROUNDS');
  for(let j=0;j<24;j++){
   assert.equal(future[j].tick,task.detectionTick+j);
   assert.equal(future[j].round,genesis.R0+20*(task.detectionTick+j));
  }
  const tape=future.map((r:any)=>pf1InputForArm(r.randomness,armIndex));
  const checkpoint=task.checkpoint;
  const runner=(candidate:any,p:any,condition:string)=>{
   const f=runtime(checkpoint);
   if(condition==='reset')f.getMemory().reset();
   if(condition==='suppress')
     f.getQabbala().getZones()[candidate.b].activation*=
       scope.constants.encounter.selectiveSuppressionScale;
   if(p.kind==='displacement'){
     const s:any=f.exportState();
     s.currentZone=p.startZone;
     f.importState(s);
   }
   const zones=[f.getCurrentZone()];
   assert.equal(zones[0],p.startZone);
   for(let tick=1;tick<=24;tick++){
     f.step(inputsForTick(p,tick,tape));
     zones.push(f.getCurrentZone());
   }
   return {zones,digest:sha(zones),stateDigest:sha(normals(f)),
     schedule:p.kind==='inputDelay'?'L2':null};
  };
  const outcome=evaluate(task.candidate,scope,runner);
  assert(outcome.shamParity,'PF1_SHAM_PARITY_FAILURE');
  assert(outcome.forks<=scope.constants.budget.ameliaForksPerCandidateMax);
  exposure.forkInstancesProbed+=outcome.forks;
  if(outcome.encounter){
    exposure.confirmedEncounters+=1;
    const entity=scope.names.get(task.candidate.key);
    pendingJournal.push({schema:'PF1_LIVE_ENCOUNTER_V1',armId:state.arms[armIndex].id,
      entity:entity?.name??'UNNAMED',pair:task.candidate.key,
      detectionTick:task.detectionTick,confirmationTick:step,
      detectedAtRound:genesis.R0+20*(task.detectionTick-1),
      confirmedAtRound:genesis.R0+20*(step-1),
      detectedAtUTC:task.detectedAtUTC,
      confirmedAtUTC:ledger.rows[step-1].observedAtUTC,
      checkpointSha256:sha(task.checkpoint),
      assessment:outcome,
      notificationsSent:0,
      scientificInterpretation:'Operational PF1-A1 R2 encounter pattern only; not evidence of a mind or Outside agency'});
  }
  complete.push(task.id);
 }
 if(complete.length)state.pendingForks=state.pendingForks.filter((x:any)=>!complete.includes(x.id));
}
for(const r of verified.receipts){
 const tick=state.admittedTicks;
 assert.equal(r.tick,tick);
 assert.equal(r.round,genesis.R0+20*tick);
 assert.match(r.randomness,/^[a-f0-9]{64}$/);
 assert.match(r.signature,/^[a-f0-9]{96}$/);
 assert.equal(sha(Buffer.from(r.signature,'hex')),r.randomness,'QUICKNET_SIGNATURE_HASH_MISMATCH');
 const exposure:any={};
 const created:any[]=[];
 for(let i=0;i<9;i++){
   const arm=state.arms[i];
   const rt=runtime(arm.state);
   assert.equal(rt.getMemory().getEvents().length,tick);
   rt.step(pf1InputForArm(r.randomness,i));
   arm.state=normals(rt);
   arm.events=tick+1;
   assert.equal(arm.state.memoryState.events.length,tick+1,'PFM_EVENT_MISSING');
   arm.zones.push(rt.getCurrentZone());
   const stats=zero();stats.scannedSteps=1;
   const cand=detect(arm,tick+1);
   if(cand){
    stats.candidatesDetected++;
    const definition=scope.rowByPair.get(cand.key);
    if(definition?.eligibleByGraphOnlyNull){
      stats.eligibleCandidates++;
      const hour=Math.floor((tick+1)/60);
      const used=arm.probedByHour[String(hour)]??0;
      if(used<2){
        const orientation=definition.orientations.find((x:any)=>x.anchor===cand.a&&x.turn===cand.b);
        assert(orientation,'ELIGIBLE_PAIR_WITHOUT_ORIENTATION');
        arm.probedByHour[String(hour)]=used+1;
        const item={id:'PF1-'+arm.id+'-'+(tick+1)+'-'+cand.key,
          armIndex:i,detectionTick:tick+1,confirmationTick:tick+25,
          detectedAtUTC:r.observedAtUTC,candidate:cand,
          checkpoint:arm.state,sourceRound:r.round};
        assert(!state.pendingForks.some((x:any)=>x.id===item.id));
        state.pendingForks.push(item);
        created.push(item.id);
      }
    }
   }
   exposure[arm.id]=stats;
 }
 assert.deepEqual(Object.keys(exposure),idSet);
 const previous=ledger.rows.length?ledger.rows.at(-1).digest:genesis.genesisDigest;
 const row:any={tick,round:r.round,randomness:r.randomness,
  signature:r.signature,signatureSHA256:sha(Buffer.from(r.signature,'hex')),
  roundTime:r.roundTime,observedAtUTC:r.observedAtUTC,
  verification:'REAL_DRAND_QUICKNET_BLS_VERIFIED_C1_PINNED',
  armExposure:exposure,createdForkIDs:created,previous};
 row.digest=sha(row);
 ledger.rows.push(row);
 state.admittedTicks++;
 state.lastAdmittedRound=r.round;
 state.lastAdmissionAt=r.observedAtUTC;
 state.headDigest=row.digest;
 for(let i=0;i<9;i++)scoreReady(i,exposure[idSet[i]],state.admittedTicks);
}
assert.equal(ledger.rows.length,state.admittedTicks);
assert.equal(state.lastAdmittedRound,
  state.admittedTicks?genesis.R0+20*(state.admittedTicks-1):null);
assert.deepEqual(journal.entries.map((e:any)=>e.notificationsSent).filter((x:any)=>x!==0),[]);
if(verified.count){
 write(LIVE+'STATE.json',state);
 write(LIVE+'SILENT_LEDGER.json',ledger);
 write(LIVE+'PENDING_JOURNAL.json',{
   schema:'PF1_PENDING_LIVE_JOURNAL_FOR_EXTERNAL_RFC3161_V1',
   pending:pendingJournal,
   sourceEndTick:state.admittedTicks,
   priorJournalCount:journal.entries.length,
   noNotifications:true
 });
}
console.log('PF1_LIVE_INGESTION_PENDING_DURABLE_COMMIT',JSON.stringify({
 fromTick:original.admittedTicks,toTick:state.admittedTicks,
 newVerifiedRounds:verified.count,pendingForks:state.pendingForks.length,
 newlyConfirmedEncounterEntries:pendingJournal.length,
 notificationsEmitted:0,priorHead:original.headDigest,newHead:state.headDigest
}));
