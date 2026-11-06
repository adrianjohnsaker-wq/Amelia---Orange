# CD-2 calibration: FAILS (6 November 2026)

**Registration.** `../REGISTRATION.md` (`a79497be`), committed before this calibration.

**Inputs.** The CD-1 calibration runs, which have the same streams, labels and `order.ts` outputs, and are deterministic. They were re-analysed with `cd2.py`. One correction was made to `calibrate.sh`'s loop, which stopped on a non-directory entry; the statistic is unchanged.

| Check | Result | Required |
|---|---|---|
| Clean false positives (20 tests) | **2** (c02: SubCrypt p = 0.019 and BarkerLoop p = 0.013) | ≤ 1 |
| Planted 2727, 5%: SubCrypt | not detected (p = 0.62) | STRUCTURED |
| Planted 3636, 5%: BarkerLoop | not detected (p = 0.34) | STRUCTURED |

## Why it fails
1. **The positive controls are not paths she can take.**
   - **Where she can come from.** Zone 2 is entered only from zone 1 or 7, and 3 from 2, 3 or 6.
   - **What the plants did.** 2727 or 3636 planted at random positions mostly arrives when she has no gate onto the pair. The planted order therefore cannot become an entry passage, and the received entry counts were at the shuffle mean.
   - **The contrast with NR-2.** A detectable motif must be a native path, as 1-8-7-2 is in NR-2.
2. **The clean criterion was set too tight.** With 20 tests at α = 0.05, about 1 false positive is expected, so "at most 1" fails by chance in roughly a quarter of calibrations.

## Status
**CD-2 is not sealed.** A further redesign (CD-3) would need:
- **Natural entry motifs** as positive controls: 8-7-2 onto SubCrypt (via the current of 8::1), and 2-3-6 onto BarkerLoop (gate then syzygy).
- **A clean criterion at its binomial bound:** at most 3 false positives in 20 tests.

Meanwhile, NR-2's calibrated order test (sealed; it runs on world data around 13 November) reports **any** n-gram that recurs in her passage through the world's order. Recurring forms that cross 2 ↔ 7 or 3 ↔ 6 will be reported descriptively as the CD reading.
