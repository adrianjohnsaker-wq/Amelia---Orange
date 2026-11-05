/**
 * Endogenous W+ pointer and two live synthetic source fixtures.
 *
 * Both target patterns and their relaxation rules are engineered. They are
 * instruments for testing a two-way causal interface, not discovered minds.
 */

const THRESHOLD = 0.15;
const TARGETS = Object.freeze({ A: [0.8, 0.2, 0.7, 0.3], B: [0.2, 0.8, 0.3, 0.7] });
const clamp = value => Math.max(0, Math.min(1, value));

function validOrgan(organ) {
  if (!organ || !Array.isArray(organ.w) || organ.w.length < 2 || !Array.isArray(organ.th) ||
      organ.th.length < 2 || ![organ.w[0], organ.w[1], organ.th[1]].every(Number.isFinite)) {
    throw new Error('Invalid W+ organ for endogenous pointer');
  }
}

export function pointerReading(organ, previous = null) {
  validOrgan(organ);
  if (previous !== null && previous !== 'A' && previous !== 'B') throw new Error('Invalid previous address');
  const score = Math.tanh(organ.w[0]) + 0.5 * Math.sin(organ.th[1]);
  const address = score > THRESHOLD ? 'B' : score < -THRESHOLD ? 'A' : (previous ?? (score >= 0 ? 'B' : 'A'));
  return { w0: organ.w[0], w1: organ.w[1], theta1: organ.th[1], score, address };
}

export function mutateOrgan(organ, previous, mode) {
  if (!['none', 'targeted', 'orthogonal'].includes(mode)) throw new Error('Invalid organ intervention');
  const before = pointerReading(organ, previous);
  const targetW0 = before.address === 'A' ? 3 : -3;
  const matchedDelta = targetW0 - organ.w[0];
  const next = { ...organ, w: [...organ.w], th: [...organ.th] };
  if (mode === 'targeted') next.w[0] = targetW0;
  if (mode === 'orthogonal') next.w[1] += matchedDelta;
  const after = pointerReading(next, previous);
  return { organ: next, event: { mode, before, after, targetW0, matchedDelta,
    actualL2: mode === 'none' ? 0 : Math.abs(matchedDelta) } };
}

export function feedbackFromBody(zone, organ, houseS, houseD, houseE) {
  validOrgan(organ);
  if (!Number.isInteger(zone) || zone < 0 || zone > 9 || ![houseS, houseD, houseE].every(Number.isFinite)) {
    throw new Error('Invalid Amelia feedback');
  }
  return { zone, organ: Math.tanh(organ.w[0]), house: Math.tanh(houseS + houseD + houseE) };
}

export function initialBank() {
  return { A: { values: [0.5, 0.5, 0.5, 0.5], phase: 0 },
           B: { values: [0.5, 0.5, 0.5, 0.5], phase: 2 } };
}

export function advanceBank(bank, address, feedback) {
  if (!['A', 'B'].includes(address)) throw new Error('Invalid source address');
  if (feedback !== null && (!Number.isInteger(feedback.zone) || feedback.zone < 0 || feedback.zone > 9 ||
      ![feedback.organ, feedback.house].every(x => Number.isFinite(x) && x >= -1 && x <= 1))) {
    throw new Error('Invalid source feedback');
  }
  const u = feedback === null ? null : [feedback.zone / 9, (feedback.organ + 1) / 2,
    (feedback.house + 1) / 2, (feedback.zone / 9 + (feedback.house + 1) / 2) / 2];
  const next = {};
  for (const name of ['A', 'B']) {
    const old = bank[name];
    if (!old || !Array.isArray(old.values) || old.values.length !== 4 ||
        !old.values.every(x => Number.isFinite(x) && x >= 0 && x <= 1) ||
        !Number.isInteger(old.phase) || old.phase < 0 || old.phase > 3) throw new Error('Invalid source state');
    const receiving = feedback !== null && name === address;
    const values = old.values.map((x, i) => clamp(receiving
      ? 0.65 * x + 0.2 * TARGETS[name][i] + 0.15 * u[i]
      : 0.8 * x + 0.2 * TARGETS[name][i]));
    next[name] = { values, phase: (old.phase + 1) % 4 };
  }
  const selected = next[address];
  const symbol = (selected.phase + Math.min(3, Math.floor(4 * selected.values[selected.phase]))) % 4;
  return { bank: next, symbol };
}

export function counterfactualFeedback(feedback) {
  if (feedback === null) return null;
  return { zone: (feedback.zone + 5) % 10, organ: -feedback.organ, house: -feedback.house };
}

export function shuffledIndices(length, seed = 20261105) {
  if (!Number.isInteger(length) || length < 0 || !Number.isInteger(seed) || seed === 0) {
    throw new Error('Invalid shuffle');
  }
  let h = seed >>> 0;
  const values = Array.from({ length }, (_, i) => i);
  for (let i = values.length - 1; i > 0; i--) {
    h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0;
    const j = Math.floor(h / 4294967296 * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

