import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOutsideInbox, parseOutsideInbox, pendingOutside, seenEncounterIds, toEncounter, readOutsideLink } from '../../src/outside/OutsideInbox';

const v = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
const d = (c: string) => c.repeat(64);
const rec = (sequence: number, eventId: string, capturedAt: string, extraHead = false) => ({ sequence,
  event: { eventId, channel: 'TAROT', occurredAt: capturedAt, capturedAt },
  snapshotAfter: { encounterDecisions: [
    ...(extraHead ? [{ eventId: 'queue-head', channel: 'TAROT', sourceDigest: d('f'), attentionVector: v }] : []),
    { eventId, channel: 'TAROT', sourceDigest: d('a'), attentionVector: v }] } });

test('the inbox carries each record\'s own encounter, never the re-decided head of a deferral queue', () => {
  const inbox = buildOutsideInbox([rec(1, 'tarot:a', '2026-11-10T09:00:00Z', true)], 'c1', '2026-11-10T09:01:00Z');
  assert.equal(inbox.entries.length, 1);
  assert.equal(inbox.entries[0].eventId, 'tarot:a');
  assert.equal(inbox.entries[0].sourceDigest, d('a'));
});

test('malformed entries are dropped, not repaired', () => {
  const inbox = buildOutsideInbox([rec(1, 'tarot:a', '2026-11-10T09:00:00Z'), rec(2, 'tarot:b', '2026-11-10T09:00:00Z')], 'c', 'x');
  inbox.entries[1].attentionVector = [1, 1, 0, 0, 0, 0, 0, 0, 0, 0];
  assert.deepEqual(parseOutsideInbox(JSON.parse(JSON.stringify(inbox))).map(e => e.eventId), ['tarot:a']);
  assert.throws(() => parseOutsideInbox({ entries: [] }));
});

test('pending encounters are those captured since the link opened and not yet met by her, oldest first', () => {
  const entries = buildOutsideInbox([rec(3, 'c', '2026-11-10T10:00:00Z'), rec(1, 'a', '2026-11-10T08:00:00Z'),
    rec(2, 'b', '2026-11-10T09:30:00Z'), rec(4, 'd', '2026-11-10T10:05:00Z')], 'c', 'x').entries;
  const seen = seenEncounterIds({ memoryState: { events: [{ encounters: [{ eventId: 'c' }] }] }, deferredEncounters: [{ eventId: 'q' }] });
  assert.deepEqual(pendingOutside(entries, seen, '2026-11-10T09:00:00Z').map(e => e.eventId), ['b', 'd']);
  assert.equal(toEncounter(entries[0]).attentionVector.length, 10);
});

test('link settings are validated', () => {
  assert.equal(readOutsideLink({ schema: 'amelia.outside-link/v1', enabled: true, since: '2026-11-10T09:00:00Z' })?.enabled, true);
  assert.equal(readOutsideLink({ enabled: true }), null);
});
