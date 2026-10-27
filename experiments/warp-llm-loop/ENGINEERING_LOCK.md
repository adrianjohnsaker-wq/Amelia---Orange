# Warp LLM loop — engineering demonstration lock

**Purpose:** Exercise the missing code-generating agent architecture: an LLM writes a complete program, a separate executor runs it, the evaluator returns correctness/runtime diagnostics, and the next LLM call rewrites the program using that feedback.

**Classification:** Bounded engineering demonstration. It is not a confirmatory experiment and cannot establish general intelligence, autonomous goal formation, or a Warp-specific persistent development effect. WBD-1 remains unchanged and its reported decision remains failed.

## Pinned substrate and routing

- Amelia Orange base source: `62da152fcfb4210aaaedb210a1eb424f97990052`.
- The pinned source has a canonical open gate 3→6 and no canonical 6→3 gate; Zone 6 has no canonical outgoing gate.
- The runner uses the native `AmeliaNumogramSubstrateRuntime` and canonical 3→6 gate. It adds one in-memory adapter, 6→3, solely to return execution feedback to generation. It does not edit canonical source files.
- Zone 3 is the LLM generation state. Zone 6 is code execution/evaluation. After evaluation, its result is appended to Orange active memory and the adapter returns the runtime to Zone 3. The evaluation stderr/stdout and score are also included in the next Ollama prompt.

## Frozen engineering task

The model must write a Python module defining `primes_upto(n: int) -> list[int]`. The evaluator checks exact output for n = 10, 100, 1,000, 10,000, and 50,000 against an independent sieve in the runner. If correctness passes, measured executor runtime is fed back as an optimization target. The loop has a hard limit of four generations; it does not run indefinitely.

The model is selected by `OLLAMA_MODEL` and defaults to `hermes3:3b`. The exact Ollama model digest is captured at run time. Generation settings are temperature 0, seed 420271, an 8,192-token context, and 2,048 maximum output tokens. Model calls time out after 180 seconds. The workflow installs Ollama v0.34.0 from its release archive and checks SHA-256 `cf95886728959aa09910bb34de5cca1cc5a8f68003b5597197d3f2c2d57c0804`.

## Execution boundary

Generated code runs only in a disposable Docker container with `--network=none`, read-only root, no Linux capabilities, `no-new-privileges`, a non-root UID, 384 MiB memory, one CPU, 16 processes, and a 16 MiB no-exec temporary filesystem. Executor wall time is capped at 12 seconds per generation. Only the generated candidate file is mounted into the container. The workflow resolves `python:3.12-slim` to its immutable registry digest before execution and records that digest in the result bundle.

## Output and interpretation

The workflow runs a single bounded loop and uploads all iterations, candidate hashes, transition records, correctness results, feedback, best correct candidate, model digest, and executor image digest. The engineering objective is achieved if at least one generated candidate passes the fixed correctness evaluator. Runtime optimization is descriptive. No result is tuned or reclassified to support a preferred theoretical claim.

The inference is genuinely performed by the configured Ollama model. A stubbed provider, synthetic response, or the coding agent itself is not accepted as a substitute. If model download, inference, or sandbox startup fails, the workflow must report that failure rather than emit a synthetic success.
