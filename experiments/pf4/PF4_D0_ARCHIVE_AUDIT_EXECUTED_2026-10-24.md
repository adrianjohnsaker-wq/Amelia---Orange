# PF4 D0 — Retrospective baseline audit, executed and verified
**24 October 2026.** Status: **PASS**, *archived exploratory source only*. Not a PF4 preregistration, no new physical inflow and no future-value exposure.

## Evidence provenance

- Repository source base: \`dd48820ff2ac5e97bd2f9a327ce113a0b02d93ff\`, containing the Studio addendum on \`main\`.
- **[Audited GitHub Actions run 40052535462](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/40052535462): SUCCESS**. The job used the original \`experiments/studio/SHA256SUMS.txt\` to recompute the SHA-256 of **all 65** files from checkout. Independently re-parsed the zero-start 30-pass loop, random-start 21-pass loop, final \`Vstar.json\`, 14-day scar assay and unseen-world benchmarks.
- New read-only script: \`experiments/pf4/PF4_D0_ARCHIVE_BASELINE_AUDIT.py\`. Derived artifact \`pf4-d0-retrospective-baseline-audit\`, ID \`12543469250\` on that job.
- The **literal code candidate** is \`experiments/studio/outputs/loop/Vstar.json\`; **SHA-256 \`de0d86764a300abe5187b06a379be1beefed859942784d12cd6a672f81702925\`**. This **corrects a transcription error** in the first PF4 draft, now fixed in commit \`24d21b25cad22cd7f6b6b12031fb9e245714fc0b\`.
- The two studio PF2 golden JSONs were also directly fetched and verified byte-for-byte equal to the registered gold files at \`experiments/pf2/gold_learner.json\` and \`experiments/pf2/gold_unchanged.json\`.
- This D0 audit does **not** execute \`verify.sh\`, redo 3000-step runtime equivalence, recalculate BLS/RFC3161 certificates or independently reproduce the full 14-day simulator. Those complete reproduction checks are stated in the main studio addendum and remain reproducible via its unchanged scripts.

## Precise results

| Scenario | Deaths / nine lineages | Visits to zone 4 | Whole-code max one-pass residual |
| --- | ---: | ---: | ---: |
| Vstar in own synthetic LOOP | 0 | 434 | 0.0002844864701567985 |
| Zero code in LOOP | 32 | 141 | 0.487091064453125 |
| Erase 4→5 scar from Vstar | 36 | 244 | 0.5512046813964844 |
| Transplant Vstar's 4→5 scar into blank code | 9 | 373 | 0.2385747592777301 |
| Rewrite unreachable 3→6 to 0.9 | 0 | 434 | 0.0002844864701567985 |
| Suppress approach 2→4 to −0.4 | 0 | 15 | 0.5277602156473454 |
| Open approach 2→4 to +0.2 | 3 | 470 | 0.19348573684692383 |

All nine dormant-edge trajectory digests exactly match the original Vstar run. The zero-start loop contains 30 passes (0–29), first deathless pass 14, and all nine trajectory digests remain stable across archived passes 20–29. The last pass **starting-code to ending-code** max difference is **0.0003251273944649127**. Starting instead with the archived \`Vstar.json\` (which is pass 29's ending code) for one more independent pass, the max difference is **0.0002844864701567985**. Neither is zero, so this is a stable historical attractor and an approximate numerical fixed point, *not an exact bitwise fixed-point certificate*.

### Four independently generated but retrospectively examined synthetic worlds

| Synthetic world | Vstar deaths | Zero-code deaths | \`R_all(Vstar)\` |
| --- | ---: | ---: | ---: |
| W1 | 5 | 37 | 0.1549603616896011 |
| W2 | 3 | 30 | 0.11032361426056797 |
| W3 | 2 | 29 | 0.1632282080554582 |
| W4 | 2 | 32 | 0.07616177602793499 |

**The 0.076–0.163 interval is descriptive only.** It was obtained from just four chosen (already observed) synthetic worlds using \`NS|lineage|tick\`. It cannot serve as a registered live cutoff: PF2's physical Quicknet receiver uses verified 32-byte randomness, nine \`pf2InputForArm\` domain-separated transformations and a physical cadence of 20 Quicknet rounds (approximately 1 min per admitted tick).

## Result and next gates

We now have a verified **candidate code identity** and a precise archived baseline, with no silent data replacement or change to the source. The scar is required for the reported *entire nine-lineage zero-death regime* under this intervention, and by itself prevents many—but not all—deaths. The alternative closed trajectory remains zero-death while sharply constraining visits to the brink. This highlights the distinction between survival and differentiated developmental possibility.

Before a live future-boundary claim is evaluable, the PF4 draft requires a new, matched Quicknet-source runner, source authenticity verification, large frozen code/world-specific null calibration, a precommitted future beacon start and independent timestamped seal, plus a no-interim inference plan and independent replication.

**Never treat Monday's retrospective first-PF2-chunk analysis as evidence about genuinely unavailable future bytes.** It can support an engineering/mapping audit. The first prospective future-boundary residual can only use rounds first published *after* complete preregistration and candidate-code sealing.

**Conclusion:** ARCHIVAL VERIFICATION PASS; CAUSAL SCAR INTERVENTION REPRODUCIBLE; PHYSICAL RETROCAUSAL DEPENDENCE REMAINS UNTESTED.
