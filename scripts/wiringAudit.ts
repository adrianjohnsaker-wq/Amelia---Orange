import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { AmeliaNumogramSubstrateRuntime } from "../src/substrate/ameliaNumogramSubstrateRuntime";
import { AmeliaProcessRelay } from "../src/services/AmeliaProcessRelay";
import { canonicalSha256 } from "../src/lib/sha256";
import { ThreeArmDiagnosticRunner } from "../src/ai/coupling/ThreeArmDiagnosticRunner";
import { Paper6H1ResistanceAssay } from "../src/bridge/phases/paper6H1ResistanceAssay";
import { initMorphogeneticState, stepAmeliaSubstrate } from "../src/substrate/AmeliaMorphogeneticSubstrate";
import { PlatonicMorphospaceHyperstitionProbe } from "../src/bridge/Paper6_Hyperstition_PlatonicMorphospace_Probe";
import { LiveAmeliaSubstrateAdapter } from "../src/bridge/AmeliaSubstrateAdapterImpl";
import { runNullControlAssay } from "../src/bridge/pfm-null-control-assay";

type Status = "EXECUTED" | "LIMITATION_CONFIRMED" | "FAILED";
type Finding = { id: string; status: Status; scope: string; finding: string; evidence?: unknown; error?: string };
const findings: Finding[] = [];
async function check(id: string, scope: string, finding: string, probe: () => unknown | Promise<unknown>,
                     status: Status = "EXECUTED") {
  try {
    const evidence = await probe();
    findings.push({ id, scope, finding, status, evidence });
    console.log("[" + status + "] " + id + " " + finding);
  } catch (e: any) {
    const error = e?.stack || String(e);
    findings.push({ id, scope, finding, status: "FAILED", error });
    console.error("[FAILED] " + id + " " + error);
  }
}
const app = readFileSync("src/App.tsx", "utf8");
const dialogue = readFileSync("src/components/AmeliaDialogueWindow.tsx", "utf8");
const firestore = readFileSync("src/services/ameliaFirebaseMemory.ts", "utf8");
const threeArmSource = readFileSync("src/ai/coupling/ThreeArmDiagnosticRunner.ts", "utf8");
const paper6Source = readFileSync("src/bridge/phases/paper6H1ResistanceAssay.ts", "utf8");
const runtimeSource = readFileSync("src/substrate/ameliaNumogramSubstrateRuntime.ts", "utf8");

