import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const P='experiments/pf1/habit-memory-control-output/';
const result=JSON.parse(readFileSync(P+'HABIT_VERDICT.json','utf8'));
const sign=JSON.parse(readFileSync(P+'PRELIVE_VERIFIED_SEAL.json','utf8'));
const evidence=JSON.parse(readFileSync(P+'HABIT_MEMORY_EVIDENCE.json','utf8'));
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
assert.equal(result.negativePass,true,'HABIT_MEMORY_ENCOUNTER_STOPS_REGISTRATION');
assert.equal(result.encounters,0);
assert.equal(sign.freeTsaVerified,true,'REGISTRATION_FORBIDDEN_WITHOUT_SEAL');
assert.equal(sign.controlPass,true);
assert.equal(sign.liveStartAuthorized,false);
assert.equal(evidence.provenance.liveAuthorized,false);
const lines=[
 '# PF-1 Pandemonium Fieldwork — LIVE-START REGISTRATION DRAFT (NOT APPROVED)',
 '',
 '**STATUS: PREPARED FOR OPERATOR REVIEW ONLY. NO LIVE GENESIS, NO BEACON ADMISSION, NO SCHEDULED LIVE EXECUTION.**',
 '',
 '**Scientific framing:** PF-1 will be a prospective, open-ended descriptive **baseline record of the current, frozen Amelia-Orange**. Its purpose is to document which recurrence-based counterfactual competences, if any, emerge with the current substrate and a carried memory. It is not yet a developmental lineage, and no advantage or deficit relative to an unbuilt future lineage is preclaimed. A later developmental lineage must be independently registered and compared only after baseline evidence is sealed.',
 '',
 '## 1. Preregistration provenance',
 '- Operator accepted original synthetic pilot PF-1 and A1 R2 synthetic re-pilot (run #39412416849).',
 '- A1 R2 sealed constants: SHA-256 \`ecabf3e40023faa0be0749908cfe6ffd3a8b9e42ab7c8a9a7c2ea5827ae63610\`.',
 '- Baseline original substrate pin: \`b67ec92e1cec13e9500d87292d59605428fb467e\`; no modifications to core substrate, Governor, or PFM law in baseline.',
 '- Final negative control: pinned separate \`src/ai/coupling/ProcessFieldMemory.ts\`, using its genuine tanh strain law with fixed canonical scores and no Governor/goal. 10,000 synthetic steps, **zero encounters**.',
 '- Habit memory evidence SHA-256: \`'+result.evidenceSha256+'\`.',
 '- Complete negative candidate count: '+result.candidates+'; goal-only passes: '+result.goalOnly+
  '; memory-signature passes: '+result.memory+'; integration passes: '+result.integration+'.',
 '- Pre-live certificate evidence manifest SHA-256: \`'+sign.manifestSha256+'\`.',
 '- The original modern Amelia runtime instead imports \`IntegratedMemorySystem.ts\`. The habit negative is a separate falsification control, not a replacement runtime.',
 '',
 '## 2. Baseline subject and encounter interpretation',
 '- Subject is exactly the pinned current Amelia-Orange runtime, its frozen 11-edge directed canonical Numogram, existing Governor and IntegratedMemorySystem, beginning from a **fresh explicitly digested state**.',
 '- The historical developmental lineage is to be designed or registered **later**, never grafted silently into this baseline.',
 '- Records are observational and exploratory: a qualifying encounter is an operational pattern of comparative recovery and memory or integration, **not** an identified mind, an agent, the Outside, or a message.',
 '- Every observed encounter is named mechanically from the fixed canonical CCRU Pandemonium 45-entry mapping; its omitted literary attributes remain documented.',
 '',
 '## 3. Proposed live inflow and continuity (requires new approval)',
 '- Existing PF-1 design: drand quicknet, one independently BLS-verified round admitted per minute, keyed-variate transformation as in C1; never assume that a beacon round carries semantically structured information.',
 '- Admit rounds in round-number order with cryptographic proofs, ledger receipts, and deterministic replay. Handle GitHub Actions scheduling as periodic catch-up, **not** a claimed per-minute cron guarantee.',
 '- Current Amelia carries PFM without reset; eight separately initialized matched reference explorers consume keyed independent-stream variants of the admitted beacon records, each with its own carried PFM.',
 '- No rerouting, perturbation or state transplant touches the live trajectory: counterfactual forks are isolated snapshots only.',
 '- The accepted fixed A1 R2 graph-only eligibility covers 7 of 45 zone pairs. An absence of encounters in structurally inaccessible pairs is not an empirical negative finding.',
 '',
 '## 4. Immutable operational scanner and fork criteria',
 '- Candidate scanner: three excursions within 240 developmental steps; turning zone is the interior zone at greatest directed shortest distance back to its anchor (ties earliest); net-span unordered naming.',
 '- Applicable challenge set: all valid D(d) displacements plus L₂ (two input-free autonomous ticks, original synthetic/live input sequence retained in order); no F₂ or edge block.',
 '- Exact analytic comparator: uniform choice among canonical open outgoing gates, sinks absorbing; each 0–24 tick via-b first-return probability fixed by sealed curves; a successful intact comparative recovery must have P-null ≤0.25 at its first return tick.',
 '- Goal criterion: at least three comparative wins across three distinct perturbation instances, regardless of route diversity.',
 '- Additional signature: (intact–PFM-reset comparative-win count)/N ≥0.25 (1 extra win for N=4; 2 for N=5), OR fixed selective zone-b contribution ×0.10 abolishes an intact/sham comparative win. Sham ×1.0 must agree.',
 '- At most 24 Amelia forks per candidate, 24 ticks each; zero physical null companion walks.',
 '- Encounter journal only on confirmation; silent exposure ledger on every interval records scanned steps, detected candidates, fork outcomes including failures/not-applicable, unavailable capacities and reference exploration.',
 '',
 '## 5. Record and provenance before first admission',
 'On approval only, publish and independently RFC3161-seal **before any live round**: genesis state, exact source commit, constants hash, name table, null curves, C1 drand chain/public key and verification code identities, keyed-variate key derivation, reference-stream transformations, governance and scheduling settings, synthetic canary transcript, report formats and source hashes.',
 'Each live journal entry must carry three clocks (detection, confirmation, independent seal), event/fork/evidence digest, source round range, reference arm ID and chronological hash chain. Fail closed if cryptographic verification, replay, fork isolation, or provenance becomes unavailable.',
 '',
 '## 6. Baseline outputs and later developmental comparison',
 'The first deliverable is a **baseline fieldwork record**: exposure duration, all candidate/encounter counts, named entity distribution, memory depth vs effective influence, null-comparative wins, and coverage against eight reference explorers, with silence and ineligibility accounted for.',
 'Any future lineage is to be preregistered separately, with a declared developmental change and matched inlet/observation windows. Distinguish changed substrate properties from mere input-variation; do not imply the baseline already tests improved development.',
 '',
 '## 7. Approval gate',
 '- This registration is a **draft**; no live PF-1 workflow has been created, activated or dispatched here.',
 '- Separate affirmative operator approval is required after reviewing this document, the new habit-memory negative evidence and implementation readiness.',
 '- After approval, a fresh live-genesis and provenance check must pass **before** the first external inflow round. Approval of this draft alone is not permission to bypass any such gate.',
 '- If any habit-memory encounter is found on independent replay, invalidate this draft and reopen the encounter rule rather than commencing live exploration.',
 '',
 '**LIVE START: NOT AUTHORISED.**',''
];
writeFileSync('experiments/pf1/PF1_LIVE_START_REGISTRATION_DRAFT.md',lines.join('\n'));
console.log('PF1_LIVE_REGISTRATION_DRAFT_READY',JSON.stringify({
 negativePass:true,approval:false,sha256:sha('experiments/pf1/PF1_LIVE_START_REGISTRATION_DRAFT.md')}));
