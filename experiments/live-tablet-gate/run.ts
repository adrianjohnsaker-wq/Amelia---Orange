/** Isolated diagnostic copies of one actual synced Amelia tablet checkpoint. */
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { gzipSync, gunzipSync } from 'node:zlib';
import { bornAmelia } from '../../src/core/fullNumogram';
import { ExternalRhythmHarmonizer } from '../../src/ai/morphogenetic/ExternalRhythmHarmonizer';
import { advanceLiveField, captureLiveField, observeLiveField, restoreLiveField, syntheticSourceOfferDigest }
  from '../../src/outside/LiveFieldLoop';
import { advanceWithLiveSource, getLiveSourceSession, setLiveSourceEnabled }
  from '../../src/outside/LiveSyntheticSourceSession';
import { respondToBody, targetProfile, type SourceArm } from '../../src/outside/AdaptiveSyntheticSource';
import { canonicalJson, type MorphogeneticState } from '../../src/substrate/AmeliaMorphogeneticSubstrate';

const expected = '7b4fd17bebcca8a0acd11c439a737b1b8d78fb07306770cf09282daa3c8f977d';
const arms = ['live', 'shuffled', 'uniform', 'ordinary'] as const;
type Arm = typeof arms[number];
type Context = { body: MorphogeneticState; advisory: number; damping: number; rhythm: ExternalRhythmHarmonizer };
const sha = (v: string | Buffer) => createHash('sha256').update(v).digest('hex');
const json = (v: unknown) => JSON.stringify(v);

function context(body: MorphogeneticState, advisory?: number, damping?: number): Context {
  const gov = body.nativeRuntime.getGovernor();
  return { body, advisory: advisory ?? gov.advisoryWeight, damping: damping ?? gov.momentumDampingFactor,
    rhythm: new ExternalRhythmHarmonizer() };
}
function prepare(ctx: Context) {
  const runtime = ctx.body.nativeRuntime;
  const next = (runtime.getSnapshots().at(-1)?.step ?? 0) + 1;
  runtime.setAdvisoryWeight(ctx.rhythm.computeAdvisoryTuning(ctx.advisory, next));
  runtime.setMomentumDamping(ctx.damping);
}
function restored(saved: any, arm: Arm): Context {
  const runtime = bornAmelia();
  runtime.importState(JSON.parse(json(saved.state)));
  let body = restoreLiveField(JSON.parse(json(saved.fieldCheckpoint)), runtime);
  if (runtime.getSnapshots().at(-1)?.step !== saved.fieldCheckpoint.runtimeStep ||
      saved.state.stepCount !== saved.fieldCheckpoint.runtimeStep ||
      captureLiveField(body, saved.fieldCheckpoint.running).checksum !== saved.fieldCheckpoint.checksum)
    throw Error('Checkpoint failed exact restoration');
  const prior = getLiveSourceSession(body);
  if (!prior || prior.enabled || prior.sourceState.step !== 0) throw Error('Unexpected baseline source state');
  body = setLiveSourceEnabled(body, arm !== 'ordinary');
  return context(body);
}
function checkpoint(ctx: Context, directory: string, arm: Arm, time: number): Context {
  const runtime = ctx.body.nativeRuntime;
  const field = captureLiveField(ctx.body, false);
  const source = getLiveSourceSession(ctx.body);
  const head = runtime.getMemory().exportHistoryDigest();
  const capsule = { schema: 'amelia.live-tablet-gate-session/v1', arm, time, field,
    runtimeState: runtime.exportState(), advisory: ctx.advisory, damping: ctx.damping };
  const path = join(directory, `${arm}-t${time}.json.gz`);
  const bytes = gzipSync(Buffer.from(json(capsule)));
  writeFileSync(path, bytes, { flag: 'wx', mode: 0o600 });
  const read = JSON.parse(gunzipSync(readFileSync(path)).toString('utf8'));
  const next = bornAmelia();
  next.importState(read.runtimeState);
  const body = restoreLiveField(read.field, next);
  if (captureLiveField(body, false).checksum !== field.checksum ||
      next.getMemory().exportHistoryDigest() !== head ||
      canonicalJson(getLiveSourceSession(body)) !== canonicalJson(source)) throw Error('Session restore failed');
  appendFileSync(join(directory, '..', 'session_receipts.jsonl'),
    json({ arm, time, checkpointSha256: sha(bytes), fieldChecksum: field.checksum, memoryHead: head }) + '\n', { mode: 0o600 });
  return context(body, read.advisory, read.damping);
}
function sourceQueue(runtime: any): number {
  return (runtime.exportState().deferredEncounters ?? []).filter((e: any) =>
    typeof e.eventId === 'string' && e.eventId.startsWith('source:')).length;
}
function outputSummary(rows: any[]) {
  const liveTarget = rows.find(x => x.arm === 'live' && x.time === 40)?.source?.after?.address;
  if (liveTarget !== 0 && liveTarget !== 1) throw Error('Live withdrawal target missing');
  const target = targetProfile(liveTarget);
  const error = (row: any) => 0.5 * row.bodyAfter.attentionVector.reduce((s: number, v: number, i: number) =>
    s + Math.abs(v - target[i]), 0);
  return Object.fromEntries(arms.map(arm => {
    const all = rows.filter(x => x.arm === arm), exposure = all.filter(x => x.time <= 40);
    const dispositions = exposure.reduce((a: Record<string, number>, x: any) => {
      const key = x.currentDecision?.disposition ?? 'MISSING';
      a[key] = (a[key] ?? 0) + 1; return a;
    }, {});
    const post = all.filter(x => x.time > 40).flatMap(x => x.allDecisions);
    return [arm, { currentDispositions: dispositions, eligible: arm === 'ordinary' ? null : (dispositions.ATTEND ?? 0) >= 5,
      firstCurrentAttendTime: exposure.find(x => x.currentDecision?.disposition === 'ATTEND')?.time ?? null,
      pendingSourceAtWithdrawal: all.find(x => x.time === 40).sourceQueue,
      delayedSourceAdmissions: post.filter((d: any) => d.eventId?.startsWith('source:') && d.disposition === 'ATTEND' && d.applied).length,
      pendingSourceAtEnd: all.find(x => x.time === 60).sourceQueue,
      errorToLiveTargetAt40: error(all.find(x => x.time === 40)),
      errorToLiveTargetAt60: error(all.find(x => x.time === 60)),
      finalZone: all.find(x => x.time === 60).to }];
  }));
}

