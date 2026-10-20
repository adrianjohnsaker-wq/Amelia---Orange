# PF1-A1 R2 — Operator-revised amendment and prospective constants

**Issued:** 20 October 2026.  
**Status:** operator revisions ACCEPTED FOR SEALING; **sealed constants awaiting separate operator review; re-pilot NOT authorised; live start NOT authorised**.  
**Authoritative source:** [operator revision of PF1-A1, 20 October 2026].  
**Supersedes:** `PF1_A1_AMENDMENT_DRAFT.md` and its `PF1_A1_GRAPH_ONLY_APPLICABILITY_DRAFT.json` for future experimental design. Both historical drafts remain retained and are not rewritten.

## 1. Information boundary and invariants

Design and graph calculations use **only** the eleven frozen directed `CANONICAL_GATES` from pinned Amelia substrate commit `b67ec92e1cec13e9500d87292d59605428fb467e`, the validated 45-zone-pair names, and the already-frozen scanner definition. They **must never read prior Amelia trajectories, candidate frequencies, PFM readings, outcomes or any live beacon records**. The full graph-only exact-null generator is `PF1_A1_R2_EXACT_NULL.mjs`. Source provenance and all frozen constant values are encoded in `PF1_A1_R2_CONSTANTS.json`; an independent hash manifest records the seal.

A1 R2 does not modify the substrate, Governor, ProcessFieldMemory, 11-gate graph, readout, 240-step scanner window, 3-excursion candidate threshold, 24-tick fork horizon, 0.25 memory margin, five-signature measurement scope or 24-Amelia-fork budget. The original PF-1 work order/pilot/report remain unchanged.

## 2. Perturbations: NO F₂, no route blocking

**D(d), all applicable displacement targets:** for each scanner-confirmed excursion orientation `a → ... → b → ... → a`, enumerate in ascending zone order every `d` for which the shortest directed distance `dist(a,d) ≥ 2` is finite and `dist(d,a)` is finite. Each target is one **distinct** instance. Clone the full state, change only its current-zone pointer, preserve carried PFM, Governor and all other state. An initial placement directly at `b` is not a successful visit: it must encounter `b` **again after the perturbation** before completing a return to `a`. Disallow alternative route scoring by perturbatively deleting graph edges.

**L₂, two-tick input delay:** At anchor `a`, run two ordinary developmental ticks with no newly admitted input: `runtime.step(undefined)` is supported by the existing unchanged runtime. Queue the two synthetically provided symbols. At tick 3 and onward consume the queue's oldest symbol while continuing to enqueue the subsequent symbols. Thus the fork evolves autonomously during the first two ticks and receives the original ordered tape shifted two delivery ticks, not a wholly frozen state. Record the two symbols still queued at tick 24. Apply identical scheduling to all paired conditions and to the analytic null clock.

**F₂ is entirely WITHDRAWN**: freezing all state while queuing inputs is just a deterministic time shift, not a meaningful counterfactual. The previous deterministic preference walker comparator is also withdrawn.

For scanner-ineligible pairs, there are no scored perturbation instances. For each scanner-eligible pair, there are either three or four applicable displacements plus L₂, i.e. **four or five instances total**. Do not choose instances based on Amelia response data.

## 3. Exact analytic uniform-topological-null comparator

Fix the null transition matrix before all runs. At a zone with `m > 0` canonical open outgoing gates, the next zone is drawn with probability `1/m` independently of history, PFM, Governor, synthetic input or zone activation. At a sink (`m = 0`), probability 1 is assigned to an absorbing dwell. The null starts in precisely the same displaced zone `d` as the relevant Amelia fork or the same anchor `a` for L₂, and observes the same 24-tick clock / delayed-input schedule (though its gate-choice law is input-independent).

