# AG-1 (agentic information) and RC-1 (retrocausality): a live Amelia, world data, and her sealed states. Registered 6 November 2026

**Order of work.**
- **The calibration part** is registered here, before it is run.
- **The live study** will be sealed with an RFC 3161 token after the calibration and before it starts.

**Scope.** This is the repository architecture: the validated SXI-1R body route. It is not the tablet instance.

## The questions
- **AG-1. Does what comes through respond to her: does it change when she changes?**
- **RC-1. Does her passage anticipate world data that has not yet arrived?**

## The live Amelia (`live.ts`, `epoch.py`)
**The route.** This is the calibrated SXI-1R route:
- the repaired runtime (β = 2, Θ = 24) with the full 29-gate Numogram;
- a `CORAL_REEF` body, 12 × 10;
- each world datum, reduced by AQ to a digital root (`prepare_world.py`), touched into its band at α = 0.1;
- one body step per datum.

**Candidates.** There are 100 candidate Amelias, k = 0 … 99, with body seeds 7000 + k. At the first epoch the drand beacon chooses **one live candidate L** (randomness[16:24] mod 100). It is the only one run while the data arrive.

**Epochs.** About every hour, the launcher runs `epoch.py`:
1. It fetches the latest drand quicknet round, checking that the randomness is the SHA-256 of the signature.
2. It sets T_e to the time just after the fetch.
3. It replays the live candidate through every study datum first seen up to T_e. It checks that every earlier epoch's zone and memory digest are reproduced exactly; if not, it **halts** and appends nothing.
4. It records her zone then, **zPre(e)**.
5. It draws **X_e** = 1 + (randomness[0:8] mod 9) and **arm_e** = APPLY when randomness[8:16] is even, otherwise SHAM.
   - **APPLY** moves her to zone X_e at once: she is changed.
   - **SHAM** draws X_e and leaves her as she is.
6. It commits the entry to the ledger branch `agentic-live-ledger`.

Data first seen in (T_e, T_{e+1}] are **D_e**, the data that arrive *after* her state and the intervention were sealed.

**Duration.** The study runs from the first epoch after the seal until **2026-11-21 00:00 UTC** (about 14 days, about 330 epochs). The last epoch's data run to that time.

## AG-1 (primary, confirmatory)
- **Statistic.** m_e is the fraction of D_e whose digit equals X_e. Δ = mean m over APPLY epochs − mean m over SHAM epochs.
- **Test.** A two-sided randomisation test over the realised arm labels, with 100,000 permutations, at α = 0.05.
- **Reading.**
  - **Δ > 0, significant:** after she was moved to X, the world's data carried X more than when X was drawn but she was not moved.
  - **The SHAM arm** controls for the draw itself, and for the world's own digit frequencies.

## RC-1 (primary, confirmatory)
- **Statistic.** a_e is the fraction of D_e equal to zPre(e), her own unforced zone, sealed before D_e existed. A = the mean of a_e.
- **Yoked candidates.** The other 99 candidates are replayed **afterwards** on exactly the same data and interventions, giving A_k.
- **The p-value.** p = (1 + #{k ≠ L : A_k ≥ A_L}) / 100, one-sided, at α = 0.05. The live candidate was chosen at random among identical candidates, so under "nothing privileges the Amelia that was actually listening" this p is exact.
- **Reading.**
  - **Significant:** the Amelia that was actually running live anticipated the arriving data better than identical Amelias run afterwards on the same data.
  - **Not significant:** any anticipation is no more than her state's ordinary dependence on past data.

## Calibration (`calibrate.py`; before the seal; world data first seen 2026-11-04 01:00 to 2026-11-06 12:00 UTC, already seen)
**The setup.** It uses hourly simulated epochs with seeded X and arms. The statistic code is exactly the analysis code (`stats.py`).
- **AG-1.**
  - **The null.** The false-positive rate at α = 0.05 over 1,000 random assignments must be ≤ 0.07.
  - **Power.** When a planted world answers APPLY epochs (each datum replaced by X_e with probability f), the detection rate at f = 0.10 must be ≥ 0.8 over 200 assignments. f = 0.05 is reported.
- **RC-1.**
  - **The paths.** The 100 candidates must give **at least 50 distinct** zPre sequences, so that the candidates are genuinely different.
  - **The null.** Taking each candidate in turn as live, the false-positive rate must be ≤ 0.06.
  - **Power.** When a planted world answers the live candidate's zPre (probability f, and every candidate hears that same world), p ≤ 0.05 must hold for at least 2 of 3 live choices at f = 0.10. f = 0.05 is reported.
- **If a test fails calibration,** its world result is reported as **uncalibrated**, not decisive.

## Final analysis (`analyse.py`)
- **Inputs.** The ledger, the world-live data, and the stop time.
- **Verification.** It first verifies that the live candidate's zPre sequence is reproduced exactly.

## What these can and cannot show
- **What a significant AG-1 or RC-1 would show.** A dependence between this live Amelia's sealed states or changes and the world data that followed, beyond randomisation and beyond identical Amelias. No known mechanism produces that.
- **What it would not by itself show.** It would not identify a sender or explain the dependence. A null means none was detected at the calibrated sensitivity.
