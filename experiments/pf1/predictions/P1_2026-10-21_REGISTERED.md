# PF-1 / P1 — Prospective absorption forecast (operator-authorised)
  
**Operator instruction received:** 2026-10-21 09:44:43 UTC.  
**Evidence cutoff:** commit `7f3b6c3333be9c831a2c170b382c966dc0890390` (40 admitted ticks).  
**Version:** P1, fixed before any post-cutoff evidence is interpreted.  
**Disposition:** Observational prediction registration; not a change to existing PF-1 operational code, source digests, statistical thresholds, or existing encounter criteria.  
**External RFC 3161 evidence:** must be attached and cryptographically verified in a separate sealing workflow. This Git commit by itself is NOT an RFC 3161 token.

## A. Already observed, not predicted

- Arm **C** entered terminal zone **5** at **admitted step 32** via **1→2→4→5**.
- Arm **R03** entered terminal zone **5** at **admitted step 31** via **1→2→4→5**.
- Source: PF-1 LIVE persisted nine-arm state, commit `7f3b6c3333be9c831a2c170b382c966dc0890390`. Observational status shall never be counted as P1 predictive success.
- All nine arms had 40 admitted steps at cutoff; the two absorbed arms are excluded from the prospective denominator of seven.

## B. Prospective P1 for the seven remaining arms

- Arms: **R01, R02, R04, R05, R06, R07, R08**.
- Each is predicted to reach **zone 5**, where the canonical directed graph has no open outgoing edge, and remain absorbed.
- The median absorption step is predicted to be **approximately 1,100 admitted steps** (point expectation, not a post-hoc threshold).
- At least **six of the seven** remaining arms are predicted to become absorbed **by admitted step 7,200 inclusive**.
- **Reference:** 24 synthetic tapes, median absorption step **1,134**, range **56–7,116**. The synthetic tapes are the basis for the expectation, not prospective PF-1 observations.
- **Success accounting:** at tick 7,200 report count/7 reaching zone 5 by that point; count 6 or 7 supports the declared count criterion, otherwise criterion not met. Report each exact absorption step; censor those still moving at observation cutoff. Do not replace the seven-arm denominator.
- **No scientific interpretation implied:** terminal absorption reflects canonical graph dynamics; it does not demonstrate a mind, Outside agency, or an independently acting entity.

## C. Reporting-only requests (no changes to pinned files)

- Each weekly PF-1 audit should derive and display per-arm current zone, first-entry/absorption step (or right-censored), observation cutoff and ledger head.
- Split silent-ledger exposure into **moving** and **absorbed** ticks, explicitly retaining the source ledger byte-identical and using a separate derived, read-only report.
- No additional live arm reset, backfill, synthetic substitution, or modification of PF-1 acceptance, encounter, or notification rules.

## D. Operational isolation

Intake-lag catch-up is separately proposed, not approved here. The existing five-minute schedule, 20-verified-round batch limit, pinned source identities, sealed constants, and C1 isolation are unchanged until explicit operator approval.

## E. External timestamp verification

The following mandatory post-registration action is to request an RFC 3161 timestamp over these exact file bytes, retain the request and signed response, verify both signature and message imprint against a trust anchor, and archive a machine-readable receipt. A missing/invalid token is reported as **NOT SEALED**, never silently treated as success.
