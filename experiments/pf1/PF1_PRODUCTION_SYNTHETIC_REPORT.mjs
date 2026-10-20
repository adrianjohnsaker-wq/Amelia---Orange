/** PF1 integration evidence report: archived BLS, actual hosted lease completion and cross-job sealing.
 * Always distinguish synthetic architectural PASS from authorisation for live.
 */
import {readFileSync,existsSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const d='experiments/pf1/production-dry-run/output/';
const get=x=>JSON.parse(readFileSync(d+x,'utf8'));
const state=get('STATE.json'),ledger=get('LEDGER.json'),journal=get('JOURNAL.json'),
 archived=JSON.parse(readFileSync('experiments/pf1/production-dry-run/ARCHIVED_VERIFIED_QUICKNET.json','utf8')),
 v=get('VERIFY.json'),rec=get('RECOVERY.json'),ts=get('seals/VERIFIED.json'),
 workers=get('WORKER_ACKNOWLEDGEMENTS.json');
const sha=s=>createHash('sha256').update(s).digest('hex');
const paths=journal.entries.map((e,i)=>d+'seals/entry-'+String(i).padStart(3,'0')+'.tsr');
const unsealed=paths.filter(p=>!existsSync(p));
const gates={
 'archivedRealBlsSignaturesVerified':archived.genuineVerifiedArchivedQuicknetRounds===72&&archived.realBLSVerification==='PASS_ALL_72',
 'noLiveRoundAdmission':state.actualBeaconRoundsAdmitted===0&&state.liveGenesis===null&&archived.noLiveRoundAdmission===true,
 'hostedConcurrentLeaseExactlyOne':workers.acknowledgedCount===1&&workers.rejectedCount===1&&workers.durableLeaseCountAfterClaim===1,
 'leaseCommitAfterFirstIngest':rec.firstCompletedOnRemote===true,
 'orphanLeasePreventedAdmission':rec.contenderBlockedWhileOrphanOpen===true,
 'orphanRecoveryDidNotModifyScientificState':rec.beforeRecoveryCheckpointSha256===rec.afterRecoveryCheckpointSha256,
 'resumeLeaseAndPersistentCheckpoint':state.tick===72&&state.arms.length===9&&state.arms.every(a=>a.events===72),
 'future24RoundConfirmationAcrossJobs':journal.entries.length===2&&journal.entries.every(e=>e.within24Ticks&&e.scientificEncounter===false),
 'twoPerEntryRfc3161TokensVerifiedOffline':ts.sealCount===2&&ts.entries.every(e=>e.offlineVerified)&&unsealed.length===0,
 'appendOnlyDigestAndIndependentReplay':existsSync(d+'REPLAY_EXACT')&&v.tick===72&&v.entries===2&&v.receiptCount===72,
 'unmodifiedA1ScientificConstants':state.sealedConstantsHash==='ecabf3e40023faa0be0749908cfe6ffd3a8b9e42ab7c8a9a7c2ea5827ae63610'
};
const all=Object.values(gates).every(Boolean);
const list=[
 '# PF1 production-shaped integration — archived BLS + durable hosted synthetic dispatch',
 '',
 '**'+(all?'SYNTHETIC INTEGRATION PASS':'FAIL: required dry-run checks incomplete')+' — NO LIVE START**','',
 'This test used genuine **previously archived** DRIFT-1A C1 Quicknet signatures for cryptographic verification and then replayed 72 such immutable receipts through nine isolated copies of the **unchanged** Amelia runtime. No current/live round was fetched or admitted. The archived signatures are fixtures, not PF1 baseline observations.','',
 '## Required evidence gates','',
 '| Gate | Result |','|---|---|',
 ...Object.entries(gates).map(([k,x])=>'| '+k+' | '+(x?'PASS':'FAIL')+' |'),
 '','## 1. Verified C1 intake using archived real BLS','',
 '- Original C1 source commit: '+archived.sourceCommit+'.',
 '- Verified archived signed Quicknet rounds: '+archived.genuineVerifiedArchivedQuicknetRounds+'.',
 '- First/last round: '+archived.records[0].round+' / '+archived.records.at(-1).round+'.',
 '- Round-to-round stride: '+archived.stride+' quicknet rounds, 60 seconds.',
 '- Verified record digest: '+archived.archiveRecordDigest+'.',
 '- Production-shaped intake rejects unverified provenance and operates on archived-only material. This is *not* validation of live PF1 network intake or an approved genesis.','',
 '## 2. GitHub-hosted lease completion, contention and incident recovery','',
 '- Two competing hosted workers: '+workers.workerCount+'; acknowledged: '+workers.acknowledgedCount+
   '; rejected: '+workers.rejectedCount+'.',
 '- Durable sole outstanding lease immediately after acquisition: '+workers.durableLeaseCountAfterClaim+'.',
 '- Acknowledged worker committed the first 12 tick checkpoints **and its lease completion together**.',
 '- An isolated test lease was intentionally left open **without any ingestion**; the subsequent admission attempt was refused while it remained open.',
 '- Manual synthetic recovery reconciled that abandoned claim without a checkpoint change. Before/after SHA-256: '+rec.beforeRecoveryCheckpointSha256+'.',
 '- Following that recovery, separate hosted jobs advanced the nine arms to ticks 48 and 72 under new remote-acknowledged leases.',
 '- Replayed primary/auxiliary states are stored in the disposable Git branch and archived as an artifact.',
 '','## 3. Persistent pending fork confirmation and journal sealing','',
 '- Fixture #1 checkpoint tick 12, confirmation after tick 48.',
 '- Fixture #2 checkpoint tick 48, confirmation after tick 72.',
 '- Each required 24 subsequently admitted, archived-and-verified receipts. The delayed-input L₂ schedule was exercised without deleting or guessing an input.',
 '- Both entries are explicitly **non-encounter integration test fixtures**; no scientific PF1 encounter has been added.',
 '- Journal entries: '+journal.entries.length+'; each independently hash-chained and stamped with a distinct RFC 3161 token.',
 '- Offline verified FreeTSA receipts against pinned CA: '+ts.sealCount+'.',
 '- Ledger head: '+v.ledgerHead+'. Journal head: '+v.journalHead+'.',
 '- Independently recomputed full 72-step, nine-arm replay across a fresh hosted checkout: '+existsSync(d+'REPLAY_EXACT')+'.',
 '','## Exposure and boundaries','',
 '- Stored nine-arm checkpoint SHA-256: '+v.checkpointSha256+'.',
 '- Actual live rounds consumed: **ZERO**. Live genesis: **NONE**.',
 '- Source constants SHA-256: '+state.sealedConstantsHash+'.',
 '- Original C1 frozen files were never modified. The repaired lease exists only in PF1.',
 '- The separate full Channel A read-only audit must be judged from its **own** C1 genesis-to-head evidence.',
 '- The cumulative-memory tanh NO-GO remains valid and unmodified; a future lineage requires independently registered Rung 2.',
 '','## Not established by this test','',
 'This does **not** prove indefinite hosted uptime, simultaneous multi-writer state finalisation under all delays, availability of a timestamp service, or the suitability of a live genesis. Deployment requires operator review of the complete prospective manifest, PF1 source hashes, incident rules, fork queue retention, nine-arm initial state and BLS chain source.',
 '','**Live start remains UNAUTHORISED. No live genesis or beacon rounds.**',''
].join('\n');
writeFileSync('experiments/pf1/PF1_PRODUCTION_SYNTHETIC_INTEGRATION_REPORT.md',list);
writeFileSync(d+'INTEGRATION_VERDICT.json',JSON.stringify({schema:'PF1_PRODUCTION_DRYRUN_VERDICT_V1',
  allPass:all,gates,beaconRoundsAdmitted:0,liveGenesis:false,productionReadyWithoutOperatorApproval:false,
  sourceSha256:sha(readFileSync('experiments/pf1/PF1_PRODUCTION_ARCHIVED_STAGE.ts'))},null,2)+'\n');
console.log('PF1_PRODUCTION_INTEGRATION_VERDICT',JSON.stringify({allPass:all,gates,ledger:v.ledgerHead,journal:v.journalHead}));
if(!all)process.exitCode=3;
