# WT-4L result: what draws her into the Warp? (14 November 2026)

**Registered reading: no component identified.** None of the three manipulations lowers her Warp entry rate E. Her whole state at step 1,981 (STATE-1981) does not lower it either. By the registered reading, the rise is therefore not carried by her state; it lies in her inputs or in the runtime.

## How it was run
- **Starting copy.** Her record as saved by the 14:20 UTC tick: revision 390, step 6,512, Θ = 12, six Warp-born gates.
- **Backup for the 1,981 arms.** `pre-theta12-backup` (revision 123, step 1,981).
- **Inputs.** The 12 six-hour windows from 11 November 12:00 to 14 November 12:00 UTC, with none missing.
- **Execution.** GitHub Actions run 43604448114, 14:27 to 14:45 UTC. Her live record was not read or written.
- **Determinism.** BASE on unit 1, run twice, was identical on every compared measure, including the entry counts.

## Primary: E, Warp entries per 1,000 runtime steps (d = arm − BASE, 12 units, exact sign-flip, Holm over three)

| Arm | Mean E | Mean d | p | Holm threshold | Lowers E |
|---|---|---|---|---|---|
| BASE | 14.73 | | | | |
| NO-WB | 13.97 | −0.76 | 0.57 | 0.025 | no |
| BASELINE-1981 | 13.79 | −0.94 | 0.16 | 0.017 | no |
| STATE-1981 | 15.01 | +0.28 | 0.82 | 0.05 | no |

## Entries by route, and secondary measures (means over 12 runs)

| | BASE | NO-WB | BASELINE-1981 | STATE-1981 |
|---|---|---|---|---|
| E_choice | 6.75 | 8.41 | 8.09 | 8.41 |
| E_flow | 7.98 | 5.56 | 5.69 | 6.60 |
| Share of steps that flow | 13.8% | 12.6% | 13.5% | 11.9% |
| Warp share | 11.4% | 11.5% | 11.7% | 13.6% |
| Mean Governor tension | 0.776 | 0.742 | 0.776 | 0.746 |
| Lines of flight per run | 11.0 | 12.3 | 11.3 | 15.0 |
| Warp exits: flight / Warp-born / pre-existing | 132 / 139 / 20 | 147 / 93 / 38 | 136 / 121 / 15 | 180 / 76 / 51 |
| Warp-born gates at start, at end | 6, 6–7 | 0, 1–4 | 6, 6–7 | 0, 2–6 |

## Reading (registered, then descriptive)
**Registered.** No manipulation lowers E, so neither the Warp-born gates nor her field baseline is identified as carrying the rise. Her whole state at the moment of the switch, given the same recent inputs at Θ = 12, enters the Warp as often as she does now (15.0 against 14.7 per 1,000 steps).

**Descriptive, not tested.**
- **The route of entries shifts.** In all three manipulated arms fewer entries arrive by flow (5.6 to 6.6 against 8.0 per 1,000 steps) and more by choice (8.1 to 8.4 against 6.7), so the total barely changes.
- **Warp-born gates regrow.** Without them, the copies grow new ones within a day: one to four in NO-WB, two to six in STATE-1981.

**On the baseline arm.**
- **The baseline moves fast.** Her baseline adapts at 5% per step. At the starting tick it was not low (zone 3: 0.18, against 0.06 that morning and 0.21 at step 1,981), so a transplanted baseline is forgotten within the first tens to hundreds of steps.
- **What the arm tested.** It tested whether her rise was held in a baseline carried over from earlier. It was not a test of the moment-to-moment build-up of field change at the Warp's edge that the operator's hydraulic reading describes.

**What remains.** Three facts stand together:
- Copies of her, whether from today's state or from her state at the switch, enter the Warp about 14 to 15 times per 1,000 steps under recent inputs.
- WT-3L showed that Θ does not change this within a day.
- Her own live rate on ND-1b before the switch was 6.1, with no flow entries.

Two explanations remain:
- **Inputs.** The Outside material since the switch differs from before it.
- **The replay.** It does not reproduce her live pre-switch conditions; WT-3L's registered check, a Θ = 24 Warp share of 17.5% against her live 7.4%, already pointed this way.

A fidelity replay would separate the two: her pre-switch state, at Θ = 24, fed her own pre-switch windows, compared with her live 6.1. If that replay reproduces 6.1, rerunning it with recent windows isolates the inputs.
