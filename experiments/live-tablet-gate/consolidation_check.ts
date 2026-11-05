/** One prespecified app-consolidation calibration, in copies of the saved tablet. */
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { bornAmelia } from '../../src/core/fullNumogram';
import { ExternalRhythmHarmonizer } from '../../src/ai/morphogenetic/ExternalRhythmHarmonizer';
import { captureLiveField, restoreLiveField } from '../../src/outside/LiveFieldLoop';
import { advanceWithLiveSource, getLiveSourceSession, setLiveSourceEnabled } from '../../src/outside/LiveSyntheticSourceSession';

const expected = '7b4fd17bebcca8a0acd11c439a737b1b8d78fb07306770cf09282daa3c8f977d';
const sha = (v: string | Buffer) => createHash('sha256').update(v).digest('hex');
const json = (v: unknown) => JSON.stringify(v);
const args = process.argv.slice(2);
if (args.length !== 4 || args[0] !== '--checkpoint' || args[2] !== '--output')
  throw Error('Usage: node --import tsx consolidation_check.ts --checkpoint PRIVATE.json --output NEW_PRIVATE_DIRECTORY');
const bytes = readFileSync(resolve(args[1]));
if (sha(bytes) !== expected) throw Error('Starting checkpoint hash does not match registration');
const saved = JSON.parse(bytes.toString('utf8'));
const out = resolve(args[3]);
if (existsSync(out)) throw Error('Output directory exists');
mkdirSync(out, { mode: 0o700 });
const trace = join(out, 'trace.jsonl');
writeFileSync(trace, '', { flag: 'wx', mode: 0o600 });
const rows: any[] = [], interventions: any[] = [];
try {
  for (const arm of ['no_consolidation', 'single_consolidation'] as const) {
    const runtime = bornAmelia();
    runtime.importState(JSON.parse(json(saved.state)));
    let field = restoreLiveField(JSON.parse(json(saved.fieldCheckpoint)), runtime);
    if (captureLiveField(field, saved.fieldCheckpoint.running).checksum !== saved.fieldCheckpoint.checksum ||
        runtime.getSnapshots().at(-1)?.step !== 50 || field.stepCount !== 49 ||
        getLiveSourceSession(field)?.enabled || getLiveSourceSession(field)?.sourceState.step !== 0)
      throw Error('Baseline restoration failed');
    const baselineEvents = runtime.getMemory().getEvents().map(e => e.eventDigest);
    const initial = runtime.getGovernor();
    if (arm === 'single_consolidation') runtime.triggerConsolidation();
    const snapshot = runtime.step(); // Mirrors the bare step in the Consolidate button.
    const afterEvents = runtime.getMemory().getEvents();
    if (!baselineEvents.every((digest, i) => afterEvents[i]?.eventDigest === digest))
      throw Error('Existing PFM event prefix was not preserved');
    const intervention = { arm, initialGovernor: initial, governorAfterBareStep: snapshot.governor,
      initialEvents: baselineEvents.length, eventsAfterBareStep: afterEvents.length,
      addedKinds: afterEvents.slice(baselineEvents.length).map(e => e.kind),
      oldQueueDecisions: snapshot.encounterDecisions, initialZone: saved.state.currentZone,
      zoneAfterBareStep: runtime.getCurrentZone(), runtimeStepAfterBareStep: snapshot.step };
    interventions.push(intervention);
    const advisory = initial.advisoryWeight, damping = initial.momentumDampingFactor;
    const rhythm = new ExternalRhythmHarmonizer();
    field = setLiveSourceEnabled(field, true);
    for (let time = 1; time <= 40; time++) {
      const nextStep = (runtime.getSnapshots().at(-1)?.step ?? 0) + 1;
      runtime.setAdvisoryWeight(rhythm.computeAdvisoryTuning(advisory, nextStep));
      runtime.setMomentumDamping(damping);
      const stepped = advanceWithLiveSource(field);
      field = stepped.state;
      const current = stepped.currentSourceDecision;
      if (!current || !stepped.sourceReading) throw Error('Current source record is missing');
      const row = { arm, time, runtimeStep: stepped.snapshot.step, source: stepped.sourceReading,
        currentDecision: current, allDecisions: stepped.snapshot.encounterDecisions,
        governor: stepped.snapshot.governor, to: runtime.getCurrentZone(),
        memoryHead: runtime.getMemory().exportHistoryDigest() };
      rows.push(row); appendFileSync(trace, json(row) + '\n', { mode: 0o600 });
    }
    writeFileSync(join(out, arm + '-final.json'), json({ runtime: runtime.exportState(),
      field: captureLiveField(field, false) }) + '\n', { flag: 'wx', mode: 0o600 });
  }
  const results = Object.fromEntries(['no_consolidation', 'single_consolidation'].map(arm => {
    const a = rows.filter(r => r.arm === arm);
    const counts = a.reduce((v: Record<string,number>, r: any) => {
      const k = r.currentDecision.disposition; v[k] = (v[k] ?? 0) + 1; return v;
    }, {});
    return [arm, { counts, eligible: (counts.ATTEND ?? 0) >= 5,
      firstImmediateAdmission: a.find(r => r.currentDecision.disposition === 'ATTEND')?.time ?? null,
      minTension: Math.min(...a.map(r => r.governor.deformationFieldTension)),
      maxTension: Math.max(...a.map(r => r.governor.deformationFieldTension)),
      queuedSourceAdmissions: a.flatMap(r => r.allDecisions).filter((d: any) =>
        d.eventId.startsWith('source:') && d.disposition === 'ATTEND' && d.applied &&
        d.reason.startsWith('Previously deferred')).length }];
  }));
  const summary = { scope: 'Two private copies of one saved tablet checkpoint; not a live-device intervention.',
    baselineSha256: expected, interventions, results, rows: rows.length };
  writeFileSync(join(out, 'summary.json'), json(summary) + '\n', { flag: 'wx', mode: 0o600 });
  const hashes = { traceSha256: sha(readFileSync(trace)), summarySha256: sha(readFileSync(join(out, 'summary.json'))) };
  writeFileSync(join(out, 'hashes.json'), json(hashes) + '\n', { flag: 'wx', mode: 0o600 });
  console.log(json({ status: 'COMPLETE', interventions: interventions.map(x => ({ arm: x.arm,
    eventsAfterBareStep: x.eventsAfterBareStep, addedKinds: x.addedKinds, initialTension: x.initialGovernor.deformationFieldTension,
    tensionAfterBareStep: x.governorAfterBareStep.deformationFieldTension })), results, hashes }));
} catch (e) {
  writeFileSync(join(out, 'FAILURE.json'), json({ error: e instanceof Error ? e.message : String(e) }) + '\n', { flag: 'wx', mode: 0o600 });
  throw e;
}
