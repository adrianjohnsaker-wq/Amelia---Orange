# PF3 Phase-0 — First external-history credit provenance and edge-control result
**Observation snapshot: 23 October 2026 UTC · descriptive, retrospective.**
**Audit workflow:** [GitHub Actions 39933985500](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39933985500), PASS (archival chain continuity + raw signature-hash equality + source edge / 24-step learner credit consistency + edge-strata checksum). This workflow did **not** itself reverify BLS cryptographic signatures, RFC3161 or execute the entire PF2 Numogram from genesis; separately pinned source-audit and replay retain authority for those claims.

## Source identity

- **572** archive ticks, 31 originally admitted chunks (tick 0…571); **10,296** lineage-step observations (18 × 572). The prior 292-tick Capture Atlas is a separate historical prefix.
- Physical Quicknet round starts at the already registered R0, each subsequent round at stride 20.
- Original archive head at tick 571 \`bd356847d5e6a152d69ca1afe401da09032a70f9cecdc4c3050c6835e7318a81\`.
- One source beacon underlies the physical tape and eight keyed derived PF2 reference arms; reference arms are not independent physical sources.
- Derived artifact \`pf3-external-history-selection-exploratory\`, GitHub artifact ID \`12492912206\`. Its \`HISTORY_CREDIT_LINKS.jsonl\` holds every verified-source-index link to the archived source and settlement round/bytes/signature, path and V-outcome; \`TERMINAL_HISTORY_LINKS.jsonl\` holds the four terminal histories.

## 1. What PF2 actually selects

The frozen PF2 receiver sets a 24-step delayed \`refrainOutcome\` for a *past transition edge*. Its reward depends on novelty/return within the preceding trajectory. The resulting V update is on that edge. It is **not an evaluation of an independent external input history**. This analysis associates each actual source encounter's external cue and preceding four-cue context with its downstream settled memory update. Causality for the source cue/history is **not** established by mere association.

The entire 572-tick prefix yielded:
- **4,893** learner credit settlements linked exactly to original within-life source transition and beacon evidence.
- **115** positive (novelty/return) outcomes, **4,778** zero outcomes.
- **4** terminal histories: 2 learner deaths, 2 unchanged controls. No new independently observed learner lineage turnover beyond the first 292 ticks.
- All 4,893 source edges and 24-step source-index lags matched original receiver's recorded refrain updates exactly.

## 2. Gross cue-credit associations and why they mislead

| Source encounter cue class | Later positive / all settled | Conditional share |
| --- | ---: | ---: |
| Cue named selected open exit | **61/254** | **24.02%** |
| Cue named another open exit (rejected) | **1/65** | **1.54%** |
| Cue did not name an open exit | **53/1,337** | **3.96%** |
| Forced exit (no choice) | **0/3,237** | **0%** |

Those contrasts look dramatic but are **not causal effects of external history**. In particular, the cue-followed class contains 51 positive credit events on **1→2**, an edge whose cue-class exposure distribution differs fundamentally from 1→8.

## 3. The decisive negative-control check: exact source-edge strata

| Exact past edge | Cue followed: positive/all | Cue not open: positive/all | Cue declined: positive/all |
| --- | ---: | ---: | ---: |
| **1→8** | **1/161 (0.62%)** | **9/1,269 (0.71%)** | **1/65 (1.54%)** |
| **2→7** | **7/11 (63.64%)** | **43/66 (65.15%)** | — |
| **1→2** | **51/80 (63.75%)** | — | — |
| **2→4** | **2/2** | — | — |

Within **1→8** and **2→7**, where genuine same-edge cue strata are available, the apparent advantage of cue-following *does not persist* as a striking positive-credit difference. The strong aggregate association is substantially confounded by which transition was taken, and the source's 24-step novelty/return rule. Data are sparse in some cells, and no confirmatory statistical test was registered.

**Result:** We have established the precise mapping between historical beacon encounters and the formation of personal V memory, but **we have not established that Amelia selectively retains external histories on the basis of their informational structure**.

This is useful evidence, not a failure of the philosophical programme. It identifies the gap that the proposed new selective-history experiment must fill.

## 4. Interpretation aligned with the programme

- External information *can settle a current exit*: earlier Capture Atlas has exact counterfactual cue-pivotal decisions.
- A past *transition* can acquire future causal influence: inherited V at tick 67 in R02, as previously reverified.
- An archived *external input history* is correlated with later memory credit, but the source-edge control shows we cannot call that correlation independent selection of external history.
- The physical beacon's own field-organising memory/agency is **not** established. No new field-level agency hypothesis may be retrospectively inferred from this archive.

## 5. Next preregistration candidates (NOT executed)

**Phase 1:** a separate EncounterHistory state H, with all admitted source time/bytes/hashes, bounded retention capacity, and state-conditioned selection versus yoked, fixed, shuffled-time, and history-reset controls. Compare the SAME current cue and same current organism state while varying only H. Require held-out prospective history-sensitive choice and differentiated recurrence readouts.

**Phase 2:** a physically or computationally independent persistent-pattern source with documented autonomous field-state dynamics versus frozen replay, state shuffle, timing permutation, graph-rewired and place/lineage controls. Show a reproducible, source-specific and perturbation-robust organising effect *before* describing field agency.

All future source mappings, predictions, exclusion rules and readouts must be locked before independent challenge. This is a design draft requiring separate operator approval, not a PF2 protocol amendment.

**Conduct:** no PF2/PF1/C1 state or canonical source changed, no new data admitted, no live run initiated. The analysis is create-only on a dedicated nonproduction branch.
