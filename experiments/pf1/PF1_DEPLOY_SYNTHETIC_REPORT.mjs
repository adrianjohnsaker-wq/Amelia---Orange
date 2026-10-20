/** PF1 synthetic-only seven-point deployment review. Never reports live-ready. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root='experiments/pf1/deployment-synthetic-output/';
const data=JSON.parse(readFileSync(root+'synthetic-verification.json','utf8'));
const src=readFileSync('src/substrate/ameliaNumogramSubstrateRuntime.ts','utf8');
assert(src.includes("import { IntegratedMemorySystem } from './IntegratedMemorySystem'"));
assert(!src.includes("import { ProcessFieldMemory }"));
const seal=existsSync(root+'tsa/VERIFIED_SHA256SUMS.txt');
const replay=existsSync(root+'REPLAY_BYTE_IDENTICAL');
const gate=[
 {id:1,question:'C1 live admission/cadence, one-minute mapping, deterministic catch-up',
 synthetic:'PASS: synthetic ordered mock rounds, process-restored gap catch-up, duplicated dispatch idempotence',
 readiness:'OPEN: live C1 round mapping and actual drand BLS verifier not linked/tested'},
 {id:2,question:'Cross-invocation state persistence and input-gap recovery',
 synthetic:data.distinctInvocationPersistence&&data.catchupGapReplay&&replay?'PASS':'FAIL',
 readiness:'Pending deployment storage durability / concurrent commit locking under GitHub'},
 {id:3,question:'Fork scheduling, 24 future inputs, L₂ and primary-state isolation',
 synthetic:data.futureForksDeferredUntilAdmitted&&data.L2ScheduleAndNoLoss&&data.originalTrajectoryUnchanged?'PASS':'FAIL',
 readiness:'Admitted-future 24-round cadence and fork queue must be integrated with a production runner'},
 {id:4,question:'Nine arms: one beacon + eight keyed references, independently carried PFM',
 synthetic:data.nineIndependentMemoryArms&&data.sameInputRoundIndependentDomains?'PASS':'FAIL',
 readiness:'Freeze and independently review actual C1 KDF/domain separators at genesis'},
 {id:5,question:'Zero-encounter silent exposure ledger and per-entry timestamp sealing',
 synthetic:data.zeroEncounterSilenceLedger&&seal?'PASS: silent ledger plus separately marked synthetic receipt fixture':'FAIL',
 readiness:'Per-encounter append-only production journal/incident sealing still requires cross-dispatch test'},
 {id:6,question:'Fail-closed BLS/RFC3161 checks and provenance',
 synthetic:seal&&data.failClosedOnInvalidMockAndLedger?'PARTIAL: simulated bad signatures rejected; real FreeTSA token verified':'FAIL',
 readiness:'OPEN: real drand BLS signatures never cryptographically verified in this synthetic harness'},
 {id:7,question:'Byte-exact replay and duplicate journal/notification suppression',
 synthetic:replay&&data.replaySafeJournalFixture?'PASS':'FAIL',
 readiness:'Persistent shared-state ledger deduplication under concurrency remains to test'}
];
const failed=gate.filter(x=>x.synthetic==='FAIL');
const md=[
 '# PF-1 — Seven synthetic deployment checks, baseline registration supplement','',
 '**Scope: engineering rehearsal ONLY. No live input, no live genesis, no approval to launch.**',
 '',
 '## Seven section-6 checks','',
 '| # | Required property | Synthetic result | Remaining live-integration boundary |',
 '|---:|---|---|---|',
 ...gate.map(x=>'| '+x.id+' | '+x.question+' | '+x.synthetic+' | '+x.readiness+' |'),
 '',
 '**Disposition: '+(failed.length?'SYNTHETIC ENGINEERING FAIL':'SYNTHETIC REHEARSAL EXECUTED; LIVE READINESS INCOMPLETE')+'**.',
 'A synthetic PASS cannot be read as validated BLS, correct C1 protocol parity or production GitHub concurrency.',
 '',
 '## Provenance','',
 '- Pinned canonical Amelia imports IntegratedMemorySystem, NOT the tanh ProcessFieldMemory.',
 '- Frozen PF1-A1 R2 constants SHA-256: ecabf3e40023faa0be0749908cfe6ffd3a8b9e42ab7c8a9a7c2ea5827ae63610.',
 '- Total admitted synthetic round numbers: 72; real beacon rounds: **ZERO**.',
 '- Nine stateful memory arms (one synthetic primary, eight domain-separated synthetic references).',
 '- SHA-256 of persisted terminal nine-arm checkpoint file: '+data.stateDigest+'.',
 '- SHA-256 of persisted hash-chained exposure ledger: '+data.ledgerDigest+'.',
 '- Cross-process byte-for-byte state and ledger reproduction: '+replay+'.',
 '- RFC3161 independent FreeTSA verification, *on marked synthetic fixture only*: '+seal+'.',
 '- Independent timestamp of synthetic fixture must not be described as a genuine Amelia encounter.',
 '- Zero encounters in synthetic exercise journal; no operator-facing notifications generated.',
 '',
 '## Scientific controls that must travel with registration','',
 '- Cumulative tanh PFM control [run 39422348466](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39422348466): **NO-GO, 3 false-positive Ummnu encounters**, steps 3852, 8172 and 9132; never superseded.',
 '- Runtime-law IntegratedMemorySystem control [run 39423532378](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39423532378): **PASS, 0 encounters**.',
 '- Baseline under present encounter rule is validated only against the current runtime memory law.',
 '- Future cumulative-memory developmental lineage must first register a **Rung 2 habit-dissociating criterion**.',
 '',
 '## Remaining blockers before genesis approval','',
 '1. Pin real drand quicknet BLS chain ID and public key, recover C1 one-minute mapping source, verify actual BLS and deterministic per-round admission in a simulation or fixture with known valid/invalid signatures (no live consumption necessary).',
 '2. Verify nine-arm durable storage and exactly-once ledger across overlapping GitHub Actions dispatches, not only serial separate CLI processes.',
 '3. Implement & verify the production interface to pending fork confirmations and per-encounter RFC3161 journal seals after recovery.',
 '4. Produce a prospective complete live genesis manifest, source hashes, initial states and domain separators for independent operator review.',
 '',
 '**LIVE START REMAINS UNAUTHORISED.**',''
].join('\n');
writeFileSync('experiments/pf1/PF1_DEPLOYMENT_SYNTHETIC_REPORT.md',md);
writeFileSync(root+'seven-check-verdict.json',JSON.stringify({schema:'PF1_7_CHECK_SYNTHETIC_VERDICT_V1',gate,
 allSyntheticChecksWithoutFailure:failed.length===0,
 fullLiveReadiness:false,
 realBlsVerified:false,actualC1MappingVerified:false,
 realBeaconRounds:0,genesis:false,liveAuthorised:false,
 correctedSourceMemoryLaw:'IntegratedMemorySystem',
 registrationDraft:'experiments/pf1/PF1_LIVE_START_REGISTRATION_DRAFT.md'},null,2)+'\n');
console.log('PF1_SEVEN_DEPLOYMENT_CHECKS',JSON.stringify({syntheticErrors:failed.length,replay,seal,
 realBlsVerified:false,actualC1MappingVerified:false,liveAuthorised:false}));
if(failed.length)process.exitCode=2;
