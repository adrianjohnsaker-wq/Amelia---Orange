# Prototype 0 (the supplied engine): independent audit, 15 November 2026

**What was audited.** `numogram_cybergothic.py` is the operator's supplied prototype, restored from flattened text to
runnable Python. Every rule is as supplied. Three switches were added, each off by default:
- seeded entropy, for replay;
- the death repair;
- reseeding on or off.

`self.died` records deaths for observation only.

**Run.** `python3 audit.py AUDIT_RESULTS.json`: 30 seeds × 4 conditions, 100 cycles, 28 founders, seeded entropy.

| Condition | Ghost hosts (died, still present) | Corpse sharing a living genome | Zero hosts at cycle 100 | Mean hosts at 100 |
|---|---|---|---|---|
| Supplied, reseeding on | 30/30 runs | 30/30 | 0/30 | 6.73 |
| Supplied, reseeding off | 30/30 | 30/30 | 22/30 | 0.40 |
| Repaired, reseeding on | 0/30 | 0/30 | 0/30 | 7.10 |
| Repaired, reseeding off | 0/30 | 0/30 | 30/30 | 0.00 |

**Against the other session's report (14–15 Nov):**
- **Ghost hosts and shared corpse lists in 30/30 supplied runs, 0/30 repaired.** Corroborated.
- **Zero hosts at 100 without reseeding: 14/30 supplied, 29/30 repaired.** Same direction; the repaired count is corroborated
  (30/30). The supplied count differs (22/30 here). The seeds and random streams differ; with 30 runs each, 14 and 22 are
  about 2 standard errors apart.
- **Conclusion.** Without reseeding, the repaired ecology collapses: it is not self-sustaining.

**The cause, confirmed in the code.** When an agent moves (current drift, a gate jump, or a syzygetic pull) and then reaches
zero energy, the supplied death check removes it from the zone it started in. That fails, so the dead agent stays in its
destination. Its genome list is also appended as the corpse without copying, so ghost and corpse share one mutable list.

**Topology (important for the paper).** Prototype 0 uses its own topology, not the CCRU Numogram's:

| | Prototype 0 | CCRU Numogram (as in `experiments/enochian-numogram/matrix.py` and `src/core/fullNumogram.ts`) |
|---|---|---|
| Time-Circuit | {1, 2, 3, 4, 5, 6} | {1, 2, 4, 5, 7, 8} |
| Warp | {7, 8, 9} | {3, 6} |
| Plex | 0 ("Cthell") | {0, 9} |
| Movement | (zone + current) mod 10 | syzygy, current (\|2z−9\|) and gate (digital root of z(z+1)/2) edges |
| Pandemonium classes | opcode ranges 0–14 / 15–29 / 30–44 | Chrono, Xeno and Amphi by the regions of the pair's two zones |

Findings from Prototype 0 are therefore findings about this engine, not about the Numogram. The developed research prototype
(29-gate graph) must be checked against `FULL_NUMOGRAM_GATES` before its results are described as Numogrammatic.
