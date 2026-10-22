# PF-2 “The Receiver” — append-only project engineering log

**Standing question:** Can an encounter with something external create a history that becomes capable of organising subsequent encounters?

**Standing three-studio plan:** [AMELIA_THREE_STUDIOS_WORKING_PLAN.md](./AMELIA_THREE_STUDIOS_WORKING_PLAN.md). Stone Tape = memory held by a place; Quatermass = inherited ancestral course; the Outside = candidate organised patterns read through Numogram dynamics. These are linked generative hypotheses, not already established external consciousness.

## 22 October 2026 — operator-approved build and first fidelity gate

- **18:13:07 UTC:** Operator approved the PF-2 build but **not a live genesis**. Four normative files supplied and preserved with their exact uploaded byte SHA-256:
  - registration `12a641718fb6c23f81b9f31ce7bc1e966654a9f01c85d16853219e50604e8237`
  - `receiver.mjs` `030a0685e7d48fb71706b6100d2291e2d132a776432a99a81d54ba90b9c9a4b7`
  - `gold_learner.json` `a35799a04c77f5d574cfd772c832b9aa7391af3ccad490636219d2027e499510`
  - `gold_unchanged.json` `e984bb291476b820875a48e566d562a5e571a95435c7157cb44dba9df39a539f`
- Normative `receiver.mjs` calls an `exitBonus` property absent from the frozen canonical runtime interface. The scientific decision is to implement its required `+0.5V(e)` **as the last expression** in a separate, temporary step-selection wrapper, leaving all real Numogram gates and canonical source untouched. The exact post-evolution canonical expression is evaluated left-to-right; only if the chosen target differs from the original score does a temporary gate proxy enforce the selected exit. The real gate state is never rewritten by this overlay. `experiments/pf2/PF2_EXIT_SCORE_OVERLAY.mjs` and reference file remain distinct.
- **Fidelity gate PASS** [workflow 39830353960](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39830353960): all four 20,000-tick trace hashes equal the two uploaded goldens, all lives, whole JSON output and exact 11-edge final learner lineage-0 V. The original four files' exact byte SHA-256 and frozen canonical/PF-1/C1 source pins were independently verified in the workflow. No genesis, no live input.
- Faster independent replay of the same reference [workflow 39830694321](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39830694321) PASS. It used the existing DEV-1 *byte-identical* incremental long-history hash adapter, installed afresh at each birth. The normative receptor's state transition logic, outputs and golden comparisons were not relaxed.
- Stateful paired implementation `PF2_RECEIVER_CORE.mjs` (nine arms × two modes = 18 receivers) and domain-separated reference mapping `PF2_REFERENCE_INPUT.mjs` committed. **Independent stateful fidelity PASS** [workflow 39831691428](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39831691428): 4×20,000 GOLD digests, lives, choice counters and all final V exact; 18-lineage state export/import and 120 synthetic-tick interrupted/restarted replay byte-identical. Nothing live admitted. No notifications.

## PF-1 shared infrastructure integration, before any genesis

- Added **PF2-only** verified input adapter importing C1's original `LiveBeacon`, admission guard and 20-round batch limit, read-only as to PF-1/C1. Added nine paired receiver engine, append-only verified batch staging, C1/PF-1 `Sealer`-backed genuine RFC3161 per-batch signing, chunk/chain verifier and full read-only replay. Future guarded A1 driver reuses the exact `experiments/pf1/PF1_SAFE_LEASE.py.acquire` exclusive shared remote-lease routine and its 20-per-batch/480-per-invocation limits, no stale rebase, no PF-1/C1 writes. There is **no automatic schedule, no currently authorised invocation, no email/chat/webhook/other notification action**.
- New PF2-specific reference-arm mapping uses the precise ASCII separator `PF2-REF-i|` on 32-byte verified randomness. Same real round as PF-1 at coincident grid ticks; independently domain separated. No PF-1 domains modified.
- Original unchanged PF-1 graph-only scanner, Rung1 scorer, exact null curves and Pandemonium naming table are imported for individual learner and control lineages, not copied or retuned. The preliminary `PF2_PANDEMONIUM.mjs` adapter retains per-life recurrence histories, tracks candidate/encounter distinction and journals prior 240 cues/choices for confirmed patterns.

## Engineering failure and repair (retained)

- [Scanner integration run 39833217186](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39833217186) **FAILED** after canonical and PF-1/C1 source pins passed: while testing a constructed PF-1 Rung1 reset fork, the per-runtime exact incremental digest wrapper still referred to the pre-reset memory events and correctly raised `DEV1_HISTORY_RESET_REQUIRES_NEW_ADAPTER`. No live data or scientific parameter changed. Root cause was fixture/fork adapter lifetime across canonical PFM reset.
- Repair committed at `2f19723c61f8e2d7bf70fdbcf6b375fff85df955`: for reset forks only, restore the original canonical prototype's `exportHistoryDigest` and install a new *byte-identical* incremental adapter on the now-reset memory before any new step. The original core and PFM source remain byte-identical, and the failed run remains in history.
- **Not a licence to change golden traces, registration, selection formula, null curves or live outcomes.** A new passing integration test is required before any pre-genesis seal.

## Pre-genesis gate

- `PF2_GENESIS_MANIFEST_FOR_APPROVAL.json` is **prospective**, specifies grid `(R0−33158540) % 20 = 0`, same drand Quicknet physical round as overlapping PF-1, stride20, `PF2-REF-i|`, future-on-grid R0 selection rule on **separate genesis approval** with ≥20min publication margin, pinned BLS source and exact frozen science.
- **No live `experiments/pf2/live/GENESIS.json` exists, no R0 chosen, no live intake run, no published PF2 experimental result, no scheduled actions and no notifications**.
- The **single prospective RFC3161 seal** should cover one SHA256 bundle listing the exact registration, receiver, both goldens, this manifest and all relevant working scientific code including the selector overlay. Operator approval of this signed manifest must precede any actual genesis and any live collection. Never imply that signing the review manifest itself authorised genesis.

- [Scanner integration rerun 39833731114](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39833731114) **FAILED** after original PF-1/C1/canonical source checks passed. The reset fork digest lifetime was correctly repaired, but the unchanged PF-1 Rung1 `inputDelay` perturbation intentionally supplies `undefined` to the first few fork steps. The PF-2 exit-score adapter had assumed every call contained a string and raised a `TypeError` at `input.trim()`. Fix committed `9f069385cf8175e638f4500022e1f5d51a235685`: for **undefined/empty fork input only**, preserve frozen canonical no-cue semantics (`inputZone=undefined`), while all real verified beacon and GOLD string inputs follow precisely the unchanged selector score. Affected gate is not bypassed or tuned. As this modifies the selector adapter, the GOLD tests must be rerun and PASS again before the single prospective seal. No live data, no genesis, no notifications.
