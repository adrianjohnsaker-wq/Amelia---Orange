/**
 * pfm-null-control-assay.ts
 *
 * Same-regime null-control extension to the Poincaré separation assay
 * reported in "Constitutive history and differentiated recurrence" (§21-29).
 * Implements the three manipulations proposed as future work in §45:
 *
 *   NATURAL        — unmodified lineages, as already reported in Table 1.
 *   ABLATED         — both lineages' PFM tensor reset to a zero baseline at
 *                     the matched observed projection, before the return map
 *                     is computed. Tests whether removing PFM collapses D
 *                     toward a null range.
 *   NEUTRAL_RESET   — both lineages' PFM tensor reset to a shared canonical
 *                     baseline tensor (e.g. sampled from the ground-state
 *                     Plex-binary baseline, §26) rather than zero. Distinct
 *                     from ABLATED: this tests whether *equalizing* history
 *                     collapses D, not whether *removing* it does.
 *   TRANSPLANT      — lineage alpha's and lineage beta's PFM tensors are
 *                     exchanged before computing returns. The strongest
 *                     causal test: if separation follows the tensor rather
 *                     than the lineage, D(alpha-with-m_beta, beta) should
 *                     collapse relative to D(alpha, beta) natural.
 *
 * This module does NOT implement Amelia's substrate mechanics. It defines
 * AmeliaSubstrateAdapter as the integration boundary; bind it to the
 * existing Firebase/Firestore-backed substrate so that null-control
 * conditions are evaluated with the identical Poincaré section, distance
 * function, and return-map procedure already used for Table 1 — not a
 * re-implementation of them. No function here performs linguistic
 * rendering, interpretation, or regime reclassification: that separation
 * is preserved deliberately (see gemini-assay-protocol.md).
 */

// ---------- Core data types ----------

export interface PFMTensor {
  /** 10x10 elastoplastic deformation tensor M[i][j]. */
  matrix: number[][];
}

export interface ObservedProjection {
  /** Declared field/topology projection o_t used for regime classification and Sigma. */
  field: number[];
  topology: number[];
}

export interface LineageSnapshot {
  seed: number;
  depth: number;
  observed: ObservedProjection;
  pfm: PFMTensor;
  regime: string;
}

export type NullCondition = 'NATURAL' | 'ABLATED' | 'NEUTRAL_RESET' | 'TRANSPLANT';

export interface PFMParams {
  /** Plasticity rate. Manuscript default 0.05 (§18). */
  eta: number;
  /** Syzygetic resonance term. Manuscript default 0.25 (§18). */
  kappa: number;
}

// ---------- Integration boundary ----------
// Implement this against the live substrate. Every method must reuse the
// exact procedure already used to produce Table 1 — the null-control
// conditions are only informative as a control if the instrumentation is
// identical to the reported assay.

export interface AmeliaSubstrateAdapter {
  /** Advance a lineage to `depth` under `params`. Returns its snapshot at the
   *  point where Sigma is evaluated and regime membership (R) is classified. */
  conditionLineage(seed: number, depth: number, params: PFMParams): Promise<LineageSnapshot>;

  /** Compute P_m(o*): the return map for `observed` under tensor `pfm`.
   *  Must be the same procedure used for the reported Table 1 values. */
  computeReturn(observed: ObservedProjection, pfm: PFMTensor): Promise<ObservedProjection>;

  /** The declared phase-space distance d(.,.), identical to the manuscript's. */
  distance(a: ObservedProjection, b: ObservedProjection): number;

  /** Governor entropy H at the point of comparison, for the viability-band record. */
  governorEntropy(observed: ObservedProjection, pfm: PFMTensor): Promise<number>;

  /** A canonical baseline tensor for NEUTRAL_RESET — e.g. sampled from the
   *  ground-state Plex-binary baseline (§26). Must NOT be the zero tensor;
   *  that would collapse this condition into ABLATED and defeat the point
   *  of running both. */
  canonicalBaselineTensor(): Promise<PFMTensor>;
}

// ---------- Tensor manipulations ----------

export function zeroTensor(size = 10): PFMTensor {
  return { matrix: Array.from({ length: size }, () => Array(size).fill(0)) };
}

