# Studio 07 and 07b — operator-supplied results and corrected Studio 08 interpretation

**Document date:** 25 October 2026. **Classification:** narrative protocol and outcome record copied from the operator's 25 October chat, **not** a byte-for-byte import of the original working-project precommit, model runner, per-world traces or checkpoints. Do not promote this document to an original source manifest. Any contradiction with signed/original source is an audit stop.

## Studio 07 — original experimental question and prior predictions

Studio grade; criteria reported fixed before the runs, 25 October 2026. Eight incorporated learner–house worlds W1–W8, intact or one-season `2→7` lesion of −5 followed by six seasons.

The canonical external cue's `+0.35` scoring advantage was cancelled by `−0.35`, and replaced by a `+0.35` self-generated cue on one target zone. Two operator-defined self-cues:
- **traj:** first byte of `SHA256("SELF|" + last 24 visited zones)`, modulo 10.
- **asm:** first byte of `SHA256("SELF|" + last 24 visited zones + learned V code + house S+D record to 6 decimals)`, modulo 10.

The **exact source serializer**, joining syntax, key ordering, text representation of decimal values and handling of missing history are NOT given here. The original executable must determine these details. The textual formula does **not** explicitly include PFM eventDigest, inputDigest, inputZone or raw beacon randomness.

Earlier reference arms: external cue maintained an intact territory and restored 6/8 after lesion; no cue sent all 8 to circuit.

Pre-stated outcomes:
- **held/restored:** deathless last season, distinct routes ≥6.5, house `2→7` pull ≥0.5;
- **circuit:** deathless last season, routes ≤4.5;
- **haunted:** last-season deaths >0 and `4→5` pull ≥0.05;
- else other.
- Self-sustaining or self-repairing if ≥6/8 per matched variant; irreplaceable by that variant if both intact and lesioned ≤2/8. Death risk reported separately.

The operator recorded in advance the concern that a last-24-zones-only cue may repeat forever inside a circuit, while a coupled state carrying decaying house memory and drifting V might not.

### Reported result — Studio 07, not reexecuted here

| Cue | Held intact | Restored after lesion | Mean lesion-season deaths per world | Cue / V / house choice-settlement shares |
|---|---:|---:|---:|---|
| Beacon reference | Held (8 not individually itemised) | 6/8 | 59.5 | 6.5% / 2.4% / 1.5% |
| None | 0/8, circuit 8/8 | 0/8, circuit 8/8 | 0 | 0 / 0 / 0 |
| traj | 0/8, circuit 8/8 | 0/8, circuit 8/8 | 0 | 0 / 0 / 0 |
| asm | 7/8 | 7/8 | 48.6 | 6.6% / 2.5% / 1.6% |

Additional reported trajectory: traj/no-cue `1→2` house pull fell from 0.40 to zero in five seasons. Under asm, intact `2→7` pull remained 0.82, while damaged `2→7` pull recovered 0.40, 0.70, 0.78, 0.80, 0.81, 0.81, 0.81; mean deaths by lesion and subsequent seasons: 48.6, 9.3, 4.5, 1.9, 0.5, 0.4, 0.1.

**Studio 07 first interpretation:** coupled memory plus sensitive reader substitutes for the external direct input cue, with death risk. The study did NOT establish whether the recorded beacon input had an indirect effect through memory, or that the reader evolved endogenously.

## Studio 07b — closed input and two distinct smooth conditions

Criteria also reported fixed before execution, 25 October 2026. Same eight incorporated worlds, intact and damaged, same six-season endpoints and thresholds as Studio 07.

- **Closed input:** identical text string `CLOSED` each tick to every lineage, no varying signal; cancel the constant's own canonical `+0.35` choice bonus with `−0.35` exactly.
- **asm:** unchanged operator Studio 07 coupled-state hash, not the new Studio 08 hash-prototype.
- **Studio 07b smooth:** **NOT** the current Studio 08 `houseChangeCue` prototype. Targets the destination of the **individual edge** with the largest decline in its house **surface layer S** over the preceding 24 ticks; no cue if no edge's S decreased. The original runner must establish the tie/order and precise timing.

Reported outcomes:

