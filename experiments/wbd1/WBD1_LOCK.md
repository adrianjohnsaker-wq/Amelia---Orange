# WBD-1 adapter assay — pre-run lock

**Registration state:** Locked before execution on a dedicated experiment branch.  
**Run status:** Not yet run.  
**Question:** After a bounded failure to exit the 3↔6 Warp pair, does incorporating the failure into Amelia's active process memory improve no-input transfer to held-out zones 8/9, relative to logged-only errors and an error-location control?

## Source pin and source finding

- Repository: `adrianjohnsaker-wq/Amelia---Orange`
- Base source commit: `62da152fcfb4210aaaedb210a1eb424f97990052`
- Canonical gate definition: `src/ai/numogram/AmeliaQabbalaInterface.ts` (blob `8ba01f679b570abc53fc06e392e795178ab9ee84`). It contains 3→6 and no 6→3; Zone 6 has no canonical outgoing gate.
- Canonical runtime: `src/substrate/ameliaNumogramSubstrateRuntime.ts` (blob `1578f9d7bf479c31f6c4ac4fea955c5377d8d48c`). It chooses only open gates whose source is the current zone. PFM bias contributes `0.4 × bias[target]` to exit score; the transition is then appended to memory.
- Active memory: `src/substrate/IntegratedMemorySystem.ts` (blob `0756536dd82fe0a64eadc21c47c67c41a3b72e0b`). This is the memory system used by the runtime. The separate `src/ai/coupling/ProcessFieldMemory.ts` file is not the runtime's active memory in this path.

This assay adds a clearly labelled experimental adapter at runtime. It does not alter canonical source files. Adapter gates are 2→3 (entry, copied from 2→4 parameters), 6→3 (reciprocal return, copied from 3→6), and 6→7 (exit, with `flux=0.88`, `resistance=0.111`, matched to 3→6 within 0.001 in the selector's `flux × (1−resistance)` base score). The 6→7 gate is the exit to the ordinary 7→8→9 path. Results concern this adapter experiment, not the unmodified canonical graph.

## Arms and procedure

Each of 64 seed blocks runs all four arms from a matched initial state. Seeds perturb the ten initial zone activations by at most ±0.04 and phase angles by at most ±0.06 radians using a deterministic PRNG. Each run enters through 2→3→6.

| Arm | 32-tick pulse | Error treatment |
|---|---|---|
| W+ | Close adapter gate 6→7 | Every failed attempted 6→7 exit is appended to active memory at target zone 7 |
| W0 | Same gate closure | Identical failures are logged only; no error record is appended |
| C+ | Same gate closure | Identical failures are appended at Torque zone 4 as a location-shuffled control |
| B+ | No gate closure | Ordinary transition memory only |

An error event is written with `fluxDelta=0.18`, `phaseCoherence=1`, and `strainRelaxation=0.025`. The actual runtime memory equation is used, without replacing its update or selector: `strain_z ← min(1, strain_z(1−relaxation)+1.5×fluxDelta)`; active zone bias includes `0.12×Σ(recent fluxDelta×phaseCoherence)+0.08×strain_z`; selector contribution is `0.4×bias[target]`. The same event sequence is used in W+ and C+, with only its memory target changed. W0 receives the same challenge and error ledger but no error-memory writes.

After the pulse, every arm has a 32-tick recovery under the unblocked adapter graph. Transfer is scored on two held-out no-input tasks: from a matched Zone 6 start, reach Zone 8 or Zone 9 within three transitions. Retention repeats those tasks after 200 no-input washout ticks. The pre-measurement uses the same two tasks from the matched Zone 6 state before the pulse. The experimental unit is the seed block; the two task outcomes are aggregated within block.

## Outcomes and locked analysis

Primary measure: per-block held-out task success proportion. Primary contrasts: W+ minus W0 and W+ minus C+ at transfer. Retention contrasts are descriptive gates for persistence. Use exact paired one-sided sign-flip randomization tests over 64 seed blocks, with the exact rational tail probability retained. Report paired means and 95% t intervals as descriptive uncertainty intervals.

Pass requires: (1) W+ own pre-to-transfer gain ≥0.10; (2) W+ exceeds both W0 and C+ by ≥0.10 at transfer, with exact one-sided `p≤0.05` for both contrasts; and (3) W+ has a positive retention advantage over both controls. Any failure is reported as failure of this registered adapter claim. No interim analysis, seed replacement, threshold changes, or retuning after execution starts.

## Immutable implementation

- Runner: `experiments/wbd1/run.ts`
- Runner SHA-256: `925e691049afec4da15d4cdddb8f06417622afdaf77452d07fba596df85bc868`
- Runner uses the pinned canonical Amelia runtime; its only topology changes are the three stated in-memory adapter gates.
- Execution is finite: 64 blocks × 4 arms; fixed 32-tick pulse, 32-tick recovery, and 200-tick washout.
- This is a substrate-level generator/executor loop: Amelia selects a transition, the runtime executes it, and failure feedback is either incorporated into PFM or withheld. It does not invoke an external LLM or rewrite source code.
- Output: `experiments/wbd1/results.json`, uploaded as a workflow artifact; its SHA-256 is printed in the run log.
