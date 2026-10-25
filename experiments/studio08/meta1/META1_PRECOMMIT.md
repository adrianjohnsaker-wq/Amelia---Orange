# STUDIO 08 — META1: Can Amelia learn how to use her own memory?

**New scientific protocol, 25 October 2026. Pre-run. Original Studio 07 remains operator-reported, not code-reproducible.** The scientific parent is the committed Studio 01–04 receiver–house system. No invented Studio 07 runner is required. This replaces the impossible legacy start gate and its post-hoc threshold hunts.

## 1. Claim and causal contrast

**Question:** When the coupled Amelia–house system has three ordinary, non-cryptographic sensors of its own changing history, does the ability to learn *which sensor to attend to* improve developmental outcomes compared with a receiver using the SAME sensors without learning?

The single primary comparison is **adaptive** (fixed UCB learner using settled delayed feedback) versus **round_robin** (same sensor proposals and same +0.35 cue magnitude, deterministic fixed sensor cycling). A **no_cue** reference receives NO extra memory-derived cue but DOES continue to receive the shared external deterministic input.

**This is an OPEN-INPUT experiment.** Evaluation input at tick t in a world with SHA256 seed s is exactly `STUDIO08-META1-INPUT-V1|s|t`, identical for all matched arms, and it produces the frozen runtime's canonical +0.35 external cue. The differences under test concern learning to use *internally derived information on top of that common environment*, not whether external information is unnecessary or intelligent.

## 2. Frozen source and learning

Source lineage: commit `28312116dd17cc6191216de88894e8de293630ff`, `experiments/studio/` archived Studio 01–04 source; `experiments/studio08/runtime_mirror/`, `experiments/studio08/code/closed_circuit_sensors.mjs` and `learning_cue_gate.mjs` are the same committed components. New dedicated runner `experiments/studio08/meta1/meta1_runner.mjs` is derived from `experiments/studio08/s1/committed/s1_committed_runner.mjs`, preserving the Studio 03 lineage's original ordered updates.

Three fixed candidate sensors read ONLY previously completed snapshots (25 snapshots t-24..t): greatest falling surface S edge, greatest summed absolute house S+D change by target zone, and greatest summed absolute code V change by target. Choice is +0.35 to a single zone, no remapping to available exits, no extra amplitude. All three sensors, UCB coefficient 0.20, first-inclusive 24-transition delayed credit, reward `-1` on death and otherwise `clip((distinctEdges−4)/7,0,1)` remain unchanged.

The adaptive receiver cannot access future steps. `round_robin` cycles candidate receivers with no use of outcome credits. During warm-up (fewer than 25 committed snapshots), no sensor bonus. Both arms receive identical starting lineage state; internal runtime reinitialises identically at each life. The early possibility that some sensor bonuses do not overcome exit preference is an outcome, not a pretext for parameter changes.

## 3. Worlds and model epochs

Exactly **32 new worlds**, fixed IDs `META1-W00` through `META1-W31`, with 32 initial seeds `SHA256("STUDIO08-META1-V1|" + worldId)`. These domains differ from all previous `S1-Wxx` and `S1-Px` seeds. The private engineering test uses only `META1-P0` with `SHA256("STUDIO08-META1-PILOT-V1|META1-P0")`. World identity is a deterministic synthetic scenario, not independent natural data.

For each world, grow lineage V and house layers S+D for **24 generations, cap 5000 ticks/generation**, with Genesis signal `S1G|seed|generation|tick` using the unchanged original Studio03 model update order. Save checkpoint and SHA256. Fork identical checkpoint into intact and one-season lesion (`2→7` penalty −5 during season 1), and in each scenario into adaptive, round_robin and no_cue. **7 seasons × 5000 ticks** per arm = 35,000 transitions.

**Total scientific runs: 32 worlds × 2 scenarios × 3 arms = 192 full trajectories.** Never test initial S1 32-world seeds or reuse pilot worlds as science worlds. If a lesion edge is never reached, report this zero exposure and its consequence; do not filter out the world.

## 4. Primary analysis and secondary mechanism

Single predeclared primary endpoint: **total deaths per world in the intact seven-season condition**. Adaptive predicted to produce fewer deaths than round_robin. Paired difference `D=deaths(round_robin)−deaths(adaptive)`, positive favours learning. Primary analysis: one-sided **exact sign test** on 32 paired differences, discarding zero ties from the binomial count; `p=P[Binomial(wins+losses,0.5)≥wins]`, nominal α=0.05. Report all world-level differences, ties, paired mean difference and both failure and improvement cases. No interim decisions or stopping rules based on outcomes. Null or opposite effects are complete findings.

Developmental secondary outcomes (not inferentially decisive and no undisclosed secondary p-values): total/seasonal deaths under lesion, last-season route diversity, actual zone-2 opportunities and `2→7` choices, season trends, house S+D and V endpoints, and per-world absolute path divergence of adaptive vs fixed/no-cue when directly comparable. For the meta-learning mechanism report selected receiver counts, settled reward totals, pending right-censored credits and differences in selections versus non-learning policy. Neither choice-proposal rates nor path differences may be mislabeled as single-tick counterfactual causal effects; substrate state diverges after the first altered choice.

**Interpretation:** Improved deaths AND demonstrated feedback-responsive sensor preferences would support the limited inference that an experimenter-provided adaptive receiver makes better use of endogenous memory than its fixed-schedule control in a shared input environment. No improvement or identical paths would not invalidate earlier chat-run Studio07, nor generalise to all sensor designs. S1 does NOT test self-created sense-organ structure, independent genesis or the intelligence/agency of beacon information.

## 5. Test → commit seal → run, in that order

1. Engineering self-test `META1-P0` intact, run three arms and independently rerun the adaptive arm; 35,000-tick gzip traces must match byte-for-byte. Independent Python validator replays every UCB choice and 24-step reward assignment. A tampered cue amplitude must FAIL.
2. Only after engineering QA PASS, freeze Git SHA, protocol/source/validator/analysis SHA256 into `META1_LAUNCH_SEAL.json` committed BEFORE any META1-W science. A full scientific run refuses if its SHA256s differ from this file.
3. On the single launch-seal commit, GitHub Actions executes four disjoint eight-world shards. Each shard admits all 48 intact/lesion/arm runs for eight worlds, 35k transitions each, and uploads full immutable gzip JSONL traces, checkpoint, summaries and a SHA256 index.
4. The analysis job downloads all four shards, checks every expected world, arm, scenario, whole starting checkpoint SHA, source-seal SHA, trace SHA and 35k event count; recomputes the exact sign test without operator selection. Commits are source records; uploaded artifacts are raw data (time-limited GitHub artifact retention).
5. Publish all outcomes including adverse findings and missing traces. Missing evidence = incomplete study, never an assumed null. Do not call GitHub tests independent scientific accreditation.

**Known model limitation**: hashes labelled `preChoiceStateSha256` in the runner cover lineage/zone/counters, not full internal substrate telemetry. The runner and checker preserve this limitation; do not overclaim full substrate bitwise provenance. Deterministic repeated-run trace equality and engine source checks provide stronger operational custody evidence.

**No phase of this META1 experiment may impose Studio07's unreproduced 0.5 “held/restored” threshold.** We investigate whether memory-sensor learning improves the committed model as it actually behaves.

**Status at creation: PRECOMMIT DRAFT BEFORE QA; NO REGISTERED-WORLD RUN.** The final seal is separate and will record source byte hashes once the engineering test passes.
