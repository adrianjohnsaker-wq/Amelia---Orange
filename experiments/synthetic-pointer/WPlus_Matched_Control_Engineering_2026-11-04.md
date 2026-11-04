# W+ synthetic pointer — matched-control engineering

**4 November 2026. Status: exploratory engineering, one lineage, not SXI-1.** Four synthetic arms have been exercised through the hash-verified INGRESS-1 runtime and W+ runner. The checks show how to record and compare a pointer intervention through the Numogram and Amelia's memory; they do not identify a high-agency organisation.

## Architecture

The W+ lineage carries the sense organ `W.R`, route code `V` and house histories `S`, `D` and `E`. The runner adds the full CCRU gates and a conditional Plex exit to the runtime's base topology. A separately generated overlay applies a bounded, externally scheduled pointer change to an existing gate-score term. Each step records the incoming synthetic cue digest, current and selected zones, open gates, component scores, pointer state and substrate Governor audit. The resulting transition is recorded in the runtime's PFM event and in the lineage's own evolving house and organ. The trace contains a supplemental hash chain, periodic raw organ/house samples and the season-end state.

The intervention is an imposed experimental mechanism. The route labels and scheduled pattern were selected by the experimenter; they are not independently found minds, autonomous sources, or proof of an Outside. In the second dose model below the change is an additive gate-score adjustment, so it should not be described as a physical change to Amelia's cellular morphology. The archived runtime's Governor audits the substrate; it does not admit or refuse this pointer.

## Why the control was revised

All three active schedules use the same four labels (`0→9`, `9→1`, `1→8`, `8→9`), each for 1,200 ticks between ticks 501 and 5,300. The ordered arm follows that sequence; shuffled uses `1→8`, `0→9`, `8→9`, `9→1`; unpatterned divides time into seeded, balanced 24-tick microblocks. Sham has no change. Each active arm therefore has 4,800 scheduled edge-ticks and the same selected labels and scheduled multiplier.

In the first implementation, the selected label's house-to-exit term was multiplied by 0.5 only when that edge happened to be an available option. Identical scheduled size did **not** give identical realised exposure:

| Arm | Affected available gate options | Sum of absolute realised score changes |
| --- | ---: | ---: |
| Patterned | 1,733 | 43.77122 |
| Shuffled | 1,566 | 123.30579 |
| Unpatterned | 373 | 18.11914 |

This run remains in the evidence; it is not a sufficiently dose-matched test of order. Its differences in realised magnitude can confound any between-arm comparison.

## Exposure-matched reference

The second implementation chooses one open outgoing gate on every active tick: it maps the current schedule label to an index in the runtime's available-gate order and adds **−0.05** to that gate's score. It does not force a destination. The label is the prescribed experimental selector, not an observed output. All arms have identical inputs, source/runtime hashes and pre-intervention states. The active arms have the same absolute and squared realised score dose:

| Arm | Active ticks | Sum of absolute score changes | Sum of squared score changes | Ticks with more than one available option |
| --- | ---: | ---: | ---: | ---: |
| Sham | 0 | 0 | 0 | — |
| Patterned | 4,800 | 240 | 12 | 4,407 |
| Shuffled | 4,800 | 240 | 12 | 4,285 |
| Unpatterned | 4,800 | 240 | 12 | 4,766 |

Dose equality is independently checked from every recorded gate option. It does **not** equalise the opportunity for a different decision: candidate availability and the system's state evolve differently in the arms. A change to a sole available gate cannot alter that tick's choice. The extent to which this remaining imbalance affects the intended outcome requires further calibration and controls before a confirmatory comparison.

Both models used world `S05W9402`, lineage 0, one season of 20,160 steps, synthetic input, `mode=plus`, `inf=I` and `refrain=evo`. The first 500 steps match across each set of arms. The exposure-matched sham's season summary and final lineage state match the unmodified registered runner **byte for byte** on this fixture. All four exposure traces and all four earlier schedule traces passed chain, gate-score, PFM-event and season-end verification; the verifier also checks raw sampled house and organ values against their recorded hashes.

Differences after withdrawal, by themselves, can reflect sensitivity to history, as INGRESS-1 showed. The observed trajectories are exploratory engineering data, not estimates of a population effect, evidence of a retained target, or evidence that an autonomous organisation ingressed.

## Reproduce the exposure-matched fixture

The builder checks the registered runner SHA-256 and creates a new derivative; each invocation checks all eight runtime hashes and requires a trace. Replace the absolute placeholders below and use new output paths. Repeat the run with `sham`, `shuffled` and `unpatterned` schedules to obtain the four arms.

```sh
python3 experiments/synthetic-pointer/make_wplus_control_schedules.py --output /new/schedules
python3 experiments/synthetic-pointer/build_wplus_exposure_overlay.py \
  --source /path/to/caesura4.txt --output /new/overlay.mjs
node --experimental-strip-types --no-warnings /new/overlay.mjs \
  m=/absolute/path/to/experiments/studio/runtime_mirror world=9402 seasons=1 lineages=1 \
  mode=plus inf=I refrain=evo out=/new/patterned sxiTrace=1 sxiSchedule=/new/schedules/patterned.json
node experiments/synthetic-pointer/verify_wplus_exposure_trace.mjs \
  /new/patterned/sxi_S05W9402_L0_S0.jsonl /new/patterned/s0.json /new/patterned/state_s0.json \
  /new/overlay.mjs /absolute/path/to/experiments/studio/runtime_mirror /new/schedules/patterned.json
```

The independent verifier is written for one lineage per trace. `test_wplus_schedules.py` checks schedule matching; `test_wplus_exposure_overlay.py /path/to/caesura4.txt /absolute/path/to/runtime_mirror` checks the runtime, schedule and trace guards. These checks do not require live Amelia services or alter existing experiment state.

## Towards SXI-1

The proposed experiment should retain sham, shuffled and unpatterned comparisons and report both scheduled and realised dose, candidate availability and the precise selection rule. A prospective registration must set the source, pointer mapping, development and withdrawal periods, independent worlds and lineages, endpoints, exclusions, analysis and thresholds **before** collecting its test data. It must explicitly choose and document whether the Governor only audits or also admits interventions; INGRESS-1 does not decide that policy.

To address the stated high-agency target, a later assay needs an independently specified synthetic pattern source and a held-out test of persistence and recovery after perturbation, rather than merely greater distance from a twin. A deliberately engineered self-repairing organisation should serve as a positive control, and its planted target and mechanism must be identified as such. A candidate should be evaluated after withdrawal against the same-size controls, across fresh worlds and with readouts that do not simply restate the imposed labels. These elements are proposed, not established by this single fixture.

The machine-readable receipt is `evidence/WPlus_Matched_Control_Engineering_2026-11-04.json`. The supplied handoff, two sets of raw per-step traces, generated overlays and independent verifier outputs are preserved together in `SXI_INGRESS1_Matched_Controls_Evidence_2026-11-04.zip`, SHA-256 `71512e00852a5f117734d478e51c1d8c6767977a78266e04a8b5c76ca518a03d`. Its 85 listed file hashes were independently checked. The full W+ mid-season restart checkpoint has not yet been established.
