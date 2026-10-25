# STUDIO 08 S1 — Can the assemblage acquire a usable sensitivity?

**Status: DESIGN DRAFT, NOT SEALED, NOT RUN AS SCIENCE.** Prepared 25 October 2026 after receiving Studio 07/07b textual results. This is a **new prospective sensitivity-selection experiment**, not a revision of Studio 07/07b, not a preregistered discovery, and not permission to replace the original source.

## 1. Scientific claim ladder

Studio 07b operator-reported a coupled-state SHA-256 readout supporting maintenance and repair in 7/8 incorporated worlds with constant input; its specific non-hash surface-decline-24 readout failed in all eight. This demonstrates **conditional competence under a supplied sensitive transducer**, not spontaneous formation of a transducer.

S1 asks whether a fixed scaffold for *selection among weak, noncryptographic sensors* can learn to use internally available differences. It is NOT a test of unassisted invention of entirely new receptors. The scaffold, candidate functions, credit rule and reward all originate with the experimenter. "Acquired sensitivity" would mean **a learned choice of which internal signal to amplify**, relative to identical fixed-selection controls.

S1 is separated from:
- E1 verification of Studio 07b's original closed-source trace parity;
- E2 comparing a single new non-hash sensor on the original 8 incorporated worlds;
- E3 generating territory from **blank** learner/house states. An acquired territory is not de novo evidence.
- Prospective "Outside has intelligence or agency": no such inference follows from S1.

## 2. Source admission and ethical claim boundary

The experiment may not run on reconstructed Studio05–07 house/learner state. All exact original code, precommits, checkpoint digests and event update schedules must pass `STUDIO08_ORIGINAL_IMPORT_HANDOFF_20261025.md` and reproducibility checks. The runner must preserve the original baseline selection/house/death dynamics. Instrumentation cannot change the meanings of "death", "distinct route", "choice settled" or "house pull".

A NEW independent series of 32 whole synthetic worlds will be required. Canonical world IDs `S1-W00` through `S1-W31`; provisional deterministic seed derivation `SHA256("STUDIO08-S1-V1|" + worldId)`, with comparison to historical seeds before use. No tuning on these seeds. An actual registration must contain final code hashes, exact 32 resulting seed values, arm order and source archive SHA, trace fields and tests BEFORE execution. Avoid inferring independent replication simply because the word "32" is used: world construction must create truly independent synthetic tapes and fork states.

## 3. Source of variation: strictly pre-choice endogenous features

No beacon, synthetic external cue, PFM eventDigest, inputDigest, raw entropy, wall-clock, post-choice result, or current-step observation may enter a candidate sensor. `step(undefined)` is the preferred sealed source condition; constant `CLOSED` is an additional matched diagnostic.

Three new **designer-provided** candidate sensors, all reading already committed pre-choice snapshots t−24 and t (25 snapshots):
- `surface_decline24`: destination of the single directed house edge with largest strictly positive decrease in house surface record S across the window; ties resolve lexicographically among the frozen 11 edges; no positive decrease emits null. Similar to, but NOT a byte-equivalent reproduction of, Studio07b's smooth description: the original tie rule is unavailable.
- `house_flux24`: destination zone with largest sum of absolute 24-step change of S+D across all edges ending at that zone; tie lowest numerical zone; no change greater than 1e−14 emits null. This is a NEW definition (prior Studio08 prototype was based on two most recent snapshots; the new 24-step window is an explicit separate candidate).
- `code_drift24`: destination zone with largest sum of absolute 24-step change in learned V across all incoming edges; tie lowest numerical zone; no measurable change emits null.

Candidates propose a target zone 0..9 or no cue. They do not inspect which exits are open and cannot remap a non-candidate target to a "good" exit. The only action is +0.35 to the proposed target *if it is an open exit*. At most ONE candidate applies per decision; there is no summation of cue strengths. If all candidates emit null, no bonus is applied.

The available raw house and code records must preserve the original numerical precision; no quantization is added to source dynamics. Only deterministic readout comparisons use a fixed 1e−14 noise floor. No SHA-256 is used **inside any sensor**; hashing files for provenance is distinct.

## 4. Adaptive receiver, fixed in advance

A tiny deterministic three-expert UCB chooser selects one of the non-null candidate targets before each choice. Expert tie-breaking follows the fixed order above; no pseudo-random or external score enters. At choice step t, it knows only cumulative settled rewards from strictly earlier steps and how often each sensor was selected. Its `+0.35` action magnitude is identical to existing external and Studio07 self cues.

Fixed exploration coefficient `c=0.20`. Score for expert j with k_j selections and n_j **settled** credit events at time t:

`Q_j(t) = sumReward_j/max(1, n_j) + 0.20 * sqrt(2*ln(1+t)/(1+k_j))`.

