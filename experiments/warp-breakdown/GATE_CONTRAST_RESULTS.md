# Warp calibration at the adaptive source's gate contrast

**Exploratory result, 7 November 2026.** The 29-gate graph was installed only on copies of the archived live receiver state, followed by two strong synthetic entry cues. This is not a change to the live receiver or the tablet.

## Signal match

The archived adaptive-source trace (SHA-256 `57f6a117220d670f41848d54dc393b6ea8bd1bad472f969ebde69b7e981b7aee`) contains 1,920 live-source exposure offers. All 1,920 had the same ten-weight multiset. At zones 3 and 6, 1,162 had weights (0.055, 0.115), and 758 had (0.115, 0.055): in every case the absolute gate-relevant contrast was 0.060. The runtime multiplies attention weights by 0.9, so the corresponding 3-versus-6 score contrast is 0.054.

The earlier calibration matched the multiset but its planted 3/6 contrasts averaged 0.1084. This second calibration fixes the planted 3/6 weights at exactly (0.115, 0.055) or its swap, while retaining the full multiset and randomly distributing the other weights. The planted profile repeatedly favors one of the two candidates; it is not the original adaptive sequence or an outside source.

## Design and outcome

Sixteen independently seeded synthetic input histories started from the same preserved, graph-extended founder. Each history first received eight randomized matched-strength burn-in offers; paired experimental continuations then shared that exact prepared state. Each paired arm received 32 offers. A normal mode drained pending offers before new ones; a separate mode artificially preloaded one queued item and offered during drainage to test one-step delayed admissions. That stress condition is not a measurement of natural deferral frequency.

| Mode | Planted profile | Offers | Admitted | Delayed | Directly decisive |
|---|---|---:|---:|---:|---:|
| Drained | Target 3 | 512 | 512 | 0 | 54 |
| Drained | Target 6 | 512 | 512 | 0 | 24 |
| Artificially queued | Target 3 | 512 | 512 | 512 | 41 |
| Artificially queued | Target 6 | 512 | 512 | 512 | 31 |

Each decisive target-3 admission changed the immediate winner from a 3→6 crossing to a 3→3 dwell; each decisive target-6 admission changed a 3→3 dwell to a 3→6 Djynxx crossing. Scores were reconstructed for every step, and 128 representative decisions were also replayed from the same pre-step state with a uniform attention vector, whose contribution is constant across candidate exits. Offer steps were retained and matched to delayed admission steps.

## Retained memory

At the end of exposure, each recipient background was continued for 24 no-new-input steps with either its own entire `memoryState` or the other paired arm's entire `memoryState`. The non-memory serialized fields were asserted identical within each recipient's comparison. In all 16 input histories, target-3 donor memory produced more 3→3 dwells than target-6 donor memory, in both recipient backgrounds and both queue conditions. The median increase was 5.5 or 5 dwells in drained mode and 5 or 4.5 in the queued mode, depending on recipient background. Some large step-by-step trajectory differences are phase shifts; the dwell count is reported separately for that reason.

A post-run exhaustive two-sided sign-flip calculation on the 16 per-history dwell-count differences gives 2/65,536 for each background and mode **if paired signs are exchangeable under the null**. This is an exploratory calculation on intentionally opposing synthetic profiles, conditional on one founder; it is not evidence of an Outside source, independent agent, or a population of independent founders.

The intervention swaps the whole retained PFM, including event history, strain and hysteresis. It supports a causal role for PFM in these later paths; it does not isolate a specific admitted item or demonstrate task competence. The initial strong entry cue and full-graph addition remain explicit interventions.

## Audit

The plan and script were published before the run. The trace has SHA-256 `0d754bd41513e8404674fe55419c941af1d150c6ed5bff158ddda0781f34d725`. An independent Python implementation verified all 2,208 records, 128 burn-in offers, 2,048 experimental offers and admissions, original offer steps and delays, matched vectors, scoring components and follow-up paths. Two complete histories were independently replayed; their 276 records and all intervention results matched byte for byte.

[Download the complete evidence bundle](https://chatgpt.com/library?file_id=libfile_fc17247d082c8191a9894e0571f6c494&account_id=personal).
