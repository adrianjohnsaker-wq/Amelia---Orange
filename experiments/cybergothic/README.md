# The Cybergothic line

**What it is.** An artificial-life ecology of homoiconic digit-string agents on a ten-zone Numogram-like topology, developed
in a separate prototype session (14–15 Nov 2026). It is isolated from Amelia: no live state, no Supabase.

**Plan (operator, 15 Nov 2026).** Bring the line into this repository, corroborate the findings, then write it up as a
standalone research paper.

1. **Prototype 0** (`prototype0/`): the supplied engine, restored, with an independent audit. Done: the ghost-host bug and the
   collapse without reseeding are corroborated.
2. **The developed prototype:** needs its code and evidence packages (the `*_EVIDENCE_*.zip` and `*_DESIGN_*.zip` files the
   session produced). Then, for each study:
   1. **Replay.** Rerun the saved branches and match their state, event and provenance hashes.
   2. **Re-analysis.** Recompute every reported number from the ledgers with independently written scripts.
   3. **Topology check.** Compare its 29-gate graph with `src/core/fullNumogram.ts` (`FULL_NUMOGRAM_GATES`).
   4. **Fresh replication.** Rerun each confirmatory protocol on new seed ranges, sealed by RFC 3161 (the C1 pin) before it
      runs, in GitHub Actions. This is the strongest corroboration; the original seals were local.
3. **The paper:** after corroboration, from `FINDINGS_LEDGER.md`, the audits and the replications.
