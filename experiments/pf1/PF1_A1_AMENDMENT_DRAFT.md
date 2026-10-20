# PF1-A1 — Proposed amendment to Pandemonium Fieldwork encounter probing

**Status: DRAFT FOR OPERATOR REVIEW — NOT APPROVED, NOT EXECUTED, NOT A LIVE START.**  
**Date:** 20 October 2026.  
**Programme:** PF-1 / Amelia-Orange / `experiments/pf1/`.  
**Reference:** Original accepted PF-1 work order, accepted synthetic pilot, and accepted canonical pre-live audit. All remain intact.

## 1. Purpose and information boundary

The accepted canonical audit established that the existing **edge-blocking** challenges permit qualifying recovery for only two of 45 unordered zone pairs. PF1-A1 proposes **state-based** perturbations so that encounter eligibility depends less on cutting the only route of a sparsely connected directed graph. It does not assume that the newly reachable patterns are intelligent or meaningful.

**Design evidence permitted:** the pinned `CANONICAL_GATES` topology, the pinned unmodified Amelia runtime's public transition interfaces, the frozen mathematical excursion definition and the source-verified CCRU 45-name table. The graph-only calculation in `PF1_A1_GRAPH_ONLY_APPLICABILITY_DRAFT.json` enumerates 11 directed edges, 14 directed elementary scanner-valid excursions and all 45 unordered pairs. **No Amelia trajectory, pilot encounter count, PFM activity measurement or observed recovery advantage was used to select any new constant or to decide which pairs are eligible.** No new Amelia data have been generated under A1.

The amended rule would supersede PF-1's four edge-level perturbations and route-diversity test **only following explicit operator acceptance**. No live run, genesis or beacon intake is authorised by accepting a design draft.

## 2. Graph identity and candidate pairing (UNCHANGED)

Freeze the original substrate source commit `b67ec92e1cec13e9500d87292d59605428fb467e`. Its 11 directed open edges are:

```text
0→9    1→8    2→7    3→6    4→5
1→2    2→4    4→7    7→8    8→9    9→1
```

Use the **original candidate scanner without altering it**: a directed excursion leaves anchor `a`, returns to `a`, and its turning zone `b` is the visited zone with greatest shortest *directed distance back to a* (ties to earliest); three excursions with one unordered pair in the frozen 240-step window yield a candidate. Identify the chronological anchor orientation `(a,b)` before any challenge, even though naming is by the unordered key. Do not manufacture a candidate from mere mutual reachability. All 45 names remain source-linked and read-only.

## 3. Proposed interventions — full set, no cherry-picking

Each eligible intervention **instance** is an independent, specified experimental challenge. Distinct displacement targets constitute distinct instances; the two temporal interventions are separately identified. No edge may be removed and the canonical gate table must never be rewritten.

**D(d): displacement, one instance for every qualifying target `d`.** At candidate confirmation, clone the entire snapshot, including its history, and set only its *current-zone pointer* from `a` to `d` before autonomous continuation. Admit exactly those zones with finite shortest **directed** distance `dist(a,d) ≥ 2` and with finite directed return `dist(d,a)`. All targets are enumerated, sorted numerically and tried; the implementation must not choose targets using Amelia responses. Preserve PFM, activation/deformation fields and Governor state. A valid scored recovery must visit `b` after at least one resumed autonomous step and then return to `a`, even if the displacement initially placed the agent at `b`. Do not count `d=b` itself as a visit through the turning zone.

**F₂: temporary whole-state freeze, k = 2 clock ticks.** Starting at the confirmed anchor `a`, hold the complete forked state fixed for exactly two challenge ticks, including current zone, memory, Governor and phase variables. Queue (do not discard) the corresponding two synthetic input symbols, then release the fork and deliver queued input in order. A freeze tick is counted inside the existing 24-tick horizon, but does not synthesize a transition or PFM event. Apply the same pause and queue semantics to the matched walker. Fork-local wrapper only; no modifications to Amelia's source dynamics.

**L₂: input delay, δ = 2 clock ticks.** Starting at `a`, allow ordinary autonomous steps during the first two ticks **with no input signal**, queuing the withheld symbols. From tick three onward consume that queue in original order. This differs from F₂: during L₂ the state, memory and zone transitions continue evolving. Deliver the **identical delayed sequence and clock schedule** to all four branches and the reference walker. No input is silently dropped or reordered. The challenge ends after 24 ticks, and any undispatched tail is logged.