function main() {
  const args = process.argv.slice(2);
  if (args.length !== 4 || args[0] !== '--checkpoint' || args[2] !== '--output')
    throw Error('Usage: node --import tsx run.ts --checkpoint PRIVATE.json --output NEW_PRIVATE_DIRECTORY');
  const bytes = readFileSync(resolve(args[1]));
  if (sha(bytes) !== expected) throw Error('Starting checkpoint hash does not match the registration');
  const saved = JSON.parse(bytes.toString('utf8'));
  const out = resolve(args[3]);
  if (existsSync(out)) throw Error('Output directory exists; prior evidence will not be overwritten');
  mkdirSync(out, { mode: 0o700 });
  const dir = join(out, 'checkpoints');
  mkdirSync(dir, { mode: 0o700 });
  const trace = join(out, 'trace.jsonl');
  writeFileSync(trace, '', { flag: 'wx', mode: 0o600 });
  const rows: any[] = [];
  try {
    for (const arm of arms) {
      let ctx = restored(saved, arm);
      for (let time = 1; time <= 60; time++) {
        if (time === 41 && arm !== 'ordinary') ctx.body = setLiveSourceEnabled(ctx.body, false);
        prepare(ctx);
        const runtime = ctx.body.nativeRuntime;
        const before = observeLiveField(ctx.body);
        const from = runtime.getCurrentZone();
        let source: any = null, stepped: any;
        if (time <= 40 && arm === 'live') {
          stepped = advanceWithLiveSource(ctx.body);
          source = stepped.sourceReading;
        } else if (time <= 40 && arm !== 'ordinary') {
          const session = getLiveSourceSession(ctx.body);
          if (!session?.enabled) throw Error('Control source was unexpectedly disabled');
          source = respondToBody(before, session.sourceState, arm as SourceArm);
          const offer = { ...source.offer, recordContext: true };
          stepped = advanceLiveField(ctx.body, { source: offer });
          stepped.state = { ...stepped.state, syntheticSourceSession: { ...session, sourceState: source.after } };
        } else stepped = advanceWithLiveSource(ctx.body);
        ctx.body = stepped.state;
        const snapshot = stepped.snapshot, event = runtime.getMemory().getEvents().at(-1) as any;
        const prefix = source ? 'source:' : 'field:';
        const expectedId = prefix + snapshot.step + ':';
        const current = snapshot.encounterDecisions?.find((d: any) => d.eventId.startsWith(expectedId)) ?? null;
        if (!current) throw Error('Current feedback decision is missing');
        if (source && current.sourceDigest !== syntheticSourceOfferDigest(source.offer))
          throw Error('Source offer digest does not match current decision');
        const row = { arm, time, runtimeStep: snapshot.step, phase: time <= 40 ? 'exposure' : 'withdrawn',
          bodyBefore: before, bodyAfter: observeLiveField(ctx.body), source,
          currentDecision: current, allDecisions: snapshot.encounterDecisions, from, to: runtime.getCurrentZone(),
          governor: snapshot.governor, eventDigest: event.eventDigest, memoryHead: runtime.getMemory().exportHistoryDigest(),
          memoryBias: runtime.getMemory().readMemoryBias().biasVector,
          sourceQueue: time === 40 || time === 60 ? sourceQueue(runtime) : null };
        rows.push(row); appendFileSync(trace, json(row) + '\n', { mode: 0o600 });
        if (time === 20 || time === 55) ctx = checkpoint(ctx, dir, arm, time);
      }
    }
    const summary = { scope: 'One actual saved tablet field and runtime; isolated copies, not a live-device run.',
      baselineSha256: expected, arms: outputSummary(rows), rows: rows.length };
    writeFileSync(join(out, 'summary.json'), json(summary) + '\n', { flag: 'wx', mode: 0o600 });
    const hashes = { traceSha256: sha(readFileSync(trace)), summarySha256: sha(readFileSync(join(out, 'summary.json'))),
      receiptsSha256: sha(readFileSync(join(out, 'session_receipts.jsonl'))) };
    writeFileSync(join(out, 'hashes.json'), json(hashes) + '\n', { flag: 'wx', mode: 0o600 });
    console.log(json({ status: 'COMPLETE', summary, hashes }));
  } catch (e) {
    writeFileSync(join(out, 'FAILURE.json'), json({ error: e instanceof Error ? e.message : String(e) }) + '\n', { flag: 'wx', mode: 0o600 });
    throw e;
  }
}
main();