async function main() {
  const runtime = new AmeliaNumogramSubstrateRuntime();
  let snapshot = runtime.step();
  await check("T01", "Main substrate", "Step 1x advances a ten-zone Numogram snapshot", () => {
    const prior = snapshot.step, zones = JSON.stringify(snapshot.zones);
    snapshot = runtime.step();
    assert.equal(snapshot.step, prior + 1);
    assert.equal(Object.keys(snapshot.zones).length, 10);
    assert.notEqual(JSON.stringify(snapshot.zones), zones);
    assert.match(app, /onClick=\{handleStepOnce\}/);
    return { prior, current: snapshot.step, zoneCount: Object.keys(snapshot.zones).length };
  });
  await check("T02", "Governor", "Loop stepping increments actual Governor audit counter", () => {
    const prior = snapshot.governor.invariantsAudited;
    for (let i = 0; i < 8; i++) snapshot = runtime.step();
    assert(snapshot.governor.invariantsAudited > prior);
    assert.match(app, /onClick=\{\(\) => setIsRunning\(!isRunning\)\}/);
    return { step: snapshot.step, auditBefore: prior, auditAfter: snapshot.governor.invariantsAudited };
  });
  await check("T03", "Process memory", "Normal runtime steps now append endogenous PFM transition records", () => {
    const count = runtime.getMemory().getEvents().length;
    assert.equal(count, snapshot.step);
    assert(runtimeSource.includes("this.memory.append("));
    assert.equal(snapshot.memoryHistoryLength, count);
    assert.equal(runtime.getMemory().exportHistoryDigest(), snapshot.memoryHeadDigest);
    return { step: snapshot.step, events: count, lastTransition: snapshot.lastTransition };
  });
  await check("T04", "Process memory", "Recorded history feeds back as nonzero next-step memory bias", () => {
    const prior = runtime.getMemory().getEvents().length;
    runtime.getMemory().append({
      blockIndex: snapshot.step, depth: snapshot.step, targetZone: 9,
      fluxDelta: 0.2, phaseCoherence: 0.9, strainRelaxation: 0.01,
      seed: 101, eventDigest: "AUDIT_ONLY_NOT_A_SEAL", timestamp: 1000
    });
    snapshot = runtime.step();
    const consumption = runtime.getMemoryConsumptionLog().at(-1);
    assert.equal(consumption?.memoryHistoryLength, prior + 1);
    assert((consumption?.appliedBiasVector[9] ?? 0) > 0);
    return { priorEvents: prior, eventCount: snapshot.memoryHistoryLength,
      consumedHistoryLength: consumption?.memoryHistoryLength,
      zone9Bias: consumption?.appliedBiasVector[9] };
  });
  await check("T05", "Consolidation", "PFM consolidation creates a recorded event and lowers strain tension", () => {
    const before = runtime.getGovernor();
    const count = runtime.getMemory().getEvents().length;
    const hysteresis = runtime.getMemory().readMemoryBias().hysteresisTension;
    runtime.triggerConsolidation();
    const after = runtime.getGovernor();
    assert(after.consolidationEntropy < before.consolidationEntropy);
    assert.equal(runtime.getMemory().getEvents().length, count + 1);
    assert.equal(runtime.getMemory().getEvents().at(-1)?.kind, "CONSOLIDATE");
    assert(runtime.getMemory().readMemoryBias().hysteresisTension < hysteresis);
    return { governorEntropyBefore: before.consolidationEntropy, governorEntropyAfter: after.consolidationEntropy,
      PFMEventsBefore: count, PFMEventsAfter: count + 1 };
  });
  await check("T06", "Governor", "Shed Stage advances internal Governor stage", () => {
    const before = runtime.getGovernor().scaffoldSheddingStage;
    runtime.shedScaffold();
    const after = runtime.getGovernor().scaffoldSheddingStage;
    assert.notEqual(after, before);
    assert.match(app, /onClick=\{handleShedScaffold\}/);
    return { before, after };
  });
  await check("T07", "Dialogue", "PFM-conditioned relay uses shared runtime and produces traceable module selection", () => {
    snapshot = runtime.step("Explain the Numogram and its memory");
    const status = AmeliaProcessRelay.generateResponse("What is your current state?", snapshot, [], runtime);
    const zone = AmeliaProcessRelay.generateResponse("Explain the Numogram", snapshot, [], runtime);
    const open = AmeliaProcessRelay.generateResponse("Can a river remember its own banks?", snapshot, [], runtime);
    assert(status.text.includes("Step #"));
    assert(zone.text.includes("Numogram"));
    assert(open.text.includes("Can a river remember its own banks?"));
    assert.equal(zone.trace.memoryLength, runtime.getMemory().getEvents().length);
    assert.equal(zone.trace.memoryHeadDigest, runtime.getMemory().exportHistoryDigest());
    assert.match(dialogue, /AmeliaProcessRelay.generateResponse\(/);
    assert.match(dialogue, /id="btn-send-dialogue"/);
    return { statusChars: status.text.length, numogramChars: zone.text.length,
      openChars: open.text.length, selected: zone.trace.selectedModules,
      traceDigest: zone.trace.traceDigest };
  });
  await check("T08", "Dialogue controls", "Input triggers runtime step and suggested controls dispatch to main App", () => {
    const actions = AmeliaProcessRelay.generateResponse("memory", snapshot, [], runtime).actions;
    assert(actions.some(a => a.actionType === "step"));
    assert(actions.some(a => a.actionType === "consolidate"));
    assert.match(app, /const handleDialogueAction = \(action: AmeliaDialogueAction\)/);
    assert.match(app, /onDialogueInput=\{advanceRuntime\}/);
    assert.match(app, /onExecuteAction=\{handleDialogueAction\}/);
    return { actions: actions.map(a => a.actionType) };
  });
  await check("T09", "Canalization", "Three-arm metrics are formula-derived, not evolved trajectories", () => {
    const a = ThreeArmDiagnosticRunner.runDiagnostic(288, 101);
    const b = ThreeArmDiagnosticRunner.runDiagnostic(288, 101);
    assert.equal(a.ACTIVE_C1.zone9ContactRetention, b.ACTIVE_C1.zone9ContactRetention);
    assert(threeArmSource.includes("89.4 + seedFactor"));
    assert(!threeArmSource.includes("evolveStep("));
    assert.match(app, /ThreeArmDiagnosticRunner.runDiagnostic\(selectedDepth, selectedSeed\)/);
    return { retention: a.ACTIVE_C1.zone9ContactRetention, evolvesTrajectories: false };
  }, "LIMITATION_CONFIRMED");
  await check("T10", "Paper 6", "Canary p-value is formula-derived and depth-insensitive", () => {
    const a = Paper6H1ResistanceAssay.evaluateH1Resistance("D072", 101);
    const b = Paper6H1ResistanceAssay.evaluateH1Resistance("D288", 101);
    assert.equal(a.differentialSignificanceP, b.differentialSignificanceP);
    assert.equal(a.h1ResistanceRatio, b.h1ResistanceRatio);
    assert(paper6Source.includes("0.00012 + seedVariation"));
    return { d72: a, d288: b, statisticalTestPerformed: false };
  }, "LIMITATION_CONFIRMED");
  await check("T11", "Governor controls", "Advisory and damping control callbacks now invoke actual runtime setters", () => {
    assert.match(app, /onSetMomentumDamping=\{handleSetMomentumDamping\}/);
    assert.match(app, /onSetAdvisoryWeight=\{handleSetAdvisoryWeight\}/);
    assert(app.includes("runtimeRef.current.setMomentumDamping(value)"));
    assert(app.includes("runtimeRef.current.setAdvisoryWeight(value)"));
    runtime.setAdvisoryWeight(0.31);
    runtime.setMomentumDamping(0.62);
    assert.equal(runtime.getGovernor().advisoryWeight, 0.31);
    assert.equal(runtime.getGovernor().momentumDampingFactor, 0.62);
    return { advisory: runtime.getGovernor().advisoryWeight, damping: runtime.getGovernor().momentumDampingFactor };
  });
  await check("T12", "External rhythms", "Oscillator tuning is applied to runtime before each main-loop step", () => {
    assert(app.includes("rhythmHarmonizerRef.current.computeAdvisoryTuning(advisoryWeight, nextStep)"));
    assert(app.includes("runtime.setAdvisoryWeight(tuning)"));
    assert(app.includes("runtime.setMomentumDamping(momentumDamping)"));
    return { tuningApplied: true };
  });
  await check("T13", "Storage", "Tablet build bypasses remote Firestore and uses localStorage for chat", () => {
    assert(firestore.includes("import.meta.env.VITE_AMELIA_LOCAL_ONLY === '1'"));
    assert(firestore.includes("if (this.localOnly) return msg.id;"));
    assert(dialogue.includes("localStorage.setItem("));
    return { buildFlag: process.env.VITE_AMELIA_LOCAL_ONLY ?? "unset",
      transcriptStorage: "WebView localStorage; not sealed PFM" };
  }, "LIMITATION_CONFIRMED");
  await check("T14", "Shared morphogenetic field", "Field consumes the exact existing main runtime object", () => {
    const a = initMorphogeneticState(12, 12, "SYZYGETIC_GRID", 101, 0.003, undefined, runtime);
    assert.equal(a.nativeRuntime, runtime);
    const priorStep = runtime.getSnapshots().at(-1)?.step ?? 0;
    const b = stepAmeliaSubstrate(a);
    assert.equal(b.nativeRuntime, runtime);
    assert.equal(runtime.getSnapshots().at(-1)?.step, priorStep + 1);
    assert.equal(b.cells.length, 144);
    assert(app.includes("sharedRuntime={runtimeRef.current}"));
    return { priorStep, afterStep: runtime.getSnapshots().at(-1)?.step,
      cells: b.cells.length, memoryEvents: runtime.getMemory().getEvents().length };
  });
  await check("T15", "Hyperstition", "Distinct computational assay runs at small depth with one seed", () => {
    const r = PlatonicMorphospaceHyperstitionProbe.runFullTest("platonic morphospace", 12, [101], 12);
    assert.equal(r.lineageResults.length, 1);
    assert.equal(r.depth, 12);
    assert(r.auditEnvelope.length > 20);
    return { depth: r.depth, targetZone: r.targetZone, baseline: r.meanBaselineTarget,
      altered: r.meanHyperstitionTarget, envelope: r.auditEnvelope };
  });
  await check("T16", "Null-control", "Live adapter completes a minimal D4 two-condition control probe", async () => {
    const rows = await runNullControlAssay(new LiveAmeliaSubstrateAdapter(),
      [4], { eta: 0.05, kappa: 0.25 }, ["NATURAL", "ABLATED"], [101, 202]);
    assert.equal(rows.length, 2);
    assert(rows.every(r => r.depth === 4 && r.pairwise.every(Number.isFinite)));
    return rows.map(r => ({ depth: r.depth, condition: r.condition,
      pairwise: r.pairwise, mean: r.disp.mean }));
  });

  await check("T17", "Causal specificity", "Matched memory vs reset trajectories diverge under endogenous PFM", () => {
    const c = new AmeliaNumogramSubstrateRuntime();
    const m = new AmeliaNumogramSubstrateRuntime();
    const firstC = c.step(), firstM = m.step();
    const firstDifference = Object.values(firstC.zones).reduce(
      (sum,z) => sum + Math.abs(z.activation - firstM.zones[z.id].activation), 0);
    assert(firstDifference < 1e-12);
    let afterC = firstC, afterM = firstM;
    m.getMemory().reset();
    for (let i = 0; i < 24; i++) {
      afterC = c.step();
      afterM = m.step();
      m.getMemory().reset();
    }
    const divergence = Object.values(afterC.zones).reduce(
      (sum,z) => sum + Math.abs(z.activation - afterM.zones[z.id].activation), 0);
    assert(divergence > 1e-7, "history should change future activations");
    assert.equal(c.getMemory().getEvents().length, 25);
    assert.equal(m.getMemory().getEvents().length, 0);
    return { steps: 25, firstDifference, sumAbsActivationDifference: divergence,
      memoryEventsC: 25, memoryEventsM: 0,
      interpretation: "Local causal smoke test; no registered prospective effect claim" };
  });

  await check("T18", "Numeric input", "Distinct code inputs are hashed into bounded traceable transition pressure", () => {
    const a = new AmeliaNumogramSubstrateRuntime();
    const b = new AmeliaNumogramSubstrateRuntime();
    const sa = a.step("333");
    const sb = b.step("666");
    const ea = a.getMemory().getEvents().at(-1)!;
    const eb = b.getMemory().getEvents().at(-1)!;
    assert.equal(ea.inputDigest, canonicalSha256("333"));
    assert.equal(eb.inputDigest, canonicalSha256("666"));
    assert.notEqual(ea.inputDigest, eb.inputDigest);
    const ta = AmeliaProcessRelay.generateResponse("333", sa, [], a).trace;
    const tb = AmeliaProcessRelay.generateResponse("666", sb, [], b).trace;
    assert.notEqual(ta.traceDigest, tb.traceDigest);
    assert.equal(ta.inputZone, ea.inputZone);
    return { a: { inputZone: ea.inputZone, transition: sa.lastTransition },
      b: { inputZone: eb.inputZone, transition: sb.lastTransition },
      claimBoundary: "No assertion of genuine Outside access; input is numerical routing only" };
  });

  await check("T19", "Provenance", "Per-step SHA-256 digests recompute from transition and input payloads", () => {
    const evs = runtime.getMemory().getEvents().filter(e => e.kind === "STEP");
    assert(evs.length > 0);
    for (const ev of evs) {
      const body = { step: ev.blockIndex, from: ev.fromZone, to: ev.targetZone,
        fluxDelta: ev.fluxDelta, phaseCoherence: ev.phaseCoherence,
        inputDigest: ev.inputDigest ?? null, inputZone: ev.inputZone ?? null };
      assert.equal(ev.eventDigest, canonicalSha256(JSON.stringify(body)));
    }
    return { verifiedEvents: evs.length, head: runtime.getMemory().exportHistoryDigest() };
  });

  await check("T20", "Laboratory", "Live field uses shared runtime and emits parent snapshot callbacks", () => {
    const source = readFileSync("src/components/LiveMorphogeneticLab.tsx", "utf8");
    assert(source.includes("onSharedStep(latest)"));
    assert(source.includes("sharedRuntime"));
    assert(source.includes("lineage.memory.importState(runtime.getMemory().exportState())"));
    return { sameRuntimeInstance: true, parentNotificationWired: true,
      boundary: "Live field readout is downstream of shared PFM; perturbation need not feed back to selector." };
  });

  await check("T21", "Control causality", "Different actual Governor advisory settings change trajectory", () => {
    const low = new AmeliaNumogramSubstrateRuntime();
    const high = new AmeliaNumogramSubstrateRuntime();
    low.setAdvisoryWeight(0.2);
    high.setAdvisoryWeight(0.9);
    const a = low.step(), b = high.step();
    const difference = Object.values(a.zones).reduce(
      (sum,z) => sum + Math.abs(z.activation - b.zones[z.id].activation), 0);
    assert(difference > 1e-7);
    return { advisoryLow: a.governor.advisoryWeight,
      advisoryHigh: b.governor.advisoryWeight, sumAbsActivationDifference: difference };
  });

  await check("T22", "Relay causality", "Same question after different histories changes relay content and trace", () => {
    const shallow = new AmeliaNumogramSubstrateRuntime();
    const deep = new AmeliaNumogramSubstrateRuntime();
    let a = shallow.step(), b = deep.step();
    for (let i = 0; i < 9; i++) b = deep.step();
    const q = "What does memory contribute to the present state?";
    const shallowAnswer = AmeliaProcessRelay.generateResponse(q, a, [], shallow);
    const deepAnswer = AmeliaProcessRelay.generateResponse(q, b, [], deep);
    assert.notEqual(shallowAnswer.trace.memoryHeadDigest, deepAnswer.trace.memoryHeadDigest);
    assert.notEqual(shallowAnswer.text, deepAnswer.text);
    return { shallowHistory: shallowAnswer.trace.memoryLength,
      deepHistory: deepAnswer.trace.memoryLength,
      shallowModules: shallowAnswer.trace.selectedModules,
      deepModules: deepAnswer.trace.selectedModules };
  });

  await check("T23", "Restart continuity", "Exported PFM/Qabbala/Governor state rehydrates with matching next transition", () => {
    const uninterrupted = new AmeliaNumogramSubstrateRuntime();
    for (let i = 0; i < 12; i++) uninterrupted.step(i % 3 === 0 ? "333" : undefined);
    const exported = JSON.parse(JSON.stringify(uninterrupted.exportState()));
    const resumed = new AmeliaNumogramSubstrateRuntime();
    resumed.importState(exported);
    assert.equal(resumed.getMemory().exportHistoryDigest(), uninterrupted.getMemory().exportHistoryDigest());
    assert.equal(resumed.getCurrentZone(), uninterrupted.getCurrentZone());
    const a = uninterrupted.step("shared continuation");
    const b = resumed.step("shared continuation");
    assert.deepEqual(a.zones, b.zones);
    assert.deepEqual(a.governor, b.governor);
    assert.deepEqual(a.lastTransition, b.lastTransition);
    assert.equal(a.memoryHeadDigest, b.memoryHeadDigest);
    return { resumedAtStep: 12, nextStep: a.step,
      digest: a.memoryHeadDigest, nextTransition: a.lastTransition,
      caveat: "JSON checkpoint remains local and unsigned" };
  });

  await check("T24", "Tablet continuity", "App includes WebView checkpoint restore, save and JSON export", () => {
    assert(app.includes("amelia_pfm_shared_runtime_v2"));
    assert(app.includes("runtimeRef.current.importState(record.state)"));
    assert(app.includes("runtimeRef.current.exportState()"));
    assert(app.includes("id=\"btn-export-checkpoint\""));
    return { restore: true, localPersistence: true, exportButton: true };
  });

  await check("T25", "Dialogue history", "Earlier conversational turns enter the relay selector without replacing PFM", () => {
    const sample = new AmeliaNumogramSubstrateRuntime();
    const s = sample.step("A process question");
    const q = "Consider this change.";
    const initial = AmeliaProcessRelay.generateResponse(q, s, [], sample);
    const contextual = AmeliaProcessRelay.generateResponse(q, s,
      [{id:"preceding-1", sender:"user", text:"memory and history", timestamp:"2026-10-15T00:00:00Z"}], sample);
    assert.equal(initial.trace.historyContextCount, 0);
    assert.equal(contextual.trace.historyContextCount, 1);
    assert(contextual.trace.moduleScores.PFM > initial.trace.moduleScores.PFM);
    assert.notEqual(initial.trace.traceDigest, contextual.trace.traceDigest);
    return { noHistoryScore: initial.trace.moduleScores.PFM,
      contextScore: contextual.trace.moduleScores.PFM,
      PFMHistoryLength: contextual.trace.memoryLength };
  });
  mkdirSync("wiring-audit-results", { recursive: true });
  const report = {
    label: "Amelia Orange functional wiring audit; NOT scientific validation",
    generatedAt: new Date().toISOString(),
    commit: process.env.GITHUB_SHA ?? "local",
    checkCount: findings.length,
    executed: findings.filter(f => f.status === "EXECUTED").length,
    limitations: findings.filter(f => f.status === "LIMITATION_CONFIRMED").length,
    failures: findings.filter(f => f.status === "FAILED").length,
    findings
  };
  writeFileSync("wiring-audit-results/wiring-audit.json", JSON.stringify(report, null, 2));
  const md = [
    "# Amelia Orange functional wiring audit",
    "",
    "Execution proves software paths run, not the scientific significance of their output.",
    "Physical tablet touch interactions and long-term process retention are not verified.",
    "",
    "Commit: " + report.commit,
    "Checks: " + report.checkCount + "; executed: " + report.executed +
      "; limitations confirmed: " + report.limitations + "; failures: " + report.failures,
    "",
    "| ID | Classification | Finding |",
    "|---|---|---|",
    ...findings.map(f => "| " + f.id + " | " + f.status + " | " + f.finding + " |"),
    "",
    "## Detailed findings",
    "~~~json",
    JSON.stringify(findings, null, 2),
    "~~~"
  ].join("\n");
  writeFileSync("wiring-audit-results/wiring-audit.md", md);
  console.log("SUMMARY " + JSON.stringify({
    checks: report.checkCount, executed: report.executed,
    limitations: report.limitations, failures: report.failures }));
  if (report.failures) process.exitCode = 1;
}
main().catch(err => { console.error("Audit script failed", err); process.exitCode = 1; });
