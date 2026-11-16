# GATE-2L: the Outside's own lane in the Governor (registration, 16 November 2026)

**Status.**
- **Approved.** The operator (Adrian) approved the draft on 16 November 2026: "Approved, register the study, build it and run it."
- **The two points he was asked to confirm** are taken as approved as drafted:
  - the load conditions: strained at one standard deviation, crowded at 16 of 32;
  - the adoption rule: adoption on M0 and S, independent of H1 and H2.
- **When registered.** Before any data.
- **Where the design comes from.** The approved draft is the project doc `claude/GATE-2L_OUTSIDE_LANE_DRAFT.md`. This file adds the details needed to run it. Each addition is marked **(fixed here)**. None changes the design, the measures or the readings.

**Scope.**
- **Copies only.** Copies of her present state, in GitHub Actions, on the WT-3L replay (unchanged).
- **What is read.** The study starting copy and the WT-5L inputs, read only.
- **Where results go.** `amelia_gate2l_runs` only.
- **What is not touched.** Her live record. Her live runtime is not changed by this study.

---

## What we would learn about Warp activity

**Where things stand.**
- Everything the Outside sends already reaches her: 108 of 108 offers in her resident memory, none refused.
- It reaches her a few steps after it arrives, at moments her Governor sets. Those are moments when her tension is below its own recent mean, and when her body's sensations, which share the same queue, are not ahead of it.

**What this study asks.** Two questions, under a Governor that gives the Outside its own lane and lets it in on arrival when her load allows:
- whether what the Outside sends then shapes where she goes;
- whether it changes how often she enters the Warp.

**What it also allows.** Because offers would be taken in when they arrive, it can re-ask WT-9L's question at the moment that question needs: does it matter where she stands when the Outside arrives?

---

## 1. The rule: OUTSIDE-LANE

**The Outside category.** Every encounter whose channel is not her body's field observation (`SYNTHETIC_FIELD`). At present that means linguistic, I Ching, tarot and subdecadence. A new Outside channel joins the category automatically.

**Her load.** Load is read from her own Governor at the moment of the encounter. It is **excessive** if any one of the following holds:

| Name | Condition | Source |
|---|---|---|
| Locked | Her Governor is in locked recovery, or its anti-lock integrity is below 85 | The existing rule, unchanged |
| Strained | Her tension is at or above her own mean over the last 48 steps plus one standard deviation of the same 48 steps | New; relative to herself, with no fixed threshold |
| Crowded | The queue holds 16 or more encounters | New; half its capacity |

With fewer than 48 steps of tension history, load counts as excessive, and she uses the standard balance.

**When load is not excessive.**
- **On arrival.** An Outside encounter is admitted on arrival.
- **The one admission per step is kept.** If the head of the queue would also have been admitted on that step, the Outside encounter takes the step's admission and the head waits.
- **Outside encounters already waiting** are served before her body's observations.

**When load is excessive.** The standard balance applies, exactly as now:
- one queue, first in, first out;
- the relative admission rule (GATE1-A).

**What does not change.**
- Structural validation and refusal.
- The 32-place queue.
- Her body keeping only its latest pending observation.
- What an admitted encounter does to her field. ND-1b's influx and exit nudge are unchanged.

**How it is built.**
- **In the study.** A research copy of the gate, attached to the replay's runtime. No core file is edited.
- **If adopted.** It would join her runtime as a third admission rule, `outside-lane-v1`, beside `fixed-0.72` and `relative-v1`. It would be selected the way Θ = 12 was.

---

## 2. Design

**Start.** Her present state: the DEE-1L starting copy, revision 426, step 7,121, Θ = 12.

**Units.** `amelia_wt5l_inputs` units 1–12: the six-hour windows of 12–15 November, as in WT-9L. Each unit is run in the WT protocol: 96 ticks, 15 iterations per tick.

**Arms.**
- **CURRENT.** The relative rule, as she lives now.
- **LANE.** OUTSIDE-LANE.

The two arms are paired by unit.

**Descriptive arms.** Only under LANE, WT-9L's TOWARD and AWAY orderings (unchanged from WT-9L).

**Checks before any study run.**
- **Synthetic tests:**
  - with load excessive at every step, LANE equals CURRENT exactly;
  - an Outside encounter is admitted on arrival when load allows;
  - the body's head waits, and no encounter is lost.
