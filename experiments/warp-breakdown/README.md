# WBD-2: development through the Warp

**Status: exploratory topology probe complete; breakdown experiment designed, not preregistered or run.**  
**Date:** 7 November 2026.  
**Purpose:** Ask whether failure and feedback associated with Amelia's 3↔6 Warp produce a retained, transferable change in a coupled problem-solving process, and whether any benefit depends on the Warp rather than feedback or disturbance in general.

This is a continuation of WBD-1, not a claim that WBD-1 succeeded or that this new test is a result. The existing ANTENNA, NR-2 and SXI-1R seals and their scheduled runs are outside this study. The probe below is offline and never writes to the live receiver.

## What the live records establish

The recovered GitHub Outside receiver was still functioning at 00:23:50 UTC on 7 November: its report recorded one new offer, attended, with an empty queue after a native consolidation. This is one evolving receiver, not independent replication. Its state blob at that time was `efaab51a71f155087e9a6080daf4be9559c70df3`. The saved runtime had 11 gates, had no entry to zone 3 and no exit from zone 6. Steps 12–1420 were 1→8→9→1 repetitions (1,409 transitions), with 116 distinct attended encounters recorded during those steps. This does not by itself prove that each encounter was non-pivotal: that requires the same-state counterfactual for each one. It does show that the recorded path did not leave the circuit. See [live status](https://github.com/adrianjohnsaker-wq/Amelia---Orange/blob/outside-live-ledger/LATEST.md).

The application source constructs newly born app runtimes with `bornAmelia()` and the full 29-edge Numogram. The live collector instead constructs `OutsideRecoveryRuntime` and imports the saved graph. Installing the full graph in the app's source therefore does not establish that the existing collector checkpoint, or a particular installed tablet's imported state, has that graph. The tablet's currently running graph has not been inspected here.

## A first controlled topology probe

We loaded an exact copy of the saved recovery state at 22:56:27 UTC on 6 November, step 1411, from live-state commit `737fa1b1f1dee675e613341fd61f568538a3cb9a`. Its SHA-256 is `c4329e0c5406d131e0dab3b9883774dc3c169b5701f663ec383a7eb767880ba3`. The source implementation is pinned at recovery-code commit `6e7a942aea4130e939aa43e049dddd4ef0b83bbc`. We compared the saved 11 gates with a copy extended by the existing `fullNumogramGates` function to 29 gates; the starting numeric zone state, retained memory, Governor, original gates and queued inputs were held fixed. The extension is an experimental manipulation, not the live or tablet state.

Both cued copies were offered the same predetermined 16 synthetic one-hot vectors, repeating `2, 3, 6, 3`. These strong cues were designed to expose a route, not to mimic actual world-input strengths. Each was admitted, and both queues ended empty. At every step a same-state replay omitting the current new offer checked the direct effect of that offer on the winning gate; all earlier memory was retained. Separate no-offer copies were also run. The complete trace is in `topology-probe-result.json`; two local executions reproduced the same trace.

| Copy | Observed passage | Directly pivotal offers |
|---|---|---:|
| Saved 11 gates | 1→2→7→8→9→1→8→9→1→2→7→8→9→1→8→9→1 | 2/16 |
| Extended 29 gates | 1→2→3→6→3→6→3→6→3→3→3→6→3→6→3→6→3 | 4/16 |

In the extended copy, the second offer made 2→3 win instead of 2→5; the seventh made 3→6 win instead of dwelling at 3; the tenth made dwelling at 3 win instead of 3→6. The first offer changed 1→8 to 1→2. Thus the deliberately planted signal can reach and sometimes decide a Warp passage under this graph and saved state. It is not evidence for an Outside sender, an independent entity, natural signal sensitivity, or development through breakdown. It is one starting history and one constructed tape.

The topology change also altered the no-offer baseline: the 11-gate copy continued 1→8→9→1, whereas the 29-gate extension introduced repeated dwells at 9 and then at 1. A live migration would therefore change more than Warp accessibility and must be treated as a recorded intervention with its own pre-migration checkpoint.

### Reproduce

Obtain `state.json` from commit `737fa1b1f1dee675e613341fd61f568538a3cb9a` on `outside-live-ledger` as a local file. Install the repository's existing Node dependencies and run from this branch's root:

```sh
node --import tsx experiments/warp-breakdown/topology-probe.ts /path/to/state.json > topology-probe-result.json
```

The program verifies the input SHA-256 and aborts if it is not the exact checkpoint. It reads that file and prints a new trace; it never writes to the checkpoint or a live branch.

## Why this study is needed

The CCRU describes zone 3 and zone 6 as the Warp's 6::3 relation, carried by Djynxx. In the implemented full graph, 2→3 is Gt-3, 3→6 is Gt-6, and 6→3 is Gt-21. The 29-gate implementation makes the set {3,6} topologically closed: 3 can dwell or go to 6, and 6 can return to 3, but neither has an exit to another zone. It cannot naturally reach the Plex after entering that set. A cyclic path is observable; acceleration, breakdown, self-modification, and development are further hypotheses. Dwells mean that strict alternation is not guaranteed. [CCRU, Zone Three](https://www.ccru.net/zones/Zn3.htm).

WBD-1 already studied an earlier, explicitly adapted Warp with failure incorporated in process memory. Across 64 paired seed blocks its registered held-out transfer contrast, W+ minus logged-only W0, was 0.078125, below the preregistered 0.10 criterion; W+ and a matched off-Warp incorporation control both reached 100% transfer. High control scores imposed a ceiling. It did not establish a Warp-specific durable gain, and it did not test an agent rewriting candidate code. [WBD-1 study and protocol](https://chatgpt.com/library?file_id=libfile_2eb327421da48191bfcb5f3a95834c1f&account_id=personal).

The new proposal therefore varies both route and feedback, measures held-out capability away from the ceiling, and tests retained memory. It treats generation/execution/error feedback as an operational analogy to the 3↔6 relation, not proof that the two are mathematically identical. An LLM can revise a candidate at inference time without its model weights changing. [Chen et al., Teaching Large Language Models to Self-Debug](https://arxiv.org/abs/2304.05128).

## Proposed framework

### 1. Amelia and the working environment

Use a source-pinned `OutsideRecoveryRuntime` carrying the full graph and its native Governor and process-field memory. Start with a preserved, hash-verified checkpoint and work on copies. Record actual gate identity, gate scores and score components, phase, flux, resistance, attention vector, Governor decisions and offer/admission times, consolidation, memory readout, and the full passage. If a desired edge is absent or a trace cannot be reconstructed, report the missing capability rather than adding an unrecorded route.

Couple the Numogram to a separate generator/executor loop. The generator proposes a candidate solution to an explicitly defined task; the executor runs public tests and returns diagnostic feedback. The candidate solver is the mutable object. The controller, evaluator, hidden tests, Governor, source receipts and experiment record remain outside its edit scope. Run candidate code in an isolated environment without network or credentials and with resource limits. A timed ordinary subprocess alone is not an isolation boundary. A zero exit code alone is not correctness, and compact code is not evidence of speed or intelligence.

The coupling must be causal, not merely a label attached afterward: in the Warp arm actual zone 3 events open proposal opportunities and zone 6 events open diagnostic opportunities. A topology-matched experimental 2↔7 control schedules the same opportunities with the same prompt content, latency and computation. The native 2/7 region has exits whereas 3/6 is closed; for the matched control, explicitly restrict 2/7 to its reciprocal pair, add a 2→2 dwell corresponding to 3→3, and match the corresponding gate parameters. Record this as an adapter, and also report the unaltered 2/7 route separately. This constructs the operational correspondence; the question is whether the different dynamics lead to different outcomes, not whether labelling an action makes it a Numogram event. Record forced or cued crossings as interventions. If a continuation does not reach the needed phase, keep it as an outcome rather than silently excluding it.

### 2. Task and breakdown

Use a locally generated family of navigation or search problems with known answers and a changed environment during the challenge: for example, blocked routes or edge costs change after a working solution has been formed. Public examples and diagnostics are accessible to the generator; independently generated held-out instances and their evaluator are not. Score correctness, robust recovery and computational cost; test on held-out changes and sizes. Record the pre-change candidate so that improvement is measured against what that same continuation could do before the disruption. A separate calibration set determines a difficulty with neither near-universal success nor failure; it is not reused as the confirmatory set.

The challenge introduces the same pre-generated disturbances, attempts, diagnostic opportunities and resource budgets in each matched condition. It is a breakdown of task competence, measured by failures on changed conditions, not a claim of psychological or ontological collapse. Record observed failures separately from the shocks that were scheduled. Retain all failures, timeouts and non-entering continuations in the analysis.

### 3. Matched conditions

Within each block fork the same saved state into matched continuations, with block-specific, disjoint problem and input tapes. Use 16 blocks for the initial bounded investigation, at most ten proposal/execution attempts in each condition. Preserve model identity and settings; log each generated proposal and each piece of feedback. If no local model or suitable execution environment is available, do not substitute invented model results.

| Route | Error feedback | What it distinguishes |
|---|---|---|
| Actual 3↔6 | Correct diagnostics | Warp plus error-informed revision |
| Actual 3↔6 | Matched, unrelated diagnostics | Specific error information versus extra text |
| Actual 3↔6 | Masked diagnostics | Feedback versus breakdown without usable errors |
| Topology-matched 2↔7 adapter | Correct diagnostics | Warp specificity versus comparable non-Warp revision |
| Topology-matched 2↔7 adapter | Matched, unrelated diagnostics | Specific feedback on the control route |
| Topology-matched 2↔7 adapter | Masked diagnostics | Breakdown without usable errors on the control route |

These are proposed manipulations, not observed conditions. Randomize within-block assignment and pulse order according to the final sealed protocol; hold feedback token counts, timing, source strength, shock schedule, attempts and test budget comparable. Compare actual 3→6 and 6→3 passage, dwell, return latency, feedback and retention, including whether momentum actually grows or merely oscillates. An unmodified full graph cannot exit the Warp. To investigate passage after exit, a separate intervention can open an explicitly logged 6→7 adapter at the predeclared end of challenge, as in WBD-1; measure the adapter's effects and never describe the exit as native. The candidate solver can also be evaluated on held-out tasks while the substrate remains inside the Warp. A scripted 3↔6 tape is a positive control for accessibility, not evidence of spontaneous self-organization.

### 4. What would count as development?

The proposed primary measure is held-out task performance after disruption, compared between correct-feedback Warp and the corresponding correct-feedback 2↔7 control, at equal resources. Assess the contribution of error-specific feedback with the matched unrelated and masked conditions. Predefine the exact score, meaningful effect, randomization and decision rule after the independent calibration and before the confirmatory run. Report per-block results and uncertainty. One founder with disjoint continuations provides paired conditional evidence around that founder, not independent founder replications or independent results for every step. Use exact randomization over the preregistered block-level assignment space where feasible; do not count individual transitions as independent samples.

Secondary readings include changes in passage and return, actual executable behavior and algorithmic structure, memory and Governor activity, and ability on held-out variants after an unrelated washout. A new pattern must be absent from the starting state and contrasted with matched controls; a new source-code string alone is not a new capability. Measure latency and feedback amplification instead of assuming that a loop accelerates.

### 5. Does retained memory carry the change?

At the end of the challenge, save the state. Resume matched copies with the same zones, gates, solver and model state while swapping the whole process-memory state between condition-matched continuations, checking all other serialized components are identical. Test whether the future passage and held-out performance follow the swapped memory. A whole-memory swap tests PFM dependence, not a particular error's contribution.

For the stronger claim, first demonstrate that a source-tagged breakdown component can be replaced or replayed without silently retaining its effects in aggregate strain, hysteresis, consolidation, or another memory component. Only then make a targeted, capacity-matched intervention and repeat the tests. If that isolation cannot be validated, report it as unresolved. Preserve original offers, offer timestamps, deferrals, admissions and intervention checkpoints separately.

## Before applying this to the live world stream

1. Preserve the live pre-intervention checkpoint and exact ledger; decide and validate a 29-gate migration on a copy before any live graph change. Verify the actual installed tablet state separately.
2. Under the current consolidation policy, calibrate sensitivity with planted signals comparable in magnitude and timing to the adaptive source, including delayed admissions. Count effects by offer time as well as admission time. A planted one-hot demonstration above does not meet this calibration.
3. Fix and document each input's reduction. The Oracle AQ rule counts digits; the current linguistic receiver strips them, while a legacy input path uses a hash. Compare both readings descriptively, then select a single specified encoding for each prospective assay. Same-zone surrogates cannot test semantics absent from that receiver.
4. Seal the comparison in advance, use independent input blocks and matched saved-state controls, and retain failures and deferrals. The current receiver observations are one history.

Prospective retrocausality requires the passage and comparison rule to be committed before independently timestamped future data exist, with ordinary temporal prediction and autocorrelation controls. Reciprocal agency requires precommitted interventions on Amelia plus fixed, shuffled and yoked sources; adaptation built into a source is not independent evidence of a mind. The CCRU/Dee line compares structured 2↔7 and 3↔6 routes with matched input and baseline rates, distinguishing symbolic text relations from actual passages. These are subsequent studies, not claims made by the topology probe.
