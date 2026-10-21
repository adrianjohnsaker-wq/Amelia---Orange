# PF-1 operational amendment A1 — operator approval and deployment conditions

- **Operator approval received:** 2026-10-21 10:11:29 UTC: “Operational catch up A1 approved✅”.
- **Scope:** explicitly approved proposal `experiments/pf1/operations/PF1_LIVE_CATCHUP_A1_PROPOSED_NOT_APPROVED.md`.
- **Science unchanged:** immutable PF-1 genesis, substrate, selection/runtime code, thresholds, reference arms, C1 verifier pin, silence and journal-seal policy all remain byte-identical.
- **Permitted operational change:** retain the 5-minute GitHub scheduler; make each successful dispatch catch up a maximum of 480 genuine, C1-pinned BLS-verified, published, ordered 60-second ticks in 20-tick batches; maximum 35-minute dispatch window with five-minute buffer.
- **Durable batch boundary:** each batch uses the existing PF1_LIVE_INTAKE.py, PF1_LIVE_RUN.ts, PF1_LIVE_SEAL.py and PF1_LIVE_CHECK.py unchanged, then pushes its exact journal/state/ledger head to main, verifies independently fetched HEAD, before advancing further.
- **Exclusive lease:** one remotely acknowledged PF1_SAFE_LEASE per dispatch; completed only on final success or durable fail-closed halt. Any stale commit push is rejected without rebase, and unresolved lease blocks later dispatch.
- **Fail-closed:** science/seal failure restores the last remotely confirmed committed prefix and writes a dated halt before lease completion; no automatic restart from halted state.
- **Predeployment gate:** synthetic-only detached Git rehearsal with real local Git push/restore and remote-divergence tests must pass before editing live workflow. If it fails, live workflow remains unchanged.
- **Reporting:** records backlog, batch count, committed head and admitted rounds in GitHub job logs, no notifications. The existing separate read-only companion reports moving/absorbed exposure.

No endorsement of biological intelligence, Outside agency, or an external entity follows from successful operational catch-up.