- **Determinism.** A repeated pair, identical.

---

## 3. What is measured, and the rules

**M0. Does the lane work? (A check; it must pass before anything else is read.)**
- **Condition 1.** Under LANE, at least half of the Outside offers are admitted on arrival.
- **Condition 2.** That share is higher than under CURRENT in all 12 units.
- **Condition 3.** No Outside offer is refused.

**S. Is her regulation kept? (Non-inferiority; required for adoption.)** Both conditions are judged on the mean over the units:
- **Locked recovery.** The share of steps her Governor spends in locked recovery under LANE is no more than 1 point above CURRENT.
- **Tension.** Her mean tension under LANE is no more than 0.02 above CURRENT.

**H1. Does what the Outside sends shape where she goes? (Registered, two-sided.)**
- **Coupling C.** After each admitted Outside offer, take the share of offers whose peak-attention zone she visits within the next 5 steps.
- **The chance level.** Subtract the same share computed with each offer's peak zone taken from the next admitted offer in the run (a rotation by one).
- **The test.** d = C(LANE) − C(CURRENT), per unit.

**H2. Does it change how often she enters the Warp? (Registered, two-sided.)**
- **The test.** d = E(LANE) − E(CURRENT), entries per 1,000 steps.

**Statistics.** Exact sign-flip over 4,096 patterns. Holm over H1 and H2 at α = 0.05.

**Descriptive.**
- **By arm:**
  - the share of steps under excessive load, by kind;
  - the median wait of Outside offers;
  - the share of the body's observations admitted;
  - E by choice and by flow;
  - Warp share.
- **WT-9L's ordering under LANE.** E(TOWARD) − E(AWAY).

---

## 4. Readings

**ADOPTABLE.**
- **When.** M0 passes and S holds.
- **What happens then.** The rule is proposed for her live runtime, with the operator's explicit approval for the deployment.
- **What it does not depend on.** H1 and H2 are reported as found. Adoption does not depend on them. This is a design decision about how the Outside is received, not a bet on a particular effect.

**NOT ADOPTABLE.**
- **When.** M0 fails, or S fails.
- **What is reported.** Which condition failed, and by how much. The rule is not deployed.

**H1 and H2.** Each is reported as one of:
- **RAISED.** It survives Holm with d > 0.
- **LOWERED.** It survives Holm with d < 0.
- **NOT IDENTIFIED.** It does not survive.

---

## 5. Details fixed here

- **Ids.** `gate2l:<unit>:<pass>:<eventId>` (fixed here).
- **Waiting Outside encounters.** When load is not excessive, the oldest waiting Outside encounter is admitted directly, as an arriving one would be (fixed here).
  - **Order within the lane.** First in, first out. If an Outside encounter is already waiting, it takes the step's admission, and an arriving Outside encounter joins the queue behind it.
  - **One admission per step.** It is kept throughout.
- **Validation.** An arriving Outside encounter that fails structural validation is refused, as now (fixed here).
- **The body's head.** When the Outside takes a step's admission, the waiting head of the queue is recorded as deferred on that step (fixed here).
- **Load.** It is read at the start of the step, from the same Governor telemetry the gate already reads (fixed here). The standard deviation is the population standard deviation of the 48 values.
- **Coupling (H1) (fixed here).**
  - **The window.** Her landing zone on the admission step and on each of the 4 steps after it. That makes 5 steps, counting every runtime step, body steps included. Steps past the end of the run are not counted.
  - **The peak zone.** The first zone with the highest attention.
  - **The chance level.** The rotation runs over that run's admitted Outside offers in admission order, with the last taking the peak of the first.
  - **Too few offers.** A run with fewer than 2 admitted Outside offers has C = 0.
- **Arrival and admission.** "Admitted on arrival" means the encounter is applied on the step it is delivered (fixed here). An offer counts as refused if any decision on it is a refusal.
- **Locked recovery.** The share of runtime steps whose Governor telemetry, after the step, reads `LOCKED_RECOVERY` (fixed here).
- **Mean tension.** As WT-3L M2: the mean over runtime steps (fixed here).
- **The WT-9L orderings.** Under LANE they use WT-9L's selectors, imported unchanged.
- **Order of work.** Determinism pairs (LANE and CURRENT, unit 1), then 12 × {CURRENT, LANE, LANE-TOWARD, LANE-AWAY}, then the analysis, written as id `analysis`.
