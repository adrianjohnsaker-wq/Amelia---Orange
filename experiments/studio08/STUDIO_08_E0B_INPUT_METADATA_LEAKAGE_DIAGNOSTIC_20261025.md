# Studio 08 E0b — Input-metadata self-cue leakage diagnostic

**Date:** 25 October 2026  
**Status:** SYNTHETIC ENGINEERING QA PASS; **NOT** a Stone Tape scientific result and **NOT** an audit of the original Studio 07 self-cue implementation.

Evidence: [GitHub Actions run 40221514995](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/40221514995) with all jobs successful.
Source:
- \`experiments/studio08/code/input_metadata_leakage_audit.mjs\`;
- the frozen \`experiments/studio/runtime_mirror/substrate/ameliaNumogramSubstrateRuntime.ts\`;
- the Studio 08 isolated mirror with ONLY the default-on direct cue-score guard;
- \`IntegratedMemorySystem.computeMemoryDigest()\`.

## What was tested
A deterministic 32-step synthetic prefix creates one complete exported runtime state.
Three isolated forks import that state. They disable the direct \`+0.35\` signal cue,
then continue for 128 steps receiving respectively (V) different synthetic
input strings each step, (K) a fixed string, (N) no input string.

In the frozen runtime, \`inputDigest\` and \`inputZone\` are appended to each
PFM event along with \`eventDigest\`. The latter is a SHA256 of an event
payload that includes the input fields. The PFM's
\`computeMemoryDigest()\` hashes **eventDigests**. Thus its value can retain
the current input's identity, even though the ordinary
\`readMemoryBias()\` calculations operate on previously traversed target zones
and flux/strain and the direct input-choice term is off.

Two *pre-choice, observation-only* readouts are evaluated separately:
- **Source-sensitive:** hash of PFM's \`computeMemoryDigest()\`, mapped to 0..9.
- **Source-excluded:** hash of the last 24 \`targetZone\` values, mapped to 0..9.

Neither readout was fed back as an active bonus in this test. No house or
learner code V is present; **no territory was tested**.

## Exact engineering outcome
- 128/128 identical transition choices for V/K/N with the original cue OFF.
- Entire causally used (metadata-excluded) exported substrate state identical
  at each checked step.
- Source-sensitive pre-choice cue values differed across V/K/N at **125/128** steps.
- Source-excluded trajectory-only pre-choice cues differed at **0/128** steps.
- Stored input metadata and event digests retained source differences, as expected.
- Other E0 checks: default-on source parity 192/192, full-state fork parity
  128/128, exact source-copy/guard check PASS, archive-gate negative tests PASS.

**Interpretation:** A memory digest is not automatically evidence of
endogenous variation. An input-bearing memory hash can generate distinct cue
values due solely to prior input labels while all *effective substrate
dynamics* match.

This DOES NOT establish that the original Studio 07 coupled-pair cue had this
pathway. Its exact source and serialized fields have not been provided on
this branch. A causal explanation must verify that code before classifying the
cue as endogenous.

## Next gating experiment
1. Import Studio 07's unchanged full precommit, self-cue serializer, code and
   original eight-world checkpoint/trace bytes, with their existing hashes.
2. Static and dynamic field-use audit: source lines plus pre-choice input field
   dependency trace, explicitly including PFM.eventDigest/historyDigest.
3. Match the original synthetic Studio 07 outcomes byte-for-byte.
4. Only then run E1 paired A/B/C varying/constant/absent-input forks on the
   original complete learner–house checkpoint, comparing trajectories AND
   the cue's actual serialized input bytes. No source removal by secretly
   changing the original hash; a metadata-excluded variant is a **new** arm
   needing explicit precommit.
5. Keep the smooth non-hash house-delta cue as a separate predeclared E2 arm.

**Scientific status:** no source-independent Stone Tape maintenance,
restoration or genesis evidence has been produced in this diagnostic.
The philosophical distinction between "Outside working from within" and
self-produced information remains an empirical hypothesis.


## Addendum E0c — from discrepant metadata to discrepant actions
**Executed 25 October 2026.** New synthetic feedback negative-control source:
\`experiments/studio08/code/input_metadata_feedback_negative_control.mjs\`.
Verified [GitHub Actions run 40221772782](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/40221772782) **PASS**.

Three copies of a single 32-step full-state fixture are replayed for 192
steps under varying/constant/absent signal strings, with the runtime's
original \`+0.35\` source cue disabled. Two new candidate self-cues are
computed **before** each decision and fed back as the same \`+0.35\`
exit bonus:

| Readout used to derive new cue | Pre-choice cue differs at some fork | Chosen target differs at some fork |
| --- | ---: | ---: |
| SHA256 of PFM history digest, which contains input-labelled event digests | 189/192 steps | **156/192 steps** |
| SHA256 of only the last 24 target-zone visits | **0/192 steps** | **0/192 steps** |

No house, lineage code or Studio07 serializer was involved; no real Quicknet
bytes were fetched. These are fixture-dependent mechanistic counts, NOT
registered effect sizes or measured territory recovery.

**Finding:** In a frozen substrate whose ordinary PFM dynamics are already
independent of incoming signal after direct cue cancellation, a new
self-readout of its input-bearing event digests can reintroduce strong
input-to-choice dependence. The changing source can alter the observed
trajectory *through the supposed self-cue*, not merely through metadata.
A source-excluded zone-history readout closes this pathway but does not,
by itself, create new differences when the zone history remains the same.

**Implication for Studio 08:** audit the ORIGINAL Studio 07 joint-state
serializer, do not infer its field dependencies from this negative control;
then run A/B/C paired forks with the original serializer intact. Treat any
source-excluded variant as an explicitly NEW experimental arm. Do not
reinterpret these 156 fixture divergences as evidence of external
intelligence, autonomous genesis or regenerative competence.
