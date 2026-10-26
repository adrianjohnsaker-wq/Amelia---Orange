# Studio 09 E1C — Independent-episode structural acquisition, P0 engineering report

**Recorded 26 October 2026 · PILOT-ONLY · Source/trace engineering audit PASS · NO registered E1C scientific world executed**

## Problem and change-control history

The E1B ordinary-input pilot showed eleven structural receptor flips in one world; its delayed, overlapping 24-transition per-choice reward meant a single death could count repeatedly as distinct negative learning evidence. The new E1C unit [was specified before any E1C-P0 run](./E1C_EPISODE_CREDIT_PREPILOT.md). This is a separate pilot-informed version, NOT a retuning or retroactive correction to E1B's frozen outcome. Do not use E1B's eleven-versus-E1C's one flip as a pre-registered causal comparison or as evidence that less wiring change is always better.

**Exactly one scientific-mechanism change:** the developmental **structural receptor** receives at most **one credit for each disjoint episode** (24 transitions, or the first death), and assigns that credit to the receptor sensor chosen at the episode's first step. The frozen META1 UCB continues to receive original overlapping 24-transition per-decision feedback: **the experiment isolates structural-learning credit independence, not independence of every policy reward.** The three originally committed sensors, two target mappings, strict mean threshold `< −0.25`, eight-event recency memory, 24-episode refractory, four-switch limit, +0.35 cue strength, coupled lineage/house update order, and canonical external source path remain unchanged.

**Single prespecified pilot:** original source-model `E1-P0`, ordinary deterministic ordered encounter (two 5,000-tick blocks), same exact 24-generation genesis method as prior E1 studies, then two identical heldout 1,000-tick input tapes for the exact carry/reset receptor-structure fork. No sink-biased challenge and no favourable-seed screen; original prior studies unchanged.

## Verified pilot-only results

| Engineering measure | Observed |
|---|---:|
| Encounter transitions | **10,000** |
| Completed, non-overlapping developmental episodes | **425** |
| Distinct fatal episodes | **16** |
| Receptor structural changes | **1** |
| First/only receptor change | **tick 2,210** |
| Changed sensor | **surface_decline24** |
| Replayed latest-eight episode mean triggering change | **−0.375** |
| Fatal episodes within that eight-episode sensor history | **3 separate deaths** |
| Encounter final wiring (surface, house, code) | **(1,0,0)** |
| Unfinished episode censored on transfer | **Yes, identically** |
| UCB pending per-choice credits at boundary | **23, censored in both forks** |
| New deaths in held-out carry fork | **7** |
| New deaths in held-out structural reset fork | **4** |

**The critical result is that structural rewiring survives de-duplication:** the one receptor change was supported by **three distinct fatal developmental episodes** appearing within the last eight completed episodes assigned to surface-decline. The original E1B set of three simultaneous flips at tick 683 was not a set of independent experiences; E1C's event at tick 2210 is qualitatively different evidence.

The held-out forks were identical in the complete source-model checkpoint **before resetting only the receptor wiring bit**. The same held-out source inputs generated different paths and additional death counts, **seven** with the retained bit versus **four** after reset. The retained change was consequential but **maladaptive on this observed outcome**. This does not show better intelligence, superior fitness or agency in the source tape.

## Source and independent verification

- The original legacy E1 and E1B negative/positive pilot reports, and registered META1, are **unchanged**.
- E1C implementation: `e1c_episode_receptor.mjs` and new original-source `e1c_integrated_runner.mjs`.
- `e1c_episode_verify.py` is a **separate Python verifier** which reconstructs from the gzipped raw trace: each consecutive episode ID and age, non-overlap, single death attribution, all original META1 per-choice reward time windows, each episode's reward, final wiring, the structural event at tick 2210, rolling window contents, and checkpoint counters. It additionally checks the two complete 2,000-transition held-out traces against the same full-state parent and source tape, correctly distinguishing added transfer deaths from cumulative earlier deaths.
- Deliberate corruptions of a completed episode reward and a duplicated episode identifier were **both rejected** by the independent source replay.
- [Engineering GitHub workflow **40266244594**](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/40266244594) **SUCCESS**.
- GitHub Actions raw evidence artifact **`studio09-e1c-distinct-episodes-p0-raw`**, ID **12626905171**: exact P0 genesis, complete encounter and fork checkpoint, two gzip heldout traces, all receipts and Python independent verification. Retention is temporary (90 days); archive externally for durable replication.
- Encounter raw gzip trace SHA256: `bb5068bd6ae0aaae6a54f5dd20c7e9585bd0b405a453ac4249a2bf996f81e575`.
- Carry heldout raw gzip SHA256: `07f92d18cebcad6d1011b5ff22a3f6e19a81434b7867dfde2cf431c5ed7f3b33`.
- Reset heldout raw gzip SHA256: `9796183598eb45346017b3687e7663cf65378887476aae22cea0fb17685e2560`.

**Exact observed limits:** one deterministic synthetic seed; an investigator-authored, two-target per-sensor grammar; externally provided (not self-invented) mappings and reward; no genuine drand tape; no actual CCRU Zone-3 ⇄ Zone-6 recurrent Warp in the frozen eleven-edge runtime; no independent external certificate. Counts of completed episodes are not automatically independent biological replicates. The whole receptor's outcomes can be history-dependent, and prior UCB selection still receives overlapping outcome credits.

## Next scientific gate

The original interpretive question now has an experimentally attainable, inspectable mechanism: a real Outside-origin input sequence can contribute to **an acquired mapping that persists and affects a later encounter** without counting one death as eight separate structural observations.

Before a stronger scientific conclusion, register a **new, independent-seed 32-world test** of episode-conditioned structural learning against a **feedback-blinded structurally fixed control**, and the full-state **carry/reset heldout causal contrast**. Admit worlds with zero structural flips and negative transfer effects. The primary analysis should distinguish structural *consequence* from *benefit*, with independent clean-checkout replay of all source-model traces. This next study is NOT yet sealed or executed.

**Verdict:** E1C episode-credit engineering PASS; independent structural acquisition observed once, with adverse persistence; prospective multi-world developmental advantage remains unproven.
