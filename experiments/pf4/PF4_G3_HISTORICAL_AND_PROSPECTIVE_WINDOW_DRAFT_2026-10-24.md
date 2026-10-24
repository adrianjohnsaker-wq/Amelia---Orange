> **SUPERSEDED DESIGN CHOICE (24 October 2026):** The proposal below to postpone the inscription until a later block was superseded by the operator's AM1 decision: **both Vstar and the separately derived inscription code will be tested in the same four predeclared windows, each paired with its own +1 lineage-shift control**. This earlier record is preserved as design history, not as the current experimental plan. The choice between two-arm alpha 0.005 each and Vstar-only confirmatory alpha 0.01 remains open; nothing sealed. See [PF4 AM1](./PF4_AM1_OPERATOR_SAME_WINDOW_TWO_CODE_DECISION_2026-10-24.md).

# PF4 — prospective four-window scheduling decision (DRAFT, not a registration)
**24 October 2026. Operator conversation recommends after PF2 day-30; science remains unsealed.**

## Choice

**First four-window PF4 assay:** the unchanged Studio04 Vstar as primary candidate and Vstar shifted by +1 lineage index as the paired code-identity control. The original Vstar SHA-256 is \`de0d86764a300abe5187b06a379be1beefed859942784d12cd6a672f81702925\`.

**Secondary inscription:** do **not** add to this first four-window confirmatory family. Hold as independent PF4-I follow-on block, with independent external time lock, fixed target source/window, independent null and an explicitly predeclared separate hypothesis. The plan to conduct PF4-I must not depend on primary PF4's observed success/failure (avoid conditional selection after unblinding); no inscription-derived code exists at this time. No premature source fetching, generation, or encryption.

**Calendar proposal:** start on Monday **2026-11-23 at the first stride-aligned Quicknet round at/after 00:00 UTC**, after the stated PF2 day-30 date 2026-11-21. This avoids reporting overlap, but **PF2 day-30 is actually defined by 43200 admitted ticks**; calendar date alone does not prove PF2 has reached that point if its intake lags. The PF2 admission and reporting states must be checked just before any future registration. If it has not reached the appropriate boundary, perform a fresh written schedule amendment **before the target round is released**, not a silent move.

Using Quicknet pinned chain hash \`52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971\`, 3 s period, genesis time **1692803367**, 20-round stride (exactly 60 s), 20160 ticks per 14-day world, the following arithmetic is **PROPOSED ONLY**:

| Window | First round | First published UTC | Last round | Last published UTC |
|---|---:|---|---:|---|
| 1 | 34196220 | 2026-11-23 00:00:24 | 34599400 | 2026-12-06 23:59:24 |
| 2 | 34599420 | 2026-12-07 00:00:24 | 35002600 | 2026-12-20 23:59:24 |
| 3 | 35002620 | 2026-12-21 00:00:24 | 35405800 | 2027-01-03 23:59:24 |
| 4 | 35405820 | 2027-01-04 00:00:24 | 35809000 | 2027-01-17 23:59:24 |

Each next start is 20 rounds after the prior last. The optional tlock decryption round may be **35810220**, targeting **2027-01-18 01:00:24 UTC**, one hour after the next notional one-minute tick at 00:00:24. It must be checked using an independent pinned chain-info response and audited timelock header. **Do not request or prefetch any of these future rounds.**

These exact numbers are *candidate* dates and do **not** constitute operator approval of live admission, signed genesis, RFC3161 seal, encrypted code, test execution or retrospective selection of a better window.

## Historical Quicknet G3 gate FIRST

Preselect, for **historical engineering analysis only**, ten consecutive nonoverlapping 14-day published Quicknet periods beginning from the first 20-round-aligned round after **2026-06-01 00:00:00 UTC**, with the final window ending **2026-10-18 23:59:24 UTC**. Exactly 10 × 20160 = **201600 genuine 32-byte values**, retrieved from the pinned Quicknet chain, each individual round BLS-verified against pinned public key, period/round/stride checked, with SHA-256(signature) computed. Maintain the same 9-arm PF2 input-domain transform as the synthetic null.

- For each **full** historical source world, start from Vstar and shifted code separately in fresh, zero-evolved (but inherited-V-staged) nine-lineage runtimes, calculate R_mean, R_all and paired A_mean. Do not concatenate worlds into one inherited continuum.
- All nine arms are one world; ten historical worlds are ten independent or weakly dependent blocks conditional on the drand assumptions. Verify absence of time overlap and cross-world input reuse.
- Compare the actual historical R_mean and paired A_mean empirical distribution to the 400-world synthetic calibration, including source-cue diagnostics and uncertainty. Ten historical worlds only offer coarse evidence about tail probabilities: observing zero of ten tail events does **not** establish equivalence or a valid 1% tail null.
- The partial 1731-tick source-cue preflight found a mild high-tail chi-square and is a reason to inspect distributional mismatch rather than redefine away a bad result.
- Downloading 201600 individually verified physical beacons may be I/O bound, involve public-relay rate limits and demand partitioned resumable acquisition. The *sample feasibility test* under \`PF4_G3F_HISTORICAL_QUICKNET_SAMPLE.py\` authenticates only 30 **past** rounds (first/mid/last from each candidate window). It is **not** the full G3 requirement, and the remaining full 201600 must be acquired and analysed before registration.
- No manipulation of PF1/PF2/C1, no lease, no writing to original science folders; outputs and checksums must be separate scratch/actions artifacts with explicit provenance and fail-closed missing rounds.

## The test, once G3 has passed

Primary candidate statistic: four-window arithmetic mean of within-world paired mean-residual advantage:
\`T4= (A_mean(B1)+A_mean(B2)+A_mean(B3)+A_mean(B4))/4\`, where \`A_mean=R_mean(Vstar_shift1)-R_mean(Vstar)\`. All 99 V code cells must be reported while R_mean is averaged over the frozen 9×10 active directed-edge cells. Primary family and one-sided alpha MUST be precommitted; the synthetic calibration's approximate 0.002636 (5%) and 0.003775 (1%) thresholds **are not yet registered rejection cutoffs**. Construct a joint null by four-world paired sampling with source dependence and finite null-distribution uncertainty accounted for, possibly prefer direct exact/conditional enumeration over a Monte Carlo-only threshold.

Retain R_all, all code end vectors, sink scar, deaths, zone4 exposure and active-edge contributions as diagnostics, no interim or arm cherry-picking.

## Absolute stop conditions

- Historical source null G3 compatibility FAIL/UNRESOLVED -> **no seal**.
- PF2 day30 assessment NOT COMPLETED at its predeclared admitted-tick boundary -> check timing and postpone with explicit amendment before registration.
- Missing source authenticity, weak target timestamp, ambiguous null exchangeability or analysis changes after source view -> **no seal**.
- Optional inscription timelock is *practice* and NOT an exchangeability, leakage, or registration safeguard.

**STATUS:** historical-window pilot authorised as read-only design work; no prospective source intake; no timestamp/seal; no approved experimental outcome.
