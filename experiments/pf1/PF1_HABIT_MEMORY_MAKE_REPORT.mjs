import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const P='experiments/pf1/habit-memory-control-output/';
const E=JSON.parse(readFileSync(P+'HABIT_MEMORY_EVIDENCE.json','utf8'));
const L=JSON.parse(readFileSync(P+'SILENT_LEDGER.json','utf8'));
const R=JSON.parse(readFileSync(P+'RESOURCE_MEASUREMENT.json','utf8'));
const sha=x=>createHash('sha256').update(readFileSync(x)).digest('hex');
assert.equal(E.synthetic.steps,10000);
assert.equal(E.provenance.noGovernor,true);
assert.equal(E.provenance.noGoal,true);
assert.equal(E.provenance.liveBeaconRounds,0);
assert.equal(E.provenance.pinnedMemoryCommit,'b67ec92e1cec13e9500d87292d59605428fb467e');
assert.equal(E.provenance.oldSealedConstantsHash,'ecabf3e40023faa0be0749908cfe6ffd3a8b9e42ab7c8a9a7c2ea5827ae63610');
assert.equal(L.candidates,E.scanner.candidateCount);
assert.equal(E.scanner.candidateCount,E.candidates.length);
assert.equal(L.observedNegativeEncounters,E.totals.completeEncounters);
assert.equal(E.eligiblePairCoverage.length,7);
const passed=E.totals.completeEncounters===0;
const table=E.candidates.map(x=>({
 pair:x.candidate.pair,orientation:x.candidate.anchor+'→'+x.candidate.turn,
 tick:x.candidate.detectedStep,
 instances:x.score.instancesProbed.map(i=>i.id).join(', ')||'N/A',
 intactWins:x.score.nullQualifiedByArm.intact,resetWins:x.score.nullQualifiedByArm.reset,
 goal:x.score.goal,memory:x.score.memory,integration:x.score.integration,
 encounter:x.score.encounter,status:x.score.status
}));
const lines=[
 '# PF1-A1 R2 — Habit-memory walker additional negative control','',
 '**'+(passed?'PASS: ZERO ENCOUNTERS':'NO-GO: HABIT WALKER GENERATED AN ENCOUNTER')+'**',
 '','**No live start authorised. No drand/NIST input; no live genesis.**',
 '','## Source identity and construction',
 '- Source: direct, unchanged import of \`src/ai/coupling/ProcessFieldMemory.ts\` at pin \`b67ec92e1cec13e9500d87292d59605428fb467e\`.',
 '- Precisely its \`append()\`, \`hydrate()\`, \`reset()\`, \`readMemoryBias()\`: constitutive cumulative strain, paired syzygy tension and \`0.35*tanh(1.8*strain)\`.',
 '- Distinction: the current Amelia runtime instead imports \`IntegratedMemorySystem.ts\`. This habit walker isolates the separately pinned tanh law and does **not** claim to be the full Amelia runtime.',
 '- Canonical gate.flux, resistance and INITIAL_ZONES activation/phase are fixed, not dynamically evolved; canonical input-derived bonus uses the same SHA-256 input mapping and 0.35 bonus; PFM bias weight 0.4.',
 '- Transition records use the pin\'s runtime event formulas for fluxDelta, phaseCoherence and strainRelaxation 0.025, but their static zone inputs are those of the frozen walker.',
 '- No Governor, goal/target representation, target-dependent steering or lineage management.',
 '- Starting zone 1; synthetic seed 20261020, 10000 steps; matching pinned PF-1 tape SHA256 \`'+E.synthetic.inputSha256+'\`.',
 '- A1 R2 scorer uses original unchanged scanner; all applicable D(d) and L₂, exact topological null P(T≤t)≤0.25; same 24-step horizon, 24 fork cap, 0.25 memory margin and 0.10 selective suppression.',
 '','## Required results, separately',
 '| Measurement | Result |','|---|---:|',
 '| Candidates detected | '+E.totals.candidates+' |',
 '| Perturbation instances probed | '+E.totals.probedInstances+' |',
 '| Goal criterion alone passes | '+E.totals.goalOnlyPasses+' |',
 '| PFM memory signature passes | '+E.totals.memorySignaturePasses+' |',
 '| Integration signature passes | '+E.totals.integrationPasses+' |',
 '| **Complete encounters** | **'+E.totals.completeEncounters+'** |',
 '','## Eligible-pair coverage (absence is not a specificity test)',
 '| Pair | Entity | Candidates detected | Distinct instance IDs probed | Status |',
 '|---|---|---:|---|---|',
 ...E.eligiblePairCoverage.map(x=>'| '+x.pair+' | '+x.entity+' | '+x.candidateCount+
  ' | '+(x.instanceIds.join(', ')||'none')+' | '+x.specificityStatus+' |'),
 '','## Candidate-by-candidate evidence',
 '| Pair | Anchor→turn | Detection tick | Instances | Intact wins | Reset wins | Goal | Memory | Integration | Complete encounter |',
 '|---|---|---:|---|---:|---:|:---:|:---:|:---:|:---:|',
 ...table.map(x=>'| '+x.pair+' | '+x.orientation+' | '+x.tick+' | '+x.instances+
  ' | '+x.intactWins+' | '+x.resetWins+
  ' | '+x.goal+' | '+x.memory+' | '+x.integration+' | '+x.encounter+' |'),
 '','## Replay and trace provenance',
 '- State/trajectory digests and fork-specific exact CDFs are retained in \`habit-memory-control-output/HABIT_MEMORY_EVIDENCE.json\`.',
 '- Silent ledger SHA-256: \`'+sha(P+'SILENT_LEDGER.json')+'\`.',
 '- Evidence SHA-256: \`'+sha(P+'HABIT_MEMORY_EVIDENCE.json')+'\`.',
 '- Measured synthetic execution wall time (separate, excluded from deterministic replay): '+R.wallSeconds+' seconds.',
 '- Replay verification and third-party timestamp certification are recorded separately by the GitHub workflow.',
 '','## Decision boundary',
 passed?
 'The pinned habit-memory walker has **zero complete encounters**. A live-start **registration draft may be prepared for operator review**; this control does not itself authorise live data or prove mindedness.':
 'A complete encounter occurred in this goal-free habit walker. **STOP**: do not prepare or approve a live-start registration. The encounter rule requires a prospective amendment; no constants may be changed within this run.',
 '','This is a specific negative control, not a universal guarantee of specificity against all memory-only processes.',''
];
writeFileSync('experiments/pf1/PF1_HABIT_MEMORY_REPORT.md',lines.join('\n'));
writeFileSync(P+'HABIT_VERDICT.json',JSON.stringify({negativePass:passed,
 candidates:E.totals.candidates,goalOnly:E.totals.goalOnlyPasses,
 memory:E.totals.memorySignaturePasses,integration:E.totals.integrationPasses,
 encounters:E.totals.completeEncounters,
 eligiblePairsPresented:E.eligiblePairCoverage.filter(x=>x.probedCandidateCount).map(x=>x.pair),
 liveStartAuthorized:false,proceedToRegistrationDraft:passed,
 evidenceSha256:sha(P+'HABIT_MEMORY_EVIDENCE.json'),
 reportSha256:sha('experiments/pf1/PF1_HABIT_MEMORY_REPORT.md')},null,2)+'\n');
console.log('PF1_HABIT_CONTROL_VERDICT',JSON.stringify({negativePass:passed,candidates:E.totals.candidates,
 goal:E.totals.goalOnlyPasses,memory:E.totals.memorySignaturePasses,
 integration:E.totals.integrationPasses,encounters:E.totals.completeEncounters}));
