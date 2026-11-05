/**
 * Isolated, freshly initialized full-application validation pilot.
 * This never reads, imports, or writes the user's tablet/Supabase state.
 * Run only after recording PILOT_PRECOMMIT.md and this file's Git commit.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { bornAmelia } from '../../src/core/fullNumogram';
import { advanceLiveField, captureLiveField, createLiveField, observeLiveField, restoreLiveField, type FieldMapping } from '../../src/outside/LiveFieldLoop';
import { applyPerturbationPulse, type MorphogeneticState } from '../../src/substrate/AmeliaMorphogeneticSubstrate';

const config = { study: 'LIVE-LOOP-PILOT-1', seeds: [101,102,103,104,105,106,107,108], size: 32,
  depth: 288, preset: 'SYZYGETIC_GRID' as const, acclimation: 30, followup: 50, restartAt: 25,
  pulse: { magnitude: 0.45, radius: 4 }, permutation: [3,8,1,6,4,9,0,5,2,7] };
const mappings: {label:string; mapping:FieldMapping}[] = [
  {label:'live',mapping:'live'}, {label:'shuffled',mapping:{permutation:config.permutation}},
  {label:'uniform',mapping:'uniform'},
];
const rows: any[] = [], calibrations: any[] = [], summaries: any[] = [];
function twin(savedRuntime: Record<string,unknown>, savedField: ReturnType<typeof captureLiveField>): MorphogeneticState {
  const runtime = bornAmelia(); runtime.importState(JSON.parse(JSON.stringify(savedRuntime)));
  return restoreLiveField(JSON.parse(JSON.stringify(savedField)), runtime);
}
function distance(a:MorphogeneticState,b:MorphogeneticState):number {
  assert.equal(a.cells.length,b.cells.length);
  const sum = a.cells.reduce((s,c,i) => s + (c.A-b.cells[i].A)**2 + (c.B-b.cells[i].B)**2, 0);
  return Math.sqrt(sum / (a.cells.length * 2));
}
function restart(s:MorphogeneticState):MorphogeneticState {
  return twin(JSON.parse(JSON.stringify(s.nativeRuntime.exportState())),captureLiveField(s,false));
}
function stateRecord(s:MorphogeneticState) {
  const runtime=s.nativeRuntime, events=runtime.getMemory().getEvents(), e=events.at(-1) as any;
  return { zone:runtime.getCurrentZone(), pfmHead:runtime.getMemory().exportHistoryDigest(),
    eventDigest:e?.eventDigest ?? null, fieldDigest:observeLiveField(s).sourceDigest,
    attention:e?.encounters?.find((x:any)=>x.channel==='SYNTHETIC_FIELD')?.attentionVector ?? null,
    disposition:e?.encounters?.find((x:any)=>x.channel==='SYNTHETIC_FIELD')?.disposition ?? null,
    entropy:s.entropy, fieldStep:s.stepCount };
}
for(const seed of config.seeds) {
  const runtime=bornAmelia(); runtime.step();
  let base=createLiveField(runtime,{seed,depth:config.depth,preset:config.preset,size:config.size});
  for(let t=0;t<config.acclimation;t++) base=advanceLiveField(base).state;
  const savedRuntime=runtime.exportState(), savedField=captureLiveField(base,false);
  const world:any={seed,mappings:{}};
  for(const arm of mappings) {
    let sham=twin(savedRuntime,savedField), injured=twin(savedRuntime,savedField);
    const p=applyPerturbationPulse(injured,{arm:'B_FIELD_PULSE',...config.pulse});injured=p.state;
    sham=applyPerturbationPulse(sham,{arm:'SHAM',...config.pulse}).state;
    const initial=distance(injured,sham);assert.ok(initial>0,'pulse produced no measurable change');
    // Calibrate the distance calculation with known, isolated constructed states.
    const half={...injured,cells:injured.cells.map((cell,i)=>({...cell,A:(cell.A+sham.cells[i].A)/2,B:(cell.B+sham.cells[i].B)/2}))};
    const halfDistance=distance(half,sham),zeroDistance=distance(sham,sham);
    assert.ok(Math.abs(halfDistance/initial-0.5)<1e-10 && zeroDistance===0,'distance calibration failed');
    calibrations.push({seed,mapping:arm.label,initial,halfDistance,zeroDistance});
    const perArm:any[]=[];
    for(let t=0;t<=config.followup;t++) {
      const d=distance(injured,sham);
      const row={seed,mapping:arm.label,step:t,distance:d,relativeDistance:d/initial,
        injured:stateRecord(injured),sham:stateRecord(sham)};
      rows.push(row);perArm.push(row);
      if(t===config.followup) break;
      if(t===config.restartAt) {injured=restart(injured);sham=restart(sham);}
      injured=advanceLiveField(injured,arm.mapping).state;
      sham=advanceLiveField(sham,arm.mapping).state;
    }
    world.mappings[arm.label]={initialDistance:initial,relativeAt25:perArm[25].relativeDistance,
      relativeAt50:perArm[50].relativeDistance,recoveryAt50:1-perArm[50].relativeDistance,
      pulseReceipt:p.receipt,
      injuredDispositions:perArm.slice(1).reduce((acc,r)=>{const k=r.injured.disposition ?? 'NONE';acc[k]=(acc[k]??0)+1;return acc;},{})};
  }
  summaries.push(world);
}
const mean=(xs:number[])=>xs.reduce((a,b)=>a+b,0)/xs.length;
const result={scope:'Fresh, isolated, synthetic full-application bodies. Not the user tablet history; not evidence of an outside mind.',
  config, calibrations, worlds:summaries,
  descriptive:{live:mean(summaries.map(x=>x.mappings.live.recoveryAt50)),
    shuffled:mean(summaries.map(x=>x.mappings.shuffled.recoveryAt50)),
    uniform:mean(summaries.map(x=>x.mappings.uniform.recoveryAt50)),
    liveMinusShuffled:mean(summaries.map(x=>x.mappings.live.recoveryAt50-x.mappings.shuffled.recoveryAt50)),
    liveMinusUniform:mean(summaries.map(x=>x.mappings.live.recoveryAt50-x.mappings.uniform.recoveryAt50))}};
const out='experiments/live-amelia/results';mkdirSync(out,{recursive:true});
for(const [file,value] of [['pilot-rows.json',rows],['pilot-summary.json',result]] as const) {
  const bytes=JSON.stringify(value,null,2)+'\n';writeFileSync(`${out}/${file}`,bytes);
  console.log(`${file} sha256=${createHash('sha256').update(bytes).digest('hex')}`);
}
console.log(JSON.stringify(result.descriptive));
