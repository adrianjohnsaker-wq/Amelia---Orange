/** Isolated research copies of the explicitly authorized synced runtime. */
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync,gunzipSync } from 'node:zlib';
import { bornAmelia } from '../../src/core/fullNumogram';
import { ExternalRhythmHarmonizer } from '../../src/ai/morphogenetic/ExternalRhythmHarmonizer';
import { advanceLiveField,captureLiveField,createLiveField,observeLiveField,restoreLiveField,syntheticSourceOfferDigest } from '../../src/outside/LiveFieldLoop';
import { applyPerturbationPulse,canonicalJson,digestObject,type MorphogeneticState } from '../../src/substrate/AmeliaMorphogeneticSubstrate';
import { respondToBody,startSource,targetProfile,type SourceArm,type SourceState } from './adaptive_source';

const EXPECTED_STATE='39622abee383d2653a129552da3c573ed476f834a9ec07e848f524e14af1b222';
const config={study:'AMELIA-LIVE-POINTER-1',seeds:[101,102,103,104,105,106,107,108],depth:256,
  size:32,preset:'SYZYGETIC_GRID' as const,acclimation:20,exposure:40,withdrawal:30,
  mirrorAt:21,pulseAt:51,pulse:{magnitude:0.45,radius:4},restoreAt:[20,55],
  arms:['live','shuffled','uniform','ordinary'] as const};
type Arm=typeof config.arms[number];
type Context={body:MorphogeneticState;source:SourceState|null;advisory:number;damping:number;rhythm:ExternalRhythmHarmonizer};
const sha=(text:string|Buffer)=>createHash('sha256').update(text).digest('hex');
const stateKeys=['stepCount','currentZone','memoryState','governorState','qabbalaZones','qabbalaGates','deformationTensor',
 'traitEvolutionHistory','deferredEncounters','currentObjective','suppressRelaySteering'];
