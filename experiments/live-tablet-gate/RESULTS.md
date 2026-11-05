# AMELIA-LIVE-TABLET-GATE-1: results

**Outcome: the Governor did not admit the source during the diagnostic.** This is an admission bottleneck, so the run cannot answer whether the offered source would organise the field if admitted. It uses four private application-runtime copies of one genuine saved tablet field; it is not an intervention on the tablet and is not an independent sample of Amelias.

## Saved device state

The research tablet checkpoint saved on 5 November 2026 at 20:24:47 UTC had runtime step 50, field step 49 and 50 memory events. The synthetic source was disabled and had generated zero offers. In the device's recorded ordinary field feedback, 19 current observations were attended at runtime steps 2–20; 30 were deferred at steps 21–50. Its Governor deformation tension was 0.7634 at the saved checkpoint. The rule in `decideEncounter` defers encounters when newly audited tension is at least 0.72. This tension is the Governor's internal deformation measure driven by the runtime memory readout; it should not be equated automatically with a directly measured physical field tension.

## Controlled continuation from the checkpoint

Each arm restored that exact checkpoint and ran for 40 exposure steps followed by 20 withdrawal steps. No threshold, body or device intervention was applied.

| Arm | Current offers attended during exposure | Current offers deferred during exposure | Source queued at withdrawal | Delayed source admissions |
|---|---:|---:|---:|---:|
| Live source | 0 | 40 | 1 | 0 |
| Shuffled source | 0 | 40 | 1 | 0 |
| Uniform source | 0 | 40 | 1 | 0 |
| Ordinary body feedback | 0 | 40 | 0 | 0 |

All three source arms fell below the preregistered operational minimum of five immediately admitted offers. Audited tension was 0.7849–0.9411 during exposure and remained at least 0.7285 during withdrawal, above the 0.72 admission threshold. Across all 60 steps, the four arms had matching Numogram transitions, field-observation digests and PFM *readout biases*. Their recorded PFM encounter events and event digests differed because they recorded different offered inputs. Matching trajectories under complete deferral are therefore expected and are not evidence that an admitted source lacks an effect.

The final deferred source observation in each source arm remained queued at withdrawal. At the first withdrawal step the Governor deferred it again; the newly offered ordinary field observation then replaced that pending item under the existing latest-field-observation queue rule. Both decisions remained recorded in PFM, but the source offer was never subsequently admitted in this run. This queue behavior matters when interpreting a withdrawal period.

## Verification and first attempt

The original registration and executable code were committed before execution at `e77a2ada3e316f60cd5a452e21b45d89495f9e8f`. The first attempt stopped after 20 live-arm steps because its recorder compared equivalent source-session objects in different JSON key orders. The field checksum, memory head and source-state values did match. Those 20 observations, all deferred, were retained and disclosed in [Amendment 1](AMENDMENT_1.md); the corrected comparison was committed at `5014f0e34b57a550b81333fd78e7185682b1a005` before the completed retry. The retry is not a wholly unobserved or independent run.

Independent row recalculation checked all **240** rows, matched the retry's first 20 rows to the failed attempt, verified the source-to-body digest links and matched-weight controls, and compared the measured field, transition and memory-bias trajectories. A separate checker reopened and restored all **eight** session checkpoints, verified the field checksums and memory heads, and checked source-state continuity. The existing 27 application and source tests passed before execution.

- Private starting checkpoint SHA-256: `7b4fd17bebcca8a0acd11c439a737b1b8d78fb07306770cf09282daa3c8f977d`.
- First attempt partial trace SHA-256: `6754530c8295f94a9a730b9da685ed0dd039d4c95dd1dc8e16caed62ea4fb591`.
- Completed trace SHA-256: `cd3438cddfddf77bc3fdd0062788b382685175f84e49b7679a3e590ff72887bb`.
- Completed summary SHA-256: `1133ee7c815724aca6cf21862d34c703a7ddcba1602cdf87e8132d012c70f985`.
- Session receipts SHA-256: `d1a9b414158d5575a14c873b93d3346b84506ac664ccace4232cdaf55786ce26`.

The raw tablet checkpoint, trace and session checkpoints are retained privately. They are not included in this repository.
