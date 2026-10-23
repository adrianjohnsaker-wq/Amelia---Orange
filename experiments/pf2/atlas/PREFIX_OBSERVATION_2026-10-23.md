# Capture & Selection Atlas — first descriptive prefix
**Snapshot compiled 2026-10-23. EXPLORATORY; no interim registered PF-2 test.**

## Provenance and coverage
- Existing PF-2 archive, **16** chunk records, **292** admitted ticks (tick indices 0–291; per-lineage runtime steps 1–292), 18 lineages, **5,256** observed lineage-step events.
- Signed GENESIS R0 **33298740**; observed rounds **33298740–33304560**; first/last tick UTC time given in archived \`roundTime\`.
- Chain head at tick 291: \`7f45added0c14e4f97104e56496955d9bf1d2222ed77be215debbec93df58d66\`.
- Each of 16 chunk JSON records reports \`verifiedStatus: PASS\`. This descriptive tally **did not independently execute** the BLS/RFC3161 verifier or fresh Numogram runtime exact-replay; both are prerequisites for externally claiming a newly verified derived atlas.
- PF-2 archival scanner: **159** recurrence detections, **87** graph-eligible detections, **76** created fork tasks, **1,420** evaluated fork instances, **0** confirmed Pandemonium encounters. These are different units and must NOT be pooled.
- Source scope: \`experiments/pf2/live/GENESIS.json\`, \`STATE.json\`, \`chunks/00000000.json\` through \`chunks/00000286.json\`, and the original sealed registration/receiver/cue mapper. Underlying observations and registration untouched.

## Directly tallied cue, V and mortality context

| Measure | Learner | Unchanged control |
|---|---:|---:|
| Branching choices at zones 1,2,4 | 890 | 888 |
| Choices with cue naming an open exit | 198 | 193 |
| Followed cue when open | 152/198 (76.8%) | 146/193 (75.6%) |
| Sinkward open cue followed | 46/92 (50.0%) | 41/88 (46.6%) |
| Other open cue followed | 106/106 | 105/105 |
| Choices with nonzero inherited V contribution | 805 | 0 (control by construction) |
| Refrain updates with positive outcome | 58 | 0 (control by construction) |
| Recorded deaths | 2 | 2 |

Among learner open-cue decisions where V favoured the **opposite** available exit, 25/89 did **not** follow the cue; the other 64 followed despite the contrary V difference. Those counts measure **competition in score contributions**, not unique causal settlement by the cue or by V.

Exactly **five of nine** learner/control arms have diverged by tick 291. First differing archived input-step indices and transition pairs:
- R02, archived tick **67**: learner 1→8, control 1→2, cue 2, physical round **33300080**.
- R05, archived tick **84**: learner 1→2, control 1→8, cue 2.
- R07, archived tick **159**: learner 1→2, control 1→8, cue 2.
- R06, archived tick **260**: learner 1→2, control 1→8, cue 2.
- R03, archived tick **277**: learner 1→2, control 1→8, cue 2.
- C, R01, R04 and R08 still have the same realized transitions within this short prefix.

After the FIRST divergence, subsequent learner/control trajectory differences can reflect both accumulated V and newly differing histories; they are **not independent proofs** of V influence. The first matched divergence is the cleaner comparison.

Two paired deaths were on R02 (tick 55, cue zone 1) and R08 (tick 191, cue zone 5). There are no after-third-death eligible learner mortality records in this prefix. Do not evaluate P2-1 or P2-2 ahead of their registered windows.

## Attribution boundary

**These figures validate observed influence and establish the universe of observations for a same-state attribution assay.** They do not count how many exits would have changed *had the cue or V been removed*. Hence **no numerical causal capture index is claimed yet**.

The additive offline source \`PF2_CAPTURE_SELECTION_ATLAS.mjs\` implements an exact pre-choice four-way analytic comparison during fresh deterministic read-only replay and fails closed unless every archived event and the final 18-lineage engine match the live archive. Until that program runs and passes, treat causal capture and V-pivotal counts as **PENDING**, not zero or estimated.

## Agency hypothesis: deliberately deferred

The next test, after confirming influence, is whether the external pattern maintains or reproduces an organising power across multiple encounters and interventions, rather than merely changing one receptor choice. Signed independent future challenge; fresh predictions and graph/place/lineage/sham controls required. No metaphysical or conscious entity claim follows from this descriptive prefix.
