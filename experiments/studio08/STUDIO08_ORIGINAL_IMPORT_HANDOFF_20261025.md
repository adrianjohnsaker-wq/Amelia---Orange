# Studio 08 — Original Studio 07 import handoff (25 October 2026)

**Status: SOURCE NOT YET ADMITTED.** This is a custody/instrumentation work order.
Original Studio 07 code and full eight-world checkpoints are reported to exist
inside the operator's working project. They have NOT been found in the
connected GitHub branches or indexed Library during the 25 October audit.

## Copy, do not reconstruct
Copy the original exact Studio 05/05c/06b/06c/07 precommits, original Studio07
self-cue source, runner, trace bytes and full eight-world checkpoints into
\`experiments/studio08/source_import/\` on an isolated import branch or PR.
**Do not rewrite or rerun old files** in order to satisfy the import.

Required source metadata:
- \`experiments/studio08/source_import/STUDIO08_WORKING_PROJECT_SOURCE_MANIFEST_V1.json\`
- \`experiments/studio08/source_import/STUDIO08_EIGHT_WORLD_ORIGINAL_CHECKPOINTS_V1.json\`

The source manifest must satisfy \`code/archive_gate.py\`, including the
required roles: original Studio05 record, Studio05c precommit, Studio06b
precommit, Studio07 precommit, unmodified Studio05 runner, Studio07 runner,
full Studio07 checkpoints and original Studio07 traces. Every supplied file
requires its ACTUAL original lower-case SHA256, checked against the bytes
in the import. The original source digest is not a Git blob SHA.

The eight-world index must list EXACT world IDs \`W00\` through \`W07\`,
with an intact and lesion checkpoint reference for each. Its minimal
format with separate original state files is:

\`\`\`json
{
  "schema": "STUDIO08_EIGHT_WORLD_ORIGINAL_CHECKPOINTS_V1",
  "source": "operator_working_project_original",
  "worlds": [
    {
      "worldId": "W00",
      "intact": {"path": "original/world0-intact.json", "sha256": "<actual source SHA256>"},
      "lesion": {"path": "original/world0-lesion.json", "sha256": "<actual source SHA256>"}
    }
  ]
}
\`\`\`

The actual file MUST contain eight objects, not the one illustrative entry.
If the 16 checkpoint objects were saved INSIDE one original JSON file,
preserve that original file unchanged; individual entries can instead include
\`"locator": "/worlds/W00/intact"\` and
\`"locator": "/worlds/W00/lesion"\` with the same verified file digest.
The import checker confirms that each JSON pointer identifies a nonempty
state. A binary archive or NDJSON container needs its own auditable
read-only pointer adapter, not an invented "original" extraction.

## Automatic admission upon source arrival
The branch contains the workflow:
\`.github/workflows/studio08-original-import-gate.yml\`.

It triggers on a PR or push that supplies actual files under
\`experiments/studio08/source_import/**\`, and fails closed on missing roles,
seven/duplicate worlds, changed SHA256, invalid pointer or source parse.
In GitHub Actions, it runs:

\`\`\`bash
python3 experiments/studio08/code/studio07_original_import_check.py \
  --archive-root experiments/studio08/source_import \
  --source-manifest experiments/studio08/source_import/STUDIO08_WORKING_PROJECT_SOURCE_MANIFEST_V1.json \
  --checkpoint-index experiments/studio08/source_import/STUDIO08_EIGHT_WORLD_ORIGINAL_CHECKPOINTS_V1.json
\`\`\`

A PASS means **original source custody and 16 world-state references were
verified**, NOT that Studio07 was reproduced. The command also produces an
AST candidate inventory of fields near hashes/serializers from the
SHA-bound original Studio07 runner; the reviewer MUST still trace all
aliases, imported helpers and dynamic input flows manually and document
the precise field-use dependencies. An automatically extracted property
list is NOT complete taint tracking.

## Next scientific run (not yet authorised or executed)
1. Independently replay the original Studio07 synthetic eight worlds with
   unchanged source and compare all original traces/checkpoints byte-for-byte.
   If the original source's determinism depends on wall clocks, inspect and
   account for metadata without changing the scientific states.
2. Record verbatim how the original coupled-state cue is calculated before
   each choice; identify whether it reads input digests, eventDigests or
   source-derived state. Do NOT "purify" or change the original hash.
3. Duplicate the original entire states at each intact and lesion fork;
   **run exactly the original readout** under (A) varying original input,
   (B) constant input and (C) no input. Retain any differences in input
   metadata; do not remove them if the original readout consumes them.
4. Report full per-world paired transition sequences, deaths, house memory
   S+D on 1->2 and 2->7, zone-2 opportunity/choice shares, route diversity,
   final territory maintenance and repair using original Studio07's exact
   prespecified rules, and per-world raw outputs and SHA256.
5. Report both successful and failed worlds. This E1 comparison is
   *post-Studio07 mechanistic investigation* on the already explored eight
   worlds, not eight new independent prospective confirmations.
6. Treat the smooth non-hash cue and blank genesis as NEW, separately
   precommitted E2/E3 interventions. No extrapolation to intelligence of
   the external beacon without separate prospective controls.

The E0 synthetic source-pathway and negative-control CI PASSes on the
Studio08 branch have **no scientific 05–07 outcome status**.

**Absolute stop:** if the exact original code/checkpoints remain inaccessible,
report **E1 NOT RUN**. Do not simulate a substitute or invent the
missing source's SHA256, field serializer, world state or result.
