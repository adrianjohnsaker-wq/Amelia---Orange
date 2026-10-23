/**
 * PF2 Capture & Selection Atlas: read-only derived analysis.
 * No live beacon, lease, app state or scientific source mutation.
 * Existing registered PF2 predictions remain unchanged.
 *
 * RUN: npx tsx experiments/pf2/atlas/PF2_CAPTURE_SELECTION_ATLAS.mjs /tmp/pf2-atlas
 * Prerequisite for independent *cryptographic* certification on the SAME prefix:
 *   python3 experiments/pf2/PF2_LIVE_CHECK.py
 *   npx tsx experiments/pf2/PF2_REPLAY.mjs
 */
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,sep,join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {PF2NinePairs} from '../PF2_RECEIVER_CORE.mjs';
import {pf2InputForArm} from '../PF2_REFERENCE_INPUT.mjs';
import {cueOf} from '../PF2_RECEIVER_CORE.mjs';

const ROOT='experiments/pf2/live';
const read = p => JSON.parse(readFileSync(p,'utf8'));
const sha = s => createHash('sha256').update(s).digest('hex');
const expectedNames=Array.from({length:9},(_,k)=>k===0?'C':'R'+String(k).padStart(2,'0'));
const G=read(join(ROOT,'GENESIS.json')),S=read(join(ROOT,'STATE.json'));
assert.equal(G.schema,'PF2_LIVE_GENESIS_V1');
assert.equal(G.notificationsEnabled,false);
assert.equal(S.genesisDigest,G.genesisDigest);
assert.equal(S.status,'running');
const outDir=resolve(process.argv[2]||'/tmp/pf2-capture-selection-atlas');
assert(outDir.startsWith('/tmp/')||outDir.startsWith('/mnt/data/'),
  'OUTPUT_MUST_BE_OUTSIDE_REPOSITORY_IN_TMP_OR_MNT_DATA');
const files=readdirSync(join(ROOT,'chunks')).filter(n=>/^\d{8}\.json$/.test(n)).sort();
const engine=new PF2NinePairs();
const records=[];
const summary={schema:'PF2_CAPTURE_SELECTION_ATLAS_EXPLORATORY_V1',
  status:'EXPLORATORY_READ_ONLY_NOT_REGISTERED_NOT_INTERIM_P2',
  source:{genesis:G.genesisDigest,R0:G.R0,referenceDomain:G.referenceDomain,
    inputHead:S.headDigest,expectedAdmittedTicks:S.admittedTicks,
    expectedBatches:S.sealedBatchCount},timing:{firstRound:null,lastRound:null},
  operational:{archivedChoiceEvents:0,matchedEventReplays:0,allEvents:0,
    pairedArms:9,batches:files.length,ticks:0},
  byMode:{},byArm:{},firstDivergence:{},
  boundaries:['same-state selector-only','PFM history held fixed',
   'alternative arms are keyed transforms of same physical beacon',
   'no inference for P2-1 or P2-2','not a test of external independent agency']};
function counters(){return {choices:0,cueEligible:0,cueFollowed:0,
 cuePivotal:0,vPivotal:0,eitherPivotal:0,bothPivotal:0,
 jointOnly:0,neitherPivotal:0,nonzeroV:0,cuePivotalAndV:0,
 deaths:0,positiveRefrains:0,edgeCounts:{},cuePitChoices:0,cuePitFollowed:0,
 cueOtherChoices:0,cueOtherFollowed:0,uncuedChoices:0,
 distinctEdges:0,divergentTicks:0,firstDivergentTick:null};}
