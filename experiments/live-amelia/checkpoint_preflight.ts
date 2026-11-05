/** Read-only preflight for a live-app experiment; never writes back to Amelia. */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { bornAmelia } from '../../src/core/fullNumogram';
import { restoreLiveField } from '../../src/outside/LiveFieldLoop';

function checkpointFrom(input:any):any {
  if (Array.isArray(input?.records)) {
    const matches=input.records.filter((r:any)=>r?.store==='runtime' && r?.record_id==='live-checkpoint');
    if(matches.length!==1) throw Error('Archive must contain exactly one live runtime checkpoint.');
    return matches[0].payload;
  }
  if (input?.payload?.state) return input.payload;
  if (input?.state) return input;
  throw Error('No recognizable live runtime checkpoint.');
}
function memoryEvents(checkpoint:any):any[] {
  const events=checkpoint?.state?.memoryState?.events;
  if(!Array.isArray(events) || events.some((e:any)=>typeof e?.eventDigest!=='string' || !/^[a-f0-9]{64}$/i.test(e.eventDigest)))
    throw Error('Process-memory events are missing or have invalid digests.');
  return events;
}

export function inspectCheckpoint(input:any, previousInput?:any) {
  const checkpoint=checkpointFrom(input), state=checkpoint.state, events=memoryEvents(checkpoint);
  if(!state || !Number.isSafeInteger(state.stepCount) || state.stepCount<0 || !state.governorState ||
     !state.qabbalaZones || Object.keys(state.qabbalaZones).length!==10 || !Array.isArray(state.qabbalaGates) || state.qabbalaGates.length!==29)
    throw Error('Checkpoint lacks a valid runtime, Governor or full Numogram.');
  const runtime=bornAmelia(); runtime.importState(structuredClone(state));
  const exported=runtime.exportState() as any;
  for(const key of ['stepCount','currentZone','memoryState','governorState','qabbalaZones','qabbalaGates','deformationTensor','traitEvolutionHistory','deferredEncounters']) {
    if(!isDeepStrictEqual(exported[key],state[key])) throw Error(`Runtime checkpoint did not round-trip ${key}.`);
  }
  const initial=bornAmelia();initial.step();const first=initial.exportState() as any;
  const identityKeys=['stepCount','currentZone','memoryState','governorState','qabbalaZones','qabbalaGates','deformationTensor','traitEvolutionHistory','deferredEncounters','currentObjective','suppressRelaySteering'];
  const matchesNewborn=identityKeys.every(k=>isDeepStrictEqual(state[k],first[k]));
  let fieldValid=false,fieldStep:number|null=null;
  if(checkpoint.fieldCheckpoint) {
    if(checkpoint.fieldCheckpoint.runtimeStep!==state.stepCount) throw Error('Field and runtime were not saved at the same runtime step.');
    const field=restoreLiveField(checkpoint.fieldCheckpoint,runtime);
    fieldValid=true;fieldStep=field.stepCount;
  }
  let prefixContinuity:boolean|null=null,sameWriter:boolean|null=null;
  if(previousInput!==undefined) {
    const previous=checkpointFrom(previousInput),prior=memoryEvents(previous);
    prefixContinuity=prior.length<=events.length && prior.every((e:any,i:number)=>e.eventDigest===events[i].eventDigest);
    sameWriter=typeof previous.writerId==='string' && typeof checkpoint.writerId==='string'
      ? previous.writerId===checkpoint.writerId : null;
  }
  const blockers:string[]=[];
  if(!fieldValid) blockers.push('No saved live field is present.');
  if(events.length<=1 || matchesNewborn) blockers.push('The saved process memory does not demonstrate an established history.');
  if(prefixContinuity===null) blockers.push('No earlier checkpoint was supplied to compare process-memory continuity.');
  if(prefixContinuity===false) blockers.push('The earlier and later process-memory histories do not form a prefix.');
  return {runtimeStep:state.stepCount,processEvents:events.length,numogramZones:Object.keys(state.qabbalaZones).length,
    numogramGates:state.qabbalaGates.length,fieldValid,fieldStep,matchesNewborn,prefixContinuity,sameWriter,
    canStartFromSavedBody:blockers.length===0,blockers,
    identityCaveat:'A checkpoint or matching prefix does not by itself prove which device or session produced it.'};
}
if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  try {
    if(!process.argv[2] || process.argv.length>4) throw Error('Usage: node --import tsx checkpoint_preflight.ts CURRENT.json [PREVIOUS.json]');
    const current=JSON.parse(readFileSync(process.argv[2],'utf8'));
    const prior=process.argv[3] ? JSON.parse(readFileSync(process.argv[3],'utf8')) : undefined;
    const result=inspectCheckpoint(current,prior);console.log(JSON.stringify(result,null,2));
    if(!result.canStartFromSavedBody) process.exitCode=2;
  } catch(e) {console.error(e instanceof Error?e.message:String(e));process.exitCode=1;}
}
