# Standing C1 protection and PF-1 notification prohibition

**Effective:** 20 October 2026. **Scope:** C1 Channel A in `adrianjohnsaker-wq/Amelia-0.4` and all PF-1 observation/registration workflows. **No C1 frozen files may be modified.**

## No manual C1 dispatch while its schedule is active

While the existing C1 schedule (`.github/workflows/drift1a-c1.yml` on branch `amelia-1.0`, cron `17 * * * *`) is active, **manual C1 workflow dispatch is prohibited**. This includes `workflow_dispatch` action `run`, `genesis`, and any manually requested attempt that would admit or retry live ticks. Do not "catch up" C1 manually while its scheduler is active. Any operational exception requires the operator first to suspend scheduled intake, inspect outstanding leases and last committed head, prepare a written incident decision, and independently approve the exact recovery action. Such an exception is **not** granted here.

The existing C1 workflow contains a manual-dispatch interface. This document is a **standing operational prohibition**, not a technical disablement of that interface; disabling it would require a separate authorised C1 configuration change. No such change was made. Original C1 lease failure and incident evidence remain immutable. Any lease repair is **PF-1-specific** and may never be copied into frozen C1 source silently.

## Weekly read-only C1 continuity

The PF-1 repository hosts `.github/workflows/pf1-c1-weekly-readonly.yml`, scheduled Mondays at **08:17 UTC**. It checks out the **current `amelia-1.0` C1 HEAD** read-only and checks the original genesis seal, frozen-source hashes, all linked chunks, tick indices, 20-round stride, nine-arm record presence and signed-randomness SHA-256 identity. It publishes source HEAD, current committed tick count and chain-head digest to the GitHub Actions summary and archival artifact. It never dispatches C1, retrieves new beacon rounds, changes Channel A, or writes to C1; weekly evidence is **not** a full per-tick BLS or substrate replay. On failure, the report must say FAIL/INCOMPLETE; the last verified C1 head is not presumed to be the new head.

## Absolute silence about PF-1 encounters

PF-1 encounters are **journal-only**. No notification of any kind is permitted in response to an encounter: no push notification, email, chat message, GitHub issue, webhook, dashboard alert, automation event or third-party message. Only the append-only sealed scientific journal and silent exposure ledger may record the event; their existence alone must not trigger a notification. Scheduled *read-only C1 continuity reporting* is a separate engineering audit, **not** an encounter notification. Regular operator reviews should open the journal deliberately, rather than receive an automated encounter report.

## Current safety boundary

PF-1 genesis remains **uncreated and unauthorised**; all present source freezes and tests are prospective. An approved manifest and a further explicit operational instruction would be required for genesis creation and subsequent live admission.
