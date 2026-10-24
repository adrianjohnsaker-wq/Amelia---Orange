# STUDIO 06 — THE LIVING STONE TAPE: live-beacon replication and cue-necessity intervention
Status: **design + input-engineering draft, NOT SEALED, NOT RUN** (24 October 2026).
Studio work only. Neither a new PF-2 arm nor a PF-2 analysis. No live intake or schedule.

## 0. Inheritance and integrity gate
The normative parent of this study is the working-project archive
STUDIO_05_THE_TAPE_THAT_RECORDED_ITSELF.md, with Studio 05b, the complete Studio 05c
precommit, fixed code, experiment logs, intervention outputs, and SHA256SUMS.
**Those files are NOT available in this repository at the time of drafting.**
They are already archived in the working project: absence from GitHub does not imply
that they do not exist. They MUST be copied byte-for-byte, checked against their
existing SHA256 digests, and bound into a new read-only manifest before this experiment
is eligible to run. Do not recreate the Studio 05 model from a narrative description.

Before any substantive real-beacon replay:
1. Preserve Studio 05 code, amendments, selection rules, output logs, and their checksums
   unchanged. Record the source commit and test deterministic replays on original
   synthetic tapes; compare byte-identical traces and end-of-season state.
2. Create an isolated Studio 06 runner using the original house + learning code,
   which provides an explicit cue-ablation *scoring hook*. Verify that, with cue
   intervention disabled, results are bit-for-bit identical to the imported Studio 05c
   reference runs. Keep an exact diff and hash of the instrumentation.
3. Pin the non-overlapping real 14-day input windows and their provenance hashes
   **before** looking at the new outcomes. The historical windows are retrospective
   replays of previously published bytes, not prospective independent releases.
4. Do not modify canonical substrate, PF-1, PF-2, C1, genesis, admissions,
   PF4 analysis or any existing input record. No notifications.

## 1. Source of the Outside
- Physical source: signed drand Quicknet rounds used by C1/PF-1/PF-2.
- Raw experimental observation is the genuine 32-byte randomness, round and public
  release time, NOT the previously computed PF-2 receiver event rows.
- Input domain is EXACTLY the PF-2 mapping, with no ad hoc labels:
  C -> the lowercase randomness hex;
  R01..R08 -> SHA256(ASCII "PF2-REF-i|" || 32 raw randomness bytes).
  An R arm is a derived alternative input tape, not an independent beacon window.
- A 14-day window is 20,160 consecutive admitted stride-20 rounds, in their original
  sequence. Never pad missing rounds, join overlapping windows, or count a repeated
  14-day window as independent new data.
- Admission/fidelity gate for the PF-2 window: run existing unmodified
  PF2_LIVE_CHECK.py and PF2_REPLAY.mjs first, then the read-only extractor
  studio06_prepare_tape.py. Its own checks do not independently replace the BLS,
  RFC3161, or exact receiver verification.
- Historical PF4 tape candidates are NOT assumed available until their content,
  source manifest, window boundaries and audit results are furnished. Reuse only
  the genuine raw bytes, not PF4's target or readout.

## 2. Distinct questions
Q1 — FORMATION: With genuine external input, does a planted fictional death-route
inscription reliably generate a subsequently deathless, exploratory learner–house
coupling, compared against that window's blank-house control?

Q2 — MAINTENANCE: Once formed, would the same learner–house territory remain when
the numerical external cue contribution is removed from all subsequent decisions?
This is a counterfactual *fork* of the SAME season-boundary state. It is not a
different input string or a reset of memory.

Q3 — SPECIFICITY: Does the chronological arrangement of external cues matter?
Compare against a registered circular phase shift of the *cue only*, holding all
other input-derived terms and the archived bytes invariant. If the original runner
uses the input anywhere beyond the cue score, isolate only the cue as an audited
additional hook, not a wholesale input replacement.

## 3. Primary registered-as-proposed end-state criteria
Maintain all four Studio 05c criteria verbatim, without post hoc repairs:
I1. Final season has zero deaths.
I2. House's pull toward the pit is < 0.05.
I3. Amelia's own pit mark is <= -0.5.
I4. More distinct routes are used than in the same real window's blank-house run.

