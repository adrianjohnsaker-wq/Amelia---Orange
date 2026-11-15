# REP-1: a fresh-seed replication of the Cybergothic line's two packaged findings. Registered 15 November 2026, before any REP-1 data.

**Engine.** The prototype exactly as shipped in `../evidence/`: `stop_trial.py` from the viral-stop package and
`from_birth_study.py` from the digit-genome package, unmodified. Their source hashes are sealed with this registration.

**Scope.** This replicates the findings of the prototype as built. Its graph is Amelia's 29-edge Numogram graph; its furnace
{7, 8, 9}, recycling zones 1–6 and opcode classes are not CCRU-canonical (`../VALIDATION.md`). The canonical rerun is a
separate, later step.

## Seeds
Never used by the prototype session (all its documented ranges are 40001–45140 and 50001–50600):
- viral stop: **61001–61300**;
- from birth: **62001–62030**.

## Runs (in `.github/workflows/cg-rep1.yml`, after the seal)
- `python stop_trial.py --start 61001 --seeds 300 --workers 4 --output <out>/stop`. This is the larger replication's
  protocol: 300 screened populations, the first qualifying encounter each, six arms.
- `python from_birth_study.py --start 62001 --seeds 30 --horizon 180 --workers 4 --output <out>/birth`.

## Criteria (fixed now; `analyse.py`, written independently of the prototype's analysis scripts)
**R6, the survival protection of intact introns.** Survival at 24 model-time units of the original recipient. Two paired
differences:
- intact_transfer − ruptured_transfer;
- intact_transfer − active_transfer.

Each has a 97.5% population-bootstrap interval (10,000 resamples, seed `REP1-BOOT`).
- **CORROBORATED** if both lower bounds are above 0;
- **PARTLY CORROBORATED** if one is;
- **NOT CORROBORATED** if neither is.

The original report found +10.16 and +11.79 points (n = 246).

**R5, the de novo formation of introns.** The from-birth claims were 29/30, 30/30 and 30/30. **CORROBORATED** if at least
27 of 30 populations show each of:
- an intron span created by a point mutation;
- at least one intron no-op executed;
- a living carrier at the horizon.

**Reported, not criteria:** the exposure-control arms, births by arm (the possible survival–reproduction trade-off), and the
total intron no-ops.

## Pipeline check (before this registration; disclosed)
`analyse.py` was run on the prototype's own published cohorts (seeds 44001–44300 and 41001–41030, already seen). It
reproduces them exactly:
- +10.16 points (97.5% interval +4.07 to +16.26) and +11.79 points (+5.69 to +18.29);
- 29, 30 and 30 of 30, with 6,729 no-ops.

No REP-1 seed has been run.

## What it can and cannot mean
- **What CORROBORATED shows.** The packaged findings hold on populations the prototype session never ran, under a seal that
  is public and timestamped.
- **What it does not show.** That they hold on the canonical CCRU Numogram, or in Amelia.