The maximal Q is selected, with fixed expert-order ties. `t` counts cue decisions even if none available; null experts are skipped only when absolutely null, NOT when they target a currently closed exit. Outstanding delayed rewards cannot be consumed early.

Learning target is a prespecified **24-transition future window** after each selected cue. After 24 actual transitions (or sooner only on absorption/death), settle the selected expert with:

`r = −1 if any death occurs within 24 transitions; otherwise r = clip((distinctDirectedEdgesAfterChoiceInWindow − 4)/7, 0, 1)`.

**Pre-science engineering clarification, 25 October 2026:** the first draft subtracted a death penalty from the novelty term, which could yield zero reward for a fatal trajectory with maximal novelty. Before any source import, scientific registration or outcome run, this was amended to make **every death receive −1**, regardless of route novelty. The original exploratory S1 draft had no scientific executions, so this is an openly recorded design change, not a post-result adjustment.

This is a designed exploratory-viability objective, not an independently arising desire. Its attribution to the selected expert is an approximate delayed bandit assignment, not a valid single-choice causal effect because later cues may intervene. The instrument must log every outstanding credit, exposure length, censoring and death.

No success threshold or objective is changed in light of results. Negative/circuit captures are retained.

## 5. Design controls and bifurcation

In each fresh world, maintain identical starting full states and the same absent-input condition:
1. **Adaptive:** choose among the three candidates with the prespecified UCB and update on settled outcomes.
2. **Fixed schedule:** equal-exposure non-adaptive round-robin of the available candidates; log exposure differences caused by candidate null values.
3. **Fixed surface decline:** one 07b-like nonhash sensor, with new tie rule documented.
4. **Fixed house flux:** another nonhash sensor, explicitly NEW.
5. **No cue:** original selection only, closed input.
6. **Sensitive hash benchmark:** original **unmodified** Studio 07 asm hash, if its source and serializer pass the original archive gate; not a permitted replacement hash invented from narrative.
7. **Yoked credit negative control:** only if an exact credit-yoking table is registered before seeing confirmatory outcomes, feed independent prior-world feedback to the chooser while leaving its candidate stream current. Do not create this control ad hoc after looking.

For each, distinguish **maintenance/repair of inherited incorporated territory** versus a **blank genesis** start. Blank genesis is a NEW follow-on with its own separate registration and no implanted inherited scar, learned house edge or external trajectory. Do not pool fork types.

## 6. Primary outcomes and interpretation

**Primary S1 observational outcome:** per-world difference in the already frozen Studio07 held/restore endpoints between Adaptive and Fixed schedule, reported separately for intact and one-season lesion. A meaningful positive sensitivity-acquisition claim requires:
- original-source integrity and no-cue source isolation PASS;
- pre-choice-only timing audit and amplitude ≤+0.35 PASS;
- demonstrable adaptation in expert use (registered per-expert choice shares and settled rewards differ from equal schedule);
- more held AND more repaired territories than the fixed policy on held-out fresh worlds, with full per-world paired results and uncertainty intervals.

This is a directional acceptance gate to complete at final registration; there is NO post-hoc p-value or discovery claim based on N=8. A null result could mean insufficient sensor coverage, weak score margins, incapable dynamics, misaligned reward, or genuinely no acquired sensitivity. Report each failure class rather than calling it "self-regulation impossible".

Secondary: cue choice-settlement fraction (counterfactual remove +0.35 at same state), valid-at-open-exit fraction, zone-2 opportunities, directed 2→7 share, house 1→2 and 2→7 S/D strength, code V changes, death count and survival distribution, distinct routes, ongoing credit backlog, learned preference by time and exact manifests.

**Essential interpretive constraint:** a receiver that learns to select among three externally authored sensors is not yet a self-invented sense organ or evidence that external information has its own intelligence. A later S2 study might mutate sensor transformations themselves under provenance-preserving variation and compare to grammar-matched nulls, but that would be a new scientific hypothesis.

## 7. Construction and registration

The branch's `code/learning_cue_gate.mjs` is the reusable **engineering component**. Its synthetic tests verify no future credit use, deterministic choice, valid cue amplitude, null gating and state cloning. `code/closed_circuit_sensors.mjs` implements the three pre-choice sensor proposals, strictly separated from source metadata.

**STOP / NOT RUN:** The project has not yet supplied the original Studio 07 runnable archive and checkpoint bytes. Without that, unit tests DO NOT validate any full learner–house or territory outcome. Do not seal S1, dispatch live seasons, or claim a science result based only on engineering CI.

Retain the Studio07/07b operator report and older E0 synthetic negative controls unchanged. They remain scientific context, not new S1 observation.
