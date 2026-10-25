#!/usr/bin/env node
/**
 * STUDIO08 S1 — P0/P3 ONLY HISTORICAL-CONFIG ELIGIBILITY SCREEN
 * Exploratory ENG-only screening on original P0-P3 pilot seeds, never S1-W00..W31.
 * All changes from committed runner are deterministic text substitutions checked
 * against exact anchors and preserved in a per-condition diff manifest.
 *
 * This IS NOT an S1 experimental result, protocol registration, peer-reviewed
 * confirmation, or exact original Studio07 replay. The screen uses *shortened*
 * 2 x 1,000 tick diagnostic exposures with the same 1-season lesion, to decide
 * whether zones/choice-effect conditions are even physically accessible.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import zlib from 'node:zlib';
const sha=b=>createHash('sha256').update(b).digest('hex');
const thisdir=path.dirname(new URL(import.meta.url).pathname);
const committed=path.resolve(thisdir,'../../committed');
const sourcePath=path.join(committed,'s1_committed_runner.mjs');
const source=fs.readFileSync(sourcePath,'utf8');
const rt=path.resolve('experiments/studio08/runtime_mirror');
const out=path.resolve(process.env.GITHUB_WORKSPACE||process.cwd(),'_studio08_pilotonly_screen');
fs.mkdirSync(out,{recursive:true});
const gpath=(...xs)=>path.join(out,...xs);
const CONFIGS=[
  {id:'contested_learn',a:0.002,A:1,wV:0.5},
  {id:'learn_only',a:0,A:0,wV:0.5},
  {id:'house_only',a:0,A:1,wV:0},
  {id:'contested_only',a:0.002,A:1,wV:0},
  {id:'malign_learn',a:0,A:1,wV:0.5},
];
const WORLDS=['S1-P0','S1-P1','S1-P2','S1-P3'];
const ARMS=['no_cue','adaptive','round_robin','fixed_surface_decline24','fixed_house_flux24'];
const SCENARIOS=['intact','lesion'];
const edits=[];
const fixedOld='const a = 0.002, A = 1, wV = 0.5, wH = 0.35,';
const ticksOld='const SEASON_TICKS = 5000, SEASONS = 7, LESION = -5, LESION_EDGE =';
function once(s,old,v) {
  if(s.split(old).length!==2)throw Error('Missing or duplicated original code anchor: '+old);
  return s.replace(old,v);
}
function execute(args) {
  const proc=spawnSync(process.execPath,['--experimental-strip-types','--no-warnings',...args],
      {encoding:'utf8',maxBuffer:2*1024*1024});
  if(proc.status!==0)throw Error('Pilot subprocess failed: '+args.slice(-5).join(' ')+'\n'+proc.stderr.slice(-1500));
  return proc.stdout.trim().split('\n').at(-1);
}
const output=[];
for(const cfg of CONFIGS) {
  let c=once(source,fixedOld,
    'const a = '+cfg.a+', A = '+cfg.A+', wV = '+cfg.wV+', wH = 0.35,');
  c=once(c,ticksOld,'const SEASON_TICKS = 1000, SEASONS = 2, LESION = -5, LESION_EDGE =');
  const temp=path.join(committed,'_S1_ENGINEERING_PILOT_TEMP_'+cfg.id+'.mjs');
  // The runner's module-relative sensor imports remain correct in its original folder.
  if(fs.existsSync(temp))throw Error('Refuse to overwrite existing temp file');
  fs.writeFileSync(temp,c,{flag:'wx'});
  const diff={config:cfg,originalSourceSha256:sha(source),temporaryRunnerSha256:sha(c),
    changes:['genesis a,A,wV from archived Studio03 condition',
      'exposure reduced from 7 x 5000 to 2 x 1000 TICKS FOR ENGINEERING ONLY']};
  edits.push(diff);
  try {
    for(const wid of WORLDS) {
      const ck=gpath(cfg.id+'_'+wid+'.json');
      const pilotSeed=sha('STUDIO08-S1-PILOT-V1|'+wid.replace('S1-',''));
      execute([temp,'genesis',rt,wid,pilotSeed,ck]);
      const checkpoint=JSON.parse(fs.readFileSync(ck));
      const records={};
      for(const scenario of SCENARIOS)for(const arm of ARMS) {
        const key=scenario+'__'+arm;
        const trace=gpath(cfg.id+'_'+wid+'_'+key+'.jsonl.gz');
        const summary=gpath(cfg.id+'_'+wid+'_'+key+'.summary.json');
        execute([temp,'run',rt,ck,wid,scenario,arm,trace,summary]);
        const raw=zlib.gunzipSync(fs.readFileSync(trace)).toString('utf8').trimEnd().split('\n').map(JSON.parse);
        if(raw.length!==2000)throw Error('Expected 2000 diagnostic ticks');
        let opportunities=0,cues=0,cuesAtOpenExit=0,lesionAtOption=0;
        const moves=[],lastMoves=[];
        for(const row of raw) {
          if(row.sourceInput!==null || row.tick!==moves.length+1)throw Error('Bad row provenance');
          moves.push(row.from+'>'+row.to);
          if(row.from===2)opportunities++;
          if(row.selectedTarget!==null) {
            cues++;
            if(row.options.some(o=>o.to===row.selectedTarget))cuesAtOpenExit++;
          }
          if(row.options.some(o=>o.lesion===-5))lesionAtOption++;
        }
        records[key]={moves,opportunities,cues,cuesAtOpenExit,lesionAtOption,
          final:JSON.parse(fs.readFileSync(summary)),
          uncompressedSha256:sha(raw.map(x=>JSON.stringify(x)).join('\n')),
          compressedSourceSha256:sha(fs.readFileSync(trace))};
        // Raw traces are local CI working files. Only aggregate is uploaded.
        fs.unlinkSync(trace);
      }
      const baseInt=records['intact__no_cue'];
      const baseLes=records['lesion__no_cue'];
      const results=[];
      for(const scenario of SCENARIOS)for(const arm of ARMS) {
        const k=scenario+'__'+arm,r=records[k],base=records[scenario+'__no_cue'];
        let pathDiff=0;
        for(let i=0;i<r.moves.length;i++)if(r.moves[i]!==base.moves[i])pathDiff++;
        results.push({scenario,arm,zone2Opportunities:r.opportunities,
          totalCueTargets:r.cues,cueHitsAnAvailableExit:r.cuesAtOpenExit,
          appliedLesionExitOptions:r.lesionAtOption,
          differenceFromNoCueTransitions:pathDiff,
          reportedLastSeasonRoutes:r.final.lastSeasonRoutes,
          reportedPull27:r.final.lastSeasonPull27,
          lastSeasonDeaths:r.final.lastSeasonDeaths,
          completeTraceSha256:r.compressedSourceSha256});
      }
      output.push({config:cfg.id,worldId:wid,pilotSeed,
        genesisDeaths:checkpoint.genesisDeaths,
        checkpointPull27:Math.tanh(checkpoint.lineage.S[2]+checkpoint.lineage.D[2]),
        initialLineageSha256:checkpoint.lineageSha256,
        intactVsLesionNoCuePathDiff:baseInt.moves.filter((v,i)=>v!==baseLes.moves[i]).length,
        results});
    }
  }finally {
    fs.unlinkSync(temp);
  }
}
const all=output.flatMap(v=>v.results.map(r=>({...r,config:v.config,worldId:v.worldId})));
const summary={status:'STUDIO08_S1_PILOT_ONLY_ELIGIBILITY_SCREEN_NOT_SCIENCE',
  sourceCommit:'28312116dd17cc6191216de88894e8de293630ff',
  pilotOnly:true,freshRegisteredS1WorldsUsed:0,
  originalConfigurations:CONFIGS,shortDiagnosticExposures:{seasons:2,ticksPerSeason:1000},
  pilotWorlds:WORLDS,sourceEdits:edits,
  summaryByConfig:CONFIGS.map(cfg=>{
    const rows=all.filter(x=>x.config===cfg.id);
    const scenarioIntactNoCue=rows.filter(x=>x.scenario==='intact'&&x.arm==='no_cue');
    const active=rows.filter(x=>x.arm!=='no_cue');
    return {config:cfg.id,
      totalZone2OpportunitiesInNoCueIntact:scenarioIntactNoCue.reduce((n,x)=>n+x.zone2Opportunities,0),
      totalZone2OpportunitiesInAllArms:rows.reduce((n,x)=>n+x.zone2Opportunities,0),
      totalCueHitsOpenExitInAllSensorArms:active.reduce((n,x)=>n+x.cueHitsAnAvailableExit,0),
      totalTransitionChangesRelativeToNoCue:active.reduce((n,x)=>n+x.differenceFromNoCueTransitions,0),
      lesionOptionsExposed:rows.filter(x=>x.scenario==='lesion').reduce((n,x)=>n+x.appliedLesionExitOptions,0),
      pilotWorldsWithAnySensorPathEffect:new Set(active.filter(x=>x.differenceFromNoCueTransitions>0).map(x=>x.worldId)).size
    };
  }),
  rows:output,
  sourceEvidenceNote:'A diagnostic config screen on previously used pilot seeds; changing genesis/config and horizon makes this a NEW exploratory feasibility assay. Never pool with registered 32-world S1.',
  noFullRawTraceFilesArchived:true};
fs.writeFileSync(gpath('PILOT_ONLY_FEASIBILITY_REPORT.json'),JSON.stringify(summary,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:summary.status,
  aggregates:summary.summaryByConfig,
  artifact:'_studio08_pilotonly_screen/PILOT_ONLY_FEASIBILITY_REPORT.json'}));