export function ablate(state: LineageSnapshot): LineageSnapshot {
  return { ...state, pfm: zeroTensor(state.pfm.matrix.length) };
}

export function neutralReset(state: LineageSnapshot, baseline: PFMTensor): LineageSnapshot {
  return { ...state, pfm: { matrix: baseline.matrix.map(row => [...row]) } };
}

export function transplant(
  a: LineageSnapshot,
  b: LineageSnapshot,
): [LineageSnapshot, LineageSnapshot] {
  return [
    { ...a, pfm: { matrix: b.pfm.matrix.map(row => [...row]) } },
    { ...b, pfm: { matrix: a.pfm.matrix.map(row => [...row]) } },
  ];
}

// ---------- Dispersion statistics (review point 2) ----------

export interface Dispersion {
  n: number;
  mean: number;
  sd: number;   // sample SD, n-1 denominator; 0 when n=1
  range: number;
  cv: number;   // coefficient of variation, sd / mean
}

export function dispersion(values: number[]): Dispersion {
  const n = values.length;
  const mean = values.reduce((s, v) => s + v, 0) / n;
  const variance =
    n > 1 ? values.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1) : 0;
  const sd = Math.sqrt(variance);
  const range = Math.max(...values) - Math.min(...values);
  return { n, mean, sd, range, cv: mean !== 0 ? sd / mean : NaN };
}

// ---------- Assay orchestration ----------

export interface DepthLedgerRow {
  depth: number;
  condition: NullCondition;
  pairwise: number[];
  disp: Dispersion;
  entropyRange: [number, number];
}

// Extend beyond the manuscript's three canonical seeds if more df are wanted
// for the dispersion estimate (see review point 2 and §40's own recommendation
// to increase the cohort before treating the curve as more than directional).
const CANONICAL_SEEDS = [101, 202, 303] as const;

function allPairs<T>(items: readonly T[]): [T, T][] {
  const pairs: [T, T][] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) pairs.push([items[i], items[j]]);
  }
  return pairs;
}

export async function runNullControlAssay(
  adapter: AmeliaSubstrateAdapter,
  depths: number[],
  params: PFMParams = { eta: 0.05, kappa: 0.25 },
  conditions: NullCondition[] = ['NATURAL', 'ABLATED', 'NEUTRAL_RESET', 'TRANSPLANT'],
  seeds: readonly number[] = CANONICAL_SEEDS,
): Promise<DepthLedgerRow[]> {
  const ledger: DepthLedgerRow[] = [];
  const pairs = allPairs(seeds);

  for (const depth of depths) {
    const snapshots = new Map<number, LineageSnapshot>();
    for (const seed of seeds) {
      snapshots.set(seed, await adapter.conditionLineage(seed, depth, params));
    }
    const baseline = await adapter.canonicalBaselineTensor();

    for (const condition of conditions) {
      const pairwise: number[] = [];
      const entropies: number[] = [];

      for (const [seedA, seedB] of pairs) {
        let a = snapshots.get(seedA)!;
        let b = snapshots.get(seedB)!;

        switch (condition) {
          case 'ABLATED':
            a = ablate(a); b = ablate(b); break;
          case 'NEUTRAL_RESET':
            a = neutralReset(a, baseline); b = neutralReset(b, baseline); break;
          case 'TRANSPLANT':
            [a, b] = transplant(a, b); break;
          case 'NATURAL':
          default:
            break;
        }

        const returnA = await adapter.computeReturn(a.observed, a.pfm);
        const returnB = await adapter.computeReturn(b.observed, b.pfm);
        pairwise.push(adapter.distance(returnA, returnB));
        entropies.push(await adapter.governorEntropy(a.observed, a.pfm));
        entropies.push(await adapter.governorEntropy(b.observed, b.pfm));
      }

      ledger.push({
        depth,
        condition,
        pairwise,
        disp: dispersion(pairwise),
        entropyRange: [Math.min(...entropies), Math.max(...entropies)],
      });
    }
  }

  return ledger;
}

// ---------- Hyperparameter sensitivity sweep (review point 4) ----------