const distinct={};
function score(g,z,b,cue,V,incCue,incV) {
 // The frozen canonical selector expression, with V strictly LAST.
 return g.flux*(1-g.resistance)
   +(b[g.target]||0)*0.4
   +z[g.target].activation*0.2+Math.cos(z[g.target].phaseAngle)*0.1
   +(incCue&&cue===g.target?0.35:0)
   +(incV?0.5*(V[String(g.source)+'>'+String(g.target)]||0):0);
}
function choose(gates,values) {
 let max=-Infinity,chosen=null;
 for(let i=0;i<gates.length;i++){const v=values[i];if(v>max){max=v;chosen=gates[i].target;}}
 return chosen;
}
let count=0,head=G.genesisDigest;
for(const name of files) {
 const chunk=read(join(ROOT,'chunks',name));
 assert.equal(chunk.verifiedStatus,'PASS');
 assert.equal(chunk.startTick,count);
 assert.equal(chunk.previousHead,head);
 assert.equal(chunk.genesisDigest,G.genesisDigest);
 assert.equal(chunk.count,chunk.rows.length);
 for(const row of chunk.rows) {
  assert.equal(row.tick,count);
  assert.equal(row.round,G.R0+20*count);
  assert.equal(row.previous,head);
  assert.equal(row.verification,'REAL_QUICKNET_BLS_VERIFIED_WITH_PINNED_C1_PF1');
  assert.equal(sha(Buffer.from(row.signature,'hex')),row.randomness);
  assert.equal(row.armEvents.length,18);
  summary.timing.firstRound??=row.round;
  summary.timing.lastRound=row.round;
  const captures=new Array(18).fill(null);
  const undo=[];
  try {
   for(let i=0;i<18;i++){
    const line=engine.receivers[i],rt=line.runtime;
    const from=rt.getCurrentZone();
    const values={...line.V};
    const input=pf2InputForArm(row.randomness,line.k);
    const cue=cueOf(input);
    const trait=rt.traitEvolution;
    const original=trait.evolveStep;
    const path=[...line.lifeZones];
    trait.evolveStep=function(...args){
     const result=original.apply(this,args);
     if(from===1||from===2||from===4){
      const zones=args[0],gates=args[1],bias=args[4];
      const open=gates.filter(g=>g.isOpen&&g.source===from);
      assert.equal(open.length,2,'EXPECTED_TWO_CANONICAL_EXITS');
      const opts={
       actual:open.map(g=>score(g,zones,bias,cue,values,true,true)),
       cueOff:open.map(g=>score(g,zones,bias,cue,values,false,true)),
       vOff:open.map(g=>score(g,zones,bias,cue,values,true,false)),
       bothOff:open.map(g=>score(g,zones,bias,cue,values,false,false))
      };
      const chosen=Object.fromEntries(Object.entries(opts)
        .map(([k,v])=>[k,choose(open,v)]));
      captures[i]={cue,from,values,options:open.map((g,j)=>({
        edge:String(from)+'>'+String(g.target),target:g.target,gateId:g.id,
        flux:g.flux,resistance:g.resistance,activation:zones[g.target].activation,
        phaseAngle:zones[g.target].phaseAngle,pfmBias:bias[g.target]||0,
        cueBonus:cue===g.target?0.35:0,VBonus:0.5*(values[String(from)+'>'+String(g.target)]||0),
        actualScore:opts.actual[j],noCueScore:opts.cueOff[j],
        noVScore:opts.vOff[j],neitherScore:opts.bothOff[j]})),
        selected:chosen,lifePathBefore:path};
     }
     return result;
    };
    undo.push(()=>{trait.evolveStep=original;});
   }
   const replayed=engine.processVerified(row.round,row.randomness);
   assert.deepEqual(replayed.events,row.armEvents,
      'EVENT_REPLAY_MISMATCH_AT_TICK_'+count);
  } finally {
   for(const f of undo.reverse())f();
  }
  const byPair={};
  for(let i=0;i<18;i++) {
   const e=row.armEvents[i],mode=e.mode,id=e.armId+'-'+mode;
   assert.equal(e.armId,expectedNames[Math.floor(i/2)]);
   assert.equal(mode,i%2===0?'learner':'unchanged');
   const t=summary.byMode[mode]??=counters(),a=summary.byArm[id]??=counters();
   const edge=String(e.fromZone)+'>'+String(e.toZone);
   (distinct[id]??=new Set()).add(edge);
   for(const q of [t,a]){
    q.edgeCounts[edge]=(q.edgeCounts[edge]||0)+1;
    if(e.death)q.deaths++;
    if(e.refrainOutcome?.outcome>0)q.positiveRefrains++;
   }
   if(e.choicePoint) {
    const c=captures[i];assert(c,'MISSING_SELECTOR_CAPTURE_'+id+'_'+count);
    assert.equal(c.cue,e.cueZone);
    assert.equal(c.selected.actual,e.toZone,
       'RECONSTRUCTED_ACTUAL_EXIT_MISMATCH_'+id+'_'+count);
    for(const [edgeKey,term] of Object.entries(e.valueTerms)){
     const opt=c.options.find(x=>x.edge===edgeKey);
     assert(opt,'MISSING_VALUE_TERM_EDGE');
     assert.equal(opt.VBonus,term,'V_BONUS_MISMATCH_'+id+'_'+count);
    }
    const cf=c.selected;
    const cuePivotal=cf.actual!==cf.cueOff;
    const vPivotal=cf.actual!==cf.vOff;
    const jointOnly=!cuePivotal&&!vPivotal&&cf.actual!==cf.bothOff;
    const nonzeroV=c.options.some(x=>x.VBonus!==0);
    const pit=e.fromZone===1?2:e.fromZone===2?4:5;
    for(const q of [t,a]){
     q.choices++;q.cueEligible+=Number(e.cueAmongOpenExits);
     q.cueFollowed+=Number(e.followedCue);
     q.cuePivotal+=Number(cuePivotal);
     q.vPivotal+=Number(vPivotal);
     q.eitherPivotal+=Number(cuePivotal||vPivotal);
     q.bothPivotal+=Number(cuePivotal&&vPivotal);
     q.jointOnly+=Number(jointOnly);
     q.neitherPivotal+=Number(!cuePivotal&&!vPivotal&&!jointOnly);
     q.nonzeroV+=Number(nonzeroV);
     q.cuePivotalAndV+=Number(cuePivotal&&nonzeroV);
     q.uncuedChoices+=Number(!e.cueAmongOpenExits);
     q.cuePitChoices+=Number(e.cueAmongOpenExits&&e.cueZone===pit);
     q.cuePitFollowed+=Number(e.cueAmongOpenExits&&e.cueZone===pit&&e.followedCue);
     q.cueOtherChoices+=Number(e.cueAmongOpenExits&&e.cueZone!==pit);
     q.cueOtherFollowed+=Number(e.cueAmongOpenExits&&e.cueZone!==pit&&e.followedCue);
    }
    summary.operational.archivedChoiceEvents++;
    records.push({schema:'PF2_CAPTURE_DECISION_V1',
      sourceChunk:name,sourceTick:row.tick,sourceRound:row.round,
      sourceUnixTime:row.roundTime,sourceRowDigest:row.digest,
      rawRandomnessHex:row.randomness,rawBlsSignatureHex:row.signature,
      arm:e.armId,mode:e.mode,lifePathThroughChosen:[...c.lifePathBefore,e.toZone],
      from:e.fromZone,to:e.toZone,cueZone:e.cueZone,
      cueEligible:e.cueAmongOpenExits,cueFollowed:e.followedCue,
      VBefore:c.values,exactOptions:c.options,selected:cf,
      cuePivotal,vPivotal,jointOnly,nonzeroV});
   } else {
    assert.equal(captures[i],null,'CAPTURED_NON_CHOICE');
   }
   if(i%2===0)byPair[e.armId]=[e];
   else {
    const learner=byPair[e.armId][0];
    const differ=learner.toZone!==e.toZone||learner.fromZone!==e.fromZone;
    if(differ){
     for(const mid of ['learner','unchanged']){
      const q=summary.byArm[e.armId+'-'+mid];
      q.divergentTicks++;
      q.firstDivergentTick??=row.tick;
     }
     summary.firstDivergence[e.armId]??={
       tick:row.tick,round:row.round,
       learner:{from:learner.fromZone,to:learner.toZone},
       unchanged:{from:e.fromZone,to:e.toZone},
       cue:e.cueZone,sourceRowDigest:row.digest
     };
    }
   }
  }
  summary.operational.allEvents+=18;
  summary.operational.matchedEventReplays+=18;
  head=row.digest;
  count++;
 }
 assert.equal(head,chunk.finalHead,'CHUNK_HEAD_MISMATCH');
}
assert.equal(count,S.admittedTicks,'PREFIX_TICK_COUNT_MISMATCH');
assert.equal(head,S.headDigest,'HEAD_DIGEST_MISMATCH');
assert.equal(files.length,S.sealedBatchCount);
assert.deepEqual(engine.exportState(),S.engine,'EXACT_FINAL_ENGINE_MISMATCH');
summary.operational.ticks=count;
for(const [id,edgeSet] of Object.entries(distinct))summary.byArm[id].distinctEdges=edgeSet.size;
for(const [mode,s] of Object.entries(summary.byMode)){
 const all=new Set();
 for(const [id,edges] of Object.entries(distinct))if(id.endsWith('-'+mode))
  for(const e of edges)all.add(e);
 s.distinctEdges=all.size;
}
summary.source.lastArchiveDigest=head;
summary.source.sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
summary.method='exact pre-choice post-evolution selector scores, two single-factor ablations and joint ablation; no replay-state perturbation';
summary.outcome='LOCAL_CAUSAL_ATTRIBUTION_COMPUTED_NOT_AGENCY_PROOF_NOT_P2_INTERIM';
mkdirSync(outDir,{recursive:true});
writeFileSync(join(outDir,'SUMMARY.json'),JSON.stringify(summary,null,2)+'\n');
writeFileSync(join(outDir,'CHOICES.jsonl'),records.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log('PF2_CAPTURE_SELECTION_ATLAS_READ_ONLY_REPLAY_PASS',
 JSON.stringify({ticks:count,events:summary.operational.allEvents,
 choices:summary.operational.archivedChoiceEvents,
 head,output:outDir,byMode:summary.byMode}));
