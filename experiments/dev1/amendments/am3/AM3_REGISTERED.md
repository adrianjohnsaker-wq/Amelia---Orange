# DEV-1 Amendment AM3: refrain signal, corrected sequence, co-primary outcomes

**Issued:** 21 October 2026, operator-approved at 18:05:23 UTC. **Amends:** DEV-1 Stage 1 work order, AM1 stone tape, AM2 Quatermass. **Status:** PROSPECTIVE; no corrected-arm execution before SHA-256 + independently verified RFC 3161 seal.

## 1. Disclosure and design rule

Registered original D1, whose operator-approved signal `o` measured the change in distinct-edge mobility over H=24 steps, **shortened survival** (mean 1224.6875 vs B 1703). Tape 2 final values on safe 1→8→9→1 were approximately −0.6041, −0.6162, −0.6602, with near-zero values on 1→2 and 2→4. Repeated return to a territory produced negative mobility-change credit, favoring 1→2 and the route to sink 5. **This was the reviewer's original specification error, not an implementation error**, and was diagnosed from original D1 values, not any corrected-arm results. Original registered D1 is retained unaltered.

Operator's Deleuzian design rule (verbatim): **"adaptive signals distinguish lines of flight that return from lines of abolition; they do not penalise novelty."**

Drawing on Deleuze and Guattari, *A Thousand Plateaus*, the refrain means deterritorialisation followed by reterritorialisation; the line of abolition leads to destruction (Plateau 9), with the black hole of too-sudden destratification (Plateau 6). The canonical zone 5 has no exit and is the graph's line of abolition.

## 2. Corrected consequence signal o″, unchanged transition architecture

Use the original zone sequence `z_s`. The directed edge taken at step t (zero-based) is `e_t=(z_t→z_(t+1))`; **H=24**. Territory `Theta_t` contains the zones occupied at steps `t-24` through `t-1` (truncated at 0). At `t<24`, use all zones occupied so far starting with zone 0 at step 0. The unvisited beginning `t=0` includes its current initial zone 0.

Each `o″(e_t)` is resolved **once**, at `z_(t+H)`, or earlier upon terminal absorption.

1. **Abolition precedence:** If zone 5 (no outgoing open gate) is entered at any step in `t+1 ... t+H`, `o″(e_t) = -1`.
2. **Refrain:** Otherwise, if `z_(t+1)` **is not in** `Theta_t`, and there is a first return to **any** zone of `Theta_t` among `z_(t+2) ... z_(t+H)`, then `o″(e_t) = r`, where `r=|E_exc \ E_prev|/11`. `E_exc` is the set of distinct directed edges taken **from step t through the transition ending at the first return step, inclusive**; `E_prev` is the set of distinct directed edges taken in the **24 steps before t**, truncated at birth. Reward in [0,1]; repeated excursion edges already in E_prev yield 0.
3. **Otherwise:** `o″(e_t)=0`, including repetition, in-territory moves, departures without return in H and departures neither absorbed nor returned.

Unchanged numeric constants: **H=24, edge count=11, initial V=0, V∈[-1,1], w_V=0.5, update `V <- V +(o″-V)/8`**. AM1 T remains separate, terminal-only with one distinct-edge update per death toward −1. No frozen original source files, sealed work-order constants, AM1/AM2 timestamps, topology, or PF-1/C1 source may change.

## 3. Arm status, sequence, review gates

**Retired unrun with original o:** D2, D3, D4, Y, L, LY, L0, LS, LSY. **Existing B reused unchanged; original D1 preserved as registered.**

**New corrected series in order:** D1″, D2″, D3″, D4″, Y″, L″, LY″, L0″, LS″, LSY″. The within-life series replaces only o with o″; lineage series also inherits unchanged AM1/AM2 designs. D1″ is executed/reported then must be **reviewed** before D2″ or any subsequent arm runs.

## 4. Co-primary registered outcomes and families

O1 (within-life) = restricted mean survival time through 10,000 steps; (lineage) = per-lineage Spearman slope of log survival versus generation.

O4 (within-life) = distinct directed edges visited per 1,000 actual moving steps; (lineage) = per-lineage arithmetic mean across generations 2 to last of per-life O4 rates. Other specified assays (O2 selector-memory ablation, absorption routes, AM1 O2-T/O7, AM2 O8) remain operative.

