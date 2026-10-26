// STUDIO09 E1 — engineering integration of committed Studio01-04 model + META1 policy.
// The original META1 and Studio01-04 source are read-only parents; this is a new experiment.
// No registered E1-W world may run before a separate final source/protocol seal.
import {e1StructuralVariants,E1PlasticReceptor} from './e1_receptor_plasticity.mjs';
import {e1WorldSeed,e1EncounterInput,e1TransferInput} from './e1_outside_tapes.mjs';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { createHash } from 'node:crypto';
import { closedCircuitSensorCandidates, SENSOR_IDS } from '../../studio08/code/closed_circuit_sensors.mjs';
import { S1LearningCueGate, S1_CUE_STRENGTH, S1_REWARD_WINDOW } from '../../studio08/code/learning_cue_gate.mjs';

const EDGES = ['0>9','1>8','2>7','3>6','4>5','1>2','2>4','4>7','7>8','8>9','9>1'];
const a = 0.002, A = 1, wV = 0.5, wH = 0.35, lamS = 0.002, kappa = 0.0005, lamD = 0.00005, H = 24, eta = 1 / 8;
const GENESIS_GENERATIONS = 24, GENESIS_CAP = 5000;
const SEASON_TICKS = 5000, SEASONS = 7, LESION = -5, LESION_EDGE = '2>7';
const ARMS = ['adaptive','round_robin','no_cue'];
const SCENARIOS = ['intact','lesion'];
const key = (x, y) => `${x}>${y}`;
const zero = () => Object.fromEntries(EDGES.map(e => [e, 0]));
const sha = s => createHash('sha256').update(s).digest('hex');
const fail = m => { throw new Error(m); };

function finalExcursion(z) {
  const ta = z.length - 1;
  for (let t = Math.max(0, ta - H); t < ta; t++) {
    const th = new Set(t > 0 ? z.slice(Math.max(0, t - H), t) : [z[0]]);
    if (th.has(z[t + 1])) continue;
    let ok = true; for (let s = t + 1; s <= ta; s++) if (th.has(z[s])) { ok = false; break; }
    if (ok) { const e = new Set(); for (let s = t; s < ta; s++) e.add(key(z[s], z[s + 1])); return [...e]; }
  }
  return [key(z[ta - 1], z[ta])];
}
function refrain(z, t) {
  const th = new Set(t > 0 ? z.slice(Math.max(0, t - H), t) : [z[0]]);
  if (th.has(z[t + 1])) return 0;
  for (let s = t + 2; s <= t + H; s++) if (th.has(z[s])) {
    const prev = new Set(); for (let u = Math.max(0, t - H); u < t; u++) prev.add(key(z[u], z[u + 1]));
    const exc = new Set(); for (let u = t; u < s; u++) exc.add(key(z[u], z[u + 1]));
    let n = 0; for (const e of exc) if (!prev.has(e)) n++;
    return n / 11;
  }
  return 0;
}
// One Studio 03 tick of lineage bookkeeping after a transition; returns true on death.
function afterTransition(L, z, i, from, to) {
  const e = key(from, to); if (e in L.S) L.S[e] += a;
  for (const f of EDGES) { const s = L.S[f]; L.S[f] = s * (1 - lamS); L.D[f] = L.D[f] + kappa * s - lamD * L.D[f]; }
  if (to === 5) {
    for (const f of finalExcursion(z)) { L.S[f] += A; L.V[f] += eta * (-1 - L.V[f]); }
    return true;
  }
  const t = i - H;
  if (t >= 0) { const ek = key(z[t], z[t + 1]); if (ek in L.V) L.V[ek] += eta * (refrain(z, t) - L.V[ek]); }
  return false;
}
const lineageJson = L => JSON.stringify({ V: EDGES.map(e => L.V[e]), S: EDGES.map(e => L.S[e]), D: EDGES.map(e => L.D[e]) });

async function loadRuntime(dir) {
  return (await import(`${dir}/substrate/ameliaNumogramSubstrateRuntime.ts`)).AmeliaNumogramSubstrateRuntime;
}

