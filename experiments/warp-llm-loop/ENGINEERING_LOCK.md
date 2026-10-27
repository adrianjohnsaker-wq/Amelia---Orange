# Warp LLM loop — engineering demonstration lock

**Purpose:** Exercise the missing code-generating agent architecture: an LLM writes a complete program, a separate executor runs it, the evaluator returns correctness/runtime diagnostics, and the next LLM call rewrites the program using that feedback.

**Classification:** Bounded engineering demonstration. It is not a confirmatory experiment and cannot establish general intelligence, autonomous goal formation, or a Warp-specific persistent development effect. WBD-1 remains unchanged and its reported decision remains failed.

## Pinned substrate and routing

- Amelia Orange base source: `62da152fcfb4210aaaedb210a1eb424f97990052`.
- The pinned source has a canonical open gate 3→6 and no canonical 6→3 gate; Zone 6 has no canonical outgoing gate.
- The runner uses the native `AmeliaNumogramSubstrateRuntime` and canonical 3→6 gate. It adds one in-memory adapter, 6→3, solely to return execution feedback to generation. It does not edit canonical source files.
- Zone 3 is the LLM generation state. Zone 6 is code execution/evaluation. After evaluation, its result is appended to Orange active memory and the adapter returns the runtime to Zone 3. The evaluation stderr/stdout and score are also included in the next Ollama prompt.
- Runner SHA-256 for this correction-loop revision: `4b1ced73d3186a7f4a41c9c6f5738868d0974b9cd60cac1f4caff23a8d8cf95d`.

## Frozen engineering task

The model must write a Python module defining `primes_upto(n: int) -> list[int]`. The evaluator checks exact output for n = 10, 100, 1,000, 10,000, and 50,000 against an independent sieve in the runner. If correctness passes, the median of three function-only timings for n=50,000 is fed back as an optimization target; these timings exclude container startup. The loop has a hard limit of four generations; it does not run indefinitely.

The model is selected by `OLLAMA_MODEL` and defaults to `hermes3:3b`. The exact Ollama model digest is captured at run time. Generation settings are temperature 0, seed 420271, an 8,192-token context, and 2,048 maximum output tokens. Model calls time out after 180 seconds. The workflow installs Ollama v0.34.0 from its release archive and checks SHA-256 `cf95886728959aa09910bb34de5cca1cc5a8f68003b5597197d3f2c2d57c0804`.

## Execution boundary

Generated code runs only in a disposable Docker container with `--network=none`, read-only root, no Linux capabilities, `no-new-privileges`, a non-root UID, 384 MiB memory, one CPU, 16 processes, and a 16 MiB no-exec temporary filesystem. Executor wall time is capped at 12 seconds per generation. Only the generated candidate file is mounted into the container. The workflow resolves `python:3.12-slim` to its immutable registry digest before execution and records that digest in the result bundle.

## Output and interpretation

The workflow checkpoints each generated candidate and result after every evaluation, so a later inference timeout cannot erase earlier work. It uploads all iterations, candidate hashes, transition records, correctness results, actionable failure diagnoses, function timing samples, best correct candidate, model digest, executor image digest, and any model error. The prompt specifies the sieve marking stride explicitly (p) and the correct interpretation of enumerate's (index, boolean) pairs. IndexError feedback now identifies the traceback line, forbids out-of-range/chained assignments and resizing, and states the sole allowed composite write. A failed rewrite is not used as the next correction's source of truth: whenever available, the best verified candidate is the repair base, while the failed candidate is separately labelled as diagnostic evidence. Correction prompts prioritize the precise defect and prohibit optimization until correctness has returned. The evaluator reports the first differing output index, expected and actual values, output lengths, and ordering/type defects; runtime type and index errors receive traceback-line-aware diagnoses. Full evaluator stdout/stderr are preserved per iteration, while only a compact diagnosis is sent back to the model. It records correction mode, failure class, and verified-base hash per generation. Executor, evaluator, and transport faults stop the loop without asking the model to rewrite correct or unverified source in response to infrastructure problems. The engineering objective is achieved if at least one generated candidate passes the fixed correctness evaluator. If inference fails before any candidate passes, the workflow fails and preserves the trace. If inference fails after a candidate passes, it retains that candidate and records the incomplete optimization attempt. Runtime optimization is descriptive. No result is tuned or reclassified to support a preferred theoretical claim.

The inference is genuinely performed by the configured Ollama model. A stubbed provider, synthetic response, or the coding agent itself is not accepted as a substitute. Model download or sandbox startup failure prevents a valid run; later inference errors are recorded with any already verified candidate retained.

