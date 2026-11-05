import test from 'node:test';
import assert from 'node:assert/strict';
import { pointerReading, mutateOrgan, feedbackFromBody, initialBank, advanceBank,
         counterfactualFeedback, shuffledIndices } from './live_pointer_source.mjs';

test('actual organ configuration selects the address with hysteresis', () => {
  const a = { w: [0, 0], th: [0, -Math.PI / 2, 0] }, b = { w: [0, 0], th: [0, Math.PI / 2, 0] };
  assert.equal(pointerReading(a).address, 'A');
  assert.equal(pointerReading(b).address, 'B');
  assert.equal(pointerReading({ w: [0, 0], th: [0, 0, 0] }, 'A').address, 'A');
  assert.equal(pointerReading({ w: [0, 0], th: [0, 0, 0] }, 'B').address, 'B');
  assert.throws(() => pointerReading({ w: [NaN, 0], th: [0, 0, 0] }));
});

test('targeted body intervention changes the pointer; orthogonal control matches its magnitude', () => {
  const organ = { w: [-0.6, 0.4, 0], th: [0, -0.8, 0.3] };
  const baseline = JSON.stringify(organ);
  const target = mutateOrgan(organ, null, 'targeted');
  const control = mutateOrgan(organ, null, 'orthogonal');
  assert.notEqual(target.event.after.address, target.event.before.address);
  assert.equal(control.event.after.address, control.event.before.address);
  assert.equal(target.event.actualL2, control.event.actualL2);
  assert.ok(target.event.actualL2 <= Math.PI);
  assert.equal(JSON.stringify(organ), baseline);
});

test('Amelia feedback changes source state and can change the emitted symbol', () => {
  const organ = { w: [0, 1], th: [0, 0, 0] };
  const feedback = feedbackFromBody(0, organ, 0, 0, 0);
  assert.notDeepEqual(feedback, feedbackFromBody(9, organ, 1, 0, 0));
  const bank = initialBank();
  bank.A.phase = 3;
  bank.A.values[0] = 0.1;
  const a = advanceBank(bank, 'A', feedback);
  const b = advanceBank(bank, 'A', counterfactualFeedback(feedback));
  assert.notDeepEqual(a.bank.A, b.bank.A);
  assert.notEqual(a.symbol, b.symbol);
  assert.equal(bank.A.values[0], 0.1);
});

test('disconnected synthetic source relaxes toward its programmed target', () => {
  let bank = initialBank();
  const error = b => Math.hypot(...b.A.values.map((x, i) => x - [0.8, 0.2, 0.7, 0.3][i]));
  const initial = error(bank);
  for (let i = 0; i < 30; i++) bank = advanceBank(bank, 'A', null).bank;
  assert.ok(error(bank) < initial * 0.002);
});

test('shuffle is deterministic and preserves every donor sample', () => {
  const order = shuffledIndices(100);
  assert.deepEqual(order, shuffledIndices(100));
  assert.deepEqual([...order].sort((a, b) => a - b), Array.from({ length: 100 }, (_, i) => i));
  assert.notDeepEqual(order, Array.from({ length: 100 }, (_, i) => i));
});
