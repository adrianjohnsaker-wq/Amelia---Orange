# PF S1 amendment 8 (3 Nov 2026, operator instruction): stop the repository growth, shallow checkouts, time-limit orphans

## What happened
- **A run killed at its time limit.** PF-2 run 41675368677 (lease `41675368677-1`) spent 36 minutes on `actions/checkout` and committed 9 batches. It was then cancelled by GitHub at its 48-minute limit, during batch 10, at 17:22 UTC on 3 Nov. Its lease stayed open.
- **The pacer refused it correctly.** The pacer (amendment 7) treated only a `failure` conclusion as the refused-push case, so it paused and opened issue #24.
- **The cause: the repository had grown to 6.1 GB.** The current tree was only about 530 MB.
  - S1 commits every batch's live state as fresh 38 MB shard files, and every live run cloned the whole history (`fetch-depth: 0`).
  - Checkouts grew from about 3 minutes to between 6 and 36.

## Correction
### 1. Live state outside Git history
`experiments/pf_storage/PF_STORE.py` provides the same `join_all` / `split_all` calls as `PF_SHARD.py`.
- **Where the state lives.** `split` stores the exact live file, gzip'd, as the asset `<pf>--<file>--<sha256>.json.gz` of the release `pf-live-state`. It then writes the small tracked pointer `<file>.pointer.json`, which records the SHA-256, the size and the asset name.
- **What each batch commits.** The pointer is committed in each batch commit exactly where the shards were.
- **Integrity on join.** `join` downloads the asset named by the committed pointer and refuses unless the bytes have exactly the recorded SHA-256.
- **Refused pushes.** A refused push leaves the committed pointer, and so the committed state, unchanged.
- **Pruning.** Only assets that are not committed and are older than the 8 newest per file are deleted.
- **What changes in the catch-up scripts.** The only change in `PF1_A1_CATCHUP_S1.py` and `PF2_A1_CATCHUP_S1.py` is their storage import line. Admission, runtime, sealing, leases and science are byte-identical.

### 2. Latest-commit checkouts
- **The setting.** The live workflows check out with `fetch-depth: 1`; nothing in the live path reads history.
- **The frozen-core check.** The b67ec92 core check, formerly `git diff b67ec92 HEAD`, becomes an equality check of Git tree and blob ids, which are content hashes of exactly the same paths:
  - `src/substrate` `37a43062…`
  - `src/governance` `e4c5190e…`
  - `src/ai/numogram` `d12942e4…`
  - `src/types/amelia.ts` `25316d8e…`

### 3. Time-limit stops reconciled like refused pushes
- **Amendment 5.** `pf-s1-a5.yml` accepts a lease whose run concluded `failure` or `cancelled`. Its full audit is unchanged.
- **The pacer.** The pacer does the same.

### Seals
- **One checker.** `PF_SEAL_CHECK.py` verifies each operational bundle's RFC 3161 token. Every file must have the hash of the last bundle listing it, with seal_a8 last.
- **Who uses it.** The live workflows check `seal` + `seal_a8`. Amendments 4 and 5 check their own seal + `seal_a8`.
- **This amendment's seal.** One RFC 3161 token over every changed file is archived to `experiments/pf_storage/seal_a8/`.

### Migration (`.github/workflows/pf-s1-a8.yml`, second job)
1. **Audit.** Verify the seals and hashes; confirm that run 41675368677 concluded `cancelled`; join all three live files from their shards; run the read-only lease audit and the pinned `PF1_LIVE_CHECK.py` and `PF2_LIVE_CHECK.py`.
2. **Complete the lease.** Write exactly one C1-native completion for `41675368677-1`.
3. **Move the state.** Create the release and store the three files as assets. Delete the local copies, join them back from the release, and require byte-identical SHA-256.
4. **Commit.** Remove the three shard folders from the current tree; history keeps them. Commit only the pointers, `MIGRATED_A8.json` and the completion.

## Unchanged
Science, criteria, genesis, chunks, journals, seals, C1, leases, admission bounds. Notifications stay disabled.

## Effects
- **Repository growth.** The repository stops growing by about 150–250 MB per batch. What it already holds, 6.1 GB, stays in history.
- **Checkouts.** Checkouts fetch only the current tree, roughly 100 MB once the shards are gone, instead of the full history.