**Primary family: six tests, 100,000 permutations, Holm 0.05**, paired tape sign flips for within-life and lineage permutations for lineages:

1. D4″ > B, O4 exploration, one-sided
2. D4″ vs B, O1 survival, two-sided
3. D4″ > Y″, O4 exploration, one-sided
4. D4″ vs Y″, O1 survival, two-sided
5. L″ > LY″, O1 lineage survival slope, one-sided
6. L″ > LY″, O4 lineage exploration, one-sided

**Interpretation fixed:** support continued deterritorialisation while avoiding abolition **only if both #5 and #6 favour L″ after correction**. More survival but less exploration = reterritorialisation by restriction, **not development**. More exploration but no survival gain = unchecked line of flight.

Independent unchanged secondary families: AM1 `LS″ > L0″`, `LS″ > LSY″`; AM2 `L″ < LS″` and `L″ < L0″` on exploration (P-AM2-1), each family separately Holm-corrected at 0.05.

## 5. Predictions prospectively registered before any corrected execution

**P3-1:** Within-life D1″–D4″ explore more than B on O4; survival is not greater than B and may be lower. Report both supported or failed; no post-run parameter tuning.

**P3-2:** In L″ and LS″, `V(4→5)` or `T(4→5)` is only driven toward −1 because terminal edge 4→5 cannot return. From first post-absorption generation, uncued zone-4 choice predicted to switch to 4→7 because flux gap ≈0.009 and one death yields −0.125. With +0.35 input cue and wV=0.5, pitward cued choices predicted to persist until the accumulated terminal mark falls below −0.7: approximately nine absorptions, since `(7/8)^9≈0.30`. Cued absorption declines after roughly generation nine; zone-4 4→7 share rises from generation two. In LY″ and LSY″ there is no generation-linked decline prediction. **Record held or failed independently; no signal correction following a failure.**

**P3-3:** For every L″ lineage reaching ten generations, terminal `V(2→4)>V(4→5)`. The lineage learns to avoid the abolishing edge, not the region. Report held/failed.

**Additional descriptive requirements:** all future reports give pitward shares at **1→2, 2→4, 4→5**, each with exact pitward-cued, other-cued, uncued, overall numerators/denominators, sparse markers as in AM2. D1 diagnosis/hazard scaling is exploratory: B zone1 6.4223% vs D1 7.0174%, roughly one-third heuristic of RMST reduction; not causally identified.

## 6. Seven mandatory pre-D1″ unit tests (original numbered §5)

1. **Repetition:** repeated circuit `1→8→9→1` gives `o″=0` for every edge (in an established repeating territory).
2. **Returning excursion:** `1→8→9→1` followed by `1→2→7→8`: `1→2` and `2→7` each have `o″=r>0`, `7→8` has `o″=0` (in-territory move).
3. **Repeated refrain:** repeat that excursion within 24 steps with its edges in `E_prev`; `r=0`.
4. **Absorption:** absorption at step `t+k`, `k<=24`, makes `o″=-1` for **every** edge `e_t,...,e_(t+k-1)`.
5. **No return:** nonabsorbing departure without return through 24 steps has `o″=0`.
6. **Early steps:** `Theta_t` matches step-truncated zone history at `t<24`, including birth zone 0.
7. **Exit-choice sensitivity:** nonzero V flips selected exit whenever the base-score gap is less than `w_V×|V|` (original D1 gate flip mechanism).

## 7. Evidentiary constraints

Seal the exact issued scientific definition and additive v3 manifest with SHA-256 and independently verified RFC 3161 **before running any corrected arm**. Verify that **only B/D1 cohort results** exist when sealing; lineage, D2–D4, Y, and corrected-arm outcomes must be absent. Signed original AM1/AM2 artifacts remain byte-identical. Run seven unit tests on artificial constructed traces first; log any ambiguity or failed unit, fail closed. D1″ 32 identical synthetic tapes only after seal and all units PASS; byte-identical replay; O1, O4, O2, routes, 32 final V tables, all three cue strata. D1″ reviewed before any later corrected arm.

**This registration is motivated by historical D1 results** and is NOT an independent hypothesis fixed before D1. Philosophical analogies are design interpretations and not experimental findings.
