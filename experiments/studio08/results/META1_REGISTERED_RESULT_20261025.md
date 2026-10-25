# Studio 08 META1 — Registered artificial-life experiment: completed results

**25 October 2026 · Experimental evidence record · Internal verification PASS · Not external accreditation**

## Scope and provenance

**Scientific question:** Does learning which of three fixed, internally generated memory cues to select improve the developmental survival of the coupled Amelia–house substrate compared with the same sensors on a non-learning schedule?

- Scientific parent: committed Studio 01–04 receiver–house model, inherited by the new META1 runner. This is not a reproduction of the Studio 07 chat experiment; Studio 07 remains reported historical evidence.
- Design: 32 fresh domain-separated synthetic worlds, intact/one-season `2→7` lesion, 3 arms (adaptive UCB; fixed round-robin; no extra memory cue); 7 × 5,000 transitions per arm.
- All arms within each world received the **same time-varying deterministic external runtime input**. Consequently this is not a closed-circuit or beacon-intelligence assay.
- Original experimental precommit: [META1_PRECOMMIT.md](../meta1/META1_PRECOMMIT.md), SHA256 `fcf19898e11d29588c4b688084c87c29a407fa0e6da3e289c2beb6f560004dc4`.
- Pre-outcome SHA256 launch seal: [META1_LAUNCH_SEAL.json](../meta1/META1_LAUNCH_SEAL.json), commit [`3e9b7b8ce43ca56498537b47cb1fafcfef70ed52`](https://github.com/adrianjohnsaker-wq/Amelia---Orange/commit/3e9b7b8ce43ca56498537b47cb1fafcfef70ed52); the seal pins the model, frozen sensors, learning selector, precommit, runner, trace validator and analysis bytes.
- Prior pilot: META1-P0 only, [QA run 40245629650](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/40245629650) PASS (three arms, byte-identical adaptive repeat, deliberately corrupted cue rejected). No registered-world data were used in QA.
- All scientific data generated and analyzed in [GitHub Actions run 40245752416](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/40245752416), ALL FIVE JOBS **SUCCESS** (four 8-world jobs + complete-data analysis).
- Four full raw-trace evidence artifacts: `meta1-science-shard-0` (ID 12618822163), `-1` (12618497810), `-2` (12618183910), `-3` (12618946599). These comprise checkpoints, 192 gzip JSONL transition traces, per-arm summaries and SHA256 manifest receipts. The artifacts have finite GitHub retention (90 days); reproduce and archive externally for permanent public-verifier custody.
- Registered analysis artifact: `meta1-scientific-analysis` (ID **12618742622**); uncompressed `META1_ANALYSIS_RESULT.json` SHA256 **`b008a972d33c17c9ac349011986d7b2c5e41729bf800525b5bd4427fe11d1f7e`**. The source evidence is the file in the artifact, not this narrative summary.
- Complete-data analysis independently rechecked all 192 trace digests, raw event chronology, paired source states and fixed source/input constraints before producing the primary result. **192 × 35,000 = 6,720,000 recorded transitions.**

## Registered primary result — intact, seven-season total deaths

Hypothesis fixed BEFORE the first registered world: adaptive memory-sensor selection yields fewer deaths than the same sensors on a fixed round-robin schedule. Prespecified method: one-sided exact paired sign test on 32 world-level differences, with no interim decisions and α=.05.

| Registered endpoint | Value |
|---|---:|
| Worlds favouring adaptive (fewer deaths) | **22** |
| Worlds favouring round-robin | **5** |
| Paired ties | **5** |
| Mean deaths, adaptive | **33.625** per world |
| Mean deaths, round-robin | **62.21875** per world |
| Mean adaptive advantage | **28.59375** deaths avoided per world versus round-robin |
| One-sided exact sign-test p | **0.0007568597793579102** |
| Prespecified α=.05 criterion | **PASS** |

World-level `round_robinDeaths − adaptiveDeaths` in the frozen world order:

`W00 47; W01 40; W02 22; W03 0; W04 78; W05 50; W06 −19; W07 49; W08 73; W09 55; W10 −29; W11 80; W12 90; W13 −1; W14 11; W15 80; W16 51; W17 44; W18 36; W19 −11; W20 29; W21 −20; W22 21; W23 0; W24 9; W25 14; W26 0; W27 43; W28 34; W29 0; W30 0; W31 39`.

The positive result is specifically **adaptive versus fixed non-learning sensor scheduling in these synthetic seeded worlds**, not a general superiority claim about all forms of memory, intelligence or autonomy.

## Descriptive controls and mechanism

The **no-extra-cue reference** is scientifically essential:

| Condition | Adaptive mean deaths | Round-robin mean deaths | No-extra-memory-cue mean deaths |
|---|---:|---:|---:|
| Intact (all 7 seasons) | 33.625 | 62.21875 | **33.375** |
| Lesioned (all 7 seasons) | 33.000 | 53.8125 | 39.250 |

Against the no-additional-cue reference in intact worlds, adaptive did better in **11**, worse in **16**, and tied in **5**; average adaptive saved deaths = **−0.25** (slightly worse). It would therefore be **incorrect to conclude that META1 improved Amelia beyond her unaugmented behaviour**, despite its positive prespecified comparison. The model's native input and transition dynamics remain effective without additional memory-sensor cues.

Lesioned condition (SECONDARY, exploratory description; no preregistered p-value): adaptive better than round-robin in **21** worlds, worse in **6**, tied in **5**, mean difference **20.8125** fewer deaths. Against no-extra-cue: adaptive better in **12**, worse in **15**, tied in **5**, mean **6.25** fewer deaths (heterogeneous, not a general advantage).

Last-season mean route diversity, intact: adaptive **7.1142**, round-robin **7.0701**, no-extra-cue **8.4245**. Lesioned: adaptive **6.3398**, round-robin **6.1804**, no-extra-cue **8.4193**. Thus adaptive does not dominate the uncued control on route diversity either.

**Mechanism: changed attention allocations.** Across intact-world receiver selections:

| Three fixed pre-choice sensors | Adaptive selection share | Round-robin selection share |
|---|---:|---:|
| Code drift (V) | **45.61%** | 23.67% |
| House surface+deep flux | 36.00% | 43.39% |
| House surface decline | 18.39% | 32.94% |

These shifts align with the adaptive gate's use of delayed rewards. This is behavioural evidence of **learned selection among three engineer-supplied sensors**. It is not evidence the system invented receptors or that the externally supplied signals possessed intelligence. Selection shares alone do not establish that individual choices were counterfactually turned; trajectories need matched choice-point replay for that claim.

## Scientific interpretation and limitations

**Supported:** A fixed adaptive receiver using reward-conditioned, memory-derived sensor selection reduced deaths relative to an otherwise matched fixed-schedule receiver in the sealed 32-world test. The implementation actually exhibited changed sensor-selection distribution and the preregistered sign test passed.

**Not supported:** The stronger assertion that the adaptive receiver improved outcomes relative to the no-extra-cue Amelia baseline; this control was essentially as safe on deaths and higher on last-season route diversity. The result suggests adaptive filtering may protect the system from injurious indiscriminate extra cues, without proving that those cues improve its natural dynamics.

**Untested:** spontaneous evolutionary development of new sensory transforms, de novo organism–house territory genesis, source-free autonomous intelligence, regenerative competence equivalent to Studio 07, or agency/intelligence in drand or any philosophical Outside.

**Inference boundary:** The exact sign-test p is conditional on the registered 32 synthetic seed-worlds, the fixed pairwise sign null and chosen model; these are not 32 independent field organisms. Source and evidence underwent reproducible internal CI checking; no independent external authority has formally certified an AI result, and a clean-checkout replication by a second investigator remains valuable.

**Data custody:** GitHub Actions artifacts are time-limited. Keep this committed digest/index and archive/download the original raw blobs before their retention expires. Never delete or suppress the negative world-level comparisons.

## Conclusion

META1 supplies a real, positive and bounded test of **meta-level selection among pre-existing internal memory readouts**. Against fixed indiscriminate sensor use, learning which signal to attend to mattered for survival. But the no-additional-cue reference establishes the limit: in this model, *learning to choose an internal cue* has not yet surpassed *knowing when no extra cue is necessary*. That distinction is the next theoretical question, not grounds for retrospective alteration of META1.
