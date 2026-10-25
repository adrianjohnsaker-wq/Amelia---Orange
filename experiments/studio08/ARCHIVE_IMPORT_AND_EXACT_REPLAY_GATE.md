# Studio 08 — import and scientific-run gate

This describes **how to admit the already-archived Studio 05–07 project data**.
The user reports these originals exist in their working project. They have
not yet been supplied to GitHub. No substitutions, regenerated files, or
new outcomes are authorised by the existence of this guide.

## Copy originals, keep their authorial provenance
Create a dedicated staging branch and add the full existing:
- `STUDIO_05_THE_TAPE_THAT_RECORDED_ITSELF.md`
- Studio 05c original outcome precommit and its inherited test sources
- `STUDIO_06B_THRESHOLD_AND_SCAR_PRECOMMIT.md`
- Studio 06c direct-cue-off run source and outputs
- `STUDIO_07_SELF_GENERATED_DIFFERENCE_PRECOMMIT.md`
- Studio 07 full learner–house runner, joint-cue source and exact serializer
- All eight ORIGINAL world states at the intact and lesion boundaries (house
  surface/deep, entire V code, runtime/governor/PFM, last 24 zones, counters)
- Complete raw logs, season-end summaries, negative and failed cases, original
  SHA256SUMS or equivalent provenance manifest

Do not silently relabel the author's working-project hashes as Git commit hashes
or regenerate reports from later reconstructed code.

## Format of the independent Studio 08 import manifest
Save `STUDIO08_WORKING_PROJECT_SOURCE_MANIFEST_V1.json` separately in the
source staging root. Do not invent digests. Minimal shape:

```json
{
  "schema": "STUDIO08_WORKING_PROJECT_SOURCE_MANIFEST_V1",
  "operator_source": "existing_working_project_archive",
  "files": [
    {"role": "studio05_record", "path": "STUDIO_05_THE_TAPE_THAT_RECORDED_ITSELF.md", "sha256": "<actual SHA256 of exact original bytes>"},
    {"role": "studio05c_precommit", "path": "<existing relative path>", "sha256": "<actual SHA256>"},
    {"role": "studio06b_precommit", "path": "STUDIO_06B_THRESHOLD_AND_SCAR_PRECOMMIT.md", "sha256": "<actual SHA256>"},
    {"role": "studio07_precommit", "path": "STUDIO_07_SELF_GENERATED_DIFFERENCE_PRECOMMIT.md", "sha256": "<actual SHA256>"},
    {"role": "studio05_runner", "path": "<existing relative path>", "sha256": "<actual SHA256>"},
    {"role": "studio07_runner", "path": "<existing relative path>", "sha256": "<actual SHA256>"},
    {"role": "studio07_full_checkpoints", "path": "<original checkpoint artifact>", "sha256": "<actual SHA256>"},
    {"role": "studio07_traces", "path": "<original full logs>", "sha256": "<actual SHA256>"}
  ]
}
```

The placeholders above are **not valid digests**: replace them with genuine
source-file SHA256 hashes before running the gate. Append every additional
source, table, hash manifest and negative run output as a separately digested
`files[]` entry (each with unique `role` and `path`).

Run:

```sh
python3 experiments/studio08/code/archive_gate.py --check \
  --archive-root /path/to/copied/source \
  --manifest /path/to/copied/source/STUDIO08_WORKING_PROJECT_SOURCE_MANIFEST_V1.json
```

The audit rejects an absent role, a missing or changed source, an unsafe path,
a duplicate path/role and a bad SHA256. Passing this check establishes
**byte custody only**, not the scientific validity of the underlying results.

## Independent E1 acceptance before run

1. Pin original eight-world initial and **full** fork states, originals SHA256,
   workflow/runner commits and full deterministic Studio 07 reproduction PASS.
2. Compare the exact Studio 07 joint-cue byte serializer to these dependencies:
   zone history, code, house S/D, `PFM.inputDigest`, `PFM.inputZone`,
   `PFM.eventDigest`, event-history-head hashes, tick indices, epoch time,
   raw drand signature/randomness. Mark each present/absent with source lines.
3. A/B/C from the Studio 08 draft must use that SAME original self-hash,
   identical initial complete state and separate varying/constant/absent input.
   Changing which fields the hash reads is a **new arm**, not an innocuous
   source isolation fix. Record the entire hash input at a hashed audit digest
   for each pre-choice step; avoid source secret exposure where applicable.
4. Do not read any future beacon or PF4 prospective ciphertext/target; use
   original synthetic fixtures for these E1 runs only.
5. Preserve every original lesion condition, scar/code state, weights and
   frozen restoration threshold. Pair within world. No reruns selected by
   success; inspect dead ends too.
6. Report maintenance and repair separately with the original six-season
   cutoff. A new longer horizon needs a separate precommit, not amended
   endpoints on known data.

**STOP if any item fails:** the E0 parity results do not authorise a
synthetic-house reconstruction as a stand-in for the original Studio 07.

## New E2 and E3 boundaries
The smooth cue in `code/endogenous_cues.mjs` is a new selector-derived
experimental intervention, not part of the author's historical Studio 07
implementation. Freeze its exact source/version and known failures before
applying it to original archived worlds.

No-previous-imprint genesis E3 is a **separate** study on new precommitted
seeds; inherited Studio 07 intact states are ineligible for E3 and are only
suitable for E1/E2 maintenance/repair.

Track provenance and any explicit null result alongside every philosophical
interpretation. External agency/intelligence is a later distinct test family.