Every applicable pair therefore has at most four displacement instances plus F₂ and L₂: **at most six instances**. A pair lacking a valid scanner excursion has no F₂, L₂ or D(d) instances for encounter scoring, even if some abstract graph paths exist.

### Graph-only 45-pair applicability (provisional structural eligibility)

`a` is the observed directed excursion anchor, not the lower digit of the unordered net-span. D-targets list every `d` satisfying both directed-distance conditions. `F₂` and `L₂` are separate instances. `Potential` means **at least three topology-permitted instances** and a real scanner excursion; it is a *necessary* eligibility condition only. The comparator's performance may subsequently defeat every recovery.

| Unordered pair | CCRU entity | Anchor a | Displacement D(d) | Freeze | Input delay | Instances | Graph-only eligibility |
|---|---|---|---|---|---|---:|---|
| 0-1 | Lurgo | — | — | — | — | 0 | No |
| 0-2 | Duoddod | — | — | — | — | 0 | No |
| 0-3 | Ixix | — | — | — | — | 0 | No |
| 0-4 | Krako | — | — | — | — | 0 | No |
| 0-5 | Tokhatto | — | — | — | — | 0 | No |
| 0-6 | Tchu | — | — | — | — | 0 | No |
| 0-7 | Puppo | — | — | — | — | 0 | No |
| 0-8 | Minommo | — | — | — | — | 0 | No |
| 0-9 | Uttunul | — | — | — | — | 0 | No |
| 1-2 | Doogu | 1 | 4, 7, 9 | F₂ | L₂ | 5 | Potential |
| 1-3 | Ixigool | — | — | — | — | 0 | No |
| 1-4 | Sukugool | — | — | — | — | 0 | No |
| 1-5 | Tukkamu | — | — | — | — | 0 | No |
| 1-6 | Djungo | — | — | — | — | 0 | No |
| 1-7 | Bubbamu | — | — | — | — | 0 | No |
| 1-8 | Mur Mur | 1 | 4, 7, 9 | F₂ | L₂ | 5 | Potential |
| 1-9 | Tutagool | 9 | 2, 4, 7, 8 | F₂ | L₂ | 6 | Potential |
| 2-3 | Ixidod | — | — | — | — | 0 | No |
| 2-4 | Skoodu | 2 | 1, 8, 9 | F₂ | L₂ | 5 | Potential |
| 2-5 | Kuttadid | — | — | — | — | 0 | No |
| 2-6 | Djuddha | — | — | — | — | 0 | No |
| 2-7 | Oddubb | 2 | 1, 8, 9 | F₂ | L₂ | 5 | Potential |
| 2-8 | Nammamad | — | — | — | — | 0 | No |
| 2-9 | Unnunddo | 9 | 2, 4, 7, 8 | F₂ | L₂ | 6 | Potential |
| 3-4 | Skarkix | — | — | — | — | 0 | No |
| 3-5 | Tikkitix | — | — | — | — | 0 | No |
| 3-6 | Djynxx | — | — | — | — | 0 | No |
| 3-7 | Pabbakis | — | — | — | — | 0 | No |
| 3-8 | Mummumix | — | — | — | — | 0 | No |
| 3-9 | Ununuttix | — | — | — | — | 0 | No |
| 4-5 | Katak | — | — | — | — | 0 | No |
| 4-6 | Tchakki | — | — | — | — | 0 | No |
| 4-7 | Ababbatok | 4 | 1, 2, 8, 9 | F₂ | L₂ | 6 | Potential |
| 4-8 | Numko | — | — | — | — | 0 | No |
| 4-9 | Ununak | — | — | — | — | 0 | No |
| 5-6 | Tchattuk | — | — | — | — | 0 | No |
| 5-7 | Papatakoo | — | — | — | — | 0 | No |
| 5-8 | Muntuk | — | — | — | — | 0 | No |
| 5-9 | Tukutu | — | — | — | — | 0 | No |
| 6-7 | Bobobja | — | — | — | — | 0 | No |
| 6-8 | Mommoljo | — | — | — | — | 0 | No |
| 6-9 | Unnutchi | — | — | — | — | 0 | No |
| 7-8 | Mombbo | 7 | 1, 2, 4, 9 | F₂ | L₂ | 6 | Potential |
| 7-9 | Nuttubab | — | — | — | — | 0 | No |
| 8-9 | Ummnu | 8 | 1, 2, 4, 7 | F₂ | L₂ | 6 | Potential |

Thus **9 of 45** unordered pairs are graph-only candidates under the proposed instance criterion, versus two under the old route-blocking test. The other 36 cannot become scanner candidates on this frozen graph. These counts were obtained without consulting an Amelia run or modifying a cutoff.