export interface SensitivityRow {
  eta: number;
  kappa: number;
  depth: number;
  disp: Dispersion;
}

const DEFAULT_ETA_GRID = [0.025, 0.05, 0.075, 0.10];
const DEFAULT_KAPPA_GRID = [0.10, 0.25, 0.40];

export async function runSensitivitySweep(
  adapter: AmeliaSubstrateAdapter,
  depths: number[],
  etaGrid: number[] = DEFAULT_ETA_GRID,
  kappaGrid: number[] = DEFAULT_KAPPA_GRID,
  seeds: readonly number[] = CANONICAL_SEEDS,
): Promise<SensitivityRow[]> {
  const rows: SensitivityRow[] = [];
  for (const eta of etaGrid) {
    for (const kappa of kappaGrid) {
      const ledger = await runNullControlAssay(
        adapter, depths, { eta, kappa }, ['NATURAL'], seeds,
      );
      for (const row of ledger) rows.push({ eta, kappa, depth: row.depth, disp: row.disp });
    }
  }
  return rows;
}

// ---------- Donor-alignment statistic ----------
//
// Raw TRANSPLANT distance cannot distinguish "the tensor carries
// lineage-specific influence" from "the two outcomes traded places and left
// the pairwise gap roughly where it was." A bidirectional swap does not have
// to collapse pairwise D even when the tensor is doing all the work. The
// decisive statistic is whether each transplanted lineage's return lands
// nearer its DONOR's natural return than its own.
//
//   donorAlignment(a) = d(return(a-with-b's-tensor), naturalReturn(b))
//                      - d(return(a-with-b's-tensor), naturalReturn(a))
//
// Negative -> a-with-b's-tensor sits closer to b's natural outcome than to
//             its own -> the tensor carries donor-specific developmental
//             influence.
// Positive -> a-with-b's-tensor stays closer to its own lineage's natural
//             outcome -> lineage identity persists despite the transplant.

export interface DonorAlignmentResult {
  depth: number;
  seedA: number;
  seedB: number;
  alignmentA: number; // A carrying B's tensor
  alignmentB: number; // B carrying A's tensor, reciprocal test
}

export async function runDonorAlignmentAssay(
  adapter: AmeliaSubstrateAdapter,
  depths: number[],
  params: PFMParams = { eta: 0.05, kappa: 0.25 },
  seeds: readonly number[] = CANONICAL_SEEDS,
): Promise<DonorAlignmentResult[]> {
  const results: DonorAlignmentResult[] = [];
  const pairs = allPairs(seeds);

  for (const depth of depths) {
    const snapshots = new Map<number, LineageSnapshot>();
    for (const seed of seeds) {
      snapshots.set(seed, await adapter.conditionLineage(seed, depth, params));
    }

    for (const [seedA, seedB] of pairs) {
      const a = snapshots.get(seedA)!;
      const b = snapshots.get(seedB)!;

      const naturalReturnA = await adapter.computeReturn(a.observed, a.pfm);
      const naturalReturnB = await adapter.computeReturn(b.observed, b.pfm);

      const [aTransplanted, bTransplanted] = transplant(a, b);
      const transplantReturnA = await adapter.computeReturn(
        aTransplanted.observed, aTransplanted.pfm,
      );
      const transplantReturnB = await adapter.computeReturn(
        bTransplanted.observed, bTransplanted.pfm,
      );

      const alignmentA =
        adapter.distance(transplantReturnA, naturalReturnB) -
        adapter.distance(transplantReturnA, naturalReturnA);
      const alignmentB =
        adapter.distance(transplantReturnB, naturalReturnA) -
        adapter.distance(transplantReturnB, naturalReturnB);

      results.push({ depth, seedA, seedB, alignmentA, alignmentB });
    }
  }

  return results;
}

