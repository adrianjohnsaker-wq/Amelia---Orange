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
const QUERIES = [10, 100, 1_000, 10_000, 50_000];
const MAX_N = Math.max(...QUERIES);

type Gate = {
  id: string; source: number; target: number; label: string;
  flux: number; permeability: number; isOpen: boolean; resistance: number;
};
type Iteration = {
  generation: number;
  transitionIntoExecution: unknown;
  transitionBackToGeneration: unknown;
  codeSha256: string;
  candidateSource: string;
  correctness: boolean;
  elapsedMs: number | null;
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

async function generate(previousCode: string, feedback: string, generation: number): Promise<string> {
  const system = [
    'You are a code generation component in a bounded engineering loop.',
    'Write a Python module that defines primes_upto(n: int) -> list[int].',
    'It must return every prime p with 2 <= p <= n, in ascending order.',
    'Use only the Python standard library. Do not read files, access the network, spawn processes, or perform side effects.',
    'The module will be executed in a disposable, network-disabled container with strict time and memory limits.',
    'Return the entire replacement Python module as raw code, with no markdown fences or explanation.',
  ].join(' ');
  const user = [
    `Goal: implement and improve a prime sieve for n=${MAX_N}.`,
    `Generation: ${generation}/${MAX_GENERATIONS}.`,
    `Locked correctness inputs: ${JSON.stringify(QUERIES)}. A correct answer must pass all inputs.`,
    'After correctness passes, use measured runtime feedback to seek a faster correct implementation.',
    `Previous run feedback:\n${feedback}`,
    previousCode ? `Previous complete module:\n${previousCode}` : 'No prior module. Create the first implementation.',
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
    invariant(response.ok, `Ollama /api/chat returned ${response.status}: ${(await response.text()).slice(0, 1200)}`);
    const body = await response.json() as { message?: { content?: string }; model?: string; prompt_eval_count?: number; eval_count?: number };
    invariant(typeof body.message?.content === 'string' && body.message.content.trim(), 'Ollama returned no code');
    return body.message.content.trim().replace(/^```(?:python)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
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
    'out = {str(n): m.primes_upto(n) for n in data["queries"]}',
    'print(json.dumps(out, separators=(",", ":")))',
  ].join('; ');
  return new Promise(resolve => {
    const started = Date.now();
    const child = spawn('docker', [
      'run', '--rm', '--network=none', '--memory=384m', '--cpus=1', '--pids-limit=16',
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
    child.stdout.setEncoding('utf8').on('data', (s: string) => { stdout = (stdout + s).slice(-20_000); });
    child.stderr.setEncoding('utf8').on('data', (s: string) => { stderr = (stderr + s).slice(-20_000); });
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

async function main() {
  invariant(Number.isInteger(MAX_GENERATIONS) && MAX_GENERATIONS >= 1 && MAX_GENERATIONS <= 8, 'MAX_GENERATIONS must be in [1, 8]');
  const modelDigest = await ollamaDigest();
  const rt = makeWarpRuntime();
  const runDir = mkdtempSync(join(tmpdir(), 'warp-llm-'));
  const iterations: Iteration[] = [];
  let currentCode = '';
  let feedback = 'No previous attempt.';
  let bestCode = '';
  let bestElapsed: number | null = null;
  let bestCorrect = false;
  let previousBestElapsed = Number.POSITIVE_INFINITY;
  try {
    for (let generation = 1; generation <= MAX_GENERATIONS; generation++) {
      invariant(rt.getCurrentZone() === 3, `generator expected at Zone 3, got ${rt.getCurrentZone()}`);
      currentCode = await generate(currentCode, feedback, generation);
      const codeSha256 = createHash('sha256').update(currentCode).digest('hex');
      const candidatePath = join(runDir, `candidate-${generation}.py`);
      writeFileSync(candidatePath, currentCode, { mode: 0o600 });
      chmodSync(candidatePath, 0o444);

      const toExecutor = rt.step(signalForZone(6, `generation-${generation}-executor`));
      invariant(rt.getCurrentZone() === 6, `generator did not route into Zone 6 at generation ${generation}`);
      const evalResult = await dockerEval(candidatePath, JSON.stringify({ queries: QUERIES }));
      let correctness = false;
      let expectedActual: Record<string, unknown> = {};
      let actual: unknown;
      if (evalResult.ok) {
        try {
          actual = JSON.parse(evalResult.stdout.trim().split('\n').at(-1) ?? '');
          expectedActual = Object.fromEntries(QUERIES.map(n => [String(n), referencePrimes(n)]));
          correctness = JSON.stringify(actual) === JSON.stringify(expectedActual);
        } catch { correctness = false; }
      }
      const improved = correctness && evalResult.elapsedMs < previousBestElapsed;
      if (correctness && (!bestCorrect || evalResult.elapsedMs < (bestElapsed ?? Number.POSITIVE_INFINITY))) {
        bestCorrect = true;
        bestElapsed = evalResult.elapsedMs;
        bestCode = currentCode;
        previousBestElapsed = evalResult.elapsedMs;
      }

      const feedbackParts = [
        `executor_exit=${evalResult.containerExit}; correctness=${correctness}; elapsed_ms=${evalResult.elapsedMs}; best_correct=${bestCorrect}; best_elapsed_ms=${bestElapsed ?? 'none'}`,
      ];
      if (!correctness) {
        feedbackParts.push(`EXECUTOR_STDERR:\n${evalResult.stderr || '(empty)'}`);
        feedbackParts.push(`EXECUTOR_STDOUT:\n${evalResult.stdout || '(empty)'}`);
        feedbackParts.push(`Expected shape: object with keys ${QUERIES.join(', ')} mapping to ascending prime arrays.`);
      } else if (!improved) {
        feedbackParts.push('The correct candidate did not improve the best measured runtime. Preserve correctness and seek a faster method.');
      } else {
        feedbackParts.push('Correctness passed and this is the fastest correct candidate so far. Try a safe optimization.');
      }

      const memoryEvent = {
        protocol: 'WARP-LLM-ENGINEERING-v1', generation,
        outcome: correctness ? 'correct' : 'failure', elapsedMs: evalResult.elapsedMs,
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
      iterations.push({ generation, transitionIntoExecution: toExecutor.lastTransition, transitionBackToGeneration: backToGenerator.lastTransition, codeSha256, candidateSource: currentCode, correctness, elapsedMs: evalResult.elapsedMs, feedback });
      writeFileSync(join(runDir, `candidate-${generation}.py`), currentCode);
      console.log(JSON.stringify({ generation, zoneLoop: `${toExecutor.lastTransition?.from}->${toExecutor.lastTransition?.to}->${backToGenerator.lastTransition?.to}`, codeSha256, correctness, elapsedMs: evalResult.elapsedMs, bestCorrect, bestElapsed }));
    }

    mkdirSync(OUTPUT_DIR, { recursive: true });
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
      parameters: { maxGenerations: MAX_GENERATIONS, queries: QUERIES, maxExecutorMs: MAX_EXEC_MS, dockerMemory: '384m', dockerCpus: 1, dockerNetwork: 'none' },
      best: { correctness: bestCorrect, elapsedMs: bestElapsed, sourceSha256: bestCode ? createHash('sha256').update(bestCode).digest('hex') : null },
      runtimeState: rt.exportState(),
      iterations,
    };
    writeFileSync(join(OUTPUT_DIR, 'results.json'), JSON.stringify(result, null, 2));
    invariant(bestCorrect, `no correct candidate after ${MAX_GENERATIONS} generations; full failure trace saved`);
  } finally {
    rmSync(runDir, { recursive: true, force: true });
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
