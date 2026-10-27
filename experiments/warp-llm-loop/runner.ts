import { createHash } from 'node:crypto';
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { AmeliaNumogramSubstrateRuntime } from '../../src/substrate/ameliaNumogramSubstrateRuntime';
import { CANONICAL_GATES } from '../../src/ai/numogram/AmeliaQabbalaInterface';

const SOURCE_COMMIT = '62da152fcfb4210aaaedb210a1eb424f97990052';
const MODEL = process.env.OLLAMA_MODEL ?? 'hermes3:3b';
const OLLAMA_HOST = process.env.OLLAMA_HOST ?? 'http://127.0.0.1:11434';
const MAX_GENERATIONS = Number(process.env.MAX_GENERATIONS ?? 4);
const DOCKER_IMAGE = process.env.EXECUTOR_IMAGE ?? 'python:3.12-slim';
const OUTPUT_DIR = process.env.OUTPUT_DIR ?? 'experiments/warp-llm/output';
const MAX_EXEC_MS = 12_000;
const MAX_MODEL_MS = 180_000;
const BENCHMARK_REPEATS = 3;
const QUERIES = [10, 100, 1_000, 10_000, 50_000];
const MAX_N = Math.max(...QUERIES);

type Gate = {
  id: string; source: number; target: number; label: string;
  flux: number; permeability: number; isOpen: boolean; resistance: number;
};
type Iteration = {
  generation: number;
  repairBaseSha256: string | null;
  correctionMode: 'initial' | 'repair' | 'optimization';
  transitionIntoExecution: unknown;
  transitionBackToGeneration: unknown;
  codeSha256: string;
  candidateSource: string;
  correctness: boolean;
  failureClass: string | null;
  elapsedMs: number | null;
  executorWallMs: number;
  benchmarkSamplesMs: number[];
  feedback: string;
};

function invariant(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(`WARP_LLM_PREFLIGHT:${message}`);
}

function signalForZone(target: number, salt: string): string {
  for (let nonce = 0; nonce < 10_000; nonce++) {
    const candidate = `WARP-LLM/${salt}/${nonce}`;
    if (parseInt(createHash('sha256').update(candidate).digest('hex').slice(0, 2), 16) % 10 === target) return candidate;
  }
  throw new Error(`could not derive input signal for zone ${target}`);
}

function makeWarpRuntime() {
  const rt = new AmeliaNumogramSubstrateRuntime();
  const canonical = rt.getQabbala().getGates() as Gate[];
  const pinnedGateTable = CANONICAL_GATES as Gate[];
  invariant(pinnedGateTable.some(g => g.source === 3 && g.target === 6 && g.isOpen), 'pinned gate table has no open 3->6');
  invariant(!pinnedGateTable.some(g => g.source === 6 && g.target === 3 && g.isOpen), 'pinned gate table unexpectedly has 6->3');
  const forward = canonical.find(g => g.source === 3 && g.target === 6 && g.isOpen);
  invariant(forward, 'pinned Orange source has no canonical 3->6 gate');
  invariant(!canonical.some(g => g.source === 6 && g.target === 3 && g.isOpen), 'pinned source unexpectedly has canonical 6->3');
  const returnGate: Gate = { ...forward, id: 'WLLM-6-to-3-adapter', source: 6, target: 3, label: 'WLLM experimental reciprocal return 6->3' };
  rt.getQabbala().setGates([...canonical, returnGate] as any);
  const state = rt.exportState();
  state.currentZone = 3;
  rt.importState(state);
  return rt;
}

async function ollamaDigest(): Promise<string> {
  const response = await fetch(`${OLLAMA_HOST}/api/tags`);
  invariant(response.ok, `Ollama /api/tags returned ${response.status}`);
  const body = await response.json() as { models?: Array<{ name: string; digest: string }> };
  const item = body.models?.find(m => m.name === MODEL || m.name === `${MODEL}:latest`);
  invariant(item, `Ollama model ${MODEL} is not loaded`);
  return item.digest;
}

