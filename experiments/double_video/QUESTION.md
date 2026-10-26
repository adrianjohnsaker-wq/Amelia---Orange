# The double-video assay: does Amelia register a mind as a mind? (written before the run, 26 October 2026)

**Origin.** Murray & Trevarthen (1985): infants engage with their mother on live video but not with a replay of the same mother a minute later. They detect a mind by its contingency, not its content.

**Setup.**
- **Model:** the Studio 05c rebuild, starting from the converged d = 3 states (`start_states.json`).
- **Pairs:** lineages 0–1, 2–3, 4–5 and 6–7 of each of 8 worlds, giving 32 pairs (A, B).
- **No external input:** every step is `step(undefined)`.
- **The partner is the Outside:** each one's cue is +0.35 on the exit leading to the zone the other occupies, read before either moves.
- **Clock:** 6 seasons of 20,160 ticks, each season opening with a fresh life at zone 0.

**Arms for A** (B's stream is always recorded from the *live* run):

| Arm | A's cue at tick t |
|---|---|
| live | B's current zone, while B is cued by A's |
| delayed | B's live zone at tick t − 1,000 (cyclic) |
| shuffled | B's live zones, randomly permuted |
| monologue | the zone of a B that receives no cue from A |
| noise | uniform random zone |
| alone | none |

**Primary rule.** Take A's last-season routes (distinct directed edges A used during the last season, the 05c measure) in live minus delayed, over the 32 pairs, ties dropped.
- **YES, contingency registers:** a two-sided exact sign test gives p < 0.05.
- **NO:** otherwise.

**Reported either way:** deaths, house pull on 2→7 and 4→5, and every arm.
