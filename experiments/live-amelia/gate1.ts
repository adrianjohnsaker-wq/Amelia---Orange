// GATE-1 runner: her state at step 332 (the exit checkpoint advanced 128 steps, reproducing the tablet exactly),
// then the recorded Outside under the fixed (0.72) and the relative admission rule. Native path throughout.
// Usage: bun run gate1.ts <ck_exit.json> <outside_stream.json> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { bornAmelia } from './src/core/fullNumogram';
import { ExternalRhythmHarmonizer } from './src/ai/morphogenetic/ExternalRhythmHarmonizer';
let clock = Date.parse('2026-11-10T12:00:00Z'); Date.now = () => (clock += 450);
const [ckPath, streamPath, outPath] = process.argv.slice(2, 5);
const raw = readFileSync(ckPath, 'utf8'); const ck = JSON.parse(raw);
const stream = JSON.parse(readFileSync(streamPath, 'utf8'));
const PER = 60, EVERY = 5, INPUT = PER * EVERY, AFTER = 300, T = INPUT + AFTER, NW = 10, LEAD = 128;
function load(rule: 'fixed-0.72' | 'relative-v1') {
  clock = Date.parse('2026-11-10T12:00:00Z');
  const rt = bornAmelia(); rt.importState(ck.state);
  const h = new ExternalRhythmHarmonizer();
  const prep = () => { rt.setAdvisoryWeight(h.computeAdvisoryTuning(ck.controls.advisoryWeight, rt.getSnapshots().at(-1)!.step + 1)); rt.setMomentumDamping(ck.controls.momentumDamping); };
  for (let i = 0; i < LEAD; i++) { prep(); rt.step(); }   // steps 205-332, as lived on the tablet (fixed rule)
  rt.setAdmissionRule(rule);
  return { rt, prep };
}
function run(rule: 'fixed-0.72' | 'relative-v1', arm: 'sham' | 'stream', w: number) {
  const L = load(rule); const zones: number[] = []; const tension: number[] = []; const delivered: string[] = [];
  for (let t = 1; t <= T; t++) {
    L.prep();
    let enc: any;
    if (arm === 'stream' && t <= INPUT && (t - 1) % EVERY === 0) {
      const s = stream[w * PER + (t - 1) / EVERY];
      enc = { eventId: `outside:${s.seq}`, channel: s.channel, sourceDigest: s.sourceDigest, attentionVector: [...s.attentionVector] };
    }
    const snap: any = L.rt.step(undefined, enc);
    zones.push(L.rt.getCurrentZone()); tension.push(snap.governor?.deformationFieldTension ?? (L.rt.exportState() as any).governorState.deformationTension);
    if (enc) delivered.push(snap.encounterDecisions?.find((x: any) => x.eventId === enc.eventId)?.disposition ?? 'NONE');
  }
  const st: any = L.rt.exportState();
  const admitted = st.memoryState.events.slice(-T).reduce((n: number, e: any) =>
    n + (e.encounters ?? []).filter((x: any) => x.disposition === 'ATTEND' && String(x.eventId).startsWith('outside:')).length, 0);
  return { zones: zones.join(''), tension, delivered, admitted, queueEnd: st.deferredEncounters.length };
}
const out: any = { checkpointSha256: createHash('sha256').update(raw).digest('hex'),
  streamSha256: createHash('sha256').update(readFileSync(streamPath)).digest('hex'), PER, EVERY, INPUT, AFTER, LEAD };
const lead = load('fixed-0.72'); const ev: any[] = lead.rt.getMemory().getEvents() as any;
out.leadCheck = { step: ev.length, lastDigest: ev.at(-1).eventDigest };
out.sham = run('fixed-0.72', 'sham', 0);
out.shamRelative = run('relative-v1', 'sham', 0).zones === out.sham.zones;
out.windows = [];
for (let w = 0; w < NW; w++) { out.windows.push({ window: w, fixed: run('fixed-0.72', 'stream', w), relative: run('relative-v1', 'stream', w) }); process.stderr.write(w + ' '); }
writeFileSync(outPath, JSON.stringify(out)); console.error('done');