The relevant event `T` is the **first post-perturbation recovery**, which requires one post-perturbation visit to turning zone `b` followed later by `a`. Compute the exact cumulative probability `P_null(T ≤ t)` for **every integer t = 0,...,24**, per orientation and intervention. A two-flag absorbing Markov chain on `(zone, b_seen)` suffices: start with `b_seen = false`, propagate uniform gate probabilities each tick, and send first arrivals to `a` after `b_seen` into an absorbing recovered state. There is no simulator RNG and no sampling error. Because all canonical outdegrees are ≤2, the generator uses **integer dyadic probabilities** with exact denominator `2^t` to eliminate floating-point eligibility ambiguity; all 0..24 curves and per-tick first-hit mass are archived.

Fix **α = 0.25, inclusive**. An Amelia *comparative win* on instance `i` occurs iff it returns via `b` at tick `t ≤ 24`, and the matching null cumulative probability is `P_null(T ≤ t) ≤ 1/4`. A raw recovery at a later t with greater null probability **does not count**, even if the path differs from the null's most common route. Distinct recovery routes are not required.

**Amended goal-directedness:** at least **three comparator-qualified intact recoveries, on at least three distinct perturbation instances** (one win maximum per instance). Do not call a graph-only possibility an empirical comparative win.

A graph-only instance is *potentially winning* if any first-hit time `t ≤ 24` has strictly positive null first-recovery probability and `P_null(T ≤ t) ≤ 1/4`. A pair is *structurally eligible* only when one actual scanner-valid anchor/turn orientation has at least three potentially winning instances; do not pool successes across incompatible excursion orientations.

## 4. Graph-only eligibility and analytic curves

The mathematical enumeration expects **seven structurally eligible pairs**:

- 1–2 Doogu; 2–4 Skoodu; 2–7 Oddubb; 2–9 Unnunddo; 4–7 Ababbatok; 7–8 Mombbo; 8–9 Ummnu.

The two previously plausible A1 pairs **1–8 Mur Mur** and **1–9 Tutagool** fail under the fixed `P_null(T ≤ t) ≤ 1/4` comparison (respectively zero and two potentially winning instances). The other 36 pairs lack scanner-valid elementary excursions. A graph-only generator **must derive and verify** this exact set independently of empirical Amelia observations; if it differs, STOP with an incident report, never adjust α or choose a different graph to get the expected answer.

Complete machine-readable deliverables for all 45 pairs are:

- `a1-r2-graph-only/ELIGIBILITY_45.json` — pair status, ordered anchor, every permitted D(d)/L₂ instance, exact first possible win tick, minimum qualifying null CDF, 0/1 graph eligibility, required count difference for the memory signature.
- `a1-r2-graph-only/EXACT_NULL_CURVES.json` — *every* per-instance first-hit and cumulative CDF rational, for every tick 0..24.
- `a1-r2-graph-only/ELIGIBILITY_REPORT.md` — human-readable graph-only conclusions, complete 45-row table and per-instance witness times.

## 5. Memory, integration and sham

Let N be the **total number of applicable D(d) and L₂ instances** for the candidate's observed anchor/turn orientation. Let `W_intact` and `W_reset` be the **number of comparative wins** under the same instance-specific null curves, not raw recovery fractions. A memory signature is positive iff:

`(W_intact − W_reset)/N ≥ 0.25`.

This is an **integer** difference of at least `ceil(N/4)`: one additional intact comparative win for **N=4**, or two additional wins for **N=5**. Retain all applicable instances in the denominator even when neither arm wins. For the 36 noncandidate pairs the expression is **not applicable**, not a zero score.

Integration remains the same causal-ablation form, evaluated under the amended comparative-win criterion: at least one intact and sham comparator-qualified win must be abolished by a **selectively suppressed** fork, leaving the topology intact. Retain the original synthetic implementation's zone-b activation scale **0.10**, and the sham's neutral scale **1.0**. Record exact state effects and factor. Sham must follow the same code path and reproduce intact outcomes and the nonperturbative trajectory, apart from deliberate condition labels.

An encounter requires (i) the ≥3-win / ≥3-instance goal criterion; (ii) memory **or** integration; and (iii) sham parity. Temporal and spatial reach are recorded descriptively only. No route-diversity requirement. No other threshold changes.

