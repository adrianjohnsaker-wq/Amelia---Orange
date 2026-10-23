# Amelia studio archive, 21–23 October 2026

Source and raw outputs for Studios 01–04 and the PF-2 analysis pipeline, preserved unchanged for audit. SHA-256 digests of every file are in `SHA256SUMS.txt`.

## Runtime
`runtime_mirror/` is the Amelia-Orange live runtime at commit `90cf07d`, mirrored with three changes and nothing else:
- imports carry `.ts`, and type-only imports are written `import type`;
- a public `exitBonus` hook is added as the last term of the exit score;
- the per-step history digest is set to `''`, for speed.

`code/eqcheck.mjs` verifies identical trajectories against an unmodified mirror over 3,000 steps.

## Reproduce
All runs use Node 22 with `--experimental-strip-types`. `<M>` is the absolute path to `runtime_mirror`.

| Study | Command | Output |
|---|---|---|
| Studio 01 | `node code/stone_tape.mjs <M> {L0\|LS\|LSY\|Q} 32 20 10000 <out> [LS.json]` | `outputs/*.json` |
| Studio 02 | `node code/house.mjs <M> <a> <A> 32 10 10000 <out> [erasure gen, e.g. 5 or 5D]` | `outputs/house/` |
| Studio 03 | `node code/two_subjects.mjs <M> <a> <A> <wV> 24 24 5000 <out>` | `outputs/two/` |
| PF-2 receiver | `node code/receiver.mjs <M> {learner\|unchanged} <K> <ticks> <namespace> <out>` | golden traces: `outputs/gold_*.json` |
| Studio 04, the loop | `python3 code/bootstrap_loop.py <studio dir> <out dir> <passes> 20160` | `outputs/loop/`, `outputs/loopB/` (loopB starts from a seeded random code, seed 1979) |
| Studio 04b, scar assay | `python3 code/scar_assay.py <studio dir>` | `outputs/scar/scar_assay.json` |
| PF-2 weekly measures | `code/pf2_weekly_indices.sh <chunks dir> <studio dir> <out dir> <days>` | — |

The loop's `<studio dir>` must hold `bootstrap_run.mjs` and the runtime as `m/`.

## Status
Studio grade: exploratory, unregistered. Nothing here is sealed or confirmatory. PF-1, PF-2 and C1 are unaffected.
