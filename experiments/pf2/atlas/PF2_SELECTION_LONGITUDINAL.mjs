/**
 * PF-2 LONGITUDINAL SELECTION ATLAS — read-only observational analysis
 * Run AFTER PF2_CAPTURE_SELECTION_ATLAS.mjs produced a verified choices file.
 * No new beacon, no lease, no experimental amendments, no statistical tests.
 * Expects full input archive prefix on this analysis checkout.
 */
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';

const read=p=>JSON.parse(readFileSync(p,'utf8'));
const sha=s=>createHash('sha256').update(s).digest('hex');
const input='experiments/pf2/live';
const target=resolve(process.argv[2]||'/tmp/pf2-capture-selection-atlas');
assert(target.startsWith('/tmp/')||target.startsWith('/mnt/data/'),'OUTPUT_OUTSIDE_REPOSITORY');
const capture=read(join(target,'SUMMARY.json'));
const choices=readFileSync(join(target,'CHOICES.jsonl'),'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
const G=read(join(input,'GENESIS.json')),S=read(join(input,'STATE.json'));
assert.equal(capture.source.lastArchiveDigest,S.headDigest);
assert.equal(capture.source.genesis,G.genesisDigest);
assert.equal(capture.operational.ticks,S.admittedTicks);
assert.equal(capture.operational.archivedChoiceEvents,choices.length);
const byKey=new Map(choices.map(c=>[c.sourceTick+'|'+c.arm+'|'+c.mode,c]));
assert.equal(byKey.size,choices.length,'DUPLICATE_CHOICE_KEY');
const names=readdirSync(join(input,'chunks')).filter(x=>/^\d{8}\.json$/.test(x)).sort();
const EDGES=['0>9','1>8','2>7','3>6','4>5','1>2','2>4','4>7','7>8','8>9','9>1'];
const WINDOWS=4, nTicks=S.admittedTicks,windowSize=Math.ceil(nTicks/WINDOWS);
function fresh(){
 return {ticks:0,choices:0,cueEligible:0,cueFollowed:0,cuePivotal:0,vPivotal:0,
  nonzeroV:0,positiveRefrains:0,deaths:0,routeEdges:new Set(),pitWardChoices:0,
  contextRepeat:0,contextDifferentExit:0,contextVChanged:0,contextDifferentAndVChanged:0,
  vActivityAtChoices:{nonzero:0,zero:0},firstChoiceTick:null,lastChoiceTick:null,
  memoriesObservedAtBranch:0,contextRepeatVChangeSum:0,contextRepeatAbsVDiffSum:0};
}
const arm={};const windows=Array.from({length:WINDOWS},(_,i)=>({
  window:i+1,startTick:i*windowSize,endTick:Math.min(nTicks,(i+1)*windowSize)-1,
  learner:fresh(),unchanged:fresh(),byArm:{}
}));
const ongoing={};const deaths=[];const postDeath=[];const changedReturns=[];
const escapeId=(e)=>e.armId+'-'+e.mode;
const L1=(a,b)=>EDGES.reduce((sum,key)=>sum+Math.abs((a[key]||0)-(b[key]||0)),0);
const norm=a=>EDGES.reduce((sum,key)=>sum+Math.abs(a[key]||0),0);
function summarize(x){return {...x,routeEdges:[...x.routeEdges].sort(),contextRepeatMeanVDiff:
 x.contextRepeat?x.contextRepeatVChangeSum/x.contextRepeat:null};}
let count=0,head=G.genesisDigest,joinedChoices=0;
for (const name of names){
 const chunk=read(join(input,'chunks',name));
 assert.equal(chunk.startTick,count);assert.equal(chunk.previousHead,head);
 assert.equal(chunk.count,chunk.rows.length);assert.equal(chunk.verifiedStatus,'PASS');
 for(const row of chunk.rows){
  assert.equal(row.tick,count);assert.equal(row.round,G.R0+20*count);
  assert.equal(row.previous,head);
  const w=windows[Math.min(WINDOWS-1,Math.floor(row.tick/windowSize))];
  for(const e of row.armEvents){
   const id=escapeId(e),curr=arm[id]??=(fresh());
   const windowArm=w.byArm[id]??=(fresh());
   const wMode=w[e.mode];
   const recipients=[curr,windowArm,wMode];
   const state=ongoing[id]??={lastContext:{},openLifeStart:0,pendingDeath:null};
   for (const q of recipients){
    q.ticks++;q.routeEdges.add(e.fromZone+'>'+e.toZone);
    if(e.refrainOutcome?.outcome>0)q.positiveRefrains++;
   }
   if(e.choicePoint){
    const key=row.tick+'|'+e.armId+'|'+e.mode,c=byKey.get(key);
    assert(c,'ATLAS_CHOICE_MISSING_'+key);
    assert.equal(c.sourceRowDigest,row.digest);
    assert.equal(c.sourceRound,row.round);
    assert.equal(c.cueZone,e.cueZone);assert.equal(c.to,e.toZone);
    assert.equal(c.rawRandomnessHex,row.randomness);
    assert.equal(c.rawBlsSignatureHex,row.signature);
    assert.equal(c.selected.actual,e.toZone);
    joinedChoices++;
    const V=c.VBefore,vecNorm=norm(V);
    const ctx=e.fromZone+'|'+e.cueZone;
    const prior=state.lastContext[ctx];
    const routeDiffer=!!prior&&prior.to!==e.toZone;
    const diff=prior?L1(prior.V,V):0;
    for(const q of recipients){
      q.choices++;q.cueEligible+=Number(e.cueAmongOpenExits);
      q.cueFollowed+=Number(e.followedCue);
      q.cuePivotal+=Number(c.cuePivotal);
      q.vPivotal+=Number(c.vPivotal);
      q.nonzeroV+=Number(c.nonzeroV);
      q.memoriesObservedAtBranch+=Number(vecNorm>0);
      q.vActivityAtChoices[vecNorm>0?'nonzero':'zero']++;
      q.firstChoiceTick??=row.tick;q.lastChoiceTick=row.tick;
      q.pitWardChoices+=Number([1,2,4].includes(e.fromZone)&&
        e.toZone===(e.fromZone===1?2:e.fromZone===2?4:5));
      if(prior){
        q.contextRepeat++;
        q.contextDifferentExit+=Number(routeDiffer);
        q.contextVChanged+=Number(diff>1e-12);
        q.contextDifferentAndVChanged+=Number(routeDiffer&&diff>1e-12);
        q.contextRepeatVChangeSum+=diff;
      }
    }
    if(prior){
      changedReturns.push({schema:'PF2_SELECTION_RETURN_V1',
        tick:row.tick,round:row.round,roundTime:row.roundTime,
        rawRandomnessHex:row.randomness,sourceRowDigest:row.digest,
        arm:e.armId,mode:e.mode,context:ctx,priorTick:prior.tick,
        sameZoneAndCue:true,priorTo:prior.to,currentTo:e.toZone,
        exitChanged:routeDiffer,vL1Change:diff,
        cuePivotal:c.cuePivotal,vPivotal:c.vPivotal,
        actualLifePath:c.lifePathThroughChosen,
        interpretation:'Repeated context; descriptive, not necessarily memory-caused'});
    }
    state.lastContext[ctx]={tick:row.tick,to:e.toZone,V:{...V}};
    if(state.pendingDeath && e.mode==='learner'){
      const d=state.pendingDeath;
      assert.equal(c.lifePathThroughChosen[0],0,'POST_DEATH_NOT_FRESH_ZONE_0_'+id);
      const same=L1(d.finalV,V);
      postDeath.push({schema:'PF2_SELECTION_INHERITANCE_V1',arm:e.armId,mode:e.mode,
        priorDeathTick:d.tick,deathRound:d.round,deathCue:d.cue,
        deathFinalV:d.finalV,firstNewLifeChoiceTick:row.tick,
        VBeforeFirstChoice:V,inheritedEdgeValueL1Difference:same,
        exactCarryBeforeFirstChoice:same<1e-12,
        firstChoice:c.selected.actual,firstChoiceCue:e.cueZone,
        firstChoiceVPivotal:c.vPivotal,firstChoiceCuePivotal:c.cuePivotal,
        sourceRowDigest:row.digest});
      state.pendingDeath=null;
    }
   } else {
    assert(!byKey.has(row.tick+'|'+e.armId+'|'+e.mode),'UNEXPECTED_NONCHOICE_RECORD');
   }
   if(e.death){
    for(const q of recipients)q.deaths++;
    const deathRecord={arm:e.armId,mode:e.mode,deathTick:row.tick,
      round:row.round,roundTime:row.roundTime,cue:e.cueZone,
      bornTick:e.death.bornTick,length:e.death.length,
      finalExcursion:e.death.finalExcursion,finalV:e.death.finalV,
      finalVL1:norm(e.death.finalV),
      sourceRowDigest:row.digest,rawRandomnessHex:row.randomness};
    deaths.push(deathRecord);
    if(e.mode==='learner')state.pendingDeath={
      tick:row.tick,round:row.round,cue:e.cueZone,finalV:{...e.death.finalV}};
    state.lastContext={};state.openLifeStart=row.tick+1;
   }
  }
  head=row.digest;count++;
 }
 assert.equal(head,chunk.finalHead);
}
assert.equal(count,nTicks);assert.equal(head,S.headDigest);
assert.equal(joinedChoices,choices.length);
const result={
 schema:'PF2_LONGITUDINAL_SELECTION_ATLAS_DESCRIPTIVE_V1',
 status:'EXPLORATORY_ONLY_READONLY_NO_P2_INTERIM',
 interpretationStage:'VALIDATED_LOCAL_INFLUENCE_THEN_DESCRIBE_SELECTION_AGENCY_DEFERRED',
 source:{genesis:G.genesisDigest,prefixTicks:count,prefixHead:head,
   physicalBeaconR0:G.R0,windowSize,inputChunkCount:names.length,
   sourceCaptureArtifactSchema:capture.schema,
   sourceCaptureChoices:joinedChoices,
   sourceCommit:capture.source.sourceCommit},
 methods:{
  timeWindows:'equal-width chronological prefix windows; not independent samples',
  recurrence:'same lineage, same Numogram from-zone AND same cue; route changes are descriptive',
  vChange:'L1 of eleven inherited V values since previous same-zone/same-cue encounter within same life',
  capture:'uses the previous independently reconstructed same-state score attribution only',
  selection:'descriptive disposition persistence, rebirth transfer and changes in routes; no evolutionary fitness inference',
  scope:'all arms derive from same physical beacon; no independent physical agency test'},
 windows:windows.map(x=>({...x,learner:summarize(x.learner),
   unchanged:summarize(x.unchanged),
   byArm:Object.fromEntries(Object.entries(x.byArm).map(([k,v])=>[k,summarize(v)]))})),
 byArm:Object.fromEntries(Object.entries(arm).map(([k,v])=>[k,summarize(v)])),
 rebirth:{count:deaths.length,learnerCount:deaths.filter(x=>x.mode==='learner').length,
   learnerTransfersChecked:postDeath.length,records:postDeath},
 deaths,returnEvents:changedReturns.length,
 preservedLimits:['Only two learner deaths in prefix; no estimation of population-level selection advantage',
  'V is developmental memory, not the whole canonical ProcessFieldMemory',
  'No independence across nine derived tapes from one physical beacon',
  'Differences in recurrence do not by themselves identify a causal mechanism',
  'No temporal agency or retrocausality inference',
  'No change to registered day-30 P2 endpoints or live admission']
};
mkdirSync(target,{recursive:true});
writeFileSync(join(target,'LONGITUDINAL_SELECTION_SUMMARY.json'),JSON.stringify(result,null,2)+'\n');
writeFileSync(join(target,'RETURN_EVENTS.jsonl'),changedReturns.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log('PF2_LONGITUDINAL_SELECTION_READ_ONLY_PASS',JSON.stringify({
 ticks:count,choiceEvents:joinedChoices,returnEvents:changedReturns.length,
 deathEvents:deaths.length,learnerInheritanceChecks:postDeath.length,
 allInheritanceExact:postDeath.every(x=>x.exactCarryBeforeFirstChoice),
 windows:result.windows.map(w=>({
  ticks:w.endTick-w.startTick+1,first:w.startTick,last:w.endTick,
  learner:{choice:w.learner.choices,cuePivotal:w.learner.cuePivotal,
  vPivotal:w.learner.vPivotal,contextRepeat:w.learner.contextRepeat,
  contextDifferentExit:w.learner.contextDifferentExit,
  contextDifferentAndVChanged:w.learner.contextDifferentAndVChanged},
  unchanged:{choice:w.unchanged.choices,cuePivotal:w.unchanged.cuePivotal,
  contextRepeat:w.unchanged.contextRepeat,
  contextDifferentExit:w.unchanged.contextDifferentExit}
 })),
 prefixHead:head}));