async function genesis(dir, worldId, seedHex, out) {
  const expected=e1WorldSeed(worldId);
  if (seedHex !== expected) fail('seed does not match registered derivation');
  const R = await loadRuntime(dir);
  const L = { V: zero(), S: zero(), D: zero() };
  let deaths = 0;
  for (let g = 0; g < GENESIS_GENERATIONS; g++) {
    const r = new R();
    r.exitBonus = (x, y) => wV * L.V[key(x, y)] + wH * Math.tanh(L.S[key(x, y)] + L.D[key(x, y)]);
    const z = [r.getCurrentZone()];
    for (let i = 1; i <= GENESIS_CAP; i++) {
      const from = z.at(-1); const to = r.step(`S1G|${seedHex}|${g}|${i}`).lastTransition.to; z.push(to);
      if (afterTransition(L, z, i, from, to)) { deaths++; break; }
    }
  }
  const body = lineageJson(L);
  const ck = { schema: 'STUDIO09_E1_SOURCE_GENESIS_V1', worldId, seedHex, generations: GENESIS_GENERATIONS,
    cap: GENESIS_CAP, genesisDeaths: deaths, edges: EDGES, lineage: JSON.parse(body), lineageSha256: sha(body) };
  fs.writeFileSync(out, JSON.stringify(ck) + '\n');
  console.log(JSON.stringify({ worldId, lineageSha256: ck.lineageSha256, genesisDeaths: deaths }));
}

function asmTarget(zh, L) {
  const zones = zh.slice(-24).join(',');
  const v = EDGES.map(e => L.V[e].toFixed(6)).join(',');
  const h = EDGES.map(e => (L.S[e] + L.D[e]).toFixed(6)).join(',');
  return parseInt(sha(`SELF|${zones}|${v}|${h}`).slice(0, 2), 16) % 10;
}


