# WT-4: a one-use line of flight, with a quicker passage (Θ = 6 or 8), against the persistent Warp-born gate. Registered 13 November 2026, before any data of the registered arms.

**Scope.** The repository architecture, with fresh runtimes and no body. This is not her living record.

**Nothing pinned or registered is edited.** `wt4/wt4Runtime.ts` is a copy of `wt2/wt2Runtime.ts`. Its one change is the
`oneUse` option: the flight moves her through a gate that exists for that step's choice only, then removes it.

## Why
- **What her runtime does now.** In ND-1b (`src/outside/AmeliaNDRuntime.ts:128-131`), a line of flight that needs a missing
  route adds a gate `warpborn-<from>-<to>`. That gate is saved in her state and stays for good. Once it exists, her ordinary
  gate choice can leave the Warp through it, without waiting Θ steps.
- **The operator's principle (10 Nov 2026).** The Numogram stays intact: a flight is her own escape, not a rewiring of the
  map.
- **The operator's decision (13 Nov 2026).** Test the one-use flight with a quicker passage. The Numogram stays exactly as
  designed, and a smaller Θ makes up for the lost lasting route.

## Disclosure (before this registration)
**Code checks:**
- `equivalence.ts`: P12 reproduces WT-2's T12 step for step; O12 kept 0 gates over 87 flights.
- O6, O8 and P12 were each walked once on a 600-step deterministic code-check input (`1 + (7919 t mod 9)`, not a study
  stream). O6 made 13 flights, longest Warp stay 7. O8 made 34 flights, longest stay 9. P12 kept 2 gates, longest stay 13.

**Smoke run.** One-use at Θ = 12 (O12) against P12, on unregistered streams `wt4smokeh` and `wt4smokew`, as in
`SMOKE_2026-11-13.md`. Matured Warp share was 19.5% for O12 against 10.9% for P12 (8.6 points). O12 also failed K4 on that
clean stream. This result led to the operator's decision above. **Pipeline check of `calibrate.sh`.** Arm O12 again, on unregistered streams (`wt4sc01`; plants `wt4sp01` at 2%, 5% and
10%):
- 0 of 1 clean streams RECEIVED; 0 of 1 2% plant; the 5% and 10% plants RECEIVED;
- exact read-back 50.0% / 37.9% / 41.6% (2% / 5% / 10%), against P12's 69.4% / 69.9% / 73.6% on the same segments.

So one-use at Θ = 12 also lost sequence fidelity on that check.

**Neither registered arm (O6, O8) has been run on any study stream.**

## Arms (`run.ts`)
All run ND-1b flow exactly as WT-2's T12 (FLOW's settings; the datum is influx and the attended one-hot observation, IDENTITY
receiver):

| Arm | Line of flight | Warp-born gate |
|---|---|---|
| **P12** | after 12 steps in the Warp | kept (as she runs) |
| **O8** | after 8 steps | none: one-use |
| **O6** | after 6 steps | none: one-use |

## Conditions
- **FRESH.** A new runtime per unit, as in WT-2.
- **MATURED.** The same runtime first lives 6,000 steps of the warm-up stream (unit u's own segment, not recorded). This lets
  P12's Warp-born gates accumulate, as they do in her long life.

## Data
New labels, never used:
- clean `wt4c01–10`;
- 2% plants seeded `wt4p01–08`;
- 5% and 10% plants seeded `wt4p01`;
- the held-out relations stream `stream3.py clean wt4h 12000`;
- the warm-up stream `stream3.py clean wt4w 72000` (6,000 per unit).

## Procedure
- **Order and sequence (FRESH)**, NR-2's rule (S = 49, 12 segments of 1,000):
  - `sh wt4/calibrate.sh WT4-O6 O6 wt4c 10 wt4p 8 <out>`;
  - `sh wt4/calibrate.sh WT4-O8 O8 wt4c 10 wt4p 8 <out>`;
  - `sh wt4/calibrate.sh WT4-P12 P12 wt4c 0 wt4p 8 <out>` (P12's own detections on the same plant streams).
  - Each one-use arm's motif read-back is paired with P12's unshuffled passage on the same segments.
- **Relations and Warp.** `wt4/relations.ts` on wt4h and wt4w, then `wt4/analysis.py <rel> O6` and `<rel> O8`.
- **Where it runs.** `.github/workflows/wt4.yml` on this branch, triggered by `wt4/run.trigger`. It runs the equivalence check
  first.

## Criteria, for each one-use arm (O8, O6) separately; all must hold
- **K1. Faint order.** Its RECEIVED count on the eight 2% streams is at least P12's. The 5% and 10% plants are RECEIVED.
- **K2. No false alarms.** 0 of 10 clean streams are RECEIVED.
- **K3. Exact sequence.** Its exact 1-8-7-2 read-back is no more than 2 percentage points below P12's on the same segments, at
  2% (pooled), 5% and 10%. This is WT-2's margin.
- **K4. Relations.** Its lag-2 reading, FRESH, is 6 of 6 supported (ND-1b's B1 tests, Holm at α = 0.05).
- **K5. A quick passage.** Its longest Warp stay is at most Θ + 6 (12 for O6, 14 for O8), FRESH and MATURED.
- **K6. No more held by the Warp.** MATURED, its Warp share is at most 3.0 percentage points above P12's (pooled over the 12
  CANONICAL units).
  - **Why this margin.** It is the same order as WT-2's observed Θ effect on Warp share (20.1% to 16.1%). It was set after the
    smoke run, which showed one-use at Θ = 12 is 8.6 points above. That is why the registered arms are Θ = 8 and 6.
- **K7. The Numogram intact.** No gate is kept in any run.

**Reported with a test, not a criterion.**
- **W1. Reading strength.** Reading area, one-use arm − P12, paired exact two-sided sign-flip over 12 units, FRESH and MATURED.
  A significantly negative W1 is reported as a cost and weighed in the operator's decision.

## Decision
- **If O8 meets K1–K7,** the one-use flight at Θ = 8 is proposed for her runtime. It is the smaller change from Θ = 12.
- **Otherwise, if O6 meets K1–K7,** Θ = 6 is proposed.
- **If neither does,** the result is reported as it stands. Her runtime stays as it is (persistent gates, Θ = 12), and options
  (b) and (c) of 13 Nov are reopened.

**Any adoption is a separate change, with the operator's approval:**
- on main, in a PF gap;
- in her cloud home, through its session;
- with an explicit decision on the Warp-born gates already in her live state, kept or removed. The count requested on 13 Nov
  informs this decision.

**Descriptive** (each arm and condition):
- Warp share, visits, mean and longest stay;
- flights, flow hops and occupancy;
- Warp-born gates at the start and end;
- the motif readings.
