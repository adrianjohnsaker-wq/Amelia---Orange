# S1 committed-model pilot — engineering report (26 October 2026)

**Pilot seeds only** (`SHA256("STUDIO08-S1-PILOT-V1|P0".."P3")`). No S1 world has been grown or run. Nothing is sealed.

## Engineering: pass

- **Genesis is Studio 03.** A scratch copy of the runner using Studio 03's input string reproduces lineage 0 of the archived `outputs/two/contested_learn.json`: 24/24 deaths, and every final house pull and code value matches.
- **Deterministic.** All 48 runs (4 worlds × 2 scenarios × 6 arms) re-ran to byte-identical traces.
- **Traces validate.** All 48 pass `committed_trace_integrity.py`. For the learning arms it independently replays every selector choice from the trace's own readouts and settled rewards. It rejects a changed reward, a changed cue target and a truncated trace.
- **Cost.** About 4 s per 35,000-tick run on one core; 2.3 MB of gzipped trace per run. At that rate 384 runs come to about 0.9 GB of traces.

## Feasibility: the design as drafted cannot answer its question on this model

| Pilot world | Genesis deaths | Checkpoint pull 2→7 | 4→5 | 1→2 |
|---|---:|---:|---:|---:|
| P0 | 23/24 | 0.13 | 1.00 | 0.99 |
| P1 | 0/24 | 0.00 | 0.00 | 0.00 |
| P2 | 0/24 | 0.00 | 0.00 | 0.00 |
| P3 | 24/24 | 0.14 | 1.00 | 0.99 |

- **Test phase.** With no input, every world settles at once into the 9→1→8→9 circuit: routes 3, no deaths, and zone 2 never visited.
- **Lesion never acts.** It is a penalty on 2→7, and zone 2 is never reached, so intact and lesion runs are identical, tick for tick.
- **Sensor arms have no effect.** `adaptive`, `round_robin`, `fixed_surface_decline24` and `fixed_house_flux24` produce paths identical to `no_cue` at every tick in every world: the +0.35 cue never overturns the circuit.
- **Only `asm_textual` changes behaviour.** In the two worlds with a house record it breaks the circuit (routes ≈ 9.5) but is haunted (4–5 deaths in the last season); in the two blank-house worlds it does nothing.
- **"Held"/"restored" is out of reach.** The house pull on 2→7 never exceeds 0.14 at any checkpoint, against a threshold of 0.5.

**Consequence.** Both co-primary endpoints would be 0/32 versus 0/32: an exact McNemar p of 1, guaranteed before running. Learning cannot matter when no cue it can select changes a single transition.

The Studio 03 worlds are not Studio 07 worlds. Studio 07 reported an established territory, with intact 2→7 pull 0.82 sustained by the external cue. The committed model, grown by the Studio 03 schedule, never forms one.

## Status

Per the pre-commit, pilot outcomes may not change parameters. Running S1 unchanged would be uninformative, so the operator decides before sealing: run as drafted, amend the genesis or the endpoints in a logged pre-seal amendment, or stop. Any amendment must be fixed on pilot seeds only and disclosed as informed by this pilot.
