# Amelia studio archive, 21–23 October 2026

Source and raw outputs for Studios 01–04 and the PF-2 analysis pipeline, preserved unchanged for audit. SHA-256 digests of every file are in `SHA256SUMS.txt`.

## Runtime
`runtime_mirror/` is the Amelia-Orange live runtime at commit `90cf07d`, mirrored with three changes and nothing else:
- imports carry `.ts`, and type-only imports are written `import type`;
- a public `exitBonus` hook is added as the last term of the exit score;
- the per-step history digest is set to `''`, for speed.

`runtime_unmodified/` is the same runtime with only the import change: it differs from `src/` at `90cf07d` in import lines alone. `code/eqcheck.mjs` compares the two and finds identical trajectories over 3,000 steps.

## Reproduce from a fresh checkout
- `sh setup.sh <new folder>` assembles a working studio folder: the scripts, `m/` (hooked runtime), `m0/` (unmodified runtime), and the archived loop logs, which the scar assay reads.
- `sh verify.sh <new folder>` runs setup and then four checks. It takes about 7 minutes on 2 cores.
  1. Runtime equivalence.
  2. The four registered PF-2 golden trace digests.
  3. The scar assay, byte-identical.
  4. Both bootstrap loops, pass by pass: codes, traces and deaths.
- `bash reproduce_studios.sh <folder from setup.sh>` re-runs all 24 Studio 01–03 outputs and compares each byte for byte. It takes about an hour on 2 cores. Verified 23 October 2026: all 24 identical.

## Individual commands
All runs use Node 22 with `--experimental-strip-types`. `<M>` is the absolute path to `runtime_mirror`.

| Study | Command | Output |
|---|---|---|
| Studio 01 | `node code/stone_tape.mjs <M> {L0\|LS\|LSY\|Q} 32 20 10000 <out> [LS.json]` | `outputs/*.json` |
| Studio 02 | `node code/house.mjs <M> <a> <A> 32 10 10000 <out>`; erasure runs: `node code/house.mjs <M> <a> 1 32 12 10000 <out> {5\|5D}` (12 generations, erasure at generation 5) | `outputs/house/` (`h_*` 10 generations, `e_*` 12) |
| Studio 03 | `node code/two_subjects.mjs <M> <a> <A> <wV> 24 24 5000 <out>` | `outputs/two/` |
| PF-2 receiver | `node code/receiver.mjs <M> {learner\|unchanged} <K> <ticks> <namespace> <out>` | golden traces: `outputs/gold_*.json` |
| Studio 04, the loop | `python3 code/bootstrap_loop.py <studio dir> <out dir> <passes> 20160` | `outputs/loop/` (30 passes from zero). `outputs/loopB/`: its first entry (pass −1) holds the random starting code, and the loop resumes from any log placed in `<out dir>` |
| Studio 04b, scar assay | `python3 code/scar_assay.py <studio dir>` | `outputs/scar/scar_assay.json` |
| PF-2 weekly measures | `code/pf2_weekly_indices.sh <chunks dir> <studio dir> <out dir> <days>` | — |

`<studio dir>` is a folder made by `setup.sh`.

## Scar assay: exact drift bounds
In the four unseen worlds, the converged code's maximum residual is 0.155, 0.110, 0.163 and 0.076 (W1–W4). The naive code's is 0.414–0.487. Any preregistered threshold should cite these exact values, taken from `outputs/scar/scar_assay.json`, not the rounded band 0.08–0.16.

## Status
Studio grade: exploratory, unregistered. Nothing here is sealed or confirmatory. PF-1, PF-2 and C1 are unaffected.
