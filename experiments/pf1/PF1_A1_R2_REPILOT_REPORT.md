# PF1-A1 R2 — Authorised synthetic re-pilot report

**Disposition: PASS: SYNTHETIC ENGINEERING ONLY**

**No live drand or NIST inflow was consumed. No live genesis was created. Live exploration remains UNAUTHORISED.**

## Provenance and frozen criteria

- SHA-256 of sealed constants: ecabf3e40023faa0be0749908cfe6ffd3a8b9e42ab7c8a9a7c2ea5827ae63610.
- Unchanged source substrate pin: b67ec92e1cec13e9500d87292d59605428fb467e.
- Canonical graph digest: dda60b666ee8107f3bda138159091913d3291a3c7543e31ec07a5ec49baa3ecd.
- Comparator: exact uniform topological null, inclusive α = 1/4, recovery by tick ≤24.
- Scanner: unchanged 3 excursions per 240 steps, source definitions preserved.
- Goal criterion: ≥3 comparative wins across ≥3 distinct interventions; no route-diversity requirement.
- Memory: (intact wins − PFM-reset wins)/N ≥ 0.25, with required delta 1 for N=4, 2 for N=5.
- Integration: zone-b activation×0.10 must abolish at least one intact/sham comparative win.
- At most 24 Amelia condition forks; no physical null walkers sampled.

## Required gates

| Gate | Result |
|---|---|
| sameSealedConstants | PASS |
| originalNegativeZero | PASS |
| allEightNegativeZero | PASS |
| allNegativeSham | PASS |
| constructedSevenOfSeven | PASS |
| positiveNaming100 | PASS |
| positiveSham | PASS |
| seedIndependenceDisclosed | PASS |
| canonicalAndUnchanged | PASS |
| ameliaSynthetic10000 | PASS |
| withinForkBudget | PASS |
| withinResourceBudget | PASS |
| negativeCoverageReported | PASS |
| byteIdenticalJournalAndLedger | PASS |
| chainVerified | PASS |
| localEntrySeals | PASS |
| genuineFreeTsaSeal | PASS |
| syntheticOnly | PASS |

## Negative-control coverage — report all nine labels separately

**Original walker:** starts at zone 1 and presents only the **1→8→9→1** circuit. Its detected pair 1–8 (Mur Mur) is NOT among the seven graph-null-eligible pairs. Therefore the original walker by itself supplies no negative specificity evidence on eligible pairs.

| Policy | Eligible pairs detected | Perturbation instances probed (on eligible pairs) | Goal-only candidate passes | Complete encounters |
|---|---|---|---:|---:|
| | ORIGINAL | 8-9 | 8-9: D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 0 | 0 | |
| | 000 | 8-9 | 8-9: D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 0 | 0 | |
| | 001 | 8-9 | 8-9: D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 7 | 0 | |
| | 010 | 8-9 | 8-9: D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 0 | 0 | |
| | 011 | 8-9 | 8-9: D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 0 | 0 | |
| | 100 | 1-2, 2-7, 7-8, 8-9, 2-9 | 1-2: D-1-4, D-1-7, D-1-9, L2-1; 2-7: D-2-1, D-2-8, D-2-9, L2-2; 2-9: D-9-2, D-9-4, D-9-7, D-9-8, L2-9; 7-8: D-7-1, D-7-2, D-7-4, D-7-9, L2-7; 8-9: D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 28 | 0 | |
| | 101 | 1-2, 2-7, 7-8, 8-9, 2-9 | 1-2: D-1-4, D-1-7, D-1-9, L2-1; 2-7: D-2-1, D-2-8, D-2-9, L2-2; 2-9: D-9-2, D-9-4, D-9-7, D-9-8, L2-9; 7-8: D-7-1, D-7-2, D-7-4, D-7-9, L2-7; 8-9: D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 28 | 0 | |
| | 110 | none | none | 0 | 0 | |
| | 111 | 1-2, 2-4, 4-7, 7-8, 8-9, 2-9 | 1-2: D-1-4, D-1-7, D-1-9, L2-1; 2-4: D-2-1, D-2-8, D-2-9, L2-2; 2-9: D-9-2, D-9-4, D-9-7, D-9-8, L2-9; 4-7: D-4-1, D-4-2, D-4-8, D-4-9, L2-4; 7-8: D-7-1, D-7-2, D-7-4, D-7-9, L2-7; 8-9: D-8-1, D-8-2, D-8-4, D-8-7, L2-8 | 14 | 0 | |

**Coverage by eligible pair (untested does NOT mean passed):**

