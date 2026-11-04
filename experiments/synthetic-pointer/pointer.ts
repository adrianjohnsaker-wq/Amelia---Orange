import {
  DeterministicRNG, calcEntropy, digestObject, stepAmeliaSubstrate,
} from '../../src/substrate/AmeliaMorphogeneticSubstrate';
import type { MorphCell, MorphogeneticState } from '../../src/substrate/AmeliaMorphogeneticSubstrate';

export interface PointerEdge { a: number; b: number; multiplier: number }
export interface PointerArrangement { id: string; edges: PointerEdge[] }

function laplace(field: Float64Array, x: number, y: number, W: number, H: number): number {
  const c = y * W + x;
  const l = y * W + (x - 1 + W) % W;
  const r = y * W + (x + 1) % W;
  const u = ((y - 1 + H) % H) * W + x;
  const d = ((y + 1) % H) * W + x;
  const ul = ((y - 1 + H) % H) * W + (x - 1 + W) % W;
  const ur = ((y - 1 + H) % H) * W + (x + 1) % W;
  const dl = ((y + 1) % H) * W + (x - 1 + W) % W;
  const dr = ((y + 1) % H) * W + (x + 1) % W;
  return -field[c] + 0.20 * (field[l] + field[r] + field[u] + field[d]) +
    0.05 * (field[ul] + field[ur] + field[dl] + field[dr]);
}

function validatedEdges(arrangement: PointerArrangement, W: number, H: number): Array<PointerEdge & { weight: number }> {
  if (!arrangement.id || W < 3 || H < 3) throw new Error('Invalid pointer arrangement');
  const seen = new Set<string>();
  return arrangement.edges.map(edge => {
    const { a, b, multiplier } = edge;
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a >= W * H || b >= W * H ||
        a === b || !Number.isFinite(multiplier) || multiplier < 0 || multiplier > 1) throw new Error('Invalid pointer edge');
    const key = Math.min(a, b) + ':' + Math.max(a, b);
    if (seen.has(key)) throw new Error('Duplicate pointer edge');
    seen.add(key);
    const ax = a % W, ay = Math.floor(a / W), bx = b % W, by = Math.floor(b / W);
    const dx = Math.min(Math.abs(ax - bx), W - Math.abs(ax - bx));
    const dy = Math.min(Math.abs(ay - by), H - Math.abs(ay - by));
    if (dx > 1 || dy > 1 || dx + dy === 0) throw new Error('Pointer edge is not a field neighbour');
    return { ...edge, weight: dx === 1 && dy === 1 ? 0.05 : 0.20 };
  });
}

/**
 * The canonical field is stepped exactly once. It mutates its input cells with
 * PFM coupling before the Gray-Scott update. Those cells provide the actual
 * pre-diffusion state from which the isolated weighted update is reconstructed.
 */
export function stepFieldWithPointer(
  state: MorphogeneticState,
  arrangement: PointerArrangement,
  forceNeutralReconstruction = false,
): MorphogeneticState {
  const { width: W, height: H, seed, stepCount, landianAcc, Da, Db, F, K } = state;
  const edges = validatedEdges(arrangement, W, H); // validate before any runtime mutation
  const out = stepAmeliaSubstrate(state);
  if (!forceNeutralReconstruction && edges.every(e => e.multiplier === 1)) return out;

  // state.cells now holds the post-PFM, pre-diffusion values used by the original step.
  const N = W * H;
  const aField = Float64Array.from(state.cells, cell => cell.A);
  const bField = Float64Array.from(state.cells, cell => cell.B);
  const deltaA = new Float64Array(N), deltaB = new Float64Array(N);
  for (const edge of edges) {
    const factor = edge.weight * (edge.multiplier - 1);
    const aDiff = factor * (aField[edge.b] - aField[edge.a]);
    const bDiff = factor * (bField[edge.b] - bField[edge.a]);
    deltaA[edge.a] += aDiff; deltaA[edge.b] -= aDiff;
    deltaB[edge.a] += bDiff; deltaB[edge.b] -= bDiff;
  }
  const rng = new DeterministicRNG(seed + stepCount * 997);
  const cells: MorphCell[] = new Array(N);
  for (let i = 0; i < N; i++) {
    const x = i % W, y = Math.floor(i / W);
    const a = aField[i], b = bField[i], ab2 = a * b * b;
    const noise = rng.nextGaussian() * landianAcc;
    const nextA = Math.max(0, Math.min(1,
      a + Da * (laplace(aField, x, y, W, H) + deltaA[i]) - ab2 + F * (1 - a) + noise));
    const nextB = Math.max(0, Math.min(1,
      b + Db * (laplace(bField, x, y, W, H) + deltaB[i]) + ab2 - (K + F) * b));
    cells[i] = { ...out.cells[i], A: nextA, B: nextB };
  }
  const entropy = calcEntropy(cells, N);
  let govZone: MorphogeneticState['govZone'] = 'MORPHOGENETIC_ZONE';
  if (entropy < 0.15) govZone = 'CARROLL_COLLAPSE';
  else if (entropy > 0.85) govZone = 'LANDIAN_FLASHOVER';
  return {
    ...out, cells, entropy, govZone,
    stateDigest: digestObject({
      width: W, height: H, seed, preset: state.preset,
      stepCount: out.stepCount, entropy: Number(entropy.toFixed(6)),
    }),
  };
}
