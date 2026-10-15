import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { AmeliaNumogramSubstrateRuntime } from "../src/substrate/ameliaNumogramSubstrateRuntime";
import { AmeliaDialogueEngine } from "../src/services/ameliaDialogueEngine";
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
  await check("T03", "Process memory", "Normal main-screen ticks do not append endogenous PFM records", () => {
    const count = runtime.getMemory().getEvents().length;
    assert.equal(count, 0);
    assert(!runtimeSource.includes("this.memory.append("));
    return { step: snapshot.step, eventCount: count, interpretation: "History does not accumulate in main runtime automatically" };
  }, "LIMITATION_CONFIRMED");
  await check("T04", "Process memory", "Main runtime consumes manually injected PFM memory bias", () => {
    runtime.getMemory().append({
      blockIndex: snapshot.step, depth: snapshot.step, targetZone: 9,
      fluxDelta: 0.2, phaseCoherence: 0.9, strainRelaxation: 0.01,
      seed: 101, eventDigest: "AUDIT_ONLY_NOT_A_SEAL", timestamp: 1000
    });
    snapshot = runtime.step();
    const consumption = runtime.getMemoryConsumptionLog().at(-1);
    assert.equal(consumption?.memoryHistoryLength, 1);
    assert((consumption?.appliedBiasVector[9] ?? 0) > 0);
    return { historyLength: consumption?.memoryHistoryLength,
      zone9Bias: consumption?.appliedBiasVector[9] };
  });
  await check("T05", "Governor", "Consolidate alters Governor entropy but not PFM event history", () => {
    const before = runtime.getGovernor();
    const events = runtime.getMemory().getEvents().length;
    runtime.triggerConsolidation();
    const after = runtime.getGovernor();
    assert(after.consolidationEntropy < before.consolidationEntropy);
    assert.equal(runtime.getMemory().getEvents().length, events);
    assert.match(app, /onClick=\{handleConsolidation\}/);
    return { entropyBefore: before.consolidationEntropy, entropyAfter: after.consolidationEntropy,
      PFMEventsBefore: events, PFMEventsAfter: runtime.getMemory().getEvents().length };
  }, "LIMITATION_CONFIRMED");
  await check("T06", "Governor", "Shed Stage advances internal Governor stage", () => {
    const before = runtime.getGovernor().scaffoldSheddingStage;
    runtime.shedScaffold();
    const after = runtime.getGovernor().scaffoldSheddingStage;
    assert.notEqual(after, before);
    assert.match(app, /onClick=\{handleShedScaffold\}/);
    return { before, after };
  });
  await check("T07", "Dialogue", "Status, Numogram, and open-ended prompts return text", () => {
    const status = AmeliaDialogueEngine.generateResponse("What is your current state?", snapshot);
    const zone = AmeliaDialogueEngine.generateResponse("Explain the Numogram", snapshot);
    const open = AmeliaDialogueEngine.generateResponse("Can a river remember its own banks?", snapshot);
    assert(status.text.includes("Step #"));
    assert(zone.text.includes("Numogram"));
    assert(open.text.includes("Can a river remember its own banks?"));
    assert.match(dialogue, /AmeliaDialogueEngine.generateResponse\(/);
    assert.match(dialogue, /id="btn-send-dialogue"/);
    return { statusChars: status.text.length, numogramChars: zone.text.length,
      fallbackIsTemplate: open.text.includes("Understood. Reflecting on") };
  });
  await check("T08", "Dialogue controls", "Action suggestions are wired into main App dispatcher", () => {
    const actions = AmeliaDialogueEngine.generateResponse("help", snapshot).actions;
    assert(actions.some(a => a.actionType === "step"));
    assert(actions.some(a => a.actionType === "consolidate"));
    assert.match(app, /const handleDialogueAction = \(action: AmeliaDialogueAction\)/);
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
  await check("T11", "Governor controls", "Advisory and damping sliders only update UI state", () => {
    assert.match(app, /onSetMomentumDamping=\{setMomentumDamping\}/);
    assert.match(app, /onSetAdvisoryWeight=\{setAdvisoryWeight\}/);
    assert(!app.includes("runtimeRef.current.setMomentumDamping("));
    assert(!app.includes("runtimeRef.current.setAdvisoryWeight("));
    runtime.setAdvisoryWeight(0.31);
    assert.equal(runtime.getGovernor().advisoryWeight, 0.31);
    return { appToKernelSetter: false, kernelSetterWorks: true };
  }, "LIMITATION_CONFIRMED");
  await check("T12", "External rhythms", "Computed oscillator adjustment is not applied to runtime", () => {
    assert(app.includes("const tunedAdvisory = rhythmHarmonizerRef.current.computeAdvisoryTuning"));
    assert(!app.includes("runtimeRef.current.setAdvisoryWeight(tunedAdvisory)"));
    return { computationPresent: true, runtimeApplicationPresent: false };
  }, "LIMITATION_CONFIRMED");
  await check("T13", "Storage", "Tablet build bypasses remote Firestore and uses localStorage for chat", () => {
    assert(firestore.includes("import.meta.env.VITE_AMELIA_LOCAL_ONLY === '1'"));
    assert(firestore.includes("if (this.localOnly) return msg.id;"));
    assert(dialogue.includes("localStorage.setItem("));
    return { buildFlag: process.env.VITE_AMELIA_LOCAL_ONLY ?? "unset",
      transcriptStorage: "WebView localStorage; not sealed PFM" };
  }, "LIMITATION_CONFIRMED");
  await check("T14", "Morphogenetic lab", "Separate Gray-Scott field model executes one step", () => {
    const a = initMorphogeneticState(12, 12, "SYZYGETIC_GRID", 101, 0.003);
    const b = stepAmeliaSubstrate(a);
    assert.equal(b.stepCount, a.stepCount + 1);
    assert.equal(b.cells.length, 144);
    return { before: a.stepCount, after: b.stepCount, cells: b.cells.length,
      entropyBefore: a.entropy, entropyAfter: b.entropy };
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