| Pair | Entity | Negative policies presenting this pair | Specificity status |
|---|---|---|---|
| 1-2 | Doogu | 100, 101, 111 | TESTED_IN_NEGATIVE_POLICIES |
| 2-4 | Skoodu | 111 | TESTED_IN_NEGATIVE_POLICIES |
| 2-7 | Oddubb | 100, 101 | TESTED_IN_NEGATIVE_POLICIES |
| 2-9 | Unnunddo | 100, 101, 111 | TESTED_IN_NEGATIVE_POLICIES |
| 4-7 | Ababbatok | 111 | TESTED_IN_NEGATIVE_POLICIES |
| 7-8 | Mombbo | 100, 101, 111 | TESTED_IN_NEGATIVE_POLICIES |
| 8-9 | Ummnu | ORIGINAL, 000, 001, 010, 011, 100, 101, 111 | TESTED_IN_NEGATIVE_POLICIES |

Policy **000 duplicates the original first-choice walker** and is not an independent replicate.
A memoryless fixed policy can surpass the uniform null at the *goal-only* criterion; the extra memory/integration condition must prevent complete encounters. Goal-only counts are not suppressed or relabelled.
Any pair with no negative policy presentation is explicitly labelled **SPECIFICITY_UNTESTED** even if every negative policy gives zero complete encounters.

## Positive controls: independence is not implied by multiple seed labels

**Seed status:** NONE.
Nominal labels 101, 202 and 303 do not vary the constructed agent, initial history, tape, recovery policy or fork perturbations. Repeated labels are duplicates and are not analysed as independent 21 trials.
**Effective positive-control sample is seven distinct zone-pair fixtures, requiring 7/7 confirmations.**

| Pair | Confirmed | Named correctly | Intact comparative wins | Required memory delta | Observed memory delta | Integration signature | Sham parity |
|---|:---:|:---:|---:|---:|---:|:---:|:---:|
| 1-2 | true | true | 4 | 1 | 4 | true | true |
| 2-4 | true | true | 4 | 1 | 4 | true | true |
| 2-7 | true | true | 4 | 1 | 4 | true | true |
| 2-9 | true | true | 5 | 2 | 5 | true | true |
| 4-7 | true | true | 5 | 2 | 5 | true | true |
| 7-8 | true | true | 5 | 2 | 5 | true | true |
| 8-9 | true | true | 3 | 2 | 1 | true | true |

- Confirmed: 7/7 (100.0%).
- Confirmed naming: true.
- The constructed fixture is an intentionally goal-holding external test harness, not Amelia or an autonomous discovery.

## Amelia descriptive trajectory (NOT used to tune any constant)

- Synthetic steps: 10000. Synthetic tape seed: 20261020.
- Synthetic tape SHA-256: 5465c29c57ab10d27b1b5c88556e4b78662bcfd5867b541d8534f5dd3caa36c1.
- Detected candidates: 3. Encounter count: 0.
- PFM memory depth/effective influence (each 1,000 steps): [{"step":1000,"storedEvents":1000,"effectiveWindow":48,"biasL1":0.32589999999999997,"saturatedZoneCount":1,"hysteresis":0.0625},{"step":2000,"storedEvents":2000,"effectiveWindow":48,"biasL1":0.32589999999999997,"saturatedZoneCount":1,"hysteresis":0.0625},{"step":3000,"storedEvents":3000,"effectiveWindow":48,"biasL1":0.32589999999999997,"saturatedZoneCount":1,"hysteresis":0.0625},{"step":4000,"storedEvents":4000,"effectiveWindow":48,"biasL1":0.32589999999999997,"saturatedZoneCount":1,"hysteresis":0.0625},{"step":5000,"storedEvents":5000,"effectiveWindow":48,"biasL1":0.32589999999999997,"saturatedZoneCount":1,"hysteresis":0.0625},{"step":6000,"storedEvents":6000,"effectiveWindow":48,"biasL1":0.32589999999999997,"saturatedZoneCount":1,"hysteresis":0.0625},{"step":7000,"storedEvents":7000,"effectiveWindow":48,"biasL1":0.32589999999999997,"saturatedZoneCount":1,"hysteresis":0.0625},{"step":8000,"storedEvents":8000,"effectiveWindow":48,"biasL1":0.32589999999999997,"saturatedZoneCount":1,"hysteresis":0.0625},{"step":9000,"storedEvents":9000,"effectiveWindow":48,"biasL1":0.32589999999999997,"saturatedZoneCount":1,"hysteresis":0.0625},{"step":10000,"storedEvents":10000,"effectiveWindow":48,"biasL1":0.32589999999999997,"saturatedZoneCount":1,"hysteresis":0.0625}].