## 6. Negative controls, explicitly non-tautological

Retain the **original pure-recurrence walker** (first available directed out-gate, no PFM/Governor), then additionally run all **eight** deterministic memoryless canonical topological policies. Every policy fixes which gate to choose at branching zones **1, 2 and 4**:

- Zone 1 choices: 1→8 (bit 0), 1→2 (bit 1).
- Zone 2 choices: 2→7 (bit 0), 2→4 (bit 1).
- Zone 4 choices: 4→5 (bit 0), 4→7 (bit 1).

The full eight policy IDs, in zone order (1,2,4), are **000, 001, 010, 011, 100, 101, 110, 111**. All other out-gates are deterministic; sinks have absorbing dwells. Policy 000 duplicates the original first-choice baseline *by design*; do not misreport the nine checks as independent. All fixed policies remain oblivious to memory and Governor. Their input tape, fork checkpoints, displacement instances and L₂ schedule follow the same synthetic pilot procedure.

**Each negative policy (including the original baseline) must yield ZERO complete encounters.** Report **separately**, for every policy, how many candidate/perturbation sets pass the **goal criterion alone** against the common analytic uniform-random null, even if the required memory/integration effect is absent. A zero complete-encounter result is uninformative if the scorer only compares a walker to itself; the uniform null must be used for all scores. Sham parity required.

## 7. Positive fixtures and resource budget

Only the **seven graph-only eligible pairs** receive constructed memory-held goal-control fixtures. Predeclare three independent synthetic seeds **101, 202, 303 per pair**: **21 fixtures**, no extra after seeing results. Each constructed agent must operate on the **original eleven-edge canonical graph**. Every fixture must pass the unchanged scanner and enter its fork challenge under a real scanner-confirmed excursion. A constructed recovery counts only if it satisfies the actual analytic-null comparator and the amended memory or integration signature. At least **19/21 fixtures must confirm** (≥90%), all seven pairs must be represented by at least one success, and names must be **100% correct** for every confirmed event. Sham must be identical to intact in all 21 fixtures.

**Budget remains 24 Amelia forks per candidate, without extension.** Five maximum instances × four Amelia conditions = at most **20 physical forks**, leaving four unused; the uniform null is calculated analytically and creates **zero companion walker trajectories**. If a runner cannot meet the budget, report FAIL. No changes to the 24-tick horizon, alpha, memory margin, or recovery-count threshold.

## 8. A1 re-pilot requirements — specifically NOT AUTHORISED YET

Only after **operator review and further explicit authorisation of the SEALED constants**:

1. Run graph-only eligibility code from its pinned commit and verify all 45 pair statuses and every exact null curve.
2. Run original recurrence + all 8 policies, on canonical graph, documenting **zero encounters each** and **goal criterion alone** counts.
3. Run all 21 fixed positive fixtures: ≥19 confirmed, ≥1 from each eligible pair, perfect confirmed naming and sham parity.
4. Run **10,000 synthetic-only Amelia steps**, PFM carried; report every candidate's pair, anchor, turning zone, time, perturbation applicability, comparator wins, memory/integration diagnostics and reason for non-encounter. **No Amelia data may be consulted or used to set or revise these constants.**
5. Prove deterministic byte-identical replay, journals and silent exposure ledgers, hash chain, local RFC3161 seals of journal entries, plus ≥1 genuine FreeTSA receipt verified offline against the pinned root. Archive source hashes, null curves and all fork evidence.
6. Publish `PF1_A1_R2_REPILOT_REPORT.md` with each gate, exceptions and independent reproduction links. Any failure produces NO-GO, never parameter rescoring.

**STOP CONDITIONS:** changed graph or substrate, altered threshold, non-pinned constants, unavailable null curves, hidden fork budget, missing negative policy, incorrect name, absence of a real seal, unaccounted input, or unsatisfied positive controls.

### Operator status

**The amendment revisions and mathematical analysis are authorised. The sealed constants require operator review before a separate re-pilot authorisation. The re-pilot and LIVE START are NOT authorised.**
