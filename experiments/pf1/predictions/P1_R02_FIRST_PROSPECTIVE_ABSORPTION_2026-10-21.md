# PF-1 P1 — first prospectively observed absorption

**Observation class:** P1 prospective observation, NOT a retrospective registration amendment.

- Prediction registered after 40 admitted ticks in `experiments/pf1/predictions/P1_2026-10-21_REGISTERED.md`; external RFC3161 verification [run 39579850276](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39579850276).
- At registration cutoff, arm **R02 was in zone 1 and had not been absorbed**.
- **First prospective P1 absorption:** **R02 at admitted step 159**, route **1→2→4→5**, as independently derived from the immutable 520-tick runtime trajectory.
- Independently archived read-only evidence: `experiments/pf1/weekly-audit/PF1_P1_2026-10-21T104007Z_run39586242735.json`; [successful audit run 39586242735](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39586242735).
- Head at evidence cutoff 520: `035a251216a37f37c59ea7bb8284ba22cf328e14b9ea23dc7c35d1b678b9f3ac`.
- R02 remained in terminal zone 5 for the next **361** admitted ticks (ticks 160–520), as a consequence of the unchanged directed graph lacking an outgoing edge from zone 5.
- **Prospective accounting:** 1/7 absorbed among `R01,R02,R04,R05,R06,R07,R08`; six others right-censored at 520. C (step 32) and R03 (step 31) are *observed before P1 registration* and do not enter the predictive numerator.
- **Forecast unchanged:** at least 6/7 of original seven absorbed by tick 7,200, with anticipated median around 1,100.
- **Interpretation:** deterministic graph absorption, not an operational encounter, mind or Outside-agency inference.

**Data handling:** reporting-only record. No changes to P1 prediction bytes, live ledger, canonical source, genesis, scanner or thresholds.
