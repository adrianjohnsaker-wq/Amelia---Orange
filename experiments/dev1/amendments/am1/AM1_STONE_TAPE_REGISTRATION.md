# DEV-1 Amendment AM1: stone-tape lineage arms (LS, LSY)

**Issued:** 21 October 2026, at the operator's request (11:27:35 UTC).  
**Operator disposition:** APPROVED for sealing, engineering implementation and unit tests; NO lineage experimental cohort is authorised by this approval alone.  
**Amends:** DEV-1 Stage 1 synthetic work order, 21 October 2026.  
**Timing rule:** This amendment, its constants and the additive manifest MUST be sealed by SHA-256 and externally verified RFC 3161 before any lineage arm (L, LY, L0, LS, LSY) runs. At sealing, no lineage outcome data may exist. D1–D4 and Y are unaffected.

## 1. Purpose

Arm L passes the whole memory of an individual to its successor. That memory contains two things: the record of the absorption, and a lifetime of habit (the slow trace and edge values formed within life). L cannot identify which component carries any possible survival gain.

The stone-tape arm separates them.

- **Recorded:** only death, written into place.
- **Not recorded:** the life.
- **Successor:** starts with empty personal memory and encounters the place record only at the gates where it chooses.

The model is Nigel Kneale's *The Stone Tape* (BBC2, 1972). This experimental analogy is not evidence that stone or software literally possesses experience.

## 2. Place record and transmission

**T(e)** is a terminal-mark value, keyed by the canonical gate id for each of the **11 canonical open gates**. It is initialised to **0** at the start of each lineage, and resides exclusively in the synthetic developmental wrapper, never in a canonical gate object. Canonical flux, resistance, permeability, open-state and graph topology remain byte-identical.

**Writing:** once per absorption, update each **distinct** gate traversed in the final **H = 24** transitions before and including the terminal entry, **once**:

`T(e) <- T(e) + (-1 - T(e))/8`

No write to T occurs during life. The rule matches the one-time terminal outcome update for arm L's value V(e). For fewer than 24 transitions, use all available transitions; for repeated transitions, update each gate id just once. Retain T within [-1, 0] with exact bounded arithmetic.

**Reading:** for each open outgoing gate add `w_T * T(e)` to the existing D4 exit score. **w_T = w_V = 0.5**, frozen; the basis given in the operator's work order is exceeding the largest choice-point flux gap (0.287). Only original canonical gate ids map values into the selector. Terminal marks are a *place* memory, not a personal-memory signal.

**Successor:** every generation begins as a completely fresh D4 individual: starting zone 0, fresh runtime and PFM, canonical weights, damping 0.88, fresh fast and slow traces, all personal V(e) = 0. Within life it uses all unchanged D4 mechanisms and builds its own personal V, but no personal memory passes to a successor. **Only the place record T persists**, under the control-arm rule below.

## 3. Arms (additive)

| Arm | Personal inheritance | Place-memory T | Role |
|---|---|---|---|
| LS | None | Written exclusively by that lineage's prior absorptions | Stone tape |
| LSY | None | At each generation, read the age-matched place record of lineage `(k mod 32) + 1`, using 1-based k | Wrong-death contingency control |

For LSY, snapshot donor place records at the **same generation** before running recipients; record mapping is 1→2→…→32→1. Donor lookup must not expose that donor's life history or future generations, and the recipient cannot mutate the donor record by reference. Records may be read and then updated locally at absorption; an LSY successor's next starting T must be replaced with the prescribed age-matched donor snapshot rather than inheriting its own accumulated marks. If data source choice or synchronisation requires revision, register that decision before any cohort execution.

Cohort bounds: **32 lineages**, at most **50 generations per lineage**, at most **100,000 total steps per lineage**, same synthetic 32-tape domain. Unfinished generations are right-censored; no synthetic control can access PF-1, C1 or external inflow.

## 4. Frozen outcomes and tests

**O1-LS — secondary directional family:** per-lineage Spearman rank slope of log survival against generation as in L. Two separately permuted comparisons, Holm-corrected at α = 0.05 within the **two-test secondary family**: `LS > L0` and `LS > LSY`. Do not retune or silently alter denominators.

**O1-LS — descriptive only, two-sided:** contrast L against LS to see whether whole personal history contributes beyond a death-only record; do not promote it to primary inference.

**O2-T manipulation check:** once T ≠ 0 in LS, determine the proportion of choices whose selected gate would change if only `w_T*T(e)` were removed from the *same already-evolved state*. It must exceed zero; otherwise label a **mechanism failure**, not a null developmental finding.

**O7 absorption routes:** for each lineage and generation record the ordered final 24 directed **gate ids**/edges ending at absorption. Report the effects of terminal marks on 2→4 and 4→5 and possible impacts on the circuit edges 1→8, 8→9, 9→1. Do not adjust credit assignment post hoc; a change requires a new prospectively sealed amendment.

The unchanged primary work-order family remains D4 > B, D4 > Y and L > LY, with the originally registered tests and controls.

## 5. Invariants and order

- Frozen canonical and PF-1 pinned source files byte-identical; C1 unmodified.
- Existing RFC 3161-sealed `experiments/dev1/DEV1_CONSTANTS.json` remains byte-identical. AM1 is an **additive manifest** and separately externally sealed instrument, not retroactive modification of prior constants.
- Seeded determinism and byte-identical replay required before inference.
- Every decision, failure and deviation is logged in `experiments/dev1/DEV1_LOG.md`.
- Unit tests MUST independently demonstrate (i) **no T writing while alive**, exactly-one-per-distinct-edge update at absorption, and (ii) a nonzero T changes an actual exit when the relevant score gap is smaller than `w_T*|T|`, without gate mutation.
- All five lineage cohorts **L, LY, L0, LS, LSY** remain prohibited before successful AM1 seal. At seal time, *no lineage data* may already exist.
- Operator's current ordering still applies: baseline B and D1 have been reported; no D2 or later developmental arm, and no lineage experiment, begins until explicit subsequent authorization following D1 review.

**Status of this file until signed receipt verification:** REGISTERED, NOT YET RFC3161 SEALED.