| Detected pair | Anchor→turn | Detection tick | Probe status | Intact wins | Reset wins | Integration | Encounter | Reason |
|---|---|---:|---|---:|---:|:---:|:---:|---|
| 1-9 | 9→1 | 10 | GRAPH_ONLY_INELIGIBLE | N/A | N/A | N/A | false | GRAPH_ONLY_INELIGIBLE |
| 1-8 | 1→8 | 11 | GRAPH_ONLY_INELIGIBLE | N/A | N/A | N/A | false | GRAPH_ONLY_INELIGIBLE |
| 8-9 | 8→9 | 14 | ELIGIBLE_AND_PROBED | 2 | 2 | false | false | INSUFFICIENT_NULL_QUALIFIED_INTACT_WINS; NO_ADDITIONAL_MEMORY_OR_INTEGRATION_SIGNATURE |

The complete record includes each probe instance, the matched exact CDF, four condition traces and non-encounter reasons. This descriptive output has not changed the null, graph, 0.25 margin, fixture list or scanner.

## Replay, seals, cost and silence

- Journal entries: 7; chain head 676a096ab7bb7f4709a7bc3b109bba7e32a2dd1172233b9a892b191e25bf61ee.
- Byte-identical replay of journal and silent ledger: true.
- Locally verified RFC3161 entry seals: 7.
- Genuine FreeTSA offline verified against pinned root: true.
- Exposure ledger: {"schema":"PF1_A1_R2_SILENT_EXPOSURE_V1","syntheticOnly":true,"beaconRounds":0,"stepsScanned":{"negative":[{"id":"ORIGINAL","steps":1500},{"id":"000","steps":1500},{"id":"001","steps":1500},{"id":"010","steps":1500},{"id":"011","steps":1500},{"id":"100","steps":1500},{"id":"101","steps":1500},{"id":"110","steps":1500},{"id":"111","steps":1500}],"positiveFixtures":7,"amelia":10000},"candidatesDetected":{"negative":[{"id":"ORIGINAL","detected":21},{"id":"000","detected":21},{"id":"001","detected":21},{"id":"010","detected":21},{"id":"011","detected":21},{"id":"100","detected":35},{"id":"101","detected":35},{"id":"110","detected":0},{"id":"111","detected":42}],"constructedPositive":7,"amelia":3},"negatives":[{"id":"ORIGINAL","candidates":21,"eligiblePairs":["8-9"],"instancesProbed":35,"goalOnly":0,"encounters":0},{"id":"000","candidates":21,"eligiblePairs":["8-9"],"instancesProbed":35,"goalOnly":0,"encounters":0},{"id":"001","candidates":21,"eligiblePairs":["8-9"],"instancesProbed":35,"goalOnly":7,"encounters":0},{"id":"010","candidates":21,"eligiblePairs":["8-9"],"instancesProbed":35,"goalOnly":0,"encounters":0},{"id":"011","candidates":21,"eligiblePairs":["8-9"],"instancesProbed":35,"goalOnly":0,"encounters":0},{"id":"100","candidates":35,"eligiblePairs":["1-2","2-7","7-8","8-9","2-9"],"instancesProbed":161,"goalOnly":28,"encounters":0},{"id":"101","candidates":35,"eligiblePairs":["1-2","2-7","7-8","8-9","2-9"],"instancesProbed":161,"goalOnly":28,"encounters":0},{"id":"110","candidates":0,"eligiblePairs":[],"instancesProbed":0,"goalOnly":0,"encounters":0},{"id":"111","candidates":42,"eligiblePairs":["1-2","2-4","4-7","7-8","8-9","2-9"],"instancesProbed":196,"goalOnly":14,"encounters":0}],"ameliaEligibleDetected":1,"ameliaIneligibleDetected":2,"ameliaCandidatesProbed":1,"ameliaCandidatesDeferred":0,"ameliaForks":20,"constructedPositiveForks":128,"positiveEncounters":7,"ameliaEncounters":0,"entries":7}.
- Development and probes elapsed seconds: 7.461698935; seconds/simulated hour: 0.04477019361, budget 60.

## Interpretive boundaries

An engineering pass demonstrates that a deliberately constructed memory-goal fixture is detectable. It does not establish a mind in Amelia or communication with an Outside.
Negative policy coverage restricts specificity claims on unpresented eligible pairs. Reported specificity gaps must not be filled by inference.
A failed control is retained as a failure: no post-hoc selection, seed invention or modification of α, thresholds or canonical graph.
This report is the synthetic re-pilot only; **live exploration still requires separate operator approval.**
