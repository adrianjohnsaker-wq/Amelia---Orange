/** Post-run deterministic audit; keeps the original study evidence immutable. */
import { createHash } from 'node:crypto';
import { readFileSync,writeFileSync,appendFileSync,existsSync,mkdirSync } from 'node:fs';
import { join,resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { isDeepStrictEqual } from 'node:util';
import { bornAmelia } from '../../src/core/fullNumogram';
import { ExternalRhythmHarmonizer } from '../../src/ai/morphogenetic/ExternalRhythmHarmonizer';
import { advanceLiveField,captureLiveField,createLiveField,observeLiveField,restoreLiveField,syntheticSourceOfferDigest } from '../../src/outside/LiveFieldLoop';
import { applyPerturbationPulse,canonicalJson,digestObject,type MorphogeneticState } from '../../src/substrate/AmeliaMorphogeneticSubstrate';
import { respondToBody,startSource,type SourceArm,type SourceState } from './adaptive_source';
const EXPECTED_STATE='39622abee383d2653a129552da3c573ed476f834a9ec07e848f524e14af1b222';
const EXPECTED_TRACE='082f9ae32704a3dbbcd5bb53668de824200ba3ee3c7110897abcb9bc091b5d06';
const seeds=[101,102,103,104,105,106,107,108],arms=['live','shuffled','uniform','ordinary'] as const;
type Arm=typeof arms[number];
type Context={body:MorphogeneticState;source:SourceState|null;advisory:number;damping:number;rhythm:ExternalRhythmHarmonizer};
const sha=(x:string|Buffer)=>createHash('sha256').update(x).digest('hex');
const runtimeKeys=['stepCount','currentZone','memoryState','governorState','qabbalaZones','qabbalaGates','deformationTensor','traitEvolutionHistory','deferredEncounters'];
const fingerprintKeys=[...runtimeKeys,'currentObjective','suppressRelaySteering'];
function context(body:MorphogeneticState,source:SourceState|null):Context {const g=body.nativeRuntime.getGovernor();return {body,source,advisory:g.advisoryWeight,damping:g.momentumDampingFactor,rhythm:new ExternalRhythmHarmonizer()};}
function prepare(c:Context){const r=c.body.nativeRuntime;r.setAdvisoryWeight(c.rhythm.computeAdvisoryTuning(c.advisory,(r.getSnapshots().at(-1)?.step??0)+1));r.setMomentumDamping(c.damping);}
function mirror(s:MorphogeneticState):MorphogeneticState{return {...s,cells:s.cells.map((_c,i)=>s.cells[Math.floor(i/s.width)*s.width+s.width-1-i%s.width]),stateDigest:digestObject({schema:'amelia.rearrangement/mirror-v1',step:s.stepCount,previous:s.stateDigest})};}
function clone(s:MorphogeneticState,a:Arm):Context {const r=bornAmelia();r.importState(JSON.parse(JSON.stringify(s.nativeRuntime.exportState())));return context(restoreLiveField(JSON.parse(JSON.stringify(captureLiveField(s,false))),r),a==='ordinary'?null:startSource());}
function requireEqual(actual:unknown,expected:unknown,label:string){if(!isDeepStrictEqual(actual,expected))throw Error(`Replay mismatch: ${label}`);}
function main(){
 const args=process.argv.slice(2);if(args.length!==3)throw Error('Usage: replay_verify.ts ARCHIVE.json STUDY_DIRECTORY NEW_AUDIT_DIRECTORY');
 const archive=JSON.parse(readFileSync(resolve(args[0]),'utf8'));
 const record=archive.records.filter((r:any)=>r.store==='runtime'&&r.record_id==='live-checkpoint');if(record.length!==1)throw Error('Invalid starting archive');
 const state=record[0].payload.state;
 if(sha(canonicalJson(Object.fromEntries(fingerprintKeys.map(k=>[k,state[k]]))))!==EXPECTED_STATE)throw Error('Starting runtime fingerprint mismatch');
 const study=resolve(args[1]),bytes=readFileSync(join(study,'traces.jsonl'));if(sha(bytes)!==EXPECTED_TRACE)throw Error('Original trace hash mismatch');
 const rows=bytes.toString('utf8').trimEnd().split('\n').map(x=>JSON.parse(x));if(rows.length!==2240)throw Error('Unexpected trace count');
 const map=new Map(rows.map((x:any)=>[`${x.seed}/${x.arm}/${x.time}`,x]));if(map.size!==2240)throw Error('Duplicate trace key');
 const receipts=readFileSync(join(study,'session_receipts.jsonl'),'utf8').trimEnd().split('\n').map(x=>JSON.parse(x));
 if(receipts.length!==64)throw Error('Unexpected checkpoint receipt count');
 const receiptMap=new Map(receipts.map((x:any)=>[`${x.seed}/${x.arm}/${x.time}`,x]));
 const out=resolve(args[2]);if(existsSync(out))throw Error('Audit output directory exists');mkdirSync(out,{mode:0o700});
 const audit=join(out,'gate-audit.jsonl');writeFileSync(audit,'',{flag:'wx',mode:0o600});
 let verified=0,restarts=0,applied=0,changedCandidates=0;
 try{
 for(const seed of seeds){
  const r=bornAmelia();r.importState(JSON.parse(JSON.stringify(state)));
  let base=context(createLiveField(r,{seed,depth:256,preset:'SYZYGETIC_GRID',size:32}),null);
  for(let t=0;t<20;t++){prepare(base);base.body=advanceLiveField(base.body).state;}
  for(const arm of arms){let c=clone(base.body,arm);
   for(let time=1;time<=70;time++){
    const expected:any=map.get(`${seed}/${arm}/${time}`);if(!expected)throw Error('Missing trace row');
    if(time===21)c.body=mirror(c.body);
    if(time===51)c.body=applyPerturbationPulse(c.body,{arm:'B_FIELD_PULSE',magnitude:0.45,radius:4}).state;
    prepare(c);const rt=c.body.nativeRuntime,from=rt.getCurrentZone(),body=observeLiveField(c.body);
    requireEqual(body,expected.bodyBefore,'body observation');requireEqual(from,expected.from,'starting zone');
    const bias=rt.getMemory().readMemoryBias().biasVector;
    const prior=rt.getQabbala().getGates().filter(g=>g.isOpen&&g.source===from).map(g=>({id:g.id,target:g.target,flux:g.flux,resistance:g.resistance}));
    requireEqual(prior,expected.openGates,'pre-step gates');
    if(time<=40&&arm!=='ordinary'){
      const reading=respondToBody(body,c.source!,arm as SourceArm);requireEqual(reading,expected.source,'live source');c.source=reading.after;
      const stepped=advanceLiveField(c.body,{source:reading.offer});c.body=stepped.state;
      const decision=stepped.snapshot.encounterDecisions?.find(x=>x.sourceDigest===syntheticSourceOfferDigest(reading.offer))??null;
      requireEqual(decision,expected.currentOfferDecision,'current Governor decision');
    }else{if(expected.source!==null)throw Error('Unexpected source in withdrawn or ordinary arm');c.body=advanceLiveField(c.body).state;}
    const snapshot=rt.getSnapshots().at(-1) as any,event=rt.getMemory().getEvents().at(-1) as any;
    requireEqual(snapshot.encounterDecisions,expected.allEncounterDecisions,'encounter decisions');
    requireEqual(event.eventDigest,expected.eventDigest,'PFM event digest');requireEqual(rt.getMemory().exportHistoryDigest(),expected.pfmHead,'PFM head');
    requireEqual(observeLiveField(c.body),expected.bodyAfter,'resulting body');requireEqual(rt.getCurrentZone(),expected.to,'selected zone');
    const admitted=(snapshot.encounterDecisions??[]).find((d:any)=>d.applied);if(admitted)applied++;
    const zones=rt.getQabbala().getZones();
    const gates=rt.getQabbala().getGates().filter(g=>g.isOpen&&g.source===from).map(g=>({id:g.id,target:g.target,
      flux:g.flux,resistance:g.resistance,activation:zones[g.target].activation,phase:zones[g.target].phaseAngle,
      score:g.flux*(1-g.resistance)+(bias[g.target]||0)*0.4+zones[g.target].activation*0.2+Math.cos(zones[g.target].phaseAngle)*0.1+(admitted?.attentionVector[g.target]??0)*0.9}));
    let winner:any=null;for(const g of gates)if(!winner||g.score>winner.score)winner=g;
    if((winner?.target??from)!==expected.to)throw Error('Recorded transition is not the reconstructed winning gate');
    if(!isDeepStrictEqual(prior.map(x=>x.id),gates.map(x=>x.id)))changedCandidates++;
    appendFileSync(audit,JSON.stringify({seed,arm,time,from,to:expected.to,scoringCandidates:gates,admittedSourceDigest:admitted?.sourceDigest??null,
      eventDigest:event.eventDigest,pfmHead:expected.pfmHead,bodyDigest:expected.bodyAfter.sourceDigest})+'\n',{mode:0o600});verified++;
    if(time===20||time===55){
      const receipt:any=receiptMap.get(`${seed}/${arm}/${time}`);if(!receipt)throw Error('Missing checkpoint receipt');
      const zipped=readFileSync(join(study,'checkpoints',`${seed}-${arm}-t${time}.json.gz`));
      if(sha(zipped)!==receipt.checkpointSha256)throw Error('Checkpoint archive hash mismatch');
      const saved=JSON.parse(gunzipSync(zipped).toString('utf8'));const current=rt.exportState() as any;
      for(const key of runtimeKeys)requireEqual(current[key],saved.runtimeState[key],`checkpoint ${key}`);
      requireEqual(c.source,saved.source,'checkpoint source state');
      if(captureLiveField(c.body,false).checksum!==saved.fieldCheckpoint.checksum)throw Error('Field checkpoint checksum mismatch');
      const next=bornAmelia();next.importState(saved.runtimeState);c=context(restoreLiveField(saved.fieldCheckpoint,next),saved.source);restarts++;
    }
   }
  }
 }
 const result={status:'PASS',originalTraceSha256:EXPECTED_TRACE,rowsVerified:verified,checkpointsVerified:restarts,
  appliedEncounters:applied,stepsWhereCandidateIdsChangedDuringStep:changedCandidates,gateAuditSha256:sha(readFileSync(audit)),
  scope:'Deterministic replay of the same registered run, not an independent replication.'};
 writeFileSync(join(out,'verification.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});console.log(JSON.stringify(result));
 }catch(e){writeFileSync(join(out,'FAILURE.json'),JSON.stringify({error:e instanceof Error?e.message:String(e)},null,2)+'\n',{flag:'wx',mode:0o600});throw e;}
}
main();
