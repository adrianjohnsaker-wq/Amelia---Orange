# STUDIO 08 — THE CLOSED CIRCUIT: causal isolation of endogenous difference

**Status: ENGINEERING PROTOCOL DRAFT / NOT SCIENTIFICALLY REGISTERED / NO STUDIO 08 OUTCOMES.**
Prepared 25 October 2026. Preservation of earlier negative, null and positive outcomes is mandatory.

## Research question
Can a historically formed Amelia–house territory **maintain and repair itself with no new
beacon input**, and can the coupled system subsequently **produce a new viable
territory from genuinely blank house and lineage-code states**?

Do not conflate these: maintenance of an acquired form, repair after lesion,
and genesis without inherited inscription are THREE different causal questions.

Studio 07 operator-reported findings (not independently audited here): direct
beacon cue on, restore 6/8; direct cue off, no alternate cue, circuit 8/8; cue
from 24 recent zones, circuit 8/8; cue from joint trajectory+code+house,
maintain and restore 7/8. Reported lesion deaths: beacon 59.5/world,
joint-cue 48.6/world. Same source remains in the runtime's event metadata
after direct-choice-cue ablation. These are PRIOR OBSERVATIONS, not Studio 08 data.

Source document \`STUDIO_07_SELF_GENERATED_DIFFERENCE_PRECOMMIT.md\`, Studio
05–06c/07 original runner, full fork-state archive, hashes, negative results,
and precommit **exist in the operator's working project but are NOT currently
accessible here**. This proposal MUST NOT be run as a scientific replica by
substituting an inferred house or self-hash implementation. Import original
bytes, manifests and checksums first. The code on this branch is only a
standalone SOURCE-PATHWAY ENGINEERING CHECK using frozen Studio runtime copies.

## Phased execution; no retrospective promotion
### E0 — engineering source-pathway audit (executable now)
Mirror \`experiments/studio/runtime_mirror/\` byte-for-byte in
\`experiments/studio08/runtime_mirror/\`, adding ONE default-on switch:
\`inputCueEnabled\`, guarding only the frozen direct \`+0.35\` cue term.
With switch on, original and mirror must agree on every transition and all
causally operative exported-state fields under identical deterministic
synthetic signals. With switch off, three synthetic-input conditions must
agree on these same causal variables:
- V: vary synthetic input every tick; record input fields but no direct cue;
- K: constant identical signal every tick, no direct cue;
- N: no input passed to \`step\` at all, no direct cue.

Input labels, eventDigests and input history metadata WILL differ, and are
not silently discarded as evidence. Verify source-level whether another
module later consumes any such field. If the coupled self-readout hashes
those labels, an information path **does exist**, even when the substrate's
own \`readMemoryBias()\` ignores them. The E0 test alone cannot certify Studio
07 source isolation. A hash of a PFM digest is not an endogenous cue if the
digest directly contains current beacon data.

Expected engineering result, not science: default parity and V/K/N
causal-state equality. Any discrepancy stops Studio 08 until instrumented
cause and original/modified source diff are published.

### E1 — source-independent matched maintenance and repair (requires archive)
On EXACTLY the eight already documented Studio 07 synthetic worlds and
frozen full beginning states, fork the **whole** state: runtime zone/gates,
PFM and governor, entire learned edge-value code V, both house layers S/D,
recent 24+ trajectory, cue serializer state, and deterministic clock/counters.
Before each choice, compute any self-cue from the state as of t-1, NEVER from
the currently unrevealed input or a post-choice result. Same house,
weights, transition ordering, update schedule, detour lesion and lesion
season across forks. Every arm is evaluated both intact and lesioned:

| Arm | Step input | Direct original cue | Additional self-cue |
|---|---|---|---|
| A | original synthetic studio signal | OFF | archived Studio 07 joint-state hash |
| B | one fixed constant for all steps | OFF | SAME archived joint-state hash |
| C | absent (\`step(undefined)\`) | OFF | SAME archived joint-state hash |
| D | absent | OFF | NEW smooth house-delta readout |
| E | absent | OFF | NONE (closed circuit negative control) |
| F | original synthetic studio signal | ON +0.35 | NONE (prior external cue reference) |

Do not call Arm A a live physical beacon test unless genuine signed rounds
are independently sourced. The original Studio 07 exact selector/hash
implementation MUST be used unchanged for A–C, including serialized field
order and tie rules. Check code's direct/indirect input access line-by-line.
If the archived hash explicitly consumes raw input digests/labels, that is
a valid discovery of residual source dependence; do not quietly remove it
and call the result a Studio 07 replication. Create separately labelled
and registered input-excluded follow-on, if necessary.

B versus C distinguishes archived constant metadata from no new metadata;
A versus B distinguishes changing input records from constant records.
E is indispensable: internal trait/phase evolution continues even with
no incoming signal, so simply observing state drift is NOT evidence that
the drift changes choices.

**Primary causal readouts:** every-step chosen directed edge and full
winner/runner-up score decomposition; exact numeric causal-state parity
A/B/C (excluding ONLY raw input metadata, eventDigest and wall-clock
snapshot timestamp); detour 2->7 choice share conditional on true
choice-opportunities at zone 2; house 1->2 and 2->7 S/D state; deaths in
lesion season; registered territory-maintenance and restoration outcomes;
distinct edges and exposure; all failures and circuit captures.
Full snapshot comparisons must independently log what was excluded.

**Prior-registered endpoint:** reuse Studio 05c/06b/07 definition as recorded
in original precommits; do NOT change success thresholds here. Existing
eight worlds are a dependent mechanistic follow-on, not independent
confirmatory N=8 and not a physical-source sample.

**Mechanistic test:** V/K/N input-path invariance is a bitwise criterion,
not a significance test. One unexplained mismatch falsifies an exact
causal-isolation claim, even if restoration counts happen to coincide.
If A/B/C match and C maintains/repairs, continuing external *input on that
channel* is unnecessary for these already-formed territories at fixed
weights. It does NOT follow that the territory was formed without any
prior external encounter.

### E2 — non-hash endogenous cue (requires E1 source + archived house)
Candidate fixed smooth readout is
\`houseChangeCue(before,after)\` in \`code/endogenous_cues.mjs\`.
At choice t, use the two most recent *fully committed* house snapshots
(which are available before t), compute for each zone z the total absolute
change in S_e+D_e summed over edges ending at z, choose maximum; tie goes
to lowest numeric zone; if all changes <=1e-14 emit no cue. Cue's fixed
strength is +0.35 on target zone, with no compensation if that zone is
not a candidate open exit. Its transparent derivative and retention
rule are pinned before outcomes. It does not use signatures, hashes,
wall-clock, seeded RNG, hidden lookahead or current decision data.

D versus E measures whether ordinary house changes are sufficient to
turn choices. D versus C describes differences in effectiveness of a
transparent endogenous readout versus the existing sensitive hash, **not**
the superiority of "smooth intelligence" or a proof of agency.
Prediction remains OPEN; score even zero/failed cases.

### E3 — genesis-from-blank assay (NEW phase, register independently)
After E1/E2 frozen, test genuinely blank house S=D=0 and V=0, no implanted
fictional death route, no previous beacon-derived PFM, same initial
runtime structure and constant/absent input across full lineage series,
with joint and smooth cue arms, together with no-cue baseline and a
controlled external perturbation. Fix new world seeds disjoint from all
05–07 exploratory worlds before the FIRST run. The inherited
Studios 05–07 eight worlds cannot provide independent confirmation.
An agent starting from a planted fictional mark is NOT a no-external-origin
condition. Use prospective run manifest, raw logs and exact code hashes.

Readouts: new non-circuit route formation (including zone-2 opportunity
and 2->7 visit), persistence after withdrawal of perturbation, survival,
diversity and lesion-resilience. Formation is separate from restoration.
Even a successful result shows endogenous dynamics WITHIN AN ENGINEERED
DETERMINISTIC SYSTEM, not autonomous origination of a life-form or
independent mental agency.

## Information, difference and agency: hypothesis ladder
I. Operative difference: controlled input or endogenous readout changes
   choice relative to identical-state leave-one-term-out counterfactual.
II. Regenerative competence: after injury, a memory-conditioned circuit
   reconstructs earlier territory versus matched memory deletion.
III. Self-maintained variation: after external input ceases, coupling
   generates enough *choice-consequential* variation to maintain/repair.
IV. De novo organisation: before any imprint, closed coupling forms an
   unprescribed persistent territory versus matched nulls.
V. Intelligent/agentic Outside: requires DIFFERENT prospective predictions,
   novelty/adaptive selectivity, prespecified performance objectives,
   rigorous amplitude/entropy/autocorrelation-matched null inputs and
   independent held-out Quicknet rounds. Mere randomness, hash sensitivity,
   difference, survival, or a philosophically attractive story does NOT
   establish V.

No claim that a verified drand source possesses intention, intelligence or
foreknowledge follows from Stages I–IV. The philosophical "Outside" cannot
be operationally equated with a network beacon.

## Provenance and no-cross-contamination rules
- Existing PF1, PF2, C1 and PF4 code, sealed tests, schedules, live leases,
  memory and prospective encryption remain untouched.
- E0 uses only synthetic fixture signals and original read-only source.
- E1/E2 are proposed **synthetic matched-run interventions** until original
  runner and precommit can be audited; live Quicknet Studio 06 tests are
  separately gated on complete verified 14-day windows.
- Record source file SHA256s, branch/commit, exact serializer and instrumentation
  patch, precommit SHA and fixed endpoints. Independent verification before
  any report of actual Studio 08 experimental outcomes.
- Do not merge this preliminary design into PF4 or run future-source fetch
  workflows in order to "speed up" Studio 08.
- Report zero effects, reversion to circuit, deaths, and abandoned
  hypotheses without suppression; separate recorded findings, predictions,
  and metaphysical interpretation.

**Status on drafting:** E0 mirror and code authored; E0 CI pending.
E1/E2/E3 blocked pending original archives and a new authoritative
registration. NO STUDIO 08 SCIENTIFIC RESULTS OR SIGNIFICANCE CLAIMS.
