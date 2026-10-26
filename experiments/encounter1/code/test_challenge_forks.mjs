import assert from 'node:assert/strict';
import {makeChallengeFork as fork} from './challenge_forks.mjs';
const start={receiver:{scores:[0]},house:{S:[0],D:[0]},code:{V:[0]},substrate:{state:[42]},externalHistory:['old']};
const end={receiver:{scores:[3]},house:{S:[2],D:[1]},code:{V:[4]},substrate:{state:[71]},externalHistory:['new']};
const original=structuredClone(end);
const a=fork(end,start,'carry'),b=fork(end,start,'receiver_reset'),c=fork(end,start,'house_code_reset'),d=fork(end,start,'double_reset');
assert.deepEqual(a,end);assert.deepEqual(b.receiver,start.receiver);assert.deepEqual(b.house,end.house);
assert.deepEqual(c.receiver,end.receiver);assert.deepEqual(c.house,start.house);assert.deepEqual(c.code,start.code);
assert.deepEqual(d.receiver,start.receiver);assert.deepEqual(d.house,start.house);assert.deepEqual(d.code,start.code);
for(const f of [a,b,c,d]){assert.deepEqual(f.substrate,end.substrate);assert.deepEqual(f.externalHistory,end.externalHistory)}
a.house.S[0]=99;assert.deepEqual(end,original);
assert.throws(()=>fork(end,start,'unknown'),/unknown reset/);
assert.throws(()=>fork(end,{},'carry'),/incomplete checkpoint/);
console.log(JSON.stringify({status:'ENCOUNTER1_SELECTIVE_RESET_CONTRACT_PASS',forks:4,scienceRuns:0}));