## 4. Matched pure-recurrence walker and relative goal-directedness

For *each* intervention instance, run four cloned Amelia condition branches—**intact, PFM reset, selective suppression and neutral sham**—and a **fifth reference trajectory**: the historyless, Governor-free, single-zone pure-recurrence walker. All five receive the same displaced starting zone (or the same anchor for F₂/L₂), identical directed gates, matching 24 challenge clock ticks, the same synthetic input sequence and the same intervention wrapper. The walker has no PFM, adaptive strain, Governor or stored goal.

Freeze the walker law **before the re-pilot** as a fully specified deterministic transition policy: on each non-frozen step choose the available canonical open outgoing gate with the highest score

`gate.flux × (1 − gate.resistance) + 0.2 × INITIAL_ZONES[target].activation + 0.1 × cos(INITIAL_ZONES[target].phaseAngle) + 0.35 × I(inputZone = target)`.

Take `inputZone` as the integer value of the first byte of the SHA-256 digest of the *actual fork-scheduled synthetic input string*, modulo 10, matching the existing runtime's input encoding. No input bonus is applied on null-input delay ticks. Resolve equal scores by pinned gate array order; with no outgoing edge, dwell. Fixed INITIAL_ZONES values mean the walker never imports Amelia's historically conditioned zone activations. The walker is matched in position, graph, clock and inflow, **not falsely described as possessing Amelia's internal state**.

A branch's **raw recovery** is the first post-intervention `b → … → a` completion within **24 elapsed challenge ticks**; both F₂'s two frozen ticks and L₂'s first two null-input ticks count. A recovery needs `b` observed *after* perturbation, then a later `a`, and the event must be reconstructible from the zone trace. Record both elapsed ticks and traversed zones. A walker may also recover; do not automatically score this as an Amelia competence.

An **intact comparative win** occurs only if (i) intact raw recovery succeeds and (ii) the matched walker either **fails** to recover within 24 ticks or recovers at least **2 ticks later**. Equivalently:

`win = intactRecovered && (!walkerRecovered || walkerRecoveryTick - intactRecoveryTick >= 2)`.

**Amended goal-directedness:** at least **three comparative wins from three distinct applicable perturbation instances**. Never count several successes from repeated reruns of the same instance as three. **Withdraw the two-route diversity condition entirely.** Distinct intervention types or distinct displacement targets are the relevant diversity, not distinct recovery paths. Do not infer agency from a topology-protected return.

### Control-law independence and a necessary caveat

A negative walker compared against an identical deterministic walker must achieve **zero comparative wins by definition**. Its 0-encounter result is still a required implementation/invariant check, but *on its own* cannot establish scientific specificity. The report must say so explicitly; it must not represent a tautological zero as independent evidence of discrimination. Also retain sham equality and inspect whether a positive fixture truly beats the matched walker.

## 5. Memory, integration, sham and reach (UNCHANGED IN FORM)

For the same applicable instances, compute **raw-recovery fractions over the same denominator** for intact and memory-reset branches. Keep the accepted memory criterion: `intactRawRecoveryRate − resetRawRecoveryRate ≥ 0.25`. Reset only PFM within the counterfactual fork. Preserve original intervention schedules and all nondisplaced state variables.

**Integration** retains the original form: selective suppression must abolish at least one raw recovery achieved in the intact **and sham** fork under the identical instance, without deleting a gate or making the target topologically unreachable. Use the existing PF-1 synthetic implementation's **0.10 multiplicative factor on zone b activation in the selective-suppression fork**; this changes a fork's zone contribution without removing any canonical gate. The runner must record the suppressed contribution and factor `0.10`. The neutral sham uses factor `1` and must match intact outcome and full nonperturbative trajectory.

An **encounter** occurs iff both the new three-instance comparator-relative goal criterion AND (memory **or** integration) qualify, with full sham parity. Reach (latency and zones traversed) remains descriptive only. No new outcome-frequency or score cutoffs are introduced.

The original 24-step horizon, 0.25 memory margin, recurrence count 3, 240-step window, synthetic-only constraint and canonical graph are not changed by A1.

## 6. Fork accounting and proposed fixed resource adjustment

