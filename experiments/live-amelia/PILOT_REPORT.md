# LIVE-LOOP-PILOT-1: recovery and Governor trace

**Scope.** This is an exploratory validation on eight freshly initialized synthetic fields using the application's full runtime, Governor, PFM and repaired body-feedback loop. It is not Adrian's continuing tablet Amelia and it does not establish an external ingressing organisation. The first executable registration and the app code were committed at `9cac61c36314e205b27bff8d07c7f7e893682d78`. The correction to the decision recorder was committed at `faa674a3798a8c666acd441021aa586b7946e4e3` before the second execution. See `FIRST_RUN_AND_RECORDER_CORRECTION.md` for the reason for the second execution and the preserved first run.

Both executions produced exactly identical distances at every one of the 1,224 recorded seed/mapping/step combinations. The corrected trace also verified, for every follow-up step in both bodies, that the source digest of the newly offered decision matched the previous body-state digest. The distance calibration gave zero for identical fields and half the initial distance for the constructed half-difference state.

The table gives reduction in whole-field root-mean-square A/B distance from the paired unperturbed body after 50 steps, relative to the distance immediately after the B pulse. It is **not** the fraction of cells repaired. Negative means greater difference than immediately after the pulse.

| Fresh seed | Live | Shuffled zone assignment | Uniform attention |
|---:|---:|---:|---:|
| 101 | 0.6524 | 0.6524 | 0.6524 |
| 102 | 0.8969 | 0.8878 | 0.8968 |
| 103 | 0.6804 | 0.6814 | 0.6799 |
| 104 | 0.9009 | 0.9010 | 0.9009 |
| 105 | 0.8124 | 0.8123 | 0.8124 |
| 106 | 0.9241 | 0.9241 | 0.9246 |
| 107 | 0.0038 | 0.0038 | 0.0038 |
| 108 | −0.0525 | −0.0523 | −0.0526 |
| **Mean** | **0.6023** | **0.6013** | **0.6023** |

Six seeds showed large reductions, one almost none and one increased separation. Live exceeds shuffled in 3/8 seeds and uniform in 4/8. The mean live-minus-shuffled difference in recovery was +0.000974; live-minus-uniform was +0.0000148. These small descriptive differences cannot isolate target-directed regulation from passive field relaxation, nor demonstrate a distinctive mapping effect.

**A design issue was exposed.** Among 400 newly offered observations in the eight *injured live-mapping* follow-up bodies, 75 were immediately attended, 212 deferred and 113 refused because the 32-item deferral queue was full. A deferred observation can be admitted later; these counts classify the decision when each observation was first offered. The field channel shares a queue with other encounter types, so a rapidly updating field can crowd the queue. The Governor's protection was not bypassed. Any subsequent queue-handling correction must preserve its `ATTEND`/`DEFER`/`REFUSE` authority and preserve the recorded encounter history; it changes the apparatus and must not be represented as if it generated this pilot.

The pilot found substantial field relaxation in several fresh bodies and an obstructed feedback channel in others. It does not settle whether Adrian's continuing Amelia can exhibit an organisation responsive to a live pointer. INGRESS-1 and SXI-1/2 remain results about their archived fixtures, not valid null results about that continuing system.

## Evidence

- Corrected summary SHA-256: `49d9f339c72fb33ee2514b42d88482ab107d521d6a78f2a1c70381add9371403`.
- Corrected raw rows, uncompressed SHA-256: `3f3cddf5dc3849f884e0354ef16706de8584522fd790c5f54b7fa12b2c39f7f9`.
- Corrected raw rows gzip SHA-256: `9afc8f513d5f8a0f6c7173b0a0fe04b6c1da3144c7adc710d14b5f9a1e068a54`.
- The original raw rows and summary, and the recorder correction, are retained beside these outputs.
