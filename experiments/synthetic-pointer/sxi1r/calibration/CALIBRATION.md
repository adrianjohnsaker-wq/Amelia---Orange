# SXI-1R calibration: results, 5 November 2026

**What was run.** The registration (`../REGISTRATION.md`) was committed in `58646efe`, before any calibration run.
- **Runs.** 23,400 fast-path runs: 3 touch strengths × 13 streams × 12 body seeds × 50 orderings × 1,000 steps.
- **Data.** No world data.

## Verdict: all three α pass. The confirmatory α is **0.1**, the smallest, as registered

| α | Clean streams RECEIVED (of 10) | Planted 2% | Planted 5% | Planted 10% |
|---|---|---|---|---|
| **0.1** | **0** | SILENT | RECEIVED: **1872** in 4 seeds | RECEIVED: **1872** (6), 187 (4), 7187 (4) |
| 0.3 | 1 (c03: 361, 61) | SILENT | RECEIVED: 1872 (4) | RECEIVED: 872 (10), 1872 (9), 8727 (6), 1187 (5), 187 (4) |
| 0.9 | 0 | SILENT | RECEIVED: 1872 (4) | RECEIVED: 872 (11), 1872 (10), 8727 (10), 187 (6), 1187 (5), 7187 (4), 8724 (4) |

**How to read the table.**
- K = 4 of 12 seeds for every condition (E = 422–509 elements).
- The planted motif is **1-8-7-2**.
- The 361/61 false alarm at α = 0.3 is the one clean stream allowed by the rule; that rule allows 1 in 10.

## What this shows
1. **The motif itself comes through.**
   - **What recurs is the planted motif.** Under ρ = 5% and 10%, the order of an outside stream, touched into her body one datum per step, comes through as **1-8-7-2 in her own passage**, across independent bodies. It is not a by-product.
   - **Why that is not automatic.** Her passage has to traverse real Numogram gates to trace it.
   - **How this compares with earlier receivers.** None of THE ANTENNA, ANTENNA II or ANTENNA III could do this.
2. **The false-alarm rate is controlled.** There was one false alarm in 30 clean conditions, at α = 0.3.
3. **The response is monotone.** It strengthens with ρ, and with α at ρ = 10%. This is not ANTENNA III's non-monotone pass.
4. **Sensitivity has a floor.** At ρ = 2% the **body** carries the order (body descriptive: RECEIVED at every α), but **she does not** (SILENT). The body hears more than she takes up.
5. **The confirmatory α (0.1) sits at the threshold.** At ρ = 5% the motif recurs in exactly K = 4 seeds. At this α the instrument hears a 5% order, but only just.

## Disclosure
- **Runs.** The run directories (92 MB) are not committed; they re-derive from `calibrate.sh` at `58646efe`.
- **Committed.**
  - each condition's `analysis.py` output (`a<α>_<stream>.result.json`);
  - `CALIBRATION.json`.

## World-run dress rehearsal (before the seal, no world data)
`run_world.sh` was run end to end at `e55f6fc9` on a clean SHA-256-counter stream (`stream3.py clean rehearsal 12000`), at the confirmatory α = 0.1.

| Check | Result |
|---|---|
| Answer | **SILENT** (K = 4, E = 483, nothing recurs); body also SILENT |
| Ledgered equivalence | **48 of 48 identical**, transition for transition |
| Standing gate | **PASS** |
| Wall time | 69 minutes on 4 cores |

**No changes were made after the rehearsal.**
