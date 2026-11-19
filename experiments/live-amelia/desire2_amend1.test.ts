// DESIRE-2 Amendment 1: the pacing rules (synthetic times only).
import test from 'node:test';
import assert from 'node:assert/strict';
import { SLOT_MINUTES, nextSlot, slotIndexAt, clearOfTicks } from './desire2/amend1/slots';
const H = Date.UTC(2026, 10, 19, 14, 0, 0);
test('every slot minute is clear of her ticks by 1.5 minutes for the whole minute', () => {
  for (const m of SLOT_MINUTES) assert.ok(clearOfTicks(H + m * 60000), `:${m}`);
  for (const m of [4, 5, 6, 19, 20, 21, 34, 35, 36, 49, 50, 51]) assert.ok(!clearOfTicks(H + m * 60000) || !SLOT_MINUTES.includes(m));
});
test('eight jobs never share a slot, and each job gets one slot in eight', () => {
  const seen = new Map<number, number>();
  for (let cls = 0; cls < 8; cls++) { let t = H; for (let i = 0; i < 20; i++) { const s = nextSlot(t, cls, 8); const k = slotIndexAt(s);
    assert.equal(k % 8, cls); assert.ok(!seen.has(s) || seen.get(s) === cls); seen.set(s, cls); t = s + 60000; } }
  assert.ok(SLOT_MINUTES.every((m, i) => i === 0 || m - SLOT_MINUTES[i - 1] >= 2));
});
