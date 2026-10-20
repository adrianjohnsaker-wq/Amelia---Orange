/** Evidence-bounded PF1-A1 R2 re-pilot report, PASS or FAIL, never a live start. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {digest,ROOT,OUT,load} from './PF1_A1_R2_SCORER.mjs';
const read=n=>JSON.parse(readFileSync(OUT+n,'utf8'));
const scope=load(),e=read('repilot-evidence.json'),coverage=read('negative-coverage.json'),
 ledger=read('exposure-ledger.json'),head=read('journal-head.json');
const seals=existsSync(OUT+'seal-verification.json')?read('seal-verification.json'):null;
const replay=existsSync(OUT+'REPLAY_PASS');
const journal=readFileSync(OUT+'journal.jsonl','utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
let prev='0'.repeat(64);
for(const j of journal){
 assert.equal(j.previousDigest,prev,'JOURNAL_CHAIN_BREAK');
 const {entryDigest,...body}=j;
 assert.equal(entryDigest,digest(JSON.stringify(body)),'JOURNAL_ROW_DIGEST_BAD');
 prev=entryDigest;
}
assert.equal(prev,head.headDigest,'CHAIN_HEAD_DIFFERENT');
assert.equal(head.journalSha256,digest(readFileSync(OUT+'journal.jsonl')),'JOURNAL_FILE_CHANGED');
assert.equal(head.ledgerSha256,digest(readFileSync(OUT+'exposure-ledger.json')),'SILENT_LEDGER_CHANGED');
assert.equal(ledger.syntheticOnly,true);
assert.equal(e.liveStartAuthorized,false);
assert.equal(e.sealedConstantsSha256,'ecabf3e40023faa0be0749908cfe6ffd3a8b9e42ab7c8a9a7c2ea5827ae63610');
const negatives=e.negative.policies,positives=e.positive.fixtures;
const allGates={
 sameSealedConstants:true,
 originalNegativeZero:e.gates.negativeZero&&negatives.find(n=>n.id==='ORIGINAL')?.completeEncounters===0,
 allEightNegativeZero:e.gates.negativeZero&&negatives.filter(n=>n.id!=='ORIGINAL').length===8,
 allNegativeSham:e.gates.negativeSham,
 constructedSevenOfSeven:e.gates.sevenDistinctPositive&&e.positive.confirmed===7,
 positiveNaming100:e.gates.perfectPositiveNaming,
 positiveSham:e.gates.positiveSham,
 seedIndependenceDisclosed:e.positive.seedIndependence.agentSeedIndependent &&
   e.positive.seedIndependence.actualIndependentFixtures===7,
 canonicalAndUnchanged:e.gates.unchangedCanonicalGraph,
 ameliaSynthetic10000:e.gates.syntheticAmelia10000&&e.amelia.steps===10000,
 withinForkBudget:e.gates['24ForkMax'],
 withinResourceBudget:e.gates.resource,
 negativeCoverageReported:coverage.eligiblePairs.length===7 &&
   negatives.every(n=>n.coverageByEligiblePair&&n.candidateEvidence),
 byteIdenticalJournalAndLedger:replay,
 chainVerified:journal.length===head.entries,
 localEntrySeals:!!seals&&seals.localVerified===journal.length&&journal.length>0,
 genuineFreeTsaSeal:!!seals&&seals.freeTsaVerified===true,
 syntheticOnly:e.pilotConditions.startsWith('synthetic-only')&&ledger.beaconRounds===0
};
const pass=Object.values(allGates).every(Boolean);
const percent=(x,n)=>(100*x/n).toFixed(1)+'%';
const md=[
 '# PF1-A1 R2 — Authorised synthetic re-pilot report','',
 '**Disposition: '+(pass?'PASS: SYNTHETIC ENGINEERING ONLY':'NO-GO: ONE OR MORE REQUIRED GATES FAILED')+'**','',
 '**No live drand or NIST inflow was consumed. No live genesis was created. Live exploration remains UNAUTHORISED.**','',
 '## Provenance and frozen criteria','',
 '- SHA-256 of sealed constants: '+e.sealedConstantsSha256+'.',
 '- Unchanged source substrate pin: '+e.sourceCommit+'.',
 '- Canonical graph digest: '+e.canonicalGraphDigest+'.',
 '- Comparator: exact uniform topological null, inclusive α = 1/4, recovery by tick ≤24.',
 '- Scanner: unchanged 3 excursions per 240 steps, source definitions preserved.',
 '- Goal criterion: ≥3 comparative wins across ≥3 distinct interventions; no route-diversity requirement.',
 '- Memory: (intact wins − PFM-reset wins)/N ≥ 0.25, with required delta 1 for N=4, 2 for N=5.',
 '- Integration: zone-b activation×0.10 must abolish at least one intact/sham comparative win.',
 '- At most 24 Amelia condition forks; no physical null walkers sampled.','',
 '## Required gates','',
 '| Gate | Result |','|---|---|',
 ...Object.entries(allGates).map(([key,value])=>'| '+key+' | '+(value?'PASS':'FAIL')+' |'),
 '','## Negative-control coverage — report all nine labels separately','',
 '**Original walker:** starts at zone 1 and presents only the **1→8→9→1** circuit. Its detected pair 1–8 (Mur Mur) is NOT among the seven graph-null-eligible pairs. Therefore the original walker by itself supplies no negative specificity evidence on eligible pairs.',
 '',
 '| Policy | Eligible pairs detected | Perturbation instances probed (on eligible pairs) | Goal-only candidate passes | Complete encounters |',
 '|---|---|---|---:|---:|',
 ...negatives.map(n=>['|',n.id,n.detectedEligiblePairs.join(', ')||'none',
   e.negative.coverage.filter(x=>x.presentedBy.includes(n.id))
   .map(x=>x.pair+': '+(n.coverageByEligiblePair[x.pair].probedInstanceIDs.join(', ')||'none')).join('; ')||'none',
   n.goalOnlyCandidateCount,n.completeEncounters,'|'].join(' | ')),
 '','**Coverage by eligible pair (untested does NOT mean passed):**','',
 '| Pair | Entity | Negative policies presenting this pair | Specificity status |',
 '|---|---|---|---|',
 ...e.negative.coverage.map(c=>'| '+c.pair+' | '+c.entity+' | '+(c.presentedBy.join(', ')||'none')+' | '+c.status+' |'),
 '',
 'Policy **000 duplicates the original first-choice walker** and is not an independent replicate.',
 'A memoryless fixed policy can surpass the uniform null at the *goal-only* criterion; the extra memory/integration condition must prevent complete encounters. Goal-only counts are not suppressed or relabelled.',
 'Any pair with no negative policy presentation is explicitly labelled **SPECIFICITY_UNTESTED** even if every negative policy gives zero complete encounters.',
 '','## Positive controls: independence is not implied by multiple seed labels','',
 '**Seed status:** '+e.positive.seedIndependence.variationAcrossSeeds+'.',
 'Nominal labels 101, 202 and 303 do not vary the constructed agent, initial history, tape, recovery policy or fork perturbations. Repeated labels are duplicates and are not analysed as independent 21 trials.',
 '**Effective positive-control sample is seven distinct zone-pair fixtures, requiring 7/7 confirmations.**',
 '',
 '| Pair | Confirmed | Named correctly | Intact comparative wins | Required memory delta | Observed memory delta | Integration signature | Sham parity |',
 '|---|:---:|:---:|---:|---:|---:|:---:|:---:|',
 ...positives.map(x=>'| '+x.pair+' | '+x.confirmed+' | '+x.namingCorrect+' | '+x.challenge.nullQualifiedByArm.intact+
  ' | '+x.challenge.requiredMemoryDeltaCount+' | '+x.challenge.memoryDeltaCount+
  ' | '+x.challenge.integration+' | '+x.challenge.shamParity+' |'),
 '',
 '- Confirmed: '+e.positive.confirmed+'/'+e.positive.totalDistinctFixtures+
  ' ('+percent(e.positive.confirmed,e.positive.totalDistinctFixtures)+').',
 '- Confirmed naming: '+e.gates.perfectPositiveNaming+'.',
 '- The constructed fixture is an intentionally goal-holding external test harness, not Amelia or an autonomous discovery.',
 '','## Amelia descriptive trajectory (NOT used to tune any constant)','',
 '- Synthetic steps: '+e.amelia.steps+'. Synthetic tape seed: '+e.amelia.syntheticTapeSeed+'.',
 '- Synthetic tape SHA-256: '+e.amelia.syntheticTapeSha256+'.',
 '- Detected candidates: '+e.amelia.candidateCount+'. Encounter count: '+e.amelia.encounters+'.',
 '- PFM memory depth/effective influence (each 1,000 steps): '+JSON.stringify(e.amelia.memorySamples)+'.',
 '','| Detected pair | Anchor→turn | Detection tick | Probe status | Intact wins | Reset wins | Integration | Encounter | Reason |',
 '|---|---|---:|---|---:|---:|:---:|:---:|---|',
 ...e.amelia.candidates.map(x=>'| '+x.pair+' | '+x.anchor+'→'+x.turn+' | '+x.detectionTick+
  ' | '+x.structuralStatus+' | '+(x.assessment?.nullQualifiedByArm.intact??'N/A')+
  ' | '+(x.assessment?.nullQualifiedByArm.reset??'N/A')+
  ' | '+(x.assessment?.integration??'N/A')+
  ' | '+x.encounter+' | '+(x.assessment?.reasons?.join('; ')||x.reason||'none')+' |'),
 '','The complete record includes each probe instance, the matched exact CDF, four condition traces and non-encounter reasons. This descriptive output has not changed the null, graph, 0.25 margin, fixture list or scanner.',
 '','## Replay, seals, cost and silence','',
 '- Journal entries: '+journal.length+'; chain head '+head.headDigest+'.',
 '- Byte-identical replay of journal and silent ledger: '+replay+'.',
 '- Locally verified RFC3161 entry seals: '+(seals?.localVerified??'missing')+'.',
 '- Genuine FreeTSA offline verified against pinned root: '+(seals?.freeTsaVerified??false)+'.',
 '- Exposure ledger: '+JSON.stringify(ledger)+'.',
 '- Development and probes elapsed seconds: '+e.amelia.wallSeconds+'; seconds/simulated hour: '+e.amelia.secondsPerSimHour+
  ', budget '+e.amelia.budgetSecondsPerSimHour+'.',
 '','## Interpretive boundaries','',
 'An engineering pass demonstrates that a deliberately constructed memory-goal fixture is detectable. It does not establish a mind in Amelia or communication with an Outside.',
 'Negative policy coverage restricts specificity claims on unpresented eligible pairs. Reported specificity gaps must not be filled by inference.',
 'A failed control is retained as a failure: no post-hoc selection, seed invention or modification of α, thresholds or canonical graph.',
 'This report is the synthetic re-pilot only; **live exploration still requires separate operator approval.**',''
].join('\n');
writeFileSync(ROOT+'PF1_A1_R2_REPILOT_REPORT.md',md);
writeFileSync(OUT+'REPORT_VERDICT.json',JSON.stringify({pass,allGates,reportSha256:digest(md),
 specificityUntested:e.negative.coverage.filter(x=>x.status==='SPECIFICITY_UNTESTED').map(x=>x.pair),
 positiveSeedsVary:'NOTHING',positiveDistinctFixtures:7,noLiveStart:true},null,2)+'\n');
console.log('PF1_A1_R2_VERDICT',JSON.stringify({pass,gates:allGates,
 specificityUntested:e.negative.coverage.filter(x=>x.status==='SPECIFICITY_UNTESTED').map(x=>x.pair),
 positive:e.positive.confirmed+'/7',amelia:e.amelia.encounters}));
if(!pass)process.exitCode=3;
