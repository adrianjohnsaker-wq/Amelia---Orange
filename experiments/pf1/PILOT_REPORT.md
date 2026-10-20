# PF-1 synthetic pilot engineering report

**Decision: PASS SYNTHETIC ENGINEERING ONLY**

No live drand/NIST inflow was used. No beacon rounds were admitted. No live genesis was created.
No permission to begin live exploration is implied by an engineering PASS.

## Fixed engineering criteria

| Criterion | Verdict |
|---|---|
| namingTable | PASS |
| negativeZero | PASS |
| positiveAtLeast90Percent | PASS |
| namingAccuracy100Percent | PASS |
| shamParity | PASS |
| ameliaSynthetic10000 | PASS |
| hashChain | PASS |
| replayByteIdentical | PASS |
| everyEntryLocalRFC3161 | PASS |
| realFreeTSAOfflineVerified | PASS |
| resourceBudget | PASS |

## Controls

- Pure recurrence candidates: 21; encounters: 0.
- Constructed recovery: 5/5 confirmed.
- Confirmed pair naming accuracy 100%: true.
- Sham parity: true.
- Separate positive challenge graph: 8e221a600ea2cd35a1276db5b62d3700d14eebec76cc22308014e634b16406a5.

## Amelia-Orange synthetic description (never used to tune)

- Steps: 10000. Synthetic tape SHA-256: 5465c29c57ab10d27b1b5c88556e4b78662bcfd5867b541d8534f5dd3caa36c1.
- Detected candidates: 3; probed: 2; deferred: 1.
- Journalled Amelia synthetic encounters: 0.
- Entity encounter counts: {}.
- Historical depth against effective influence (samples each 1,000 steps): [{"step":1000,"storedEvents":1000,"activeEventWindow":48,"biasL1":0.32589999999999997,"saturatedZones":1,"hysteresis":0.0625},{"step":2000,"storedEvents":2000,"activeEventWindow":48,"biasL1":0.32589999999999997,"saturatedZones":1,"hysteresis":0.0625},{"step":3000,"storedEvents":3000,"activeEventWindow":48,"biasL1":0.32589999999999997,"saturatedZones":1,"hysteresis":0.0625},{"step":4000,"storedEvents":4000,"activeEventWindow":48,"biasL1":0.32589999999999997,"saturatedZones":1,"hysteresis":0.0625},{"step":5000,"storedEvents":5000,"activeEventWindow":48,"biasL1":0.32589999999999997,"saturatedZones":1,"hysteresis":0.0625},{"step":6000,"storedEvents":6000,"activeEventWindow":48,"biasL1":0.32589999999999997,"saturatedZones":1,"hysteresis":0.0625},{"step":7000,"storedEvents":7000,"activeEventWindow":48,"biasL1":0.32589999999999997,"saturatedZones":1,"hysteresis":0.0625},{"step":8000,"storedEvents":8000,"activeEventWindow":48,"biasL1":0.32589999999999997,"saturatedZones":1,"hysteresis":0.0625},{"step":9000,"storedEvents":9000,"activeEventWindow":48,"biasL1":0.32589999999999997,"saturatedZones":1,"hysteresis":0.0625},{"step":10000,"storedEvents":10000,"activeEventWindow":48,"biasL1":0.32589999999999997,"saturatedZones":1,"hysteresis":0.0625}].

## Resource and journal evidence

- Simulated inflow: 166.66666666666666 hours.
- Elapsed: 6.798469384 seconds.
- Seconds per simulated hour: 0.040790816304; budget: 60.
- Full journal entries (including constructed controls): 5.
- Silent ledger: {"schema":"PF1_SILENT_EXPOSURE_V1","stepsScanned":{"negative":1500,"constructed":60,"amelia":10000},"candidatesDetected":{"negative":21,"constructed":5,"amelia":3},"candidatesExamined":28,"probesRun":296,"probesNotApplicable":152,"candidatesDeferred":1,"shamMismatches":0,"syntheticOnly":true}.
- Local RFC3161 seals verified: 5; FreeTSA verified offline: true.
- FreeTSA pinned root SHA256: 2151b61137ffa86bf664691ba67e7da0b19f98c758e3d228d5d8ebf27e044438.

## Pilot constants and source SHA-256

- Source substrate pin: b67ec92e1cec13e9500d87292d59605428fb467e.
- Scanner window (pilot starting value, subject to separate live-stage freeze): 240 steps.
- Memory recovery delta (pilot starting value): 0.25.
- Maximum forks per candidate: 24; max horizon: 24.
- experiments/pf1/pandemonium-45.json: SHA-256 741cf541e6eda6973118ecb86018f6d1e69978a01603ac985ff6b4d091b08521
- experiments/pf1/core.mjs: SHA-256 7cc89cc99b25b35ec2311ee12e18d5fec60986664e05f156ced7ff33d59763e4
- experiments/pf1/pilot.ts: SHA-256 44f3eef4e55fc6b7bc8f86604ddf14b4152394d440db39a95fdf6004e724175b
- experiments/pf1/finalize-journal.mjs: SHA-256 576b5b287dcf774b2d5d6453a45c6af432202f0f31c6b4710acda6180ac02731
- experiments/pf1/seal.sh: SHA-256 4d462474bbeeef6d75808b4e49733f00846835d0b534cba83fd1b81d4d685c23
- experiments/pf1/PF1_SYNTHETIC_PILOT_WORK_ORDER.md: SHA-256 714186ede0d031bda4a0862143dd72c0a842d06c9a23c7d58251451057652480

## Limitations and boundaries

Constructed positive controls demonstrate recognisability of a built-in goal mechanism, not a natural mind.
A finding in the descriptive Amelia arm does not establish mindedness, agency or an Outside message.
Journal replay reuses saved TSA request times; it must not mint new timestamp receipts.
All live parameters, encounter margins and the live start require further operator review and explicit approval.