const deep=x=>JSON.parse(JSON.stringify(x));
const HASH_PATTERN=/^[0-9a-f]{64}$/;
function assertSourceCheckpoint(ck,worldId){
  if(ck.schema!=='STUDIO09_E1_SOURCE_GENESIS_V1'||ck.worldId!==worldId||
      ck.seedHex!==e1WorldSeed(worldId)||
      sha(JSON.stringify(ck.lineage))!==ck.lineageSha256)
    fail('E1 original model genesis and seed mismatch');
}
function originalStateFromCheckpoint(ck){
  const L={V:{},S:{},D:{}};
  EDGES.forEach((e,k)=>{
    L.V[e]=ck.lineage.V[k]; L.S[e]=ck.lineage.S[k];L.D[e]=ck.lineage.D[k];
  });
  return L;
}
function stateHash(obj){return sha(JSON.stringify(obj))}
const output=(p,obj)=>fs.writeFileSync(p,JSON.stringify(obj)+'\n',{flag:'wx'});
function compressedTrace(path,rows){
  const raw=rows.join('\n')+'\n';
  const gz=zlib.gzipSync(Buffer.from(raw),{level:9});
  fs.writeFileSync(path,gz,{flag:'wx'});
  return {traceSha256:sha(gz),jsonlSha256:sha(raw),tickCount:rows.length};
}
function buildSession(R,ck,mode) {
  if(!['feedback','fixed'].includes(mode))fail('invalid source-receiver arm');
  let L=originalStateFromCheckpoint(ck);
  let gate=new S1LearningCueGate('adaptive');
  let receptor=new E1PlasticReceptor(mode);
  let pending=new Map();
  let snaps=[];
  let life=0,steps=0,i=0,z,r,target=null,selectedSensor=null,extras=[],deaths=0;
  let zone2=0,zone27=0;
  const stamp=()=>({house:{surface:{...L.S},deep:{...L.D}},code:{V:{...L.V}}});
  const born=()=>{
    r=new R();z=[r.getCurrentZone()];i=0;
    r.exitBonus=(x,y)=>{
      const e=key(x,y);
      const code=wV*(L.V[e]??0),house=wH*Math.tanh((L.S[e]??0)+(L.D[e]??0));
      return code+house+(target!==null&&y===target?S1_CUE_STRENGTH:0);
    };
  };
  born();snaps.push(stamp());
  function step(input,tick,phase){
    const before=stateHash({L:lineageJson(L),life,i,zone:z.at(-1),
      gate:gate.exportState(),receptor:receptor.exportState()});
    const proposals=snaps.length>=25?receptor.propose(snaps.slice(-25)):
      SENSOR_IDS.map(id=>({id,target:null}));
    // Original META1 UCB selector remains unchanged in all arms.
    const decision=gate.choose(proposals);
    target=decision.target;selectedSensor=decision.sensor;
    if(decision.token){
      receptor.bindChoice(decision.token,selectedSensor);
      pending.set(decision.token,{start:gate.tick,edges:new Set()});
    }
    const from=z.at(-1),to=r.step(input).lastTransition.to;
    z.push(to);i++;steps++;
    if(from===2){zone2++;if(to===7)zone27++;}
    const edge=key(from,to),death=afterTransition(L,z,i,from,to);
    const settlements=[],structure=[];
    for(const value of pending.values())value.edges.add(edge);
    for(const [token,p] of [...pending]){
      if(death||gate.tick===p.start+S1_REWARD_WINDOW-1){
        const receipt=gate.settle(token,{
          observedAt:gate.tick,distinctEdges:p.edges.size,deathWithin24:death
        });
        const switchEvent=receptor.onSettled(receipt);
        settlements.push(receipt);
        if(switchEvent)structure.push(switchEvent);
        pending.delete(token);
      }
    }
    if(death){deaths++;life++;born()}
    snaps.push(stamp());if(snaps.length>25)snaps.shift();
    const after=stateHash({L:lineageJson(L),life,i,zone:z.at(-1),
      gate:gate.exportState(),receptor:receptor.exportState()});
    return {schema:'STUDIO09_E1_MODEL_STEP_V1',tick,phase,sourceInput:input,
      from,to,death,selectedSensor,target,
      cueMagnitude:target===null?0:S1_CUE_STRENGTH,
      candidateReadouts:proposals,creditsSettled:settlements,
      structuralChanges:structure,preStateDigest:before,postStateDigest:after,
      pendingRewards:pending.size,life,zone2,zone27};
  }
  function exportSession(){
    return deep({
      schema:'STUDIO09_E1_FULL_BOUNDARY_STATE_V1',worldId:ck.worldId,
      seedHex:ck.seedHex,sourceLineageSha256:ck.lineageSha256,mode,
      L,life,steps,i,z,zone2,zone27,deaths,target,selectedSensor,
      snapshots:snaps,gate:gate.exportState(),receptor:receptor.exportState(),
      pending:[...pending].map(([token,p])=>({
        token,start:p.start,edges:[...p.edges]
      })),
      runtime:r.exportState()
    });
  }
  function importSession(checkpoint){
    if(checkpoint.schema!=='STUDIO09_E1_FULL_BOUNDARY_STATE_V1'||
      checkpoint.worldId!==ck.worldId||checkpoint.seedHex!==ck.seedHex||
      checkpoint.sourceLineageSha256!==ck.lineageSha256||
      checkpoint.mode!==mode)fail('unverified full-source boundary checkpoint');
    L=deep(checkpoint.L);life=checkpoint.life;steps=checkpoint.steps;i=checkpoint.i;
    z=deep(checkpoint.z);zone2=checkpoint.zone2;zone27=checkpoint.zone27;
    deaths=checkpoint.deaths;target=checkpoint.target;
    selectedSensor=checkpoint.selectedSensor;
    snaps=deep(checkpoint.snapshots);
    gate=new S1LearningCueGate('adaptive').importState(checkpoint.gate);
    receptor=new E1PlasticReceptor(mode).importState(checkpoint.receptor);
    pending=new Map(checkpoint.pending.map(p=>[p.token,{
      start:p.start,edges:new Set(p.edges)
    }]));
    r=new R();r.importState(checkpoint.runtime);
    r.exitBonus=(x,y)=>{
      const e=key(x,y);
      return wV*(L.V[e]??0)+wH*Math.tanh((L.S[e]??0)+(L.D[e]??0))+
        (target!==null&&y===target?S1_CUE_STRENGTH:0);
    };
  }
  function freezeTransfer(reset=false) {
    // First censor all outstanding encounter windows identically in both forks.
    const cancelled=pending.size;
    pending.clear();
    const g=gate.exportState();g.pending={};
    gate.importState(g);
    const s=receptor.exportState();s.pending={};
    receptor.importState(s);
    receptor.freezeTransfer();
    const stateBeforeReset=exportSession();
    const resetRecord=reset?receptor.resetWiring():null;
    return {cancelled,stateBeforeResetDigest:stateHash(stateBeforeReset),
      intervention:resetRecord};
  }
  return {step,exportSession,importSession,freezeTransfer,
    measures:()=>({deaths,life,steps,zone2,zone27,receiver:receptor.exportState(),
      gate:gate.exportState(),lineage:deep(L)})};
}
async function encounter(runtimePath,genesisPath,worldId,order,mode,
  checkpointOut,traceOut,summaryOut) {
  if(!['ordered','permuted'].includes(order))fail('invalid encounter tape');
  const ck=JSON.parse(fs.readFileSync(genesisPath,'utf8'));
  assertSourceCheckpoint(ck,worldId);
  const R=await loadRuntime(runtimePath);
  const session=buildSession(R,ck,mode);
  const rows=[];
  for(let t=1;t<=10000;t++){
    const season=Math.floor((t-1)/5000)+1,local=((t-1)%5000)+1;
    const source=e1EncounterInput(ck.seedHex,season,local,order);
    rows.push(JSON.stringify(session.step(source,t,'ENCOUNTER')));
  }
  const boundary=session.exportSession();
  output(checkpointOut,{...boundary,order,
    checkpointDigest:stateHash(boundary)});
  const trace=compressedTrace(traceOut,rows);
  output(summaryOut,{schema:'STUDIO09_E1_ENCOUNTER_RECEIPT_V1',
    worldId,order,mode,genesisSha256:sha(fs.readFileSync(genesisPath)),
    checkpointSha256:sha(fs.readFileSync(checkpointOut)),
    ...trace,metrics:session.measures(),
    scientificStatus:'ENGINEERING_ONLY_UNTIL_PRECOMMIT_SEALED'});
  console.log(JSON.stringify({phase:'encounter',worldId,order,mode,
    switches:session.measures().receiver.switches,...trace}));
}
async function transfer(runtimePath,genesisPath,checkpointPath,worldId,
  intervention,tracePath,summaryOut) {
  if(!['carry','reset'].includes(intervention))fail('transfer must be carry/reset');
  const ck=JSON.parse(fs.readFileSync(genesisPath,'utf8'));
  assertSourceCheckpoint(ck,worldId);
  const full=JSON.parse(fs.readFileSync(checkpointPath,'utf8'));
  if(full.worldId!==worldId||full.mode!=='feedback'||
    full.checkpointDigest!==stateHash((({order,checkpointDigest,...r})=>r)(full)))
    fail('transfer requires intact plastic encounter boundary');
  const R=await loadRuntime(runtimePath);
  const session=buildSession(R,ck,'feedback');
  session.importSession(full);
  // The checkpoint imported into either fork is EXACTLY identical before
  // changing the 3 receptor bits; all original runtime/house/gate copied.
  const equalityCheck=stateHash(session.exportSession());
  if(equalityCheck!==full.checkpointDigest)
    fail('FULL FORK parity violated before receptor intervention');
  const mark=session.freezeTransfer(intervention==='reset');
  const rows=[];
  let prior=0;
  for(let t=1;t<=2000;t++){
    const probe=Math.floor((t-1)/1000)+1,local=((t-1)%1000)+1;
    const source=e1TransferInput(ck.seedHex,probe,local);
    rows.push(JSON.stringify(session.step(source,10000+t,'TRANSFER_'+probe)));
  }
  const trace=compressedTrace(tracePath,rows);
  output(summaryOut,{schema:'STUDIO09_E1_TRANSFER_RECEIPT_V1',
    worldId,intervention,boundaryDigest:equalityCheck,
    censoredBeforeTransfer:mark.cancelled,
    preInterventionFullStateDigest:mark.stateBeforeResetDigest,
    wiringIntervention:mark.intervention,
    checkpointSha256:sha(fs.readFileSync(checkpointPath)),
    ...trace,metrics:session.measures(),
    scientificStatus:'ENGINEERING_ONLY_UNTIL_PRECOMMIT_SEALED'});
  console.log(JSON.stringify({phase:'transfer',worldId,intervention,
    deaths:session.measures().deaths,...trace}));
}
const [cmd,...args]=process.argv.slice(2);
if(cmd==='genesis')await genesis(...args);
else if(cmd==='encounter')await encounter(...args);
else if(cmd==='transfer')await transfer(...args);
else fail('usage: genesis|encounter|transfer');