async function generate(verifiedCode: string, failedCode: string, feedback: string, generation: number): Promise<string> {
  const system = [
    'You are a code generation component in a bounded engineering loop.',
    'Write a Python module whose required public function is named exactly primes_upto(n: int) -> list[int].',
    'The module must return every prime p with 2 <= p <= n, in ascending order.',
    'Use the Sieve of Eratosthenes. In particular, 1 is not prime, and 0 or 1 must never be used as divisors.',
    'Use a Boolean table from 0 through n, mark composites beginning at p*p, then return the unmarked integers from 2 through n.',
    'For n < 2 return an empty list.',
    'Use only the Python standard library. Do not read files, access the network, spawn processes, or perform side effects.',
    'The module will be executed in a disposable, network-disabled container with strict time and memory limits.',
    'Return only the complete replacement Python module. Do not include benchmark harnesses, test invocations, printed examples, markdown fences, prose, or explanation.',
  ].join(' ');
  const user = [
    `Goal: implement and improve a prime sieve for n=${MAX_N}.`,
    `Generation: ${generation}/${MAX_GENERATIONS}.`,
    `Locked correctness inputs: ${JSON.stringify(QUERIES)}. A correct answer must pass all inputs.`,
    'After correctness passes, use the evaluator-reported median function runtime (which excludes container startup) to seek a faster correct implementation.',
    'If a verified reference module is supplied, preserve its correctness first. A failed candidate is diagnostic evidence, not a replacement starting point.',
    'On a correctness failure, repair the specific reported defect and do not optimize or redesign unrelated parts. On an exception, fix the traceback line and stated cause.',
    'Do not use list deletion or resizing to mark sieve composites. Keep the Boolean table length exactly n+1; mark composites by assigning False/True at indices without changing table length.',
    'Only attempt a performance optimization when feedback explicitly says the current candidate passed correctness. If a proposed optimization fails, return to the verified reference and make one small change.',
    `Previous run feedback:\n${feedback}`,
    verifiedCode ? `VERIFIED REFERENCE MODULE (known to pass every locked correctness input; preserve this behavior):\n${verifiedCode}` : 'No verified module exists yet. Create a simple correct implementation first.',
    failedCode ? `MOST RECENT CANDIDATE (may be broken; use only to inspect the diagnosed defect):\n${failedCode}` : '',
    verifiedCode ? 'Correction rule: base the replacement on the verified reference. Do not carry forward unverified changes unless you can show they address the reported defect without changing the contract.' : 'Correction rule: use the exact failure report to repair the latest attempt.',
  ].join('\n\n');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MAX_MODEL_MS);
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST', signal: controller.signal,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        options: { temperature: 0, seed: 420271, num_ctx: 8192, num_predict: 2048 },
      }),
    });
    if (!response.ok) {
      const errorText = (await response.text()).slice(0, 1200);
      throw new Error(`Ollama /api/chat returned ${response.status}: ${errorText}`);
    }
    const body = await response.json() as { message?: { content?: string }; model?: string; prompt_eval_count?: number; eval_count?: number };
    invariant(typeof body.message?.content === 'string' && body.message.content.trim(), 'Ollama returned no code');
    const text = body.message.content.trim();
    const fenced = [...text.matchAll(/```(?:python)?\s*([\s\S]*?)```/gi)].map(m => m[1].trim());
    // Local instruct models often wrap code in explanatory prose despite the
    // raw-code contract. Extract the code block deterministically before execution.
    const codeBlock = fenced.find(block => /\bdef\s+(?:primes_upto|prime_sieve_up_to)\s*\(/.test(block)) ?? fenced[0];
    return (codeBlock ?? text.replace(/^```(?:python)?\s*/i, '').replace(/\s*```\s*$/, '')).trim();
  } finally {
    clearTimeout(timer);
  }
}

