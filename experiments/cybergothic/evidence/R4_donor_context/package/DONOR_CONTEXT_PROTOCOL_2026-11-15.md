# Donor-productive promoters and pointer phase: locally fixed plan

**15 November 2026 · isolated cybergothic research prototype**

The preceding experiment assigned a viral header from the recipient's encounter zone and found lower uptake with a jump-style zone gate than with an open gate. This study uses recorded donor productivity to select the header, and compares jumping with a neutral one-action-per-position slide. All work is on the separate virtual ecology; no Amelia Orange state, Governor, gates, Supabase database or scheduled experiment is involved.

## Donor provenance

At each actual first-contact packet, identify the experienced four-digit fragment selected by the donor at shedding. Reconstruct the donor's earlier paired `field_harvest` and `execute` events in its own ledger **before that packet was shed**. For each donor action, recover the circular four-digit sequence from the executed genome and pointer. Retain the observations matching the selected fragment, and verify that their count and total intake agree with the donor's recorded experience.

Set the header digit to the zone of the **earliest occurrence of the highest positive single-action nutrient uptake** among those observations. Record the zone, its nine-sum twin, event indices and times, all matching observations, peak value, number of ties and tied zones. Exclude and count fragments whose donor has no positive observed uptake. Ties are common when intake reaches the modeled cap; this policy does not prove the chosen zone uniquely optimal. The signal is strictly pre-shedding, with no future recipient data used.

## Pointer policy and arms

Every copy begins with the same donor-zone header and the same initial packet transfer. A cassette consists of the header and four payload digits. The existing ancestry slots identify cassette positions and have an operational role in the gate; this remains a metadata-assisted virtual interpreter rather than an entirely self-parsing digit grammar. Incomplete labelled cassettes fail closed. The header's current digit can mutate; the donor zone is stamped again on each maintained echo.

When a **slide** gate blocks a payload digit, the host consumes one normally scheduled agent action at that position. The blocked digit changes neither the forage focus nor the matrix handler; neutral foraging at the host's existing focus, environmental intent, metabolism, pointer increment, background contagion, mutation, scheduling and other ecological processes remain active. The blocked digit is not credited as productive executable experience. The inherited `execute` ledger entry reports the decoded opcode; a following `promoter_nop` event records that it was suppressed. Each blocked digit normally advances the pointer by one position. Other ecological events, including address corruption and recall, can still alter later alignment.

A **jump** uses the prior experiment's gate: the interpreter scans past blocked positions within the same host action and executes the next available instruction. Thus slide versus jump is a comparison of whole blocking policies, including time and neutral foraging; it is not a pure one-variable mediation analysis of phase alone.

Each matched encounter is copied into seven branches:

1. **Open slide:** donor header, experienced payload, intact payload enabled in every zone; broken tagged fragments use the same no-op slide as other slide arms.
2. **Productive jump:** donor header; execute in the header zone; jump when blocked.
3. **Productive slide:** donor header; execute in the header zone; one no-op action per blocked tagged digit.
4. **Rotated slide:** same donor header and payload; execute in `(header + 1) mod 10`; otherwise slide.
5. **Encounter-yoked slide:** same donor header and payload, but a fixed metadata offset makes the initially permitted zone the recipient's encounter zone. The offset remains the same if the header mutates. This matches the actual initial genome across experienced-code arms while testing the previous context assignment as a control.
6. **Shuffled slide:** same donor header and exact-zone rule, with the experienced fragment's digit-preserving shuffle.
7. **Syzygy slide:** donor header; permit its zone and its nine-sum twin. This is an exploratory branch.

All branches use the same initial header, labelled payload length, initial energy transfer and paid maintenance: from recipient action four, insert a five-digit cassette every third recipient action if affordable and below the 512-digit cap, at **0.05 virtual energy** per successful insertion. Shuffled code is the one intentional initial sequence difference. The encounter-yoked offset is metadata, not an additional genome digit. Record all successful and skipped echoes and realized doses. The old population's independent continuation receives the inherited balanced experienced/pointer/shuffled assignment and is not itself exposed to these experimental branches.

