# PF S1 amendment 1 (29 Oct 2026): the migration's final step stopped on a stray bytecode file; corrected one-shot migration

**What happened in run 40964688563** (`pf-s1-migrate.yml`):
- **M0** passed: S1 seal verified, sources unchanged, state at sealing.
- **M1** passed: PF-1 orphan lease `40614134740-1` completed after the full 10,203-tick prefix audit, committed and pushed as `5e818b14`.
- **M2** recovered PF-2 **on the runner only**.
- **M3** split and verified all three state files. It then stopped at its own clean-tree check, because an inline Python step had imported `PF_SHARD` without `PYTHONDONTWRITEBYTECODE` and left `experiments/pf_storage/__pycache__/`.

**Nothing from M2 or M3 was committed.** PF-2 remains halted at tick 7150 in the repository, and PF-1's state is unchanged at 10,203 ticks.

**Correction.** `.github/workflows/pf-s1-migrate-a1.yml` is the S1 migration with three differences:
1. M0 also verifies this amendment's own RFC 3161 token. It still requires the S1 seal, the S1 source hashes and both state files exactly as sealed.
2. M1 no longer completes the lease, because that is done. It verifies that `40614134740-1` has its C1-native completion and that no lease is unresolved.
3. Every step sets `PYTHONDONTWRITEBYTECODE=1`.

M2 (PF-2 recovery) and M3 (sharding, exact-byte joins, `MIGRATED.json`) are unchanged.

`pf-s1-migrate.yml` stays byte-identical to its S1 seal. Science, criteria and the live workflows are unchanged.