function dockerEval(candidatePath: string, testInput: string): Promise<{ ok: boolean; stdout: string; stderr: string; elapsedMs: number; containerExit: number | null }> {
  const evaluator = [
    'import importlib.util, json, sys, time',
    'spec = importlib.util.spec_from_file_location("candidate", "/candidate.py")',
    'm = importlib.util.module_from_spec(spec)',
    'spec.loader.exec_module(m)',
    'assert callable(getattr(m, "primes_upto", None)), "missing primes_upto(n)"',
    'data = json.load(sys.stdin)',
    'results = {str(n): m.primes_upto(n) for n in data["queries"]}',
    'times = []',
    'for _ in range(data["benchmark_repeats"]):',
    '    start = time.perf_counter()',
    '    m.primes_upto(data["benchmark_n"])',
    '    times.append((time.perf_counter() - start) * 1000)',
    'print(json.dumps({"results": results, "benchmark_ms": times}, separators=(",", ":")))',
  ].join('\n');
  return new Promise(resolve => {
    const started = Date.now();
    const child = spawn('docker', [
      'run', '--rm', '-i', '--network=none', '--memory=384m', '--cpus=1', '--pids-limit=16',
      '--read-only', '--user=65534:65534', '--cap-drop=ALL', '--security-opt=no-new-privileges',
      '--tmpfs', '/tmp:rw,nosuid,nodev,noexec,size=16m',
      '--mount', `type=bind,src=${candidatePath},dst=/candidate.py,readonly`,
      DOCKER_IMAGE, 'python', '-I', '-c', evaluator,
    ], { stdio: ['pipe', 'pipe', 'pipe'], detached: true });
    let stdout = '';
    let stderr = '';
    let settled = false;
    const finish = (exitCode: number | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ ok: exitCode === 0, stdout, stderr, elapsedMs: Date.now() - started, containerExit: exitCode });
    };
    child.stdout.setEncoding('utf8').on('data', (s: string) => { stdout = (stdout + s).slice(-2_000_000); });
    child.stderr.setEncoding('utf8').on('data', (s: string) => { stderr = (stderr + s).slice(-50_000); });
    child.on('error', e => { stderr += String(e); finish(null); });
    child.on('close', code => finish(code));
    const timer = setTimeout(() => {
      if (child.pid) {
        try { process.kill(-child.pid, 'SIGKILL'); } catch { child.kill('SIGKILL'); }
      }
      stderr += `\nEXECUTOR_TIMEOUT after ${MAX_EXEC_MS}ms`;
      finish(124);
    }, MAX_EXEC_MS);
    child.stdin.end(testInput);
  });
}