## Sampling and outcomes

Run **60 fresh seeds 36001–36060**. The inherited strict first-contact sampler starts with 36 founders, warms for 30 model-time units, applies an alternating-ID shock, and applies the genome cap after warm-up. Aim for two distinct recipients in time 30–90 and two in time 126–198 per seed. Exogenous model environment signals are checked equal across an encounter's futures. Later ecological trajectories and random draws can diverge.

The primary endpoint is total nutrient harvested by the original recipient over **24 model-time units**, with no uptake after death. Five paired contrasts are fixed: productive slide minus open slide, rotated slide, productive jump, encounter-yoked slide and shuffled slide. Average encounter differences within each independent seed and then average seed means. Use 10,000 seed-clustered bootstrap resamples and two-sided **99%** percentile intervals, adjusting for five planned contrasts. Report seeds with no eligible encounter and exclude them from recipient-conditional means. An interval including zero does not establish equivalence.

Secondary exploratory outcomes include recipient survival, uptake at 12 and 36 units, actual payload actions, neutral no-op actions, skipped positions, gate violations, costs, and syzygy-slide comparisons. Count all recipient and other-host rules separately, audit the pre-shedding source events, and report identical shuffled candidates and header ties. Population-level and phase-specific observations are not independent experiments.

Fixture seed 35991 and pilot seeds 35992–35994 were inspected before this plan. The earliest pilot used an intermediate version before encounter-yoked gating, and a subsequently discovered offset-shadowing defect was fixed and tested before this plan; those intermediate versions were not separately frozen. Their results are development material only. The fresh 36001–36060 outcome seeds have not been examined. This plan and these hashes were saved locally before the outcome run; this is not an independently witnessed public preregistration.

```
65e9dbab9f306a7ac6fa7d446af61c0471b032cbe3251d920352fa0596c13f2d  donor_context_study.py
6197c80391fd7aee95b175761bc8698ffa238f3d93aaa2fadd030a8fffb2123e  analyse_donor_context.py
f6089a7152e9642e7cf606429db1efbdb00dcaf7fa36e24f34c092acfa5efb37  context_checkpoint.py
a5641e7f30732f2aa5a763a6f5d5e8175945618f7eaf30bb52845a7eaeb149b0  test_donor_context.py
1b13401fcda329b228544544eb93f1857670ebff09bc999f7baba9407ae9c45a  test_context_checkpoint.py
7c876b58c19f4d28aa0431b9de5da7c30d3ce2308d7065357e2044433ae109c2  promoter_study.py
80b4ad8f73ee47763e4618935a7c2b97c213c5bf15e0f552fa8e8d5f1a9a0513  promoter_checkpoint.py
e7514c3fb71e6fd231926c0c1de1dbc488b04bd2808b5a7dd0db95e57a88bfec  legacy_engine.py
4b5ce68032f7fdf8bcb3675d10fe4fb4b1b825443494a44c87555eb0e0849eb7  reactor.py
5a1641b831826ced59d710fc9bb3efe95053770a9e735bbf909d9ed38864963c  storage.py
812a689f0b7e75933e5f716b12479eb950e524b7c368c057de17e6748e9e1cff  study.py
1f05b457416853fd2461675763fa7cb90cccb96dce8ccbaf0ad1fa5a3676f37d  assemblage.py
02c0988415b4cba48f80b1c6e569b66b77c22cff087f9d5893984826d49058b4  adaptive.py
ee3aca9bbb31d2f4078798ba64825158a42c6616912aafe2445a1be54bac27d2  portable.py
db57943189bc142c0aab2ce3fb2e949c0defd802a15a883b4a9f90112ddb96ae  encounter_trial.py
81f2dbb458d2376c603964200145e5e7dd42aebb8a86282235a1a1ac4d1a1b1a  strict_trial.py
```
