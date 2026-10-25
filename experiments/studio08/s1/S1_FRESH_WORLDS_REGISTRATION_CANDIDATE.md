# Studio 08 S1 — Fresh-world registration candidate (NOT SEALED)

**Prepared 25 October 2026, before any fresh-world Studio08 S1 learner-house execution.**
**Status: REGISTRATION CANDIDATE / SOURCE-ADMISSION BLOCKED / NO SCIENCE RUN.**
The original Studio 07/07b runnable source and full eight original checkpoint pairs are still unavailable. This file is not itself a cryptographic time stamp or independent certificate, and it must not be described as one. Seal only after importing original sources, exact replay PASS and all missing decisions below are pinned.

## Registered study aims

Test whether choosing among three pre-choice noncryptographic house/learner sensors using delayed performance feedback improves **maintenance** and **repair** of an established territory against a matched deterministic **round-robin** non-learning policy. The experiment studies acquired **selection among experimenter-authored sensors**, not spontaneous sense-organ invention.

## Original model custody / gate

The source of truth is the original Studio 05–07b code, *not* a codebase reconstructed from the operator's prose. Before the first S1 scientific choice:
1. Pass `studio07_original_import_check.py` with all original source bytes, original manifests and 8 world pairs.
2. Replay original Studio07b results, including intact 7/8, lesion 7/8, closed-input versus varying-input trace digest parity with beacon cue cancelled, and the original smooth failure. An **independent** verifier checks the exact per-world traces.
3. Pin SHA256 of the exact original world runner/serializer, the isolated intervention hook and complete S1 adaptive-source bytes.
4. Confirm input channel to `step(undefined)` is fully absent and no PFM inputDigest/eventDigest can enter any S1 candidate.
5. Freeze the per-season tick count, death/reincorporation mechanics, lesion start and end, all world genesis rules and exact per-world reference checkpoints. **No guesses on these unresolved parameters.**

**STOP if any source or parity item fails.** No scientific result may be produced from synthetic QA fixtures.

## Worlds and controls

Prospectively generate **32 genuinely independent synthetic worlds**, IDs `S1-W00` … `S1-W31`, deterministic domain-separated seed
`SHA256("STUDIO08-S1-V1|" + worldId)`. All 32 values are pinned in
`S1_FRESH_WORLD_SEEDS_V1.json`. This seed manifest is a design asset,
not a proof that independence has been achieved: the actual initial states
must be distinct and verified. Exclude all Studio05–07 exploratory worlds
and ensure seeds are not reused by history. No tuning on the 32 worlds.

For EACH world: fork the same complete incorporated initial state into
two scenarios: intact and one-season original `2→7` lesion (−5),
then original six-season follow-up. Preserve all PFM, house S/D, V, zone
history, state counters, noise inputs (none), update order and time windows.

Six arms per world × scenario (32 × 2 × 6 = **384 complete model trajectories**):
- `adaptive`: one of three sensor candidates chosen via predetermined deterministic UCB selection; strength at most +0.35, no source input;
- `round_robin`: identical three candidates, no learning, deterministic fixed schedule; matched amplitude;
- `fixed_surface_decline24`: prespecified 24-tick declining S edge sensor;
- `fixed_house_flux24`: prespecified sum |Δ(S+D)| per target;
- `no_cue`: negative reference;
- `asm_reference`: original source-authenticated Studio07 `asm` hash as a historical benchmark.

Exact original `asm` bytes/ordering are REQUIRED, never approximate the
operator's narrative formula. The third new non-hash sensor
`code_drift24` participates in the adaptive and round-robin arms.
The fixed-sensor reference arms are secondary and may not be selected
post hoc to represent a favourable non-learning comparator.

**Pre-choice-only:** sensors see 25 completed snapshots t−24…t, no
current decision or future result, raw beacon, hashes or input fields.
Without genuine 25 snapshots at the beginning, log exclusion/warm-up,
never fabricate history. Candidate targets absent from the actual open exits
produce 0 settled cue effect; do not remap. At most one +0.35 bonus.

## Frozen adaptation and credit

The three sensors and deterministic choice learning component are in
`experiments/studio08/code/closed_circuit_sensors.mjs` and
`experiments/studio08/code/learning_cue_gate.mjs`. They use the declared
sensor order and `c=0.20` UCB coefficient. A decision at time t has a
24-transition outcome horizon INCLUDING the choice t…t+23. Successful
nondeath maturation occurs after transition t+23. Any death in that
window, including at t, settles credit immediately as **−1**; otherwise
reward is `clip((distinct directed edges observed in the window−4)/7,0,1)`.
Choices at each step use only previously settled credit. End-of-run
outstanding windows are **right-censored**, never assigned an invented
zero or retrospectively matured beyond observation. Same rule in all arms
when a sensor is active; log token and settlement.

## Fixed outcomes and primary comparison

Use original Studio07/07b last-season criteria unchanged:
- **Held (intact) / restored (lesion):** last-season deaths = 0,
  last-season distinct routes ≥6.5, house pull `2→7` ≥0.5.
- **Circuit:** deathless, routes ≤4.5.
- **Haunted:** deaths>0 and `4→5` pull ≥0.05.
- Otherwise **other**. Preserve all raw continuous readings as well.

Two co-primary binary endpoints:
1. Pairwise adaptive vs round-robin **held** status (intact).
2. Pairwise adaptive vs round-robin **restored** status (lesioned).

All 32 worlds must be admitted, including failed/haunted cases, no
selective exclusions. Use one-sided exact paired McNemar binomial test for
each endpoint (wins=adaptive-only, losses=round-robin-only), Holm familywise
α=0.05 for these TWO tests only; report raw discordance, ties, observed
risk difference, descriptive 95% paired bootstrap interval from 20,000
world-resamples seeded 80710025, and per-arm descriptive deaths,
choice-settlement share, zone-2 opportunities, `2→7` shares, house S/D
strength, sensor selection/settlement/credit and exposure. A positive
claim of improved **maintenance AND repair** requires BOTH Holm-adjusted
p≤0.05, positive paired observed effect for both, verified independent
model forks, and significant actual adaptation of sensor exposure relative
to fixed schedule. A positive p alone does not prove genuine emergent
agency, genesis, spontaneous receptor invention or intelligent Outside.

No interim peeking or threshold changes; if testing fails, report FAIL.
No pooling with historical eight Studio07 worlds.

## Evidence and review standards

Every one of the 384 trajectories must have an unmodified raw trace file,
SHA256, exact world seed, intact full-state fork digest, pre-choice sensor
readouts, chosen/runner-up transition scores, source input null marker,
actual event outcome, withheld/censored credit, death/reincorporation,
end-of-season classification and original-house/code state readouts.
Check source and result SHA256 independently. Reexecute the original
science runner from clean checkout, confirming all 384 per-file SHA256
and full result summary. Have a separate reviewer examine registry,
file custody, source-pathway audit, protocol deviations and negative cases.

`science_analysis.py` is a deterministic acceptance and analysis
program with full trace custody and pair-completeness gates. Its PASS
status is **internal evidence acceptance**, not external accreditation.

**Pending original-source-dependent choices:** season ticks, exact full
initial-state construction, true original lesion timing and original asm
serializer. These must be pinned in a signed/sealed addendum BEFORE fresh
science, not reverse-engineered from observed S1 outcomes. This draft is
not yet a preregistered or executed study.
