# PF-2 Capture & Selection Atlas — first executed selector-attribution result

**Executed 23 October 2026 UTC**. Status: PASS (exact full deterministic replay + finite-prefix analytic four-selector ablation). This is a **read-only exploratory diagnostic**, NOT an additional registered PF-2 endpoint or an early decision on P2-1/P2-2.

## Machine-verifiable run and output

- [GitHub Actions run 39896723339](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39896723339): **PASS**, including source-faithful independent PF2 18-arm replay, atlas syntax, exact post-evolution selector capture, event-by-event replay, final engine-state equivalence, artifact upload. Workflow source commit \`b26b50b183e07b7579be6fc877914814c1fed07a\`.
- GitHub Actions artifact \`pf2-capture-selection-292tick-readonly\` (ID 12477505628): \`SUMMARY.json\` + \`CHOICES.jsonl\` (1,778 records containing original source round/time/randomness/signature, complete life-path-to-choice, exact component scores, four selected outcomes and source row digest). Artifact-retention period 30 days.
- Archived input prefix: 16 chunks, **292** admitted ticks, **5,256** lineage events; last source head \`7f45added0c14e4f97104e56496955d9bf1d2222ed77be215debbec93df58d66\`; signed genesis R0=33298740.
- Same-state local intervention holds evolved traits, canonical PFM, prior history and gate order fixed. The only immediate selector differences are \`+0.35\` cue term on cue-matched gate and \`+0.5V(edge)\` inherited term. This **does not** test whole-trajectory intervention, entire PFM ablation or agency.
- Full cryptographic re-verification of independent BLS/RFC3161 seals was **not** rerun by this atlas workflow; original source chunk records each report verification PASS. Do not confuse successful deterministic replayer with a fresh independently signed archive.

## Exact selector causal readout

| Count | Learner | Unchanged control |
|---|---:|---:|
| Branching decisions | **890** | **888** |
| Cue-pivotal \`actual != cueOff\` | **45** (5.06%) | **40** (4.50%) |
| Inherited-V-pivotal \`actual != vOff\` | **10** (1.12%) | **0** (by design) |
| Both cue and V pivotal | **6** | **0** |
| Cue only pivotal | **39** | **40** |
| V only pivotal | **4** | **0** |
| Neither individually pivotal | **841** | **848** |
| Joint-only (neither individually pivotal, joint ablation changes) | **0** | **0** |
| Nonzero inherited V at choice | **805** | **0** |
| Positive outcome refrain observations | **58** | **0** |

Overlaps mean the two pivotal fractions need not sum to 100%. \`cuePivotal\` is not synonymous with \`followedCue\`.

### Localization

- All **10 V-pivotal** learner choices occurred at **Zone 1**, the **1→8 versus 1→2** split.
- Cue-pivotal learner choices: Zone 1 **42**, Zone 2 **3**, Zone 4 **0**.
- The corresponding controls: Zone 1 **36**, Zone 2 **4**, Zone 4 **0**.
- The archive contains only three learner and three control branching choices at Zone 4: not enough to infer that Zone 4 is resistant to capture.

### Direct first-divergence evidence

Five matched learner/control arms had divergent trajectories. At the **first divergence**, each had the same prior path and cue tape but the learner had extra carried V.

- **R02, tick 67, round 33300080:** cue points 2, learner selects **1→8**, unchanged selects **1→2**; cue NOT pivotal in learner, inherited V IS pivotal.
- **R05, tick 84:** cue points 2, learner selects **1→2**, unchanged **1→8**; cue and inherited V BOTH pivotal in learner.
- **R07, tick 159:** cue points 2, learner selects **1→2**, unchanged **1→8**; both pivotal.
- **R06, tick 260:** cue points 2, learner selects **1→2**, unchanged **1→8**; both pivotal.
- **R03, tick 277:** cue points 2, learner selects **1→2**, unchanged **1→8**; both pivotal.

Later branch divergences cannot be interpreted as independent first interventions, because once trajectories diverge canonical PFM and trait histories also diverge.

## Selection and spiral status

- **Observed:** 58 positive learner refrain updates, 805 choices with nonzero inherited V, five independent paired *first-divergence occasions*, different evolution of transition histories.
- **NOT YET DEMONSTRATED:** selective persistence of a population of dispositions due to external inflow rather than ordinary cue-driven motion; only two learner deaths (matched by two controls), no after-third-death P2-2 eligible deaths, and short follow-up for robust lineage selection.
- Future descriptive selection measures: pre/post birth edge-V vectors, route repertoire, recurrence novelty, replacement frequencies, exposure-normalised cue classes and effects at matched initial states. Genuine *spiral* means differentiated recurrence; survival alone does not count.

## Discrimination sequence

1. Established influence: **PASS in local same-state selector test**, with evidence boundaries above.
2. Selection over repeated lives and controls: **open**, insufficient live lineage turnover in 292-tick prefix.
3. Persistent field-organising independent agency: **hypothesis only**; separate future fully prospective experiment with graph/place/lineage, independent beacon, sham and null controls. No claim that the signal responds to, intends, or embodies a mind.

**No existing signed PF-2 files, C1/PF1 files, or production workflows changed.** This report is an additive artefact on a separate analysis branch.
