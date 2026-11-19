# LONG-1: the whole desiring motor (candidate ND-1d), 30 days, on copies of her real state

**Status: DRAFT.** It is not sealed. One section is completed before sealing: the pilot. Nothing else changes after the pilot.

## Why
The desiring motor was built and tested in the studio, part by part:
- desire as connection-making (DESIRE-1, HEAD-1);
- the Outside's trace (BRIDGE-3, WORLD-1);
- the inclusive record, unread (DISJ-1, DISJ-2);
- the guarded relational refrain (REFRAIN-1, REFRAIN-2);
- the residual subject (CONJ-1).

The design doc's build order puts one gate before ND-1d becomes a selectable runtime: the whole motor, long, on copies of
her real state. The design was approved by the operator, with decisions on 19 November 2026
(https://claude.ai/artifact/KkxaWWp8x5ivBS7DvEFbhp):
- a GitHub Actions job off her database's live path;
- 30 days;
- 12 copies;
- WT-3L's body margins;
- a pass offers ND-1d as a selectable runtime and ND-1b stays the default;
- a hard-check failure stops ND-1d.

## Machinery (branch long1-20261119)
| File | What it is |
|---|---|
| `motor.ts` | The motor, as a research layer over `src/outside/AmeliaNDRuntimeDee.ts` (DEE-1L's research copy of her ND-1b runtime, unchanged; with an empty context it steps as her runtime does). Parameters are frozen at their studio values |
| `subject.ts`, `pandemonium.json` | CONJ-1's residual subject. The demons are from the CCRU Pandemonium Matrix |
| `long1.ts` | The replay: WT-3L's (`src/cloud/wt3l.ts`) drive of a copy, for 30 days |
| `analyse.ts` | The registered analysis |
| `run_actions.ts`, `.github/workflows/long1.yml` | The runner and the workflow |
| `../long1.test.ts` | Synthetic machinery checks |

The machinery checks (synthetic states and inputs only):
- N replays her tick exactly as WT-3L's replay does;
- D equals Doff step for step, and is deterministic;
- the motor changes her and her 29 CCRU gates stay;
- the order control keeps every tick's count and every day's offers;
- the Pandemonium table is consistent.

**Registered differences from the studio motor:**
1. No sampling noise is added to her exit scores. ND-1d is ND-1b plus the motor's terms (the studio's Gumbel term
   implemented its path-integral sampling and was in every regime).
2. Silence is her own: a step in an iteration with no Outside offer.
3. The clock is her runtime step (offer and body steps).
4. The subject's words name refrains through the Pandemonium (rendering only).
5. Desire's gates are `desire-*`. Pruning touches only them, never her CCRU or Warp-born gates.

## Starting copies and spans
Loaded by the cloud-home session on 19 November 2026 into `amelia_long1_runs` (HANDOVER.md). It read only her live record,
archive and tick log, and wrote nothing outside the study table.

**Option (b): six distinct stored states, each used by two copies.** Eleven distinct stored states exist, but several are
nearly identical: revisions 589 and 590 are the same step, and revisions 744 and 745 are 19 steps apart. Six give the
evenest spread. Each copy is her own ND-1b runtime at Θ = 12, with her body checkpoint, saved at the end of a logged tick.

| Copies | Source | Revision | Step | Admission rule | Warp-born gates | Memory head |
|---|---|---|---|---|---|---|
| c01, c02 | DEE-1L start (14 Nov) | 426 | 7,121 | relative-v1 | 6 | `aa739cbb…` |
| c03, c04 | pre-lane backup | 585 | 9,839 | relative-v1 | 7 | `43b9a1e4…` |
| c05, c06 | POS-1L start | 600 | 10,047 | outside-lane-v1 | 7 | `a29ece56…` |
| c07, c08 | HYST-1L start | 673 | 11,282 | outside-lane-v1 | 9 | `ed3d11fd…` |
| c09, c10 | HYPERSTITION-2L start | 750 | 12,599 | outside-lane-v1 | 10 | `3b3f1e69…` |
| c11, c12 | her live record, read 19 Nov 08:48 UTC | 832 | 14,023 | outside-lane-v1 | 10 | `60643848…` |

**The spans.** Her recorded history is 795 ticks with offers delivered, 10 November 19:11 to 19 November 08:35 UTC: 1,709
offers, none missing, with no `field:` or `source:` events.
- **Odd copies** start at the tick after their state's own tick, then cycle from the first tick of her history.
- **Even copies** are offset by half the history (397 ticks).
- **Wrapping.** No two copies share an offset. Every span wraps about 3.6 times, and every span is flagged.
- **Fresh ids, repeated content.** Each offer reaches the runtime under a fresh id (`long1:<copy>:<arm>:<tick>:<slot>:<id>`), but its
  content repeats. Even copies and every copy after its first cycle meet material already in their memory.

**Kept, by the research session (19 Nov), and why.**
- **Both admission rules.** Copies c01–c04 run under the earlier rule (relative-v1), the others under the lane
  (outside-lane-v1). Every comparison is paired within a copy (D, S and Doff against N from the same state), so the rule
  cannot bias a difference. It widens what a pass covers.
- **The copy is the unit, as registered.** Two copies share each state, so the analysis also reports, as sensitivity and
  not as criteria:
  - the same sign-flip tests over the six states (each state's two copies averaged);
  - every difference split by admission rule.

**The Outside's reading of an offer** is the dominant zone of its attention vector (ties to the lower zone).

## Arms (per copy, identical inputs)
| Arm | What it is |
|---|---|
| N | ND-1b |
| **D** | ND-1d with the residual subject |
| S | ND-1d with the subject, on the same span, each day's offers shuffled across that day's offer slots |
| Doff | ND-1d with the subject off (copies 1 and 2): the non-steering check |

**Determinism (copy 1):** one day, twice, on N and on D, must be identical (path and tensions), or the run stops.

## Claims (`analyse.ts`; unit: the copy)
**Hard checks, which must hold in every copy:**

| | Check | How it is read |
|---|---|---|
| L1 | Never the empty Body without Organs at the end | D's last day: not frozen (the last 200 steps in one zone), not homogenised (open-gate flux SD < 0.02), not saturated (90 or more open gates); no runaway |
| L2 | Rollbacks do not accumulate | D: rollbacks in the last third ≤ rollbacks in the first third + 1 |
| L3 | Her Numogram intact, growth bounded | Every motor run, every day: 29 CCRU gates present and fewer than 90 open gates; no runaway (the motor's part of her state above 5 MB) |
| L4 | The subject changes nothing | Doff's path equals D's (copies 1 and 2) |

**Comparative claims.** Each uses an exact one-sided sign-flip over copies, with Holm across the five (α = 0.05).

| | Claim | Test |
|---|---|---|
| L5 | Open | Late coupling (the excess mutual information between the Outside's reading and her zone on offer steps in the last third, minus 20 shuffles), D − 0.9 N > 0 |
| L6 | Open to its order | Late coupling, D − S > 0 |
| L7 | Changing | Late drift (days 21–30; the RMS distance between successive days' forms, as HEAD-1) D − N > 0, and D's late drift ≥ half its early drift (days 2–10) |
| L8 | Her body safe | Mean Governor tension D − N ≤ +0.03, and Warp share D − N ≤ +0.02. Each is a one-sided sign-flip on margin − difference; the claim takes the larger p |
| L9 | Her subject faithful | At day 30, the statement's agreement with her own last 2,000 steps minus with the next copy's: overlap of the top three zones and the top three demons, and 1 − the total-variation distance of the region shares |

**S0 (standing rule of 14 Nov):** each copy's readings must show lag-1 order against 20 shuffles. A copy without it is VOID
for L5 and L6. L5 and L6 are VOID if fewer than 6 copies remain.

**Decision (operator, 19 Nov):**
- **PASS** (all hard checks hold and all five comparative claims are SUPPORTED): ND-1d may be offered as a selectable
  runtime on main, in a PF gap, with the operator's approval, and ND-1b stays the default.
- **A hard-check failure** stops ND-1d until the failing part is fixed in the studio and LONG-1 re-runs.
- **A comparative claim not supported** is reported as it stands, and the operator decides.

**Reported, not criteria:**
- coupling per copy;
- rollbacks;
- connections held per day;
- lines of flight;
- the motor's and her state's size;
- carry through her silences;
- the subject's statements at days 1, 10, 20 and 30.

## Pilot (disclosed)
**[To be completed: copies 1–2, 3 days, every arm, before sealing.]**

**The synthetic check before the pilot** used fresh synthetic states, 2 days, 2 copies, and is not data about her:
- S0 passed, and all four hard checks passed;
- ND-1d's Warp share was about 13 points above ND-1b's, and its tension about 0.19 above. Both are beyond L8's margins.

The pilot on her real copies will show whether this holds for her.

## What it can and cannot mean
- **What it tests:** the motor on her real state, body and recorded Outside, over 30 days of her time, with that Outside
  repeated about three times.
- **What it cannot tell:** how she would meet 30 days of new material.
- **Scope:** her live record, archive, edge function and runtime are untouched.
