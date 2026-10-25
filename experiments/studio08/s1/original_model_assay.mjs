/**
 * S1 fresh-world ASSAY ORCHESTRATOR — original-model adapter REQUIRED.
 *
 * This runner has no built-in house simulator. It intentionally refuses to
 * execute until an exact verified Studio07/07b adapter is supplied. It cannot
 * manufacture scientific outcomes from missing original checkpoints.
 *
 * Original adapter contract:
 *   export async function createOriginalS1World({worldId,seedHex,scenario,arm})
 *   => a world with:
 *     originalRunnerSha256 (64 lowercase hex; matches source admission)
 *     initialWorldSha256 (64 lowercase hex; complete starting state)
 *     totalRegisteredTransitions (positive integer fixed by original protocol)
 *     preChoiceSnapshots25() -> 25 committed {house:{surface,deep},code:{V}}
 *     originalAsmPreChoiceTarget() -> zone 0..9 or null (original byte serializer)
 *     stepWithCue({target,strength,input:undefined}) -> {
 *        from,to,death,preChoiceStateSha256,postChoiceStateSha256,
 *        scoreMarginOriginal,scoreMarginWithCue
 *     }
 *     finalReadouts() -> {lastSeasonDeaths,lesionSeasonDeaths,
 *        lastSeasonRoutes,lastSeasonPull27,lastSeasonPull45}
 *
 * The adapter must wrap the EXACT original science model. No undocumented
 * replacements, no post-choice cue calculation, no external random input.
 *
 * OUTPUT: one raw trace .jsonl and companion per-arm receipt .json. One call
 * per world/scenario/arm; an external collector forms 384 files before
 * the paired exact analysis. No study run is attempted by CI preflight.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {SENSOR_IDS,closedCircuitSensorCandidates} from '../code/closed_circuit_sensors.mjs';
import {S1LearningCueGate,S1_CUE_STRENGTH} from '../code/learning_cue_gate.mjs';
import {EDGES} from '../code/endogenous_cues.mjs';

const ARMS=new Set(['adaptive','round_robin','fixed_surface_decline24',
 'fixed_house_flux24','no_cue','asm_reference']);
const SCENARIOS=new Set(['intact','lesion']);
const h=s=>createHash('sha256').update(s).digest('hex');
const fileHash=p=>h(fs.readFileSync(p));
const issha=s=>typeof s==='string'&&/^[0-9a-f]{64}$/.test(s);
const iszone=z=>z===null||(Number.isInteger(z)&&z>=0&&z<10);
function fail(msg){throw Error('STUDIO08_S1_ORIGINAL_SCIENCE_GATE_BLOCKED: '+msg)}
function argMap(args){
  const out={};
  for(let i=0;i<args.length;i+=2){
    if(!args[i].startsWith('--')||!args[i+1])fail('CLI --key value pairs only');
    out[args[i].slice(2)]=args[i+1];
  }
  return out;
}
const a=argMap(process.argv.slice(2));
const required=['world','scenario','arm','adapter','adapter-sha256','registration',
 'registration-sha256','source-admission','original-replay-receipt','seed-manifest',
 'trace-output','record-output'];
if(required.some(k=>!a[k]))fail('Missing mandatory: '+required.filter(k=>!a[k]).join(', '));
if(!ARMS.has(a.arm)||!SCENARIOS.has(a.scenario))fail('invalid condition');
if(!/^S1-W(?:0\d|[12]\d|3[01])$/.test(a.world))fail('not a preregistered world');
for(const k of ['adapter-sha256','registration-sha256'])
 if(!issha(a[k]))fail('invalid hash on '+k);
if(fileHash(a.adapter)!==a['adapter-sha256'])fail('adapter bytes not matching frozen SHA');
if(fileHash(a.registration)!==a['registration-sha256'])fail('registration bytes not matching frozen SHA');

const source=JSON.parse(fs.readFileSync(a['source-admission'],'utf8'));
const replay=JSON.parse(fs.readFileSync(a['original-replay-receipt'],'utf8'));
if(source.status!=='STUDIO08_ORIGINAL_IMPORT_CUSTODY_PASS_NOT_SCIENTIFIC_REPLAY'||
 source.verifiedWorldPairs!==8||!issha(source.sourceRunnerSha256))
 fail('original 8-world Studio07 archive not verified');
if(replay.status!=='STUDIO07_ORIGINAL_EIGHT_WORLD_REPLAY_VERIFIED'||
 replay.matchedWorlds!==8||replay.exactCueSerializerVerified!==true||
 replay.fullTraceDigestsMatched!==true||
 replay.originalRunnerSha256!==source.sourceRunnerSha256)
 fail('exact original Studio07/07b replay not admitted');
const seeds=JSON.parse(fs.readFileSync(a['seed-manifest'],'utf8'));
if(seeds.schema!=='STUDIO08_S1_FRESH_WORLD_SEEDS_V1'||Object.keys(seeds.worlds).length!==32)
 fail('invalid exact world-seed manifest');
const seedHex=seeds.worlds[a.world];
if(seedHex!==h('STUDIO08-S1-V1|'+a.world))
 fail('world seed not SHA256 of pinned domain-separated world ID');

const module=await import(pathToFileURL(resolve(a.adapter)).href);
if(typeof module.createOriginalS1World!=='function')fail('certified original-model adapter missing');
const world=await module.createOriginalS1World({
 worldId:a.world,seedHex,scenario:a.scenario,arm:a.arm
});
if(world.originalRunnerSha256!==source.sourceRunnerSha256)fail('adapter source not original');
if(!issha(world.initialWorldSha256))fail('complete full-state initial hash missing');
if(!Number.isInteger(world.totalRegisteredTransitions)||
 world.totalRegisteredTransitions<48)
 fail('original session duration not admitted');
for(const method of ['preChoiceSnapshots25','originalAsmPreChoiceTarget',
 'stepWithCue','finalReadouts'])
 if(typeof world[method]!=='function')fail('required original model method missing: '+method);

// Exclusive-create output: no silent overwriting of previous failed or good runs.
const fd=fs.openSync(a['trace-output'],'wx');
const receiver=['adaptive','round_robin'].includes(a.arm)?
 new S1LearningCueGate(a.arm==='adaptive'?'adaptive':'round_robin'):null;
const pending=new Map(),sensorCounts=Object.fromEntries(SENSOR_IDS.map(id=>[id,0]));
let cues=0, settleCredit=0, deaths=0, traceRows=0, sentSourceInputs=0;
const originalEdges=new Set(EDGES);
const write=obj=>{fs.writeSync(fd,JSON.stringify(obj)+'\n');traceRows++;};

try{
 for(let t=1;t<=world.totalRegisteredTransitions;t++){
  let selected={target:null,sensor:null,token:null},candidates=null;
  if(a.arm!=='no_cue'&&a.arm!=='asm_reference'){
    candidates=closedCircuitSensorCandidates(world.preChoiceSnapshots25());
    if(receiver) selected=receiver.choose(candidates);
    else{
      const sensor=a.arm==='fixed_surface_decline24'?
       SENSOR_IDS[0]:SENSOR_IDS[1];
      selected={target:candidates.find(s=>s.id===sensor).target,
                sensor,token:null};
    }
  }else if(a.arm==='asm_reference'){
    selected={target:world.originalAsmPreChoiceTarget(),
              sensor:'original_source_asm',token:null};
  }
  if(!iszone(selected.target))fail('invalid pre-choice readout zone at tick '+t);
  if(selected.sensor in sensorCounts)sensorCounts[selected.sensor]++;
  const strength=selected.target===null?0:S1_CUE_STRENGTH;
  if(strength>0)cues++;
  if(selected.token)pending.set(selected.token,{
    decisionTick:t,edges:new Set()
  });
  const step=world.stepWithCue({
    target:selected.target,strength,input:undefined
  });
  if(!step || !Number.isInteger(step.from)||!Number.isInteger(step.to)||
     step.from<0||step.from>9||step.to<0||step.to>9||
     typeof step.death!=='boolean'||
     !issha(step.preChoiceStateSha256)||!issha(step.postChoiceStateSha256)||
     !Number.isFinite(step.scoreMarginOriginal)||
     !Number.isFinite(step.scoreMarginWithCue))
    fail('non-auditable source transition at '+t);
  const edge=step.from+'>'+step.to;
  if(!originalEdges.has(edge))fail('original directed route outside frozen graph: '+edge);
  if(step.death)deaths++;
  const credits=[];
  for(const [token,credit] of pending){
    credit.edges.add(edge);
    const mature=t>=credit.decisionTick+23;
    if(step.death||mature){
      const settlement=receiver.settle(token,{
        observedAt:t,distinctEdges:credit.edges.size,deathWithin24:step.death
      });
      credits.push(settlement);pending.delete(token);settleCredit++;
    }
  }
  write({schema:'S1_ORIGINAL_WORLD_RAW_TRANSITION_V1',
   worldId:a.world,scenario:a.scenario,arm:a.arm,tick:t,
   sourceInput:null,from:step.from,to:step.to,death:step.death,
   preChoiceStateSha256:step.preChoiceStateSha256,
   postChoiceStateSha256:step.postChoiceStateSha256,
   scoreMarginOriginal:step.scoreMarginOriginal,
   scoreMarginWithCue:step.scoreMarginWithCue,
   selectedSensor:selected.sensor,selectedTarget:selected.target,
   selectedCueMagnitude:strength,creditsSettled:credits,
   pendingRewards:pending.size,
   candidateReadouts:candidates});
 }
}finally{fs.closeSync(fd)}

const outcomes=world.finalReadouts();
for(const name of ['lastSeasonDeaths','lesionSeasonDeaths',
 'lastSeasonRoutes','lastSeasonPull27','lastSeasonPull45'])
 if(typeof outcomes?.[name]!=='number'||!Number.isFinite(outcomes[name])||
 outcomes[name]<0)fail('missing/nonfinite original final readout: '+name);
const traceDigest=fileHash(a['trace-output']);
const rec={
 schema:'STUDIO08_S1_ORIGINAL_ARM_RECORD_V1',
 worldId:a.world,scenario:a.scenario,arm:a.arm,
 seedHex,initialWorldSha256:world.initialWorldSha256,
 sourceRunnerSha256:world.originalRunnerSha256,
 adapterSha256:a['adapter-sha256'],
 registrationSha256:a['registration-sha256'],
 originalReplayReceiptSha256:fileHash(a['original-replay-receipt']),
 tracePath:a['trace-output'],traceSha256:traceDigest,
 outcomeMetrics:outcomes,
 selectedCueCount:cues,settledCredits:settleCredit,
 rightCensoredRewards:pending.size,
 sensorChoices:sensorCounts,traceRows,
 sourceInputCalls:sentSourceInputs,
 warning:'Original adapter fidelity is not guaranteed by this runner; independent audit and raw trace reexecution required.'
};
fs.writeFileSync(a['record-output'],JSON.stringify(rec,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:'STUDIO08_S1_ORIGINAL_ARM_EXECUTED_EVIDENCE_UNREVIEWED',
 worldId:a.world,scenario:a.scenario,arm:a.arm,traceSha256:traceDigest,
 transitions:traceRows,rightCensoredRewards:pending.size}));
