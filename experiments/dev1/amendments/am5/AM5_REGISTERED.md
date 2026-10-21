# DEV-1 Amendment AM5 — final-departure correction and complete arm definitions

**Issued and approved by operator:** 21 October 2026, 20:38:19 UTC.  
**Amends:** AM4 §2 (definition of final departure) and original Stage 1 work order §§C–D, as corrected by AM3.  
**Verbatim underlying source:** `experiments/dev1/amendments/DEV1_STAGE1_SYNTHETIC_WORK_ORDER.md`, committed before this prospective seal.  
**Timing:** AM5 SHA-256 + genuine RFC 3161 seal **before D2″ or any later arm**, with only B, original D1 and D1″ developmental cohort results extant.

## 1. Disclosure

The AM4 literal **last** new-zone transition selected the terminal edge 4→5 automatically and correctly FAILED its tests 1 and 2. That was the reviewer's registered specification defect, not a GitHub implementation mistake. AM5 replaces "last" with a testable definition of the earliest departure with **no return to the departure territory** before absorption; it is a prospective post-AM4 correction and **must not rewrite AM4's signed failure**.

The original work order did not fully define the D2–D4/Y selector interface and redraw generator. Every new interpretation of an open choice is explicitly marked **Clarification** below. No D2″ results existed prior to this registration.

## 2. Corrected terminal departure (lineage credit only)

At absorption into canonical sink 5 at step t_a, define `Theta_t` exactly as in AM3: distinct zones occupied at steps `max(0,t−24)…t−1`, with birth zone zero at step zero. Search **in chronological order** through `t∈[max(0,t_a−24),t_a−1]` and take the **earliest** step satisfying BOTH:

1. `z_(t+1) ∉ Theta_t`;
2. for **every** `s=t+1,…,t_a`, `z_s ∉ Theta_t`.

At least t_a−1 always qualifies because the sink was never in any prior territory. `t*=earliest qualifying t` and the final nonreturning excursion consists of all **distinct directed edges** `e_t` for `t=t*,…,t_a−1`. Each distinct excursion edge is updated once `V(e)←V(e)+(−1−V(e))/8`, and analogously `T(e)←T(e)+(−1−T(e))/8`. Other unresolved final-window edges receive neutral outcome zero, never abolition −1. Outside this termination adjustment, AM3's refrain and neutral rules, 1/8 rate, wV=wT=0.5, and prior hypotheses remain unchanged. **Within-life AM3 D1″–Y″ is not rerun or modified**: terminal credit cannot influence a decision after that life ends.

AM4 mandatory §5 units 1–5 must be repeated against this EXACT revised rule; all pass before a lineage arm.

**Worked checks:**
- Repeated 1→8→9→1 territory followed by 1→2→4→5: earliest nonreturning departure 1→2, marks exactly 1→2,2→4,4→5; circuit untouched.
- Earlier 1→2→7→8 excursion within 24, followed by return circuit and 1→2→4→5: zone2 already in Theta at second 1→2; earliest qualifying exit 2→4, marks exactly 2→4,4→5.

## 3. Complete corrected within-life arm definitions and clarification markers

**Common selector score** for gate g to target zone t:

`f_g(1−r_g)+w_bias·b_t + w_act·a_t + w_phase·cos(phi_t) + w_input·[cue=t]+w_V·V(e)`.

The gate's flux/resistance and target-zone bias/activation/phase are assessed **after that step's canonical trait evolution**. Canonical weights `w_bias=0.4, w_act=0.2, w_phase=0.1, w_input=0.35, w_V=0.5`; ties retain pinned canonical gate order. All corrected arms use AM3 o″, unchanged within-life terminal outcomes until death.

**Clarification:** `TraitEvolution` ALWAYS reads the original canonical `IntegratedMemorySystem.readMemoryBias()` and the zone dynamics are otherwise the same as B when the history and exits are the same. New developmental traces or weights affect **only exit selection**, not trait evolution.

**D1″:** as already run, canonical selector + `0.5V(e)`, no other change.

