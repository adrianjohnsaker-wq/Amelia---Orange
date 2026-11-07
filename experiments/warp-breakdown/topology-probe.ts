import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { OutsideRecoveryRuntime } from '../../src/outside/OutsideRecoveryRuntime.ts';
import { fullNumogramGates } from '../../src/core/fullNumogram.ts';

// Descriptive, offline probe: identical synthetic offers on copies of one
// historical checkpoint, with the saved gate list or its full extension.
// It never writes to the live ledger or alters the input snapshot.
const expected = 'c4329e0c5406d131e0dab3b9883774dc3c169b5701f663ec383a7eb767880ba3';
if (!process.argv[2]) throw new Error('Usage: node --import tsx experiments/warp-breakdown/topology-probe.ts PATH_TO_MONITOR_STATE_JSON');
const bytes = readFileSync(process.argv[2]);
const digest = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
if (digest(bytes) !== expected) throw new Error('Input is not the pinned 22:56 UTC monitor snapshot.');
const container = JSON.parse(bytes.toString());
const saved = container.runtimeState;
const tape = Array.from({length: 16}, (_, i) => [2, 3, 6, 3][i % 4]);

function makeRuntime(full: boolean) {
  const r = new OutsideRecoveryRuntime();
  const state = structuredClone(saved);
  if (full) state.qabbalaGates = fullNumogramGates(state.qabbalaGates);
  r.importState(state);
  return r;
}

function run(full: boolean, offers: boolean) {
  const r = makeRuntime(full);
  const start = r.exportState();
  const rows = [];
  for (let i = 0; i < tape.length; i++) {
    const target = tape[i];
    const input = {eventId: `synthetic-warp-probe-${i}`, channel: 'SYNTHETIC_FIELD' as const,
      sourceDigest: digest(`synthetic-warp-probe-${i}-${target}`),
      attentionVector: Array.from({length: 10}, (_, z) => Number(z === target))};
    const prior = r.exportState();
    const without = new OutsideRecoveryRuntime();
    without.importState(structuredClone(prior));
    // On a duplicate of the same pre-step state and queue, omit only the new
    // offer. Compare the next winner; earlier encounters remain in memory.
    const counterfactual = offers ? without.step() : undefined;
    const actual = offers ? r.step(undefined, input) : r.step();
    const decision = actual.encounterDecisions?.find(x => x.eventId === input.eventId);
    rows.push({index:i+1, offeredZone:offers ? target : null,
      from:actual.lastTransition?.from, to:actual.lastTransition?.to,
      disposition:decision?.disposition ?? null,
      withoutOffer:counterfactual?.lastTransition?.to ?? null,
      directlyPivotal:decision?.applied ? actual.lastTransition?.to !== counterfactual?.lastTransition?.to : false});
  }
  return {gateCount:start.qabbalaGates?.length, startZone:start.currentZone,
    finalZone:r.exportState().currentZone, finalQueue:r.getDeferredInputs().length, rows};
}

const result = {kind:'descriptive-offline-topology-probe', snapshotSha256:digest(bytes),
  snapshotRunAt:container.lastRunAt, snapshotStep:saved.stepCount, tape,
  fullAddedGatePolicy:'fullNumogramGates applied only to saved gate list; numeric zones and memory retained',
  nativeNoOffer:run(false,false), nativeSynthetic:run(false,true), extendedNoOffer:run(true,false),
  extendedSynthetic:run(true,true)};
console.log(JSON.stringify(result,null,2));