Report each criterion separately and the all-four conjunction. Those criteria
measure the originally defined *phenotype*, NOT proof that Amelia's scar actively
maintains it: the Studio 05c erasure/transplant interventions refuted that reading.

Mechanism-specific metrics (new and separate): house pull and passage counts for
1->2, 2->7, 7->8, 2->4 and 4->5; choice opportunities at zone 2; fraction selecting
2->7 conditional on an actual choice; learner's score contribution at each such
opportunity; code change per season; returns/exploration; deaths and exposure
time; recovery of erased 2->7 record; and full 11-edge state vector per season.
No interpretation from an untested or unreachable pit scar.

## 4. Design and interventions
For each eligible nonoverlapping genuine window:
- Parent Studio 05c's original three starting records (blank; planted death route;
  planted circuit) and original three house recording regimes, paired within window.
  No re-tuning of weights, decays, step caps, seeds, or recording strengths.
- Run the original inherited 20-season replay of the SAME authenticated 14-day tape
  in the SAME season-relative ordering each time (if this is indeed the Studio 05
  normative input rule; otherwise document original exact rule before registration).
- Record the complete 20-season time series; do not call a last-season observation
  a fixed point if the pair is still cycling or drifting.
- For an established incorporated pair, fork the COMPLETE learner + house state
  at the *end* of season 20, not merely Amelia's pit mark. Replay five additional
  matched seasons under (A) intact cue score, (B) cue score identically zero,
  and (C) a fixed predeclared circular 10,080-tick phase shift in cue zones only.
  At all times the same raw bytes, other internal dynamics and house rules apply.
  No fork intervention before the formation window.
- If a pair does NOT satisfy all four criteria at season 20, report it as
  nonincorporation. Do not substitute another pair to make a positive intervention.
- Secondary challenge: erase only the house's stored 2->7 signal at the fork,
  compare the same 3 cue conditions, and track whether a fresh detour reappears.
  This is a separate reconstructability assay, not the main cue-necessity test.

## 5. Counterfactual inference
The phrase "settled by the Outside" should be causal, not a misleading exclusive
partition. Where code, house and cue are all near decision threshold, different
terms can be *jointly necessary*. For each choice log the full gate-score table
and each leave-one-term-out winning edge, with ties following the unchanged
canonical order. Record the overlap/multiple-cause category explicitly.

Q2 primary effect is within-pair difference in detour persistence under A vs B
from identical fork states, with identical non-cue terms and per-choice readouts.
A no-cue condition that still sustains the route argues external cues are
NOT necessary to maintain that particular coupled territory under that model.
A collapse under cue removal supports cue necessity only if the full trajectory
fork, scoring check, and matched controls agree.

## 6. Reporting and scientific boundary
- Before *registration* publish a manifest of exact parent source/checksum names,
  digests of real windows, fixed weights, phase-shift rule and any readout cutoffs.
  Freeze with a commit; optionally RFC3161 seal; separate seal from evidence.
- Retrospective real Quicknet replay remains **studio-grade external-input
  validation**, not prospective testing of independent unobserved signals.
- A single real window replayed for 20 seasons is ONE temporal input sample.
  Linked arms and lineage pairs within it are correlated, not new independent
  windows. Report window-level results, intervals/variation and failures.
- The Studio 05c synthetic 8/8 is existing discovery evidence, not a new
  confirmatory sample. Do not pool it with the real replay results.
- Do not claim the house is conscious, has paranormal memory, or detected a
  nonhuman mind. Mind-like, hyperstitional and process-philosophical readings
  remain explanations conditional on the interventions.
- Stopping rule: never report "holds up" before the complete predetermined
  windows and season endpoints are available. Gaps, faults and failures stay on
  the public ledger.

## 7. Present implementation status
- PF-2 read-only genuine rounds are available but have not yet accumulated one
  complete 20,160-tick 14-day window as of the drafting snapshot.
- The original Studio 05 project archive is acknowledged as existing, but its
  bytes and hashes have not been supplied to this GitHub branch.
- Historical PF4 windows have not been located here.
- The companion input extractor is only an audit/preparation utility, and will
  fail closed on incomplete or unaudited input. It does NOT run the house/learner.
- Therefore: design and intake preflight may proceed; scientific replication
  and causal results remain **NOT RUN / NOT DETERMINED**.
