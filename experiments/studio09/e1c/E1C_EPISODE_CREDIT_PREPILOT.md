# Studio 09 E1C — Distinct developmental episodes: engineering preregistration

**Dated 26 October 2026, before E1C-P0 code execution.** New engineering assay descended from Studio09 E1B, whose positive structural changes and adverse carry/reset result remain frozen and unaltered. **No 32-world science claim, no interpretation as Outside intelligence or literal Warp.**

## Why this one alteration

Under E1B's 24-transition credit, **one death can settle up to 24 pending decisions** and count as multiple negative observations for a receptor. In E1B P0, one death at tick 683 produced all three simultaneous wiring changes. This shows persistence but leaves open whether an organism acquires structural competence from *distinct developmental events* rather than several accounts of the same interruption.

## E1C credit unit, completely specified

Maintain ALL committed Numogram/Studio01–04 receiver-house dynamics, 24-gen initial growth, three E1B original memory sensor mappings, META1 UCB *choice policy and its existing per-choice reward ledger*, structural wiring `[0,0,0]`, 8-observation rolling receptor mean threshold **strictly below -0.25**, four-switch cap, 24-settled-observation cooldown and +0.35 bonus. No retuning on the earlier pilot.

**Change ONLY feedback fed to the structural receptor layer**, not to UCB sensor choice:

- A *distinct episode* is a **non-overlapping** block of at most 24 completed model transitions, anchored at its first step, ending at step 24 or on the **first death**, whichever comes first. The next episode begins with the next transition, also after reincorporation.
- **Exactly one receptor witness** is assigned when the episode opens: the actual sensor selected by the frozen UCB gate *at the first step*. Store its initial wiring encoding. If no sensor is selected then the episode has no structural credit. The witness is fixed even if UCB chooses different sensors on subsequent steps.
- At completion, compute receptor-only reward **−1 on a death**; otherwise `clip((number of distinct directed edges visited in that episode −4)/7,0,1)`. Each episode completes once, has a unique monotone identifier and cannot be reused; **one death produces at most one negative receptor observation in its episode**.
- Record the episode's start/end ticks, episode ID, age in transitions, representative sensor and initial wiring, death flag, distinct edges, receptor reward, and any wiring change. A receptor flip must be reconstructible from the last eight **completed** independent episode credits attributed to its current wiring. A future outcome cannot affect the chosen transition of that same episode.
- The *existing* per-choice META1 UCB selector may still receive overlapping rewards. **This test isolates de-duplication in receptor structural learning only.** Do not claim all decision-level learning is independent.

At transfer boundary (after exactly 10,000 encounter transitions), **censor** the one unfinished episode equally in both forks (no fictitious reward). Censor the identical still-pending META1 per-choice feedback in both forks as before. Freeze subsequent receptor structural mutation, and compare carry/reset from full state equality with identical 2 × 1,000 future input tapes.

## Single pilot, one input policy and eligibility criteria

Use **only E1-P0** and the original model's `ordered` source tape, not the dramatic Zone-5-bias intervention. Reuse the original genesis SHA derivation and fixed 10,000-tick encounter / 2,000-tick transfer. Do not test additional pilot seeds, threshold modifications or source variants.

Pre-state engineering checks:
1. 24 non-overlapping episode transitions generate exactly one credit; no 24 duplicated credits can alter receptor wiring.
2. Seven distinct non-death + one distinct death episode cannot produce a flip at the strict threshold; **five safe and three distinct death episodes** within the final eight can produce one flip. These are synthetic unit tests only.
3. An episode cannot be finished twice or started in the middle of another; one death closes and does not duplicate the next episode's credit.
4. State export/import, identical carry/reset full-state fork, source-excluding prechoice sensor readings and never more than +0.35 additional cue.
5. Independent Python verifies every episode's start/end, non-overlap, death attribution, reward, structural switch and full checkpoint counts directly from the complete raw model trace.

The genuine model pilot may result in no structural changes, in changes without transfer impact, in favourable transfer or in adverse transfer. Report each without revision; do not condition on a positive number of structural events. If no episode-driven change occurs, **this is a legitimate boundary on the initial E1C grammar, not a broken model or a mandate to search for favourable seeds.**

**Engineering output only**: raw 10,000-step encounter trace and two 2,000-step transfer traces plus SHA-256, full source checkpoint, independent verifier receipt, exact episode count, number of independent fatal episodes, number of structural flips, and held-out *additional* deaths in carry/reset. No registered science worlds run.

## Scientific design after this gate

Only after recording the one pilot, write a separate 32-world registered experiment with true prospective seeds, full source and protocol hash seal, an episode-conditioned structural learner and an *identical* feedback-blinded structural control. Its primary transfer outcome would be paired new deaths or recovery under the same external held-out tape, irrespective of whether structural changes actually occurred in each world. No post-result tuning or exclusion.

**This document is an engineering preregistration of E1C only; it is not an independently sealed research hypothesis.**
