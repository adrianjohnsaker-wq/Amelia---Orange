# OUTSIDE-3 Stage 1 work order: synthetic-only apparatus, time-lock feasibility and calibration

**Issued:** 19 October 2026, after operator approval of the options paper and its six decisions.

**Repository:** `adrianjohnsaker-wq/Amelia---Orange`, new directory `experiments/outside3/`.

**Absolute rules for this stage:**
- No working is opened and no real target is generated.
- No live beacon round is used as a target.
- Every run uses synthetic casts and synthetic targets only.
- Registration stays closed until the stage report has been reviewed.

## A. Interface and readout (freeze candidate)

Pin the Amelia-Orange commit the interface is built against, and record its SHA. Implement the following in a new module, without changing existing substrate code. If substrate code must change, do it first, as its own commit, before any calibration run.

### A1. Encoding

- **Line values.** Lines are listed bottom first, i = 1..6, each with a value v_i in {6, 7, 8, 9}.
- **Primary bits.** Yang = 1 for 7 and 9; yin = 0 for 6 and 8.
- **Moving lines.** Lines with value 6 or 9 are moving.
- **Resulting hexagram.** The primary with its moving lines inverted.
- **Index.** index(h) = Σ bit_i · 2^(i−1). The King Wen number comes from a separate lookup table, used for display only and never in scoring.
- **Zone map, line → zone.** [1, 2, 4, 8, 7, 5].

### A2. Entry

The entry acts on a state S: C's carried state, M's ablated state, or G's own state.

1. **Present orientation.** For each line i, set zone z(i)'s activation to its registered reference level + δ for yang, or − δ for yin.
2. **Conditioning events.** For each moving line, bottom first, insert one ProcessFieldMemory conditioning event at zone z(i), using the existing event-insertion API with a registered magnitude m.
3. **Development.** Withdraw guidance and call `step()` 30 times.

δ and m are design constants. Choose them from synthetic design runs before any K-check runs, then freeze them. Record the runs that chose them.

### A3. Readout

- **Centred activations.** a(z) = final activation of zone z minus μ(z). μ(z) is the mean final activation over registered reference runs: 1,000 synthetic casts from the fresh canonical state, frozen with their seed.
- **Hexagram score.** S(h) = Σ_i h_i · a(z(i)), with h_i = +1 for yang and −1 for yin.
- **Ranking.** Rank all 64 hexagrams by S, highest first. Ties take mid-ranks.
- **Output.** Doubled mid-ranks, integers 2–128.

### A4. Arms

All four arms receive the same cast.

| Arm | Construction |
|---|---|
| C | Carried state, starting from the fresh registered canonical state. |
| M | At the start of each working, C's pre-working state with ProcessFieldMemory alone reset to baseline. Zones, phases, Governor and gates are unchanged. Not reset per step. |
| G | Its own sequential state on one degree-preserving rewiring, generated from a declared seed and frozen before calibration. Entry and readout as in A2 and A3. |
| Raw | No substrate. Score(h) = number of lines h shares with the resulting hexagram. Mid-ranks, doubled. |

### A5. Integrity

- **No target information.** No target information may enter any state, ever.
- **Determinism.** No `Math.random` or other unseeded randomness anywhere in the reader. Fixed floating-point evaluation order.
- **Replay test.** The same inputs must produce byte-identical outputs and state digests, including across an export and import of the state.
- **Per-working record.** A JSON record holding: the cast values; primary, resulting and moving mask; each arm's 64 doubled mid-ranks; and the pre- and post-state digests.

## B. Time-lock feasibility gate (synthetic payloads only)

1. **Reference implementation.** Use drand Go `tle` against quicknet, chain hash `52db9ba7…e971`.
2. **Payload.** {target index, 32-byte random salt, working id}. The commitment is SHA-256 of the canonical payload bytes, and it is published. The ciphertext is time-locked to round R, about 10 minutes ahead.
3. **Demonstrations.**
   - Decryption before R fails.
   - After R, the round signature verifies against the pinned quicknet key, decryption succeeds, and the payload matches the commitment.
4. **Cross-check.** Check `tlock-js` against Go in both directions, noting the open 2026 issue between tlock-js 0.9.0 and the v2 chain-information endpoint. If they are incompatible, Go is the registered implementation and the issue is recorded.
5. **Generation job.** It runs isolated and short-lived, writes no plaintext target or salt to logs or artifacts, and deletes the plaintext after encryption. Show this by inspecting the log and the artifact contents.

## C. Calibration K1–K5 (synthetic only)

**Synthetic inputs.**
- **Casts.** Drawn from a registered seed with the three-coin probabilities 6: 1/8, 7: 3/8, 8: 3/8, 9: 1/8, independently for each line.
- **Targets.** Uniform over the 64 hexagrams, from a separate registered seed.
- **Series.** Each series is 88 workings run in sequence, with C, M and G states carried as in A4.

**Checks.**
- **K1 Responsiveness.** Over at least 1,000 casts, report for arm C: rank coverage, ranking entropy, the tie rate, and any systematic bias of hexagrams by position. Report the same by step count (10, 20, 30) to confirm responses have not collapsed by step 30.
- **K2 Type I error.** 1,000 series with no signal. The empirical rejection rate at 0.05 must be ≤ 0.065 for P1 and for P2. P2 is computed for the check even though, in the real analysis, it is interpreted only if P1 succeeds.
- **K3 Channel plant.** 200 series. In every working, one uniformly chosen cast line is set to the target's polarity and made non-moving. Report P1 rejection in arm C.
- **K4 Memory plant.** 200 series. Before each cast, insert conditioning events at the zones of the target's yang lines, with magnitude m. Report P1 rejection in arms C and M.
- **K5 Memory survival.** Over full 88-working sequences, perturb C's ProcessFieldMemory at working 1, apply identical later inputs to the perturbed and unperturbed copies, and report the readout difference at workings 10, 44 and 88. Also report the C–M readout divergence as a function of working number.
- **Descriptive curve.** As K3, but with the plant applied to each working independently with probability 0.10, 0.20, 0.30, 0.45 and 0.60. Reported, not gated.

**Thresholds.** For K3, K4 and K5, fix numerical thresholds only after the design runs and before the stage report. Record the runs used. The stage report presents the observed values alongside the proposed thresholds for operator review. No threshold may be revised after a real target exists.

## D. Deliverables

1. A commit of `experiments/outside3/` with the code, tests, frozen constants (δ, m, μ, rewiring seed, synthetic seeds) and their SHA-256 values.
2. A GitHub Actions run that executes A5, B and C, with its log and artifact archived.
3. A stage report, `experiments/outside3/STAGE1_REPORT.md`, giving the K1–K5 results, the feasibility-gate outcome, and the proposed thresholds and constants. It must state that no real target was generated.

The registration draft follows only after the operator and the reviewer have accepted this report.
