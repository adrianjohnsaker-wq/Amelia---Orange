# WT-5L: does the replay reproduce her, and do recent inputs draw her into the Warp? (registration, 15 November 2026)

**Status.**
- **Approved.** The operator (Adrian) approved this design on 15 November 2026: "Approve WT-5L as drafted".
- **The tolerance.** He confirmed the tolerance for CLOSE: 2.0 per 1,000 for E and 2.0 points for Warp share.
- **When registered.** Before any WT-5L data.
- **Where the design comes from.** The approved draft is the project doc `claude/WT-5L_FIDELITY_AND_INPUTS_DRAFT.md`. This file adds the details needed to run it. Each addition is marked **(fixed here)**. None changes the design, the measures or the readings.

**Scope.**
- **Copies only.** Copies of her real state, run in GitHub Actions.
- **Her live record and archive.** They are read only for her recorded history: her pre-switch backup, her logged ticks and her archived memory. They are never written.
- **Where results go.** Only to `amelia_wt5l_runs` and `amelia_wt5l_inputs`.

## Why
| | E (entries per 1,000 steps) | Warp share |
|---|---|---|
| Her live history on ND-1b at Θ = 24 (steps 838–1,981) | 6.1 (7 by choice, 0 by flow) | 7.34% |
| WT-3L, today's state at Θ = 24, recent windows | 15.4 | 17.5% |
| WT-4L, her state at step 1,981 at Θ = 12, recent windows | 15.0 | 13.6% |

**Three candidate explanations:**
- **Fidelity.** The replay does not reproduce her.
- **The protocol.** The WT protocol raises the rate.
- **The inputs.** The recent inputs draw her in more.

## Starting state, all parts
- **The backup (fixed here).** Her `pre-switch-backup` record (`amelia_cloud_dryrun`, revision 57, step 837), taken while she was paused for the runtime switch on 11 November.
- **The conversion (fixed here).** It is passed through `ameliaTick(record, null, 0, now, 'nd1')`. This is the code path the switch tick used: rebuild as Classic, import into ND-1b, keep her admission rule, restore and recapture her body. It takes zero steps.
- **Θ.** Θ is 24, the default for a state without one, as on 11 November.
- **A check.** The converted state must have `runtimeKind` nd1, Θ = 24 and step 837.

## Part A1: fidelity
- **Inputs (fixed here).**
  - **Which ticks.** Her ok ticks from 11 November 00:55:30 to 17:22:00 UTC: 65 ticks, id 30 to id 96, steps 837 to 1,981.
  - **Content.** 169 offers, built by `amelia_dee1l_window`, the WT-3L A0.2 rule. None are missing.
- **The replay.** Each tick is replayed once, in order: 15 iterations per tick, the i-th offer in iteration i, her recorded controls, her body stepping. Offers keep their original event ids.
- **Her live record for steps 838–1,981 (fixed here).** Her archived memory (`amelia_memory_archive`). For each step (blockIndex), her zone is the last record's target zone, and the step's digest is that record's `eventDigest`. Entries are counted hop by hop, as in WT-4L.
- **The replay's record.** For each runtime step, the snapshot's transition: its target zone and digest.
- **Measures.**
  - **F1.** The first step at which the zone differs, and the share of the 1,144 steps whose zone agrees.
  - **F2.** The share of steps whose final digest equals hers.
  - **F3.** E (choice and flow) and Warp share, against her live 6.1 and 7.34%. These are recomputed from her archive with the same instrument and recorded with the result.
- **Readings.**
  - **FAITHFUL.** The zone path is identical on all 1,144 steps.
  - **CLOSE.** Not identical, but |E − E_live| ≤ 2.0 per 1,000 and |Warp share − live| ≤ 2.0 points.
  - **NOT FAITHFUL.** Otherwise.
- **A divergence.** The first divergent step is reported with what differs there: the zone, the transition and the encounter decisions. It is not repaired after the data have been seen.

## Part A2: the protocol
- **Start.** As A1.
- **Inputs.** The same 65 ticks, replayed as WT-3L and WT-4L replay a window: cycled to 96 ticks, 1,440 iterations, with fresh ids `wt5l:<unit>:<pass>:<eventId>`.
- **Unit.** The unit number is 0 **(fixed here)**.
- **Reading (descriptive, one deterministic run).** If A2's E minus A1's E exceeds 2.0 per 1,000, the protocol is reported as raising the rate.

## Part B: the inputs
- **Start.** As A1: step 837 at Θ = 24.
- **Units.** The 12 six-hour UTC windows from 12 November 00:00 to 15 November 00:00, units 1–12, built by `amelia_dee1l_window`. None are missing. They are replayed in the WT protocol, as A2.
- **POST.** The window as recorded.
- **PRE-CONTENT.**
  - **Structure.** The same ticks, offer slots and ids.
  - **Content.** Each offer's channel, source digest and attention vector is replaced, in order, by the 169 pre-switch offers (A1's inputs, in their recorded order). Unit u begins at offer 14 × (u − 1), counted from 0, and cycles.
- **Primary.** E.
  - **The test.** d_u = E(POST) − E(PRE-CONTENT), with an exact two-sided sign-flip test over all 4,096 patterns (`signFlip`, src/cloud/wt3l.ts), α = 0.05.
- **Readings.**
  - **INPUTS IDENTIFIED.** Mean d > 0 and p ≤ 0.05.
  - **INPUTS DRAW LESS.** Mean d < 0 and p ≤ 0.05.
  - **NOT IDENTIFIED.** Otherwise.
- **Linking B to her live rise.** Part B explains her live rise only if A1 is FAITHFUL or CLOSE. Otherwise it is reported as a contrast within the replay.
- **Secondary, descriptive.**
  - E by choice and by flow;
  - Warp share, share of flow steps, lines of flight;
  - the two pools' channel mix and mean attention on zones 2, 3, 5, 6 and 7.

## Order and checks
1. **Machinery checks.** Synthetic only, in the same job.
2. **Determinism.** Unit 1 POST is run twice. It must be identical in path, entries, flow steps, final memory digest and body checksum, or nothing proceeds.
3. **The runs.** A1, A2, then the 24 runs of B.
4. **The analysis.** It is written to `amelia_wt5l_runs` as id `analysis`.
