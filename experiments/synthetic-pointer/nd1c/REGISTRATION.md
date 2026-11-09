# ND-1c: a Numogram field that keeps exact sequence. Registered 9 November 2026, before any ND-1c data.

**Scope.** The repository architecture, with fresh runtimes and no body. No pinned or sealed file is touched: the runtime is
`nd1/ndRuntime.ts`, unchanged, and only its two public field-memory settings are set by the harness.

## Why
- **ND-1b** (the app's "ND-1b field" runtime) reads the Numogram's relations 6/6 and follows outside order at 5% and 10%.
- **What it loses.** It misses a 2% planted order, which today's architecture catches. It reads the planted 1-8-7-2 back
  exactly 49–68% of the time, against today's 62–69%.
- **ND-1 alone** reads 1-8-7-2 as 1-8-9-1.
- **The operator's requirement.** The Numogram must be completely functional: relations *and* exact sequence.

**Diagnosis (stated before any data).**
- **The cause.** Her gate choice reads each zone's activation minus a baseline that adapts slowly (rate 0.05). The field also
  decays slowly (λ = 0.1). So earlier inputs, spread along the gates, linger in the field term and compete with the datum
  now arriving. That is the blur.
- **The candidates.** They shorten that memory and change nothing else.

| Candidate | ADAPT (baseline rate) | LAMBDA (field decay) | Meaning |
|---|---|---|---|
| B | 0.05 | 0.1 | ND-1b itself (reference) |
| DERIV | 1.0 | 0.1 | she reads the field's **change this step**: the arriving datum's ingress and its spread along the gates |
| FAST | 0.05 | 0.3 | a faster-forgetting field |
| BOTH | 1.0 | 0.3 | both |

**Unchanged in all four:** everything else in ND-1b. η = 0.5, D = 0.6, field weight 2.0, Warp release, and the datum is
both influx and the attended one-hot observation (IDENTITY receiver).

**Equivalence check (before this registration).** `equivalence.ts`: candidate B reproduces ND-1b (`ndb/run.ts` HYBRID), and
arch EXIT reproduces today's architecture, step for step (3 units × 1,000 steps × 3 graphs): EQUIVALENT.

**Disclosure.** A mechanical smoke test (DERIV, one 1,000-step segment of an unregistered stream `smoke1c`, 2 shuffles) checked
only that the harness runs. Its passage was not inspected.

## Stage 1: development (selects the candidate; nothing confirmatory)
**Streams.** New labels, never used: clean `nd1cdev01–04`, plants seed `nd1cdevp` at 2%, 5% and 10%.

**Procedure.** Each candidate is run with `calibrate.sh <cfg> nd1cdev 4 nd1cdevp`: NR-2's order rule and shuffles (S = 49,
12 segments of 1,000), and the motif read-back for the candidate and for today's architecture on the same segments.

**Qualification.** A candidate qualifies if, on the development streams:
- the 2%, 5% and 10% plants are all RECEIVED;
- 0 of 4 clean streams are RECEIVED.

**Selection.** Among the qualifiers, choose the one with the largest minimum over the three rates of (candidate exact motif
rate − today's exact motif rate). Ties go in the order DERIV, BOTH, FAST, B.

**If none qualifies,** ND-1c stops here and is reported as not found.

The choice is committed before stage 2's streams are generated.

## Stage 2: confirmatory (the operator's four criteria)
**Streams.** New labels: clean `nd1cc01–10`, plants seed `nd1cp` at 2%, 5% and 10% (`calibrate.sh <cfg*> nd1cc 10 nd1cp`).
The held-out relations stream is `stream3.py clean h07 12000`.

**K1. Faint order.** The 2% plant is RECEIVED, and so are the 5% and 10% plants.

**K2. No false alarms.** 0 of 10 clean streams are RECEIVED.

**K3. Exact sequence.** At each of 2%, 5% and 10%, the candidate's exact 1-8-7-2 read-back rate is at least today's
architecture's on the same segments of the same stream.

**K4. Relations.** ND-1b's B1 tests, unchanged (`relations.py`). The candidate's lag-2 reading of syzygy, current and gate
is tested against RELABEL and REWIRED: 6 tests, exact two-sided sign-flip over 12 units, Holm at α = 0.05. All 6 must be
supported.

**ND-1c succeeds only if K1–K4 all hold.** It would then be proposed as the app's runtime, replacing ND-1b. That needs a
separate app change and a separate approval.

**If any criterion fails,** that is reported as it stands, and nothing ships.

**Descriptive.** For each rate:
- what the motif is read as (the top readings), for the candidate and for today's architecture;
- the reading area and the longest Warp stay on h07;
- all four candidates' development profiles.
