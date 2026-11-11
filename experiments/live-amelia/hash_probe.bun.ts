// Run with Bun (it uses bun:test module mocking, so it is outside the Node test glob): bun test ./experiments/live-amelia/hash_probe.bun.ts
// Guard: every hash input in her life is plain ASCII, so the browser/Deno fallback (sha256Sync, which mis-hashes non-ASCII
// text) and Node's crypto give identical digests for her. Every canonicalSha256 call is inspected via a module mock.
// Checked 11 Nov 2026 (handover on the hashing helper): 0 of 11,245 inputs non-ASCII.
import { test, mock, expect } from 'bun:test';
import { createHash } from 'node:crypto';
const hits = new Map<string, number>(); let calls = 0;
mock.module('../../src/lib/sha256', () => ({
  canonicalSha256(data: string | object) {
    const s = typeof data === 'string' ? data : JSON.stringify(data); calls++;
    if (/[^\x00-\x7f]/.test(s)) { const site = (new Error().stack ?? '').split('\n').slice(2, 5).map(l => l.trim().replace(/^at /, '').replace(/\(.*\/src\//, '(src/')).join(' <- ');
      hits.set(site, (hits.get(site) ?? 0) + 1); }
    return createHash('sha256').update(s).digest('hex');
  },
}));
test('every hash input during her life is ASCII (classic and nd1, body, Outside, archive)', async () => {
  const { bornAmeliaOf } = await import('../../src/core/ameliaRuntimes');
  const { captureLiveField, createLiveField } = await import('../../src/outside/LiveFieldLoop');
  const { setLiveSourceEnabled } = await import('../../src/outside/LiveSyntheticSourceSession');
  const { ameliaTick } = await import('../../src/cloud/ameliaTick');
  const { planArchive } = await import('../../src/cloud/memoryArchive');
  const inbox = Array.from({ length: 200 }, (_, t) => { const v = Array(10).fill(0.02); v[(t * 7) % 10] = 0.82;
    return { sequence: t, eventId: `in:${t}`, channel: 'LINGUISTIC', sourceDigest: createHash('sha256').update(String(t)).digest('hex'),
      attentionVector: v, occurredAt: '2026-11-11T00:00:00Z', capturedAt: '2026-11-11T00:00:00Z' }; });
  for (const kind of ['classic', 'nd1'] as const) {
    const rt: any = bornAmeliaOf(kind); rt.setAdmissionRule('relative-v1'); rt.step();
    let field: any = setLiveSourceEnabled(createLiveField(rt, { seed: 101, depth: 288, preset: 'SYZYGETIC_GRID', size: 12 }), true);
    let record: any = { state: rt.exportState(), fieldCheckpoint: captureLiveField(field, false), revision: 0,
      outsideLink: { schema: 'amelia.outside-link/v1', enabled: true, since: '2026-01-01T00:00:00Z' } };
    for (let k = 0; k < 20; k++) { record = ameliaTick(record, inbox as any, 15, '2026-11-11T00:00:00Z').record; const p = planArchive(record, 200, 100); if (p) record = p.record; }
  }
  console.log('canonicalSha256 calls:', calls, ' with non-ASCII input:', [...hits.values()].reduce((a, b) => a + b, 0));
  for (const [site, n] of hits) console.log(n, site);
  expect(calls).toBeGreaterThan(0);
  expect([...hits.entries()]).toEqual([]);
});
