# PF-2 “The Receiver” — pre-genesis operator approval review

**22 October 2026. Status: COMPLETE BUILD/FIDELITY SEAL, BUT NO GENESIS, NO LIVE TICKS.**

## What is being requested for approval
Approve the prospectively sealed scientific design in
[`PF2_GENESIS_MANIFEST_FOR_APPROVAL.json`](./PF2_GENESIS_MANIFEST_FOR_APPROVAL.json)
for the creation of a separate, future-on-grid PF-2 genesis. Approval of this
manifest does not, by itself, start any live intake: initial genesis creation,
exclusive remote lease, A1 catch-up and admission have distinct gates.

The standing three-studio experimental question is:
**Can an encounter with something external create a history that becomes
capable of organising subsequent encounters?**

PF-2 currently implements a 9×2 **inherited personal-V receiver and unchanged
reborn control**, not a place-T receiver. The place-only Stone Tape experiment
remains a distinct subsequent experimental study; that difference is explicit.

## Fidelity: PASS
- Normative original receiver GOLD tests, all four 20,000-tick digests and
  exact learner lineage-0 11-gate final V, full JSON/lives:
  [39834102673](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39834102673).
- Fully independent 18-lineage stateful engine, all four GOLD fixtures and
  byte-identical resumed-state replay:
  [39834111165](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39834111165).
- PF1's unchanged graph-only scanner, Rung1 nulls and Pandemonium entity
  names on 18 paired synthetic receivers, with interruption/replay:
  [39834121444](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39834121444).
- Earlier scanner integration failures were logged and not discarded.

## One verified prospective RFC3161 seal: PASS
- [Signing workflow 39834538877](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39834538877)
- [One timestamp token](./seal/ONE.tsr) and [verified receipt](./seal/receipt.json).
- [One combined byte-hash bundle](./seal/PF2_SINGLE_SIGNED_SOURCE_BUNDLE.json),
  covering **16 frozen PF-2 files**, SHA-256
  `4773293274f421c2b16124b21b230aa52b5da210e45fafa11149d449f2982862`.
- Original PF2 registration, receiver, two goldens and manifest all included,
  with exact original user-upload SHA-256; canonical, PF-1, C1 byte-identical.
- No further timestamp to add or silently replace the scientific design.

## Prospective live parameters presented for review

| Parameter | Frozen pre-genesis rule |
|---|---|
| Signal | drand Quicknet; C1/PF1 pinned BLS verification |
| Cadence | every 20 rounds, 60 seconds |
| Starting round | **Not selected yet**; choose R0 still in future on C1 grid, with 20-minute minimum lead after later genesis |
| Arms | C and R01–R08, each learner and unchanged reborn control (18 lineages) |
| Reference separator | `PF2-REF-i|` on raw 32-byte randomness (not PF1 separator) |
| Observation window | first 43,200 admitted ticks (30 days) |
| Extension | to 86,400 ticks only if post-third-death P2-2 qualifying deaths number fewer than 10 |
| P2-1 | learner deaths ≤0.35×control deaths at day 30 |
| P2-2 | among learner deaths after each lineage's third, ≥85% cued toward 5, if ≥10 qualifying deaths |
| P2-3 | uncued 4→5 share ≤15%, descriptive |
| Detector | existing PF1 A1 R2 scanner, null rule and Pandemonium names; confirmations journal only |
| Intake | Shared PF1 remote lease, 20 per sealed batch, up to 480 per invocation, exact replay |
| Notifications | **None**: no email, webhook, chat message, SMS or other incident notification |

## Important authorisation and operational boundary

The signed manifest currently states
`operatorApprovedGenesis=false`, `operatorApprovedLiveAdmission=false`,
`futureR0=null`. There is **no**
`experiments/pf2/live/GENESIS.json`; no R0 or live state has been created,
and no beacon rounds have been admitted.

The code for exclusive lease, BLS intake, batch sealing and replay is staged and
inert. A first live PF-2 dispatch is **not claimed as tested** by the synthetic
fidelity success. Before opening admission, the operator must separately
approve genesis creation and the live admission workflow, which must run its
own source-identity and remote-lock checks. C1 and PF1 are not modified.

**Review request:** approve or decline this signed manifest as the normative
source for a later explicit PF-2 genesis authorisation. No notification
integration will be offered or enabled.
