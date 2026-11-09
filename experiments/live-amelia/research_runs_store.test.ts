import test from 'node:test';
import assert from 'node:assert/strict';
import { isKnownMemoryStore } from '../../src/services/ameliaIndexedMemory';
import { selectCloudArchive } from '../../src/services/cloudRecordNamespace';

test('this build stores research runs alongside her existing memory kinds', () => {
  for (const store of ['runtime', 'dialogue', 'processMemory', 'canalizationRuns', 'paper6Assays', 'snapshots', 'researchRuns'])
    assert.equal(isKnownMemoryStore(store), true, store);
});

test('a cloud record of a kind this build does not know is recognised as unknown, so sync can skip it', () => {
  assert.equal(isKnownMemoryStore('someFutureStore'), false);
  assert.equal(isKnownMemoryStore(undefined), false);
});

test('a research table with her checkpoint and a run record is used as her own history, not re-bootstrapped from main', () => {
  const own = [
    { store: 'runtime' as const, record_id: 'live-checkpoint', payload: { id: 'live-checkpoint' }, updated_at: '2026-11-09T09:13:59Z' },
    { store: 'researchRuns' as const, record_id: 'LIVE-1-2026-11-09', payload: { id: 'LIVE-1-2026-11-09' }, updated_at: '2026-11-09T13:30:00Z' },
  ];
  const out = selectCloudArchive([], own, true);
  assert.equal(out.bootstrapping, false);
  assert.equal(out.rows.length, 2);
});
