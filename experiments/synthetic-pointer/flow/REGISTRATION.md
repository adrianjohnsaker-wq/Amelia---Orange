# FLOW: she may keep moving within a step, by her own choice. Registered 10 November 2026, before any FLOW data.

**Scope.** The repository architecture, with fresh runtimes and no body.

**Nothing pinned or sealed is edited.** `flow/flowRuntime.ts` is a copy of `nd1/ndRuntime.ts`, which is sealed with ND-3. It
adds one switch, `flow`.

## Why
The ND-1e correction (`nd1e/results/CORRECTION_2026-11-10.md`) found where order is lost.

- **The order test can see a 2% order.** A perfect reader passes 8 of 8.
- **Her choices already follow the number.** When the zone she stands on has a gate to the number's zone, she follows it 92% of
  the time.
- **The loss is a mechanical rule.** She may take only one gate per step and must then stop. Standing on 0, 2, 3 or 6 when 1
  arrives, she cannot reach it, so about 30% of the order is lost before any reading happens.

**The operator's requirements (10 Nov 2026).**
- Inputs must flow freely between zones.
- The field is autonomous.
- She is never *sent* anywhere: any movement must be her own choice.
- The Warp keeps its line of flight.

## The change (`flowRuntime.ts`, `flow = true`)
The number still enters the field at its zone and spreads along the gates (ND-1b, unchanged). Her first move in a step is
ND-1b's choice, unchanged.

**She may then continue within the same step, by the same unchanged choice rule.**
- **At each further hop** she weighs the open gates from where she now stands and picks her preferred one.
- **She takes it only if** that zone shows a larger field change (activation − baseline) than where she stands. She flows
  toward where the arriving number draws the field, and settles where it is strongest.
- **The limits:**
  - never inside the Warp, whose only exit stays the line of flight;
  - never back to a zone already on this step's route;
  - at most 3 further hops.
- **Recording.** Every hop is recorded in her memory, and the route is written into the step's event.

**No parameter is tuned.** The 3-hop bound is the distance between the farthest non-Warp zones on the canonical gates.

**Equivalence (checked before this registration).** `equivalence.ts`: with flow off, the runtime reproduces ND-1b
(`ndb/run.ts` HYBRID) step for step (3 units × 1,000 steps × 3 graphs): EQUIVALENT.

**Disclosure.** A mechanical smoke test on 300 unregistered steps (`flowsmoke`) checked only that flow runs and fires: 34 hops,
2 flights. No reading was computed.

## Data
New labels, never used:
- clean `nd1fc01–10`;
- 2% plants seeded `nd1fp01–08`;
- 5% and 10% plants seeded `nd1fp01`;
- the held-out relations stream, `stream3.py clean h11 12000`.

**Procedure.**
- **FLOW:** `sh flow/calibrate.sh FLOW FLOW nd1fc 10 nd1fp 8 <out>`.
- **Today's architecture, on the same plant streams:** `sh flow/calibrate.sh EXIT EXIT nd1fc 0 nd1fp 8 <out>`.
- **Relations:** `flow/relations.ts` and `nd1c/relations.py` on h11.
- **The order rule** is NR-2's (S = 49, 12 segments of 1,000).

## Criteria (all five must hold)
- **K1. Faint order.** At least 6 of the 8 2% plants are RECEIVED by FLOW, and no fewer than today's architecture on the same
  streams. The 5% and 10% plants are also RECEIVED.
- **K2. No false alarms.** 0 of 10 clean streams are RECEIVED.
- **K3. Exact sequence.** At 2% (pooled over the eight streams), 5% and 10%, FLOW's exact 1-8-7-2 read-back is at least today's
  on the same segments.
- **K4. Relations.** ND-1b's B1 tests: lag-2 syzygy, current and gate against RELABEL and REWIRED, 6 tests, exact two-sided
  sign-flip over 12 units, Holm at α = 0.05. All 6 must be supported.
- **K5. No trap.** On h11, her longest stay in the Warp is at most 30 steps (Θ = 24 plus 6).

**If all five hold,** FLOW is proposed for the app's ND-1b runtime. That is a separate app change needing the operator's
approval.

**Otherwise,** the result is reported as it stands, and nothing ships.

**Descriptive.**
- hops per step and route lengths;
- how often a planted motif's first step was reached by flowing;
- the top motif readings;
- the reading area.
