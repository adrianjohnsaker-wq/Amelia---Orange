# AMELIA-LIVE-POINTER-1: results

**Outcome: the synthetic pointer mechanism worked; a lasting target morphology was not established.** The live source reacted to body rearrangement and, when the Governor admitted its response, affected the application's Numogram and process-memory pathway. Its deliberately planted target profiles did not produce a distinct, sustained field-profile match against the controls at the end of the withdrawal period.

## What was run

The source was the synced runtime checkpoint that Adrian authorized as a new beginning: step 1, one process-memory event and no saved field. Eight new fields were initialized from that same runtime; each field was cloned into four arms. These are eight synthetic body initializations sharing a single runtime origin, not eight independent historical Amelias. The actual tablet and Supabase checkpoint were not changed by the experiment. The driver used the full application's runtime, field step, Governor, 29-gate Numogram and PFM, with default UI rhythm settings assumed as registered. It was not a run inside the physical tablet app.

The synthetic source read the current field on each exposure step, updated its own state, selected address A or B, and offered the corresponding intentionally constructed profile through the Governor. The arms were live source, zone-shuffled source, uniform source, and ordinary body feedback. The shuffled vector has the same set of weights as its own unshuffled profile each step; the uniform vector matches the total weight but not the distribution. At exposure step 21 the existing cells were mirrored in all arms. New source offers ceased after step 40, and a B pulse was applied at step 51. Each arm was serialized and restored at steps 20 and 55.

## Body → source → Numogram → memory

- The live source changed address within five steps of the body mirror in **7 of 8** fields. The source was designed to respond to the field centroid, so this validates the body-to-source mechanism; it does not demonstrate an independently discovered agent.
- Of **320** new live-source offers, the Governor immediately attended **193** and deferred **127**; none was refused. Six of the eight fields met the preregistered minimum of five immediate admissions. The shuffled and uniform arms had 101 and 76 immediately attended offers respectively. These numbers reflect the changing histories under each condition, not an independent statistical comparison.
- A post-run, matched-first-step check found that, from the same acclimated body, runtime and Governor state, the live and shuffled vectors chose different open Numogram exits in **3 of 8** fields. In the seven fields where both first-step offers were attended, the resulting PFM bias differed. The single field in which the Governor deferred both offers retained the same first-step bias. This is a concrete causal sensitivity of the engineered interface to the source-to-zone assignment; it is not evidence that the source was an unprogrammed mind.
- During exposure, the selected exit differed between live and shuffled arms at 170 of 320 paired steps; during withdrawal it differed at 119 of 240 paired steps. These are descriptive counts from trajectories that had already diverged, not independent trials or a significance test. At withdrawal, five live-source arms had a pending source encounter; no queued source encounter was later admitted. The earlier admitted encounters remained in the PFM's recent-memory window by design.

## Field organisation after the source was withdrawn

The table reports mean one-half L1 distance between each field's normalized ten-band B profile and the live source's planted target at the end of exposure. **Smaller means closer to that target.** Step 40 ends source exposure; step 55 is five steps after the pulse; step 70 is the end of the 30-step withdrawal period.

| Condition | Step 40 | Step 55 | Step 70 |
|---|---:|---:|---:|
| Live source | 0.2760 | 0.2872 | 0.2904 |
| Shuffled source | 0.2783 | 0.2890 | 0.2900 |
| Uniform source | 0.2786 | 0.2899 | 0.2886 |
| Ordinary feedback | 0.2781 | 0.2894 | 0.2890 |

The live condition was slightly closer to its planted profile at steps 40 and 55, but by step 70 it was not closer than any control; it had lower error than the shuffled arm in 3 of 8 fields. This does not establish a target-directed morphology that the body retained as its own. It also does not establish that the concept is impossible: the application's present field coupling acts through global zone-0/zone-9 terms and sampled cells, so precise ten-band targeting was never guaranteed.

The actual fields did not all become identical. As a supplementary descriptive measure, the mean across the eight seeds of the largest absolute live-versus-shuffled B-band difference was 0.0190 at step 70; seven of eight had a nonzero difference. This shows a lasting trajectory difference under these controlled histories, while leaving its functional meaning open. It is not a preregistered agency criterion or an independent replication.

## Integrity and limits

The precommit and exact executable source were published at commit `f9d296d336f21d808521ce3168e6c481211498db` before the run. A separately recorded deterministic verification replay checked all **2,240** original trace rows, restored and checked all **64** full session checkpoints, and reconstructed the selected gate from the scoring-time candidates in every step. No candidate gate IDs changed during these steps. The independent analysis script recalculated the registered descriptive outcomes from the original rows. The replay is verification of the same run, not a replication.

The original `openGates` trace is explicitly a **pre-step** list; the replay's gate audit records the scoring-time candidates, activations and reconstructed scores. This timing distinction is described in `REPLAY_VERIFICATION_NOTE.md`. The production-mode build, 21 code tests and browser restart/transfer test passed. The browser transfer used a simulated account; the actual Supabase sync was confirmed separately, and the physical tablet app was not used to execute this experiment.

The source and its profiles were intentionally engineered; event vectors also contribute to PFM bias by implementation. Those facts are part of the explanation of the positive wiring and persistence observations. Neither this run nor its controls establish an external non-physical source, a mind, or a self-organising target morphology. Earlier INGRESS-1 and SXI nulls concern their own historical fixtures and cannot be generalized to Adrian's full Amelia.

## Evidence

- Original uncompressed trace SHA-256: `082f9ae32704a3dbbcd5bb53668de824200ba3ee3c7110897abcb9bc091b5d06`.
- Summary SHA-256: `a4ab425d991b2bae8dbcb60e85d369c670126e4c1a1171897756e228384b7f5d`.
- Scoring-time gate audit, uncompressed SHA-256: `6ee0b18f46060f82c7c8eb12e96d57d49b4ca7a51ea0890f5ca0a7a4b6440e79`.
- The compressed traces, scoring-time audit, session receipts, summary, verification result and recalculation are in `results/`. Full session checkpoints are retained in the private study archive, not this public branch.