**D2″ = D1″ plus fast/slow selector traces and consolidation.** Two zone-indexed vectors F,S, all zero at birth; after every selected destination zone z, simultaneous updates:
- `F_k←(1−αF)F_k+αF·[k=z]`, `αF=1−exp(−1/48)`.
- `S_k←(1−αS)S_k+αS·[k=z]`, `αS=1−exp(−1/2400)`.
- Use `Fhat=F/sum(F)`, `Shat=S/sum(S)`; a trace with zero sum contributes **zero** to every target.
- **Clarification:** use `b_t=(Fhat_t+Shat_t)/2` **instead of** the canonical bias in the selection score, with existing w_bias 0.4. The replacement is selector-only. At the first choice both traces are zero.
- After every completed step whose **1-based index is divisible by 48**, call `rt.getMemory().consolidateStrain()` exactly once. **Clarification:** do NOT call `rt.triggerConsolidation()`, which adds an event and changes Governor.
- In lineage only, S is inherited; F is reset to zero.

**D3″ = D2″ plus essential variables E1/E2 and a second-order weight-redraw loop.**
- E1: distinct directed edges in rolling 48 completed transitions. Assess only after the first 48 transitions; bound E1≥3.
- E2: the Governor's `deformationFieldTension` **after the current step's audit**, bound [0.14,0.65].
- Trigger after **either** variable remains out of bounds for **24 consecutive assessed steps**, provided no redraw in the preceding 24 steps (refractory).
- Redraw independently w_bias, w_act, w_phase, w_input uniformly in [0,2× respective canonical weight]; w_V stays 0.5, and new weights persist until another redraw.
- **Clarification:** derive per-tape seed as first eight bytes of SHA-256(`'DEV1-D3-DRAW-'+k`), feed a pinned deterministic generator, consume draws in order. Record step, trigger, old weights, new weights. The attached original work order specifies a seeded generator but **does not name a concrete PRNG algorithm**; if no already pinned PRNG implementation can be verified, this must be disclosed and must block D3″ arm execution until resolved. D2″ does not use random draws.

**D4″ = D3″ plus tension homeostat.** After each step audit, adjust Governor momentum damping through its existing setter: +0.01 if tension<0.14, cap at 0.99; −0.01 if tension>0.65, floor at 0.45; unchanged within bounds.

**Y″** uses D4″ machinery on exactly the same synthetic tape as corresponding D4″, but for its own edge at step t uses the *partner D4″'s* resolved o″ indexed by t; if the D4″ trajectory is already absorbed and has no step t, assign o″=0. In particular yoke terminal abolition by step index. Y″ calculates **no** outcome from its own trajectory. This is not the same as transferring partner gates or future state.

**All pre-existing AM3/AM1/AM2 families and interpretations remain frozen.** D1″ remains accepted; first next arm is D2″ only, then STOP until reviewed.

## 4. Mandatory pre-D2″ unit tests

1. Each fast/slow **normalised trace sums to 1 after a step**, and constructed values follow exact αF/αS.
2. At 48,96,… call only memory `consolidateStrain()` exactly once; never `triggerConsolidation()`.
3. The canonical bias passes unmodified to `TraitEvolution` in D2″; zone dynamics match B when the same histories/exits are fixed.
4. D3″ redraw follows only a full 24-step out-of-bounds run, obeys 24-step refractory; weights fall in registered ranges and deterministic replay matches.
5. D4″ homeostat changes damping by exact ±0.01 and respects [0.45,0.99].
6. Y″ applies its partner's o″ by step index, filling zero only after partner absorption.

## 5. Provenance and reporting

Re-run AM4's five registered tests against AM5's corrected t*; report the earlier AM4 failure and subsequent AM5 test success separately. Run all six AM5 tests **before** running D2″. D2″ on the **original 32 synthetic SHA256('DEV1-TAPE-'+k+'|'+i) tapes**, capped at 10000 steps each, with original B as unchanged comparator, byte-identical second replay, original canonical source and PF1/C1 pins verified.

Report O1 (RMST, censoring), O4 (mean per-individual distinct edges per 1000 moving steps), O2 memory ablation versus original baseline, routes and all original AM2 three choice-point shares (pitward-cued, other-cued, uncued, with numerators/denominators) and full 32×11 final V table; optionally full trace final values as extra diagnostics. No six-test confirmatory co-primary family p-value is computed for D2″. No later arm until D2″ is reviewed.

**AM5 sealing gate:** no future corrected arm besides accepted D1″ exists; historical data only B, D1, D1″. AM3/AM4 and original work order source remain byte-identical.
