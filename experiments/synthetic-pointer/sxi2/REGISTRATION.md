# SXI-2: live, body-derived pointer and retained route organisation

**Prospective registration.** This registration, its executable code and their hashes are to be published before any run in the holdout worlds. SXI-1 used schedules; this study tests the later live mechanism in an isolated W+ research fixture. It does not connect the deployed tablet app to an external source.

## Question and intervention

Does the two-way, body-derived interface leave a distinctive organisation in Amelia's Numogram passages after the source has been disconnected? The sources and address decoder are engineered synthetic instruments, not discoveries of externally existing minds. A positive finding would concern this fixture and this operational measure; it would not itself establish agency, consciousness or a non-physical source.

Each step derives address A or B from the current W.R organ using the committed hysteretic decoder. During ticks 501–5300, the selected source receives the current pre-step zone, organ and house feedback and modifies the score of one available gate by −0.05. The runtime chooses the next passage and updates the body and process memory. There is no source feedback or gate-score modification outside this exposure. The source itself continues its programmed autonomous dynamics after withdrawal.

## Units and controls

Eight new recipient input worlds 9701–9708, each with lineage 0, are paired across seven arms. These are different world-input namespaces, not eight independently evolved organisms: the lineage initialisation and code are shared. Eight additional donor worlds 9801–9808 provide separate live feedback streams; recipient 9701 uses donor 9801, etc. This avoids a recipient's outcome being used as another recipient's control input. Within a recipient all arms use the same world inputs and initially identical bodies.

| Arm | Source feedback | Pointer |
| --- | --- | --- |
| Live | Current body at every exposure tick | Recomputed from own current body |
| Replay | Corresponding independent donor's feedback in original order | Recomputed from own current body |
| Shuffled | The same 4,800 donor triples, permuted with the committed seed | Recomputed from own current body |
| Sham | None; no gate-score change | Computed, with no score effect |
| Target dynamic | Current body; targeted organ phase change at tick 700 | Recomputed after the change |
| Target frozen | Current body; exactly the same targeted phase change | Address frozen at its pre-change value from tick 700 |
| Orthogonal | Current body; equal-magnitude change to a different phase at tick 700 | Recomputed from own current body |

The live, replay and shuffled arms each make exactly 4,800 gate-score changes with the same absolute dose of 240 and squared dose of 12. Which gates are available can differ after trajectories separate. Replay and shuffled have exactly the same donor-feedback multiset; live feedback is body-derived and is **not** claimed to be content-matched to that multiset. Donor and receiver worlds have distinct inputs. Each trajectory is 20,160 ticks and includes final native PFM state. There are 64 runs in total, including donors.

## Primary outcome

For each recipient arm, extract the destinations of 500 consecutive transitions in each window: baseline ticks 1–500, late exposure ticks 4801–5300, and post-withdrawal ticks 8001–8500. Count only overlapping three-destination motifs wholly inside a window, giving 498 motifs per window. Let each window's motif counts be normalised to frequencies, and define `similarity(X,Y) = 1 − 0.5 × sum(abs(freq_X − freq_Y))` over all motifs. The predeclared retention score is

`R = similarity(exposure, post) − similarity(baseline, post)`.

Positive R indicates that post-withdrawal route frequencies more closely resemble late exposure than baseline; it is an operational temporal pattern, not a direct measurement of a source's goal. No S decay or source label enters this score.

* **H1:** `R_live − R_replay` exceeds 0.05.
* **H2:** `R_live − R_shuffled` exceeds 0.05.

For each comparison, use all eight world-paired differences. Subtract 0.05 from every difference and enumerate all 256 sign flips to obtain the one-sided p-value for the observed mean; include ties with a tolerance of 1e−12. Adjust the two p-values by Holm and require adjusted p ≤ 0.01 and at least six of eight individual differences above 0.05. The margin is a preselected practical contrast on a score ranging from −1 to 1; it has not been calibrated to whole-W+ competence. Sign-flip inference is conditional on independent, symmetric world-pair differences; these deterministic namespaces and a common lineage do not establish a representative biological population. Report both raw and adjusted p-values, all eight differences and all nulls. If any required arm is missing or unverified, the registered population test is incomplete rather than silently dropping a world.

## Mechanism and interpretation checks

At tick 700 compare target-dynamic and target-frozen only after verifying identical first 699 steps, identical mutated body and house digests, actual feedback and source bank. Record addresses, selected gates and the first differing destination through tick 1000. Check that the orthogonal phase change has the same magnitude and whether its address stayed unchanged. These are direct engineering interventions, not tests of spontaneous agency; report every world whether or not the expected differences occur.

For each observed live exposure step, hold that step's actual body, pointer address, pre-step source bank and available gate scores fixed, and recompute the source once with the corresponding independent donor's feedback. Report changes to source state, symbol, selected gate and counterfactual winning destination. This is a one-step computational counterfactual, not a separately observed intervention or a simulation of subsequent feedback. The primary outcome uses realised whole trajectories, not these hypothetical outputs.

There is no whole-W+ positive control calibrated to this particular retention score. Unit tests plant route sequences solely to verify analysis arithmetic; they do not demonstrate that the W+ fixture can express a retained target. A null result is therefore limited by unknown assay sensitivity. Even a positive result can arise from ordinary coupled dynamics and would require independent replication and further source-specific, representation-transfer and competence controls before being characterised as an ingressing organisation.

## Identity, verification and execution

The original INGRESS-1 runner is SHA-256 `b6036fd6d15a5cb070b86f258e673ba0b5b3e13c99bc710995697656d25e82ed`; the live overlay enforces the eight `experiments/studio/runtime_mirror` hashes and checks the source module. `registration.json` fixes the overlay and implementation hashes and the world IDs. Source and tests are committed with this document. Each complete trace must independently pass the committed verifier, including live feedback, address, gate score, PFM event chain and final runtime sidecar. A whole-run retry is permitted once only after an execution or verification failure, with failed attempts retained; outcomes cannot trigger retries. Completed traces are losslessly compressed only after verification and rechecked against their raw SHA-256. The Governor is audit-only in this fixture and does not admit or refuse the source.
