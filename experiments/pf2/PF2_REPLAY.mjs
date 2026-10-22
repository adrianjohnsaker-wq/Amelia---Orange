/**
 * PF2 full, read-only, independently replayed experimental history.
 * Assumes PF2_LIVE_CHECK.py already verified each C1 BLS receipt, every
 * external RFC3161 chunk token and append-only event hash chain.
 * Replays same nine matched streams from unmodified canonical initial state.
 * NO network access, no intake, no writes to existing scientific files.
 */
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {PF2NinePairs} from './PF2_RECEIVER_CORE.mjs';
const dir='experiments/pf2/live/';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const g=read(dir+'GENESIS.json'),s=read(dir+'STATE.json');
assert.equal(g.schema,'PF2_LIVE_GENESIS_V1');
assert.equal(s.genesisDigest,g.genesisDigest);
assert.equal(g.notificationsEnabled,false);
const engine=new PF2NinePairs();
let count=0,previous=g.genesisDigest;
const names=readdirSync(dir+'chunks').filter(x=>/^\d{8}\.json$/.test(x)).sort();
for(const name of names){
 const chunk=read(dir+'chunks/'+name);
 assert.equal(chunk.startTick,count);
 assert.equal(chunk.previousHead,previous);
 for(const row of chunk.rows){
  assert.equal(row.tick,count);
  assert.equal(row.round,g.R0+20*count);
  assert.equal(row.previous,previous);
  const reproduced=engine.processVerified(row.round,row.randomness);
  assert.deepEqual(reproduced.events,row.armEvents,
   'PF2_EXACT_STATEFUL_REPLAY_DIFFERENCE_TICK_'+count);
  previous=row.digest;count++;
 }
 assert.equal(previous,chunk.finalHead);
}
assert.equal(count,s.admittedTicks);
assert.equal(previous,s.headDigest);
assert.deepEqual(engine.exportState(),s.engine,'PF2_FINAL_ENGINE_STATE_REPLAY_MISMATCH');
console.log('PF2_REPLAY_ALL_INDIVIDUAL_TRANSITIONS_AND_FINAL_18_ARM_STATE_BYTE_IDENTICAL_PASS',
 JSON.stringify({ticks:count,verifiedEvents:count*18,sealBatches:names.length,
  noNotifications:true,noLiveFetch:true}));
