/** Studio 08 candidate smooth house readout — transparent, deterministic, pre-choice only.
 *
 * This is a NEW readout, not a reconstruction of the Studio 07 joint-state hash.
 * Given two consecutive COMPLETE PRE-CHOICE house snapshots, choose the Numogram
 * target zone with largest accumulated absolute change in surface+deep edge memory.
 * The winning destination receives the same +0.35 as the frozen direct cue.
 *
 * This readout is observational (it never mutates house, code or runtime).
 * A selected target not among currently open exits has no direct effect; never
 * remap it to a favourable candidate. Null cue when no records changed.
 */
export const EDGES = Object.freeze([
  '0>9','1>8','2>7','3>6','4>5','1>2','2>4','4>7','7>8','8>9','9>1'
]);
const NUM_ZONES = 10;
const EPS = 1e-14;

export function houseChangeCue(before, after, edges = EDGES) {
  for (const obj of [before,after]) {
    if (!obj || typeof obj !== 'object' || !obj.surface || !obj.deep) {
      throw new Error('House snapshots must include surface and deep layers');
    }
  }
  const byTarget = Array(NUM_ZONES).fill(0);
  for (const edge of edges) {
    const [from,to] = edge.split('>').map(Number);
    if (!Number.isInteger(from)||from<0||from>=NUM_ZONES ||
        !Number.isInteger(to)||to<0||to>=NUM_ZONES)
      throw new Error('Invalid directed Numogram edge');
    const past = Number(before.surface[edge]) + Number(before.deep[edge]);
    const now = Number(after.surface[edge]) + Number(after.deep[edge]);
    if (![past,now].every(Number.isFinite))
      throw new Error('House edge state missing or not finite: ' + edge);
    byTarget[to] += Math.abs(now-past);
  }
  const highest = Math.max(...byTarget);
  if (highest <= EPS) return null;
  // Tie rule: lowest numeric target (fixed before data).
  return byTarget.findIndex(x=>x===highest);
}
export function cueBonus(target, cueZone, weight=0.35) {
  if (cueZone===null || cueZone===undefined) return 0;
  if (!Number.isInteger(cueZone)||cueZone<0||cueZone>=NUM_ZONES)
    throw new Error('Invalid cue zone');
  if (!Number.isFinite(weight) || weight<0) throw new Error('Invalid cue weight');
  return cueZone===target ? weight : 0;
}