| Arm | Intact last season | After lesion last season | Mean lesion-season deaths |
|---|---|---|---:|
| Ccl_none: constant, no cue | circuit 8/8 | circuit 8/8 | 0 |
| Ccl_asm: constant, asm | held 7/8 | restored 7/8 | 48.6 |
| Ccl_smooth: constant, smooth | circuit 8/8 | circuit 8/8 | 0 |
| smooth: varying signal enters PFM but direct cue cancelled, smooth | circuit 8/8 | circuit 8/8 | 0 |

**Causal-parity report (critical correction):** according to the operator's direct comparison, after cancelling the canonical choice term the trajectories under varying source and `CLOSED` input had IDENTICAL trace digests. Leaving the canonical cue ON caused different trajectories.

Thus the earlier statement that beacon input carried an *operative* trace through internal memory is **withdrawn for these reported experiments**. It may still be archived in the input fields; archiving alone is not causal incorporation. This is consistent with Studio 08's separate frozen-runtime E0 engineering audits, but not independently verified against the operator's original Studio 07b runner here.

### Boundaries of the finding

1. **Supports conditionally:** an **already formed** coupled learner–house territory can reportedly maintain and recover (7/8) after the direct external cue is cancelled AND new runtime input is held constant, using the fixed, externally authored sensitive `asm` readout. The cue depends on drifting/decaying internally updated states.
2. **Does not demonstrate:** independently new territory genesis from blank state; spontaneous evolution of cue sensitivity; noncryptographic/ordinary smooth rule sufficiency; absolute isolation from environmental inputs in every part of a larger app; external information agency/intelligence.
3. **External history remains:** the forks began from **incorporated states**, originally developed through earlier interactions. Neither a constant future input nor local trajectory independence erases earlier environmental causation.
4. **Negative result:** the one tested house surface-decline smooth rule gave no settled choices and failed to maintain/repair, under both input arrangements. This does not falsify all possible smooth sensors.
5. **Do not turn 7/8 into a prospective p-value:** eight previously studied worlds are exploratory/mechanistic matched units, not a new independent confirmatory sample.
6. **Do not confuse two smooth definitions:** Studio 08's separately authored proposal chooses a target from summed absolute changes in surface+deep memory, whereas Studio 07b chooses the target of one edge's maximal decline in surface S over a fixed 24-tick window.

## Effect on the Studio 08 design

**E0: already engineering QA PASS**, not scientific Studio 07 reproduction. Its observation that hashed PFM eventDigests *can* indirectly feed source information into actions is a validated negative-control hazard, **not proof that Studio 07's asm hash did so**. The text formula for asm does not include those fields.

**E1 revised priority:**
- Admit the original Studio 07 and 07b precommits/runners with verifiable byte digests and 8 complete pair checkpoints; current operator text alone cannot pass that gate.
- Confirm original SHA256 cue serializer field by field, including the exclusion or presence of PFM eventDigest, inputZone, inputDigest, raw source, wall time and previous decisions.
- Reproduce exact original varying-versus-`CLOSED` trace-digest equality when direct cue is off, and corresponding inequality when direct cue is on; retain original asm results (7/8).
- `step(undefined)` is an **additional still-unrun control** unless an original archived run proves otherwise. It is not the same as constant `CLOSED`, because it changes event-input metadata and may affect a hash that reads metadata.
- Preserve the original operator's `smooth` result rather than silently replacing it with the distinct Studio 08 prototype.

**E2 revised priority:** replicate original Studio 07b smooth failure first, including per-choice opportunity and score margins; then register the separately designed surface+deep absolute-change smooth rule (or another bounded, non-hash sensor) as a NEW arm. Do not tune sensors on the previous eight outcomes.

**E3 still separate:** pre-register blank-genesis worlds, independently seeded/disjoint, and tests for endogenous **acquisition of cue sensitivity**. A successful inherited-territory closed-circuit assay alone cannot settle E3.

## Status and provenance gate

The operator supplied the narrative criteria, aggregated results and correction directly on 2026-10-25. The original project file `STUDIO_07_SELF_GENERATED_DIFFERENCE_PRECOMMIT.md`, the Studio 07b original executable, per-world matched trace digests and eight full states **have not yet been made available** in this GitHub branch. This note is faithful to the supplied text, but **not a seal, original precommit, independent replication, or science-run output**.

**SOURCE IMPORT OPEN; ORIGINAL-CODE AUDIT NOT RUN; STUDIO08 E1/E2/E3 NOT RUN.**