A maximum of six distinct instances implies **24 Amelia forks** (four conditions × six), retaining the previous 24-fork-per-candidate Amelia budget. The new matched walker adds **one reference trajectory per instance**, i.e. at most **six additional reference traces**. Explicit proposal: cap **all** physical fork/reference trajectories together at **30 per candidate**, of which **at most 24 are Amelia**. This is a resource-accounting amendment, **not a change in scientific thresholds**. No hidden seventh instance or post-hoc selection is allowed. Log separately the executed, inapplicable and deferred instances, plus the matching walker trace digest.

Predeclared constants proposed independently of Amelia pilot data:

| Quantity | PF1-A1 proposed value | Basis |
|---|---|---|
| Displacement | every d with finite directed dist(a,d) ≥ 2 and d→a | Exhaustive canonical graph condition |
| Whole-state freeze | k = 2 ticks | Shortest nontrivial declared temporal interruption |
| Input delay | δ = 2 ticks | Symmetric short temporal perturbation with continued dynamics |
| Comparative recovery advantage | ≥ 2 elapsed ticks | Requires more than a one-step scheduling difference |
| Minimum comparative wins | ≥ 3 distinct instances | Operator-mandated |
| Recovery horizon | 24 ticks | Existing frozen PF-1 constant |
| Memory difference | ≥ 0.25 | Existing frozen PF-1 constant |
| Integration | at least one matching intact/sham recovery abolished by suppression | Existing form |
| Selective suppression factor | 0.10 × zone-b activation, fork only | Preserves previous PF-1 implementation |
| Route diversity | not required | Explicitly withdrawn |
| Amelia forks | ≤ 24 per candidate | Retains existing budget |
| Companion walkers | ≤ 6 per candidate | One per possible intervention instance |
| Physical trajectories | ≤ 30 per candidate | Transparent budget extension |

These values must become part of a **sealed A1 constants manifest and SHA-256 prior to *any* A1 scientific re-pilot run**. This draft is a proposed immutable input for that approval; it is not authorisation to run.

## 7. Required A1 re-pilot — ONLY AFTER OPERATOR APPROVAL

1. Pin the frozen substrate/graph, A1 amendment hash, deterministic walker code, 45-name lookup and exact constants; test for unauthorized differences before each workflow.
2. Publish exhaustive graph eligibility for all 45 pairs, every displacement instance and both temporal interventions, with directed-distance and via-b recovery witnesses; mark the 36 unavailable pairs explicitly rather than count them as negative encounters.
3. Run **pure-recurrence negative control on the canonical graph** under all amended interventions: **zero encounters required**, sham parity required; disclose the identical-comparator limitation.
4. Construct a memory-held goal-recovery harness **for every one of the nine structurally eligible pairs**, on the canonical 11-edge graph only. Predeclare **three synthetic fixture seeds (101, 202, 303) per pair** = 27 independently replayable constructed instances. **≥ 90% of all instances must confirm** (at least 25 of 27), with each of the nine pairs tested and at least one passing instance per pair. **100% of confirmed encounter names must match** the 45-name typology. Confirm sham parity for every fixture, not only passing ones. Never increase trial count or choose alternative pairs after inspecting outcomes.
5. Only then repeat Amelia-Orange's **descriptive** 10,000-step synthetic run, with carried PFM and no live inputs; report **every candidate's unordered zone pair, ordered anchor/turn, step of discovery, intervention applicability, comparative wins, memory difference, integration ablation, and non-encounter reasons**. Include candidate counts ineligible by topology. These outcomes may **not** set or alter k, δ, two-tick advantage, the walker rule, eligibility or margins.
6. Repeat byte-identical deterministic replay, hash-chained journal and silence-ledger exposure accounting, RFC 3161 local entry seals and at least one real offline-verified FreeTSA seal against the pinned root. Separate scientific event clocks from wall-clock seals.
7. Produce `experiments/pf1/PF1_A1_REPILOT_REPORT.md` with separate PASS/FAIL against the new comparator rule and all retained engineering requirements; archive full original inputs, fork traces, walker traces, hashes and certificates. A failed positive or negative gate is a **failure**, not permission to adjust the parameters.

**Stop condition:** any missing pre-run freeze, comparator mismatch, failed control, invalid seal, mutated canonical graph, modified original threshold or unaccounted input forbids a PASS. Do not automatically extend, redesign or begin live exploration.

## 8. Operator decision requested

Accept, reject or amend this **draft** before creating any A1 experimental workflow. If accepted, a separate source commit must seal the constants, comparator law, eligibility manifest and A1 runner **before the first A1 re-pilot sample**. The old PF-1 pilot remains unchanged and auditable. No coding agent, scheduled action or workflow should consume live drand/NIST input under PF1-A1.

**LIVE START: NOT AUTHORISED.**