function stateFingerprint(state:any) {return sha(canonicalJson(Object.fromEntries(stateKeys.map(k=>[k,state[k]]))));}
function context(body:MorphogeneticState,source:SourceState|null):Context {
 const gov=body.nativeRuntime.getGovernor();
 return {body,source,advisory:gov.advisoryWeight,damping:gov.momentumDampingFactor,rhythm:new ExternalRhythmHarmonizer()};
}
/** Mirrors the actual app's onBeforeSharedStep defaults, not the Studio runner. */
function prepare(ctx:Context) {
 const r=ctx.body.nativeRuntime;const next=(r.getSnapshots().at(-1)?.step??0)+1;
 r.setAdvisoryWeight(ctx.rhythm.computeAdvisoryTuning(ctx.advisory,next));r.setMomentumDamping(ctx.damping);
}
function mirror(state:MorphogeneticState):MorphogeneticState {
 const cells=state.cells.map((_c,i)=>state.cells[Math.floor(i/state.width)*state.width+(state.width-1-i%state.width)]);
 return {...state,cells,stateDigest:digestObject({schema:'amelia.rearrangement/mirror-v1',step:state.stepCount,previous:state.stateDigest})};
}
function saveAndRestore(ctx:Context,folder:string,seed:number,arm:Arm,time:number):{ctx:Context;sha256:string} {
 const runtime=ctx.body.nativeRuntime;const fieldCheckpoint=captureLiveField(ctx.body,false);
 const capsule={schema:'amelia.live-pointer-session/v1',seed,arm,time,source:ctx.source,
   runtimeState:runtime.exportState(),fieldCheckpoint};
 const bytes=gzipSync(Buffer.from(JSON.stringify(capsule)));const path=join(folder,`${seed}-${arm}-t${time}.json.gz`);
 writeFileSync(path,bytes,{flag:'wx'});
 const restored=JSON.parse(gunzipSync(readFileSync(path)).toString('utf8'));
 const next=bornAmelia();next.importState(restored.runtimeState);
 const body=restoreLiveField(restored.fieldCheckpoint,next);
 if(captureLiveField(body,false).checksum!==fieldCheckpoint.checksum ||
    next.getMemory().exportHistoryDigest()!==runtime.getMemory().exportHistoryDigest()) throw Error('Session restore failed');
 return {ctx:context(body,restored.source),sha256:sha(bytes)};
}
function clone(base:MorphogeneticState,arm:Arm):Context {
 const runtime=bornAmelia();runtime.importState(JSON.parse(JSON.stringify(base.nativeRuntime.exportState())));
 const body=restoreLiveField(JSON.parse(JSON.stringify(captureLiveField(base,false))),runtime);
 return context(body,arm==='ordinary'?null:startSource());
}
function summarize(rows:any[]) {
 const worlds:any[]=[];
 for(const seed of config.seeds) {
  const per=(arm:Arm)=>rows.filter(x=>x.seed===seed&&x.arm===arm);
  const live=per('live');const targetAddress=live.find(x=>x.time===40)?.source?.after?.address;
  if(targetAddress!==0&&targetAddress!==1)throw Error('Missing source target at withdrawal');
  const target=targetProfile(targetAddress);const error=(row:any)=>0.5*row.bodyAfter.attentionVector.reduce((s:number,v:number,i:number)=>s+Math.abs(v-target[i]),0);
  const world:any={seed,targetAddress,arms:{}};
  for(const arm of config.arms) {
   const armRows=per(arm),active=armRows.filter(x=>x.time<=config.exposure);
   const dispositions=active.reduce((a:any,x:any)=>{const k=x.currentOfferDecision?.disposition??'NONE';a[k]=(a[k]??0)+1;return a;},{});
   const a20=armRows.find(x=>x.time===20)?.source?.after?.address;
   const switched=arm==='ordinary'?null:armRows.filter(x=>x.time>=21&&x.time<=25).some(x=>x.source?.after?.address!==a20);
   world.arms[arm]={currentOfferDispositions:dispositions,addressSwitchedWithin5:switched,
     errorToLiveTargetAt40:error(armRows.find(x=>x.time===40)),errorToLiveTargetAt55:error(armRows.find(x=>x.time===55)),
     errorToLiveTargetAt70:error(armRows.find(x=>x.time===70)),
     sourcePendingAtStop:armRows.find(x=>x.time===40).pendingSourceAtStop,
     delayedSourceAdmissions:armRows.filter(x=>x.time>40).flatMap(x=>x.allEncounterDecisions??[])
       .filter((x:any)=>x.eventId.startsWith('source:')&&x.disposition==='ATTEND'&&x.applied).length,
     exposureEligible:arm==='ordinary'?null:(dispositions.ATTEND??0)>=5};
  }
  worlds.push(world);
 }
 const avg=(xs:number[])=>xs.reduce((a,b)=>a+b,0)/xs.length;
 return {worlds,descriptive:{targetErrorAt70:Object.fromEntries(config.arms.map(arm=>[arm,avg(worlds.map(w=>w.arms[arm].errorToLiveTargetAt70))])),
   liveAddressSwitches:worlds.filter(w=>w.arms.live.addressSwitchedWithin5).length,
   liveExposureEligible:worlds.filter(w=>w.arms.live.exposureEligible).length}};
}
function main() {
 const args=process.argv.slice(2);
 if(args.length!==5||args[0]!=='--archive'||args[2]!=='--output'||args[4]!=='--start-new-field')
  throw Error('Usage: node --import tsx run.ts --archive PRIVATE_ARCHIVE.json --output PRIVATE_NEW_DIRECTORY --start-new-field');
 const archive=JSON.parse(readFileSync(resolve(args[1]),'utf8'));
 const matches=(archive.records??[]).filter((r:any)=>r.store==='runtime'&&r.record_id==='live-checkpoint');
 if(matches.length!==1) throw Error('Expected one live checkpoint in the supplied archive');
 const saved=matches[0].payload;
 if(!saved?.state || saved.fieldCheckpoint || stateFingerprint(saved.state)!==EXPECTED_STATE)
  throw Error('The archive does not match the registered runtime-only starting checkpoint');
 const out=resolve(args[3]);if(existsSync(out))throw Error('Output directory exists; previous evidence will not be overwritten');
 mkdirSync(out,{mode:0o700});const folder=join(out,'checkpoints');mkdirSync(folder,{mode:0o700});
 const trace=join(out,'traces.jsonl');writeFileSync(trace,'',{flag:'wx',mode:0o600});const rows:any[]=[];
 try {
 for(const seed of config.seeds) {
  const initial=bornAmelia();initial.importState(JSON.parse(JSON.stringify(saved.state)));
  let base=context(createLiveField(initial,{seed,depth:config.depth,preset:config.preset,size:config.size}),null);
  for(let i=0;i<config.acclimation;i++){prepare(base);base.body=advanceLiveField(base.body).state;}
  for(const arm of config.arms) {
   let ctx=clone(base.body,arm);
   for(let time=1;time<=config.exposure+config.withdrawal;time++) {
    let intervention:any=null;
    if(time===config.mirrorAt) {
      const before=observeLiveField(ctx.body);ctx.body=mirror(ctx.body);const after=observeLiveField(ctx.body);
      intervention={kind:'horizontal-cell-mirror',beforeDigest:before.sourceDigest,afterDigest:after.sourceDigest,
        beforeCentroid:before.attentionVector?.reduce((s,v,i)=>s+v*i/9,0),afterCentroid:after.attentionVector?.reduce((s,v,i)=>s+v*i/9,0)};
    }
    if(time===config.pulseAt) {
      const applied=applyPerturbationPulse(ctx.body,{arm:'B_FIELD_PULSE',...config.pulse});ctx.body=applied.state;
      intervention={kind:'held-out-b-pulse',receipt:applied.receipt};
    }
    prepare(ctx);
    const runtime=ctx.body.nativeRuntime,bodyBefore=observeLiveField(ctx.body),from=runtime.getCurrentZone();
    const openGates=runtime.getQabbala().getGates().filter(g=>g.isOpen&&g.source===from)
      .map(g=>({id:g.id,target:g.target,flux:g.flux,resistance:g.resistance}));
    const governorBefore=runtime.getGovernor();let source:any=null,decision:any=null;
    if(time<=config.exposure && arm!=='ordinary') {
      source=respondToBody(bodyBefore,ctx.source!,arm as SourceArm);ctx.source=source.after;
      const stepped=advanceLiveField(ctx.body,{source:source.offer});ctx.body=stepped.state;
      const digest=syntheticSourceOfferDigest(source.offer);
      decision=stepped.snapshot.encounterDecisions?.find(x=>x.sourceDigest===digest)??null;
      if(!decision)throw Error('Current source decision missing from Governor record');
    } else ctx.body=advanceLiveField(ctx.body).state;
    const snapshot=runtime.getSnapshots().at(-1) as any,event=runtime.getMemory().getEvents().at(-1) as any;
    const bodyAfter=observeLiveField(ctx.body);
    const pendingSourceAtStop=time===config.exposure
      ? ((runtime.exportState() as any).deferredEncounters??[]).filter((e:any)=>e.eventId.startsWith('source:')).length : null;
    const row={seed,arm,time,phase:time<=config.exposure?'source':'withdrawn',intervention,
      bodyBefore,source,currentOfferDecision:decision,from,to:runtime.getCurrentZone(),openGates,
      governorBefore,governorAfter:snapshot.governor,allEncounterDecisions:snapshot.encounterDecisions,
      eventDigest:event.eventDigest,pfmHead:runtime.getMemory().exportHistoryDigest(),
      memoryBias:runtime.getMemory().readMemoryBias().biasVector,bodyAfter,entropy:ctx.body.entropy,pendingSourceAtStop};
    rows.push(row);appendFileSync(trace,JSON.stringify(row)+'\n',{mode:0o600});
    if(config.restoreAt.includes(time)) {
      const restored=saveAndRestore(ctx,folder,seed,arm,time);ctx=restored.ctx;
      appendFileSync(join(out,'session_receipts.jsonl'),JSON.stringify({seed,arm,time,checkpointSha256:restored.sha256})+'\n',{mode:0o600});
    }
   }
  }
 }
 const summary={scope:'One synced runtime checkpoint at step 1; eight newly initialized synthetic fields; isolated clones, not the active tablet.',
   sourceFingerprint:EXPECTED_STATE,config,...summarize(rows)};
 writeFileSync(join(out,'summary.json'),JSON.stringify(summary,null,2)+'\n',{flag:'wx',mode:0o600});
 const hashes={traces:sha(readFileSync(trace)),summary:sha(readFileSync(join(out,'summary.json'))),
   receipts:sha(readFileSync(join(out,'session_receipts.jsonl')))};
 writeFileSync(join(out,'hashes.json'),JSON.stringify(hashes,null,2)+'\n',{flag:'wx',mode:0o600});
 console.log(JSON.stringify({status:'COMPLETE',hashes,descriptive:summary.descriptive}));
 } catch(error) {
   writeFileSync(join(out,'FAILURE.json'),JSON.stringify({error:error instanceof Error?error.message:String(error)},null,2)+'\n',{flag:'wx',mode:0o600});
   throw error;
 }
}
main();
