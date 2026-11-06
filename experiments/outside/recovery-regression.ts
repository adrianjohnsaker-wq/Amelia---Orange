/** Offline regression, invoked with a saved state and its original ledger. */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { OutsideRecoveryRuntime } from '../../src/outside/OutsideRecoveryRuntime.ts';
import { appendRecoveryJournal, enrichRecoveryActions, originalOffer, verifyRecoveryJournal } from '../../src/outside/OutsideRecoveryJournal.ts';
import type { OutsideStreamRecord } from '../../src/outside/types.ts';

if (!process.argv[2] || !process.argv[3]) throw new Error('Supply state.json and the initial ledger.json.');
const saved = JSON.parse(readFileSync(process.argv[2], 'utf8')).runtimeState;
const records:OutsideStreamRecord[] = JSON.parse(readFileSync(process.argv[3], 'utf8')).records;
const runtime = new OutsideRecoveryRuntime();
runtime.importState(structuredClone(saved));
const queue = runtime.getDeferredInputs(), history = saved.memoryState.events.map((e:{eventDigest:string})=>e.eventDigest);
for (const input of queue) assert.equal(originalOffer(records,input).initialDisposition,'DEFER');
const result = runtime.drainDeferred();
const actions=runtime.getRecoveryActions(),admissions=actions.filter(a=>a.kind==='ADMISSION');
assert.equal(result.remaining,0);
assert.deepEqual(admissions.map(a=>a.eventId),queue.map(a=>a.eventId));
assert.deepEqual(runtime.getMemory().getEvents().slice(0,history.length).map(e=>e.eventDigest),history);
const receipts=enrichRecoveryActions(actions,records);
for(const action of receipts.filter(a=>a.kind==='ADMISSION')) assert.ok((action.originalOffer as {capturedAt:string}).capturedAt);
const journal=appendRecoveryJournal('',[{kind:'TEST_START'},...receipts,{kind:'TEST_COMPLETE'}]);
assert.equal(verifyRecoveryJournal(journal).count,receipts.length+2);
assert.throws(()=>verifyRecoveryJournal(journal.replace('TEST_START','TEST_ALTERED')));
assert.equal(runtime.getGovernor().hardLimitViolationCount,0);
console.log(JSON.stringify({startingQueue:queue.length,drainSteps:result.steps,
  admissions:admissions.length,consolidations:actions.filter(a=>a.kind==='CONSOLIDATION').length,
  preservedPFMEvents:history.length,finalQueue:runtime.getDeferredInputs().length,
  receiptChainRecords:verifyRecoveryJournal(journal).count,hardLimitViolations:runtime.getGovernor().hardLimitViolationCount}));