function referencePrimes(n: number): number[] {
  if (n < 2) return [];
  const composite = new Uint8Array(n + 1);
  for (let p = 2; p * p <= n; p++) if (!composite[p]) for (let k = p * p; k <= n; k += p) composite[k] = 1;
  const out: number[] = [];
  for (let i = 2; i <= n; i++) if (!composite[i]) out.push(i);
  return out;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function diagnoseMismatch(expected: unknown, actual: unknown, n: number): string {
  if (!Array.isArray(actual)) return `n=${n}: expected a list of ${Array.isArray(expected) ? expected.length : '?'} primes; got ${actual === null ? 'null' : typeof actual}.`;
  if (!Array.isArray(expected)) return `n=${n}: reference result was not an array (evaluator fault).`;
  const shared = Math.min(expected.length, actual.length);
  let index = 0;
  while (index < shared && actual[index] === expected[index]) index++;
  if (index === shared && actual.length === expected.length) return `n=${n}: values match.`;
  const expectedValue = index < expected.length ? expected[index] : '<end>';
  const actualValue = index < actual.length ? actual[index] : '<end>';
  const actualType = actual.find(value => !Number.isInteger(value) || value < 2);
  const orderIssue = actual.some((value, i) => i > 0 && value <= actual[i - 1]);
  const detail = actualType !== undefined ? `; invalid value=${JSON.stringify(actualType)}` : orderIssue ? '; values are not strictly ascending' : '';
  return `n=${n}: first difference at index ${index}; expected ${JSON.stringify(expectedValue)}, got ${JSON.stringify(actualValue)}; expected length=${expected.length}, actual length=${actual.length}${detail}.`;
}

function failureClass(exitCode: number | null, stdout: string, stderr: string, correctnessIssue: string | null): string {
  if (/EXECUTOR_TIMEOUT/.test(stderr)) return 'candidate_timeout';
  if (/JSONDecodeError|RESULT_PARSE_ERROR/.test(stderr)) return 'evaluator_or_transport_error';
  if (exitCode === null) return 'executor_error';
  if (exitCode !== 0) return /SyntaxError/.test(stderr) ? 'candidate_syntax_error' : /Traceback|Error:/.test(stderr) ? 'candidate_runtime_error' : 'executor_error';
  if (correctnessIssue) return 'correctness_mismatch';
  if (!stdout.trim()) return 'empty_evaluator_output';
  return 'unknown_failure';
}

function actionableDiagnosis(stderr: string): string {
  if (/ZeroDivisionError/.test(stderr)) return 'Diagnosis: the candidate divided by zero. Do not include 0 or 1 in a divisor list; begin candidates at 2 and use the Boolean sieve requested.';
  if (/ModuleNotFoundError/.test(stderr)) return 'Diagnosis: the candidate imported a package unavailable in the sandbox. Use only Python built-ins or the standard library.';
  if (/missing primes_upto/.test(stderr)) return 'Diagnosis: the required public function name is exactly primes_upto.';
  if (/SyntaxError/.test(stderr)) return 'Diagnosis: the generated module has invalid Python syntax. Return only a complete, syntactically valid module.';
  if (/TypeError/.test(stderr)) return 'Diagnosis: primes_upto must return a list of integers.';
  if (/JSONDecodeError/.test(stderr)) return 'Evaluator transport error: the test payload was not received. This is a runner fault, not a candidate failure.';
  return 'Diagnosis: use the traceback to locate and correct the failing line while preserving the exact function contract.';
}

async function main() {
  invariant(Number.isInteger(MAX_GENERATIONS) && MAX_GENERATIONS >= 1 && MAX_GENERATIONS <= 8, 'MAX_GENERATIONS must be in [1, 8]');
  const modelDigest = await ollamaDigest();
  const rt = makeWarpRuntime();
  const runDir = mkdtempSync(join(tmpdir(), 'warp-llm-'));
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const iterations: Iteration[] = [];
  const modelErrors: Array<{ generation: number; error: string }> = [];
  let currentCode = '';
  let feedback = 'No previous attempt.';
  let bestCode = '';
  let bestElapsed: number | null = null;
  let bestCorrect = false;
  let previousBestElapsed = Number.POSITIVE_INFINITY;
  let terminationReason = 'max_generations_reached';
  const saveResults = (complete: boolean) => {
    if (bestCode) writeFileSync(join(OUTPUT_DIR, 'best_solution.py'), bestCode);
    const result = {
      protocol: 'WARP-LLM-ENGINEERING-v1',
      classification: 'Bounded engineering demonstration; not a confirmatory test of a Warp-specific persistent development effect.',
      sourceCommit: SOURCE_COMMIT,
      model: MODEL,
      modelDigest,
      workflowCommit: process.env.GITHUB_SHA ?? null,
      runnerSha256: process.env.RUNNER_SHA256 ?? null,
      executorImage: DOCKER_IMAGE,
      executionContract: 'Ollama generates full candidate source at Zone 3; canonical 3->6 moves to execution at Zone 6; isolated network-disabled Docker evaluates it; feedback and outcome enter Amelia memory; adapter 6->3 returns control to generation.',
      parameters: { maxGenerations: MAX_GENERATIONS, queries: QUERIES, benchmarkRepeats: BENCHMARK_REPEATS, maxExecutorMs: MAX_EXEC_MS, dockerMemory: '384m', dockerCpus: 1, dockerNetwork: 'none' },
      complete,
      terminationReason,
      modelErrors,
      best: { correctness: bestCorrect, elapsedMs: bestElapsed, sourceSha256: bestCode ? createHash('sha256').update(bestCode).digest('hex') : null },
      runtimeState: rt.exportState(),
      iterations,
    };
    writeFileSync(join(OUTPUT_DIR, 'results.json'), JSON.stringify(result, null, 2));
  };
  try {
    for (let generation = 1; generation <= MAX_GENERATIONS; generation++) {
      invariant(rt.getCurrentZone() === 3, `generator expected at Zone 3, got ${rt.getCurrentZone()}`);
      try {
        currentCode = await generate(bestCode, currentCode, feedback, generation);
      } catch (error) {
        terminationReason = 'model_generation_failed';
        modelErrors.push({ generation, error: String(error) });
        console.error(JSON.stringify({ generation, modelError: String(error), retainedBest: bestCorrect }));
        break;
      }
      const codeSha256 = createHash('sha256').update(currentCode).digest('hex');
      writeFileSync(join(OUTPUT_DIR, `candidate_${String(generation).padStart(2, '0')}.py`), currentCode);
      const candidatePath = join(runDir, `candidate-${generation}.py`);
      writeFileSync(candidatePath, currentCode, { mode: 0o600 });
      chmodSync(candidatePath, 0o444);

      const toExecutor = rt.step(signalForZone(6, `generation-${generation}-executor`));
      invariant(rt.getCurrentZone() === 6, `generator did not route into Zone 6 at generation ${generation}`);
      const evalResult = await dockerEval(candidatePath, JSON.stringify({ queries: QUERIES, benchmark_n: MAX_N, benchmark_repeats: BENCHMARK_REPEATS }));
      let correctness = false;
      let benchmarkSamplesMs: number[] = [];
      let benchmarkMedianMs: number | null = null;
      let correctnessIssue: string | null = null;
      let actualOutputDigest: string | null = null;
      const verifiedReferenceSha256 = bestCode ? createHash('sha256').update(bestCode).digest('hex') : null;
      if (evalResult.ok) {
        try {
          const output = JSON.parse(evalResult.stdout.trim().split('\n').at(-1) ?? '') as { results?: unknown; benchmark_ms?: unknown };
          const expected = Object.fromEntries(QUERIES.map(n => [String(n), referencePrimes(n)]));
          actualOutputDigest = createHash('sha256').update(JSON.stringify(output.results ?? null)).digest('hex');
          benchmarkSamplesMs = Array.isArray(output.benchmark_ms) ? output.benchmark_ms.filter((x): x is number => typeof x === 'number' && Number.isFinite(x) && x >= 0) : [];
          correctness = JSON.stringify(output.results) === JSON.stringify(expected) && benchmarkSamplesMs.length === BENCHMARK_REPEATS;
          if (!output.results || typeof output.results !== 'object') correctnessIssue = 'Evaluator result field is missing or is not a JSON object.';
          if (!correctness && output.results && typeof output.results === 'object') {
            const actualResults = output.results as Record<string, unknown>;
            for (const n of QUERIES) {
              const expectedList = expected[String(n)];
              const actualList = actualResults[String(n)];
              if (JSON.stringify(actualList) !== JSON.stringify(expectedList)) {
                correctnessIssue = diagnoseMismatch(expectedList, actualList, n);
                break;
              }
            }
          }
          if (!correctness && !correctnessIssue && benchmarkSamplesMs.length !== BENCHMARK_REPEATS) {
            correctnessIssue = 'expected ' + BENCHMARK_REPEATS + ' finite nonnegative benchmark samples; got ' + benchmarkSamplesMs.length + '.';
          }
          if (benchmarkSamplesMs.length === BENCHMARK_REPEATS) benchmarkMedianMs = median(benchmarkSamplesMs);
        } catch (error) {
          evalResult.stderr += '\nRESULT_PARSE_ERROR: ' + String(error);
        }
      }
      const improved = correctness && benchmarkMedianMs! < previousBestElapsed;
      if (correctness && (!bestCorrect || benchmarkMedianMs! < (bestElapsed ?? Number.POSITIVE_INFINITY))) {
        bestCorrect = true;
        bestElapsed = benchmarkMedianMs;
        bestCode = currentCode;
        previousBestElapsed = benchmarkMedianMs;
      }

      const correctionMode: Iteration['correctionMode'] = generation === 1 ? 'initial' : correctness ? 'optimization' : 'repair';
      const candidateFailureClass = correctness ? null : failureClass(evalResult.containerExit, evalResult.stdout, evalResult.stderr, correctnessIssue);
      const infrastructureFailure = candidateFailureClass === 'evaluator_or_transport_error' || candidateFailureClass === 'executor_error' || candidateFailureClass === 'empty_evaluator_output' || candidateFailureClass === 'unknown_failure';

      const feedbackParts = [
        `executor_exit=${evalResult.containerExit}; correctness=${correctness}; function_median_ms=${benchmarkMedianMs ?? 'unavailable'}; samples_ms=${JSON.stringify(benchmarkSamplesMs)}; best_correct=${bestCorrect}; best_function_median_ms=${bestElapsed ?? 'none'}`,
        `failure_class=${candidateFailureClass ?? 'none'}; correction_mode=${correctionMode}; candidate_sha256=${codeSha256}; verified_reference_sha256=${verifiedReferenceSha256 ?? 'none'}; actual_output_sha256=${actualOutputDigest ?? 'unavailable'}`,
      ];
      if (!correctness) {
        if (correctnessIssue) feedbackParts.push('Correctness mismatch: ' + correctnessIssue);
        feedbackParts.push(actionableDiagnosis(evalResult.stderr));
        feedbackParts.push(`EXECUTOR_STDERR:\n${evalResult.stderr || '(empty)'}`);
        feedbackParts.push(`EXECUTOR_STDOUT:\n${evalResult.stdout || '(empty)'}`);
        feedbackParts.push(`Expected evaluator output: JSON with result keys ${QUERIES.join(', ')} and three benchmark_ms samples.`);
      } else if (infrastructureFailure) {
        feedbackParts.push('This was classified as an executor/evaluator fault, not a candidate defect. Do not rewrite the source in response; the run must stop for infrastructure diagnosis.');
      } else if (!improved) {
        feedbackParts.push('The correct candidate did not improve the best measured runtime. Preserve correctness and seek a faster method.');
      } else {
        feedbackParts.push('Correctness passed and this is the fastest correct candidate so far. Try a safe optimization.');
      }

      const memoryEvent = {
        protocol: 'WARP-LLM-ENGINEERING-v1', generation,
        outcome: correctness ? 'correct' : 'failure', elapsedMs: benchmarkMedianMs ?? evalResult.elapsedMs,
        fluxDelta: correctness ? 0.05 : 0.18, phaseCoherence: 1, strainRelaxation: 0.025,
        errorDigest: createHash('sha256').update(evalResult.stderr + evalResult.stdout).digest('hex'),
      };
      rt.getMemory().append({
        blockIndex: generation, depth: generation, targetZone: 3,
        fluxDelta: memoryEvent.fluxDelta, phaseCoherence: 1, strainRelaxation: 0.025,
        eventDigest: createHash('sha256').update(JSON.stringify(memoryEvent)).digest('hex'),
        timestamp: generation, kind: 'FIELD', fromZone: 6,
      });
      const backToGenerator = rt.step(signalForZone(3, `generation-${generation}-feedback`));
      invariant(rt.getCurrentZone() === 3, `executor did not route back to Zone 3 at generation ${generation}`);
      feedback = feedbackParts.join('\n');
      iterations.push({ generation, repairBaseSha256: verifiedReferenceSha256, correctionMode, transitionIntoExecution: toExecutor.lastTransition, transitionBackToGeneration: backToGenerator.lastTransition, codeSha256, candidateSource: currentCode, correctness, failureClass: candidateFailureClass, elapsedMs: benchmarkMedianMs, executorWallMs: evalResult.elapsedMs, benchmarkSamplesMs, feedback });
      console.log(JSON.stringify({ generation, zoneLoop: `${toExecutor.lastTransition?.from}->${toExecutor.lastTransition?.to}->${backToGenerator.lastTransition?.to}`, codeSha256, correctness, functionMedianMs: benchmarkMedianMs, executorWallMs: evalResult.elapsedMs, bestCorrect, bestElapsed }));
      saveResults(false);
      if (infrastructureFailure) {
        terminationReason = 'executor_or_evaluator_failed';
        break;
      }
    }

    saveResults(true);
    invariant(bestCorrect, `no correct candidate after ${MAX_GENERATIONS} generations; full failure trace saved`);
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });

