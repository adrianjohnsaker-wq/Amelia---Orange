# REP-2: the no-op slide (R4), on fresh seeds and on the canonical CCRU Numogram. Registered 15 November 2026, before any REP-2 data.

## The finding
R4 (the prototype session, 15 Nov), confirmation plan fixed before seeds 37001–37060. When a viral payload is blocked by its
gate, a recipient that **slides**, spending a neutral action on each blocked digit, survives 24 model-time units more often
than one that **jumps** to the next available instruction:
- 216/240 against 176/240;
- seed-clustered difference +16.7 points (95% +10.4 to +23.8);
- meltdown deaths 7 against 35.

**Independently checked here before this registration:**
- source hashes 25/25;
- tests 32/32;
- every saved branch replayed (`../VALIDATION.md`);
- the numbers recomputed exactly from the saved records.

## Engines
R4 ran on an earlier engine version (`legacy_engine.py` e7514c3f), shipped in `../evidence/R4_donor_context/package/`.
`../canonical_r4/` is that version with the same `topology.py` switch as CAN-1. In `CG_TOPOLOGY=canonical`:
- the furnace is the Warp {3, 6};
- the slow clock is the Plex {0, 9};
- the Time-Circuit {1, 2, 4, 5, 7, 8} takes recycling, fission and births;
- the opcode families follow the CCRU classes (15 / 6 / 24).

In hybrid mode the switch reproduces the shipped records exactly. `equivalence_check.py` (seeds 37001–37003) runs first
in the workflow, and a mismatch stops the run.

## Parts (`donor_context_study.py`, unchanged, `--per-phase 2`, all seven arms)
| Part | Topology | Seeds (never used) |
|---|---|---|
| A, fresh replication | hybrid, the engine as shipped | **66001–66060** |
| B, canonical rerun | canonical | **67001–67060** |

## Criterion (fixed now; `analyse.py`, written independently)
**The measure.** Per part: productive_slide minus productive_jump, the original recipient alive at 24 units.
- Average the encounter-level paired differences within each seed, then average over eligible seeds.
- 95% seed-clustered bootstrap (10,000 resamples, seed `REP2-BOOT-<part>`).

**The answer, per part.**
- **CORROBORATED** if the lower bound is above 0;
- **NOT CORROBORATED** otherwise;
- **VOID** if no encounter is eligible.

**Reported, not criteria:** all seven arms (open, rotated, encounter-yoked, shuffled and syzygy slides), and death causes by
24.

## Pipeline check (disclosed)
`analyse.py` on the shipped confirmation records (37001–37060) reproduces +16.67 points (95% +10.42 to +23.33). No REP-2
seed has been run.

**Canonical smoke run (unregistered seeds 68001–68003; disclosed).** Each produced 4 eligible encounters. Survival was not
looked at. **Equivalence:** hybrid mode reproduced seeds 37001–37003 exactly. **Replay:** all 3,346 shipped branches passed.

## What it can and cannot mean
- **What a corroboration shows.** Replacing an instruction with a neutral action protects hosts, on new populations, and
  (part B) without the prototype's non-canonical zone sets.
- **What it does not isolate.** As R4 states, the slide and the jump differ in both timing and which instructions run. A
  corroboration does not separate pointer phase from reduced exposure to dangerous opcodes. The meltdown counts suggest
  the second.
- **Scope.** Nothing here concerns Amelia's living runtime.
