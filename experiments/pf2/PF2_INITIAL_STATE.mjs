/** PF2 approved genesis initializes 18 independent freshly born receivers,
 * and the exact unchanged PF1 scanner in memory. No beacon admission.
 * Invoked solely from the prospective genesis workflow, never at R0.
 */
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {PF2NinePairs} from './PF2_RECEIVER_CORE.mjs';
import {PF2Pandemonium} from './PF2_PANDEMONIUM.mjs';
assert.equal(process.env.PF2_GENESIS_OPERATOR_APPROVED,'true');
assert.equal(process.env.DRIFT_C1_ENABLE_LIVE,'false');
const a=new PF2NinePairs();
const p=new PF2Pandemonium();
const obj={schema:'PF2_INITIAL_EIGHTEEN_LINEAGES_V1',engine:a.exportState(),
 pandemonium:p.exportState(),initialAdmittedTicks:0,
 referenceDomains:'PF2-REF-i|',liveInputConsumed:false,
 externalRoundFetched:false,notificationCount:0};
assert.equal(obj.engine.tick,0);
assert.equal(obj.engine.receivers.length,18);
assert.equal(Object.keys(obj.pandemonium.track).length,18);
assert(obj.engine.receivers.every(r=>r.lastTick===0 && r.birthTick===0 &&
 r.lifeZones.length===1 && r.lifeZones[0]===0 &&
 Object.values(r.V).every(x=>x===0)));
writeFileSync(process.env.PF2_INITIAL_STATE_FILE,JSON.stringify(obj,null,2)+'\n');
console.log('PF2_GENESIS_18_EMPTY_INDEPENDENT_RECEIVERS_AND_18_SCANNERS_PASS');
