/** New E1C unit QA: distinct episode = one structural reward, never 24.
 * No scientific-world input. Original META1 choice gate not altered.
 */
import assert from 'node:assert/strict';
import {E1CEpisodeReceptor} from './e1c_episode_receptor.mjs';
import {SENSOR_IDS} from '../../studio08/code/closed_circuit_sensors.mjs';
const sensor=SENSOR_IDS[0];
const x=new E1CEpisodeReceptor();
let tick=0,observed=0;
const finish=(fatal)=>{
  const open=x.beginEpisode({tick:tick+1,sensor});
  let result=null;
  const len=fatal?1:24;
  for(let i=0;i<len;i++){
    tick++;
    result=x.completeTransition({tick,from:1,to:8,death:fatal&&i===len-1});
    if(i<len-1)assert.equal(result,null);
  }
  assert.equal(result.credit.id,open.id);
  assert.equal(result.credit.endTick,tick);
  assert.equal(result.credit.episodeTransitions,len);
  assert.equal(result.credit.death,fatal);
  observed++;
  return result;
};
// Seven safe, one death cannot produce a switch. One fatal episode produces
// exactly one new negative receptor observation independent of 24 UCB credits.
for(let i=0;i<5;i++)assert.equal(finish(false).structuralChange,null);
for(let i=0;i<2;i++)assert.equal(finish(true).structuralChange,null);
assert.equal(x.switches[sensor],0);
const result=finish(true);
assert.equal(result.structuralChange?.sensor,sensor);
assert.equal(result.structuralChange?.deathEpisodesInWindow,3);
assert.equal(result.structuralChange?.settledMean,-0.375);
assert.equal(x.switches[sensor],1);
assert.equal(x.fatalEpisodes,3);
assert.equal(x.completedEpisodes,8);
assert.equal(x.episodesBySensor[sensor],8);
assert.equal(observed,8);
assert.throws(()=>x.completeTransition({tick:tick+1,from:1,to:8,death:true}),/outside an episode/);
assert.throws(()=>x.beginEpisode({tick:tick+2,sensor}),/next unexposed/);
// Interrupt episode in a way the experiment must treat as censoring.
const unfinished=x.beginEpisode({tick:tick+1,sensor});
tick++;
assert.equal(x.completeTransition({tick,from:1,to:8,death:false}),null);
const cloned=new E1CEpisodeReceptor().importState(x.exportState());
assert.deepEqual(cloned.exportState(),x.exportState());
const censor=cloned.freezeAtBoundary(tick);
assert.equal(censor.id,unfinished.id);
assert.equal(censor.age,1);
assert.equal(cloned.censoredEpisodes,1);
const carried=new E1CEpisodeReceptor().importState(cloned.exportState());
const reset=new E1CEpisodeReceptor().importState(cloned.exportState());
assert.deepEqual(carried.exportState(),reset.exportState());
reset.resetWiring();
assert.equal(carried.wiring[sensor],1);
assert.equal(reset.wiring[sensor],0);
assert.throws(()=>x.resetWiring(),/frozen/);
assert.throws(()=>cloned.freezeAtBoundary(tick),/boundary contradicts|missing episode/);
const fixed=new E1CEpisodeReceptor('fixed');
fixed.beginEpisode({tick:1,sensor});
const fx=fixed.completeTransition({tick:1,from:1,to:8,death:true});
assert.equal(fx.structuralChange,null);
assert.equal(fixed.fatalEpisodes,1);
assert.equal(fixed.switches[sensor],0);
console.log(JSON.stringify({status:'STUDIO09_E1C_EPISODE_CREDIT_UNIT_QA_PASS_NOT_SCIENCE',
 uniqueCompletedEpisodes:8,independentDeathEpisodes:3,structuralFlips:1,
 duplicatedDeathCreditPrevented:true,exactForkRestoration:true,
 scienceWorldsExecuted:0}));