export function donorAlignmentToMarkdownTable(results: DonorAlignmentResult[]): string {
  const header =
    '| Depth D | Seed A | Seed B | Alignment A | Alignment B | Reading |\n' +
    '|---|---|---|---|---|---|\n';
  const rows = results.map(r => {
    const reading =
      r.alignmentA < 0 && r.alignmentB < 0 ? 'both track donor'
      : r.alignmentA >= 0 && r.alignmentB >= 0 ? 'both retain own lineage'
      : 'mixed';
    return `| ${r.depth} | ${r.seedA} | ${r.seedB} | ${r.alignmentA.toFixed(4)} | ` +
      `${r.alignmentB.toFixed(4)} | ${reading} |`;
  }).join('\n');
  return header + rows;
}

// ---------- Same-regime null envelope (the missing §21-22 criterion) ----------
//
// Zero was never the right bar for "history-indifferent." The predeclared
// envelope is the distribution NEUTRAL_RESET itself produces — lineages
// sharing a canonical, non-zero PFM state. NATURAL only counts as
// history-differentiated if it clears that envelope, not merely if it's
// nonzero. `n` is surfaced deliberately: a percentile computed from three
// values is not a meaningful percentile, and any report using this function
// must say so rather than let the number stand alone.

export interface NullEnvelopeResult {
  depth: number;
  envelope: number;
  naturalMean: number;
  exceedsEnvelope: boolean;
  n: number;
}

export function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export function checkNaturalAgainstEnvelope(
  depth: number,
  naturalValues: number[],
  neutralResetValues: number[],
  p = 0.95,
): NullEnvelopeResult {
  const envelope = percentile(neutralResetValues, p);
  const naturalMean = dispersion(naturalValues).mean;
  return {
    depth,
    envelope,
    naturalMean,
    exceedsEnvelope: naturalMean > envelope,
    n: neutralResetValues.length,
  };
}

// ---------- Verdict classification ----------
//
// perm_p_fdr >= alpha means "no difference detected," not "no difference
// exists." Labelling that DIFFERENTIATION_REJECTED asserts equivalence
// without an equivalence test having been run. This classifier will not
// return an equivalence verdict at all — it only distinguishes detected
// differentiation from a non-result. Claiming equivalence requires a
// prespecified margin and an actual equivalence test (e.g. TOST), which
// is deliberately not implemented here until the cohort is large enough
// for the inputs to it to mean something (see the module-level note on
// bootstrap/permutation validity at n=3).

export type Verdict = 'DIFFERENTIATION_SUPPORTED' | 'NO_DIFFERENCE_DETECTED' | 'INDETERMINATE';

export function classifyVerdict(
  permPFdr: number | null,
  effectSize: number | null,
  alpha = 0.05,
  effectThreshold = 0.5,
): Verdict {
  if (permPFdr === null || effectSize === null) return 'INDETERMINATE';
  if (permPFdr < alpha && Math.abs(effectSize) >= effectThreshold) {
    return 'DIFFERENTIATION_SUPPORTED';
  }
  if (permPFdr >= alpha) return 'NO_DIFFERENCE_DETECTED';
  return 'INDETERMINATE';
}

// ---------- Ledger export (Table-1-compatible format) ----------

export function toMarkdownTable(ledger: DepthLedgerRow[]): string {
  const header =
    '| Depth D | Condition | Mean D | SD | Range | CV | Entropy range |\n' +
    '|---|---|---|---|---|---|---|\n';
  const rows = ledger.map(r =>
    `| ${r.depth} | ${r.condition} | ${r.disp.mean.toFixed(4)} | ${r.disp.sd.toFixed(4)} | ` +
    `${r.disp.range.toFixed(4)} | ${(r.disp.cv * 100).toFixed(1)}% | ` +
    `${r.entropyRange[0].toFixed(4)}-${r.entropyRange[1].toFixed(4)} |`
  ).join('\n');
  return header + rows;
}

export function sensitivityToMarkdownTable(rows: SensitivityRow[]): string {
  const header =
    '| eta | kappa | Depth D | Mean D | SD | CV |\n' +
    '|---|---|---|---|---|---|\n';
  const body = rows.map(r =>
    `| ${r.eta} | ${r.kappa} | ${r.depth} | ${r.disp.mean.toFixed(4)} | ` +
    `${r.disp.sd.toFixed(4)} | ${(r.disp.cv * 100).toFixed(1)}% |`
  ).join('\n');
  return header + body;
}
