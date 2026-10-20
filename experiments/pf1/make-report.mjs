import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {PILOT,loadMatrix,checkHashChain} from './core.mjs';
const root='experiments/pf1/output';
const read=f=>JSON.parse(readFileSync(root+'/'+f,'utf8'));
const a=read('pilot-evidence.json'),ledger=read('exposure-ledger.json'),
 seals=existsSync(root+'/seal-verification.json')?read('seal-verification.json'):null;
const raw=readFileSync(root+'/journal.jsonl','utf8');
const journal=raw.trim().split('\n').filter(Boolean).map(JSON.parse);
checkHashChain(journal);
const gate={
 namingTable:Object.keys(loadMatrix()).length===45,
 negativeZero:a.gates.negative,
 positiveAtLeast90Percent:a.gates.positive,
 namingAccuracy100Percent:a.gates.namingAccuracy,
 shamParity:a.gates.sham,
 ameliaSynthetic10000:a.gates.ameliaDescriptive,
 hashChain:journal.length===a.journal.preparedEntries,
 replayByteIdentical:existsSync(root+'/REPLAY_PASS'),
 everyEntryLocalRFC3161:!!seals&&seals.localVerified===journal.length&&journal.length>0,
 realFreeTSAOfflineVerified:!!seals&&seals.freeTsaVerified===true,
 resourceBudget:a.gates.resource
};
const sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const sources=['experiments/pf1/pandemonium-45.json','experiments/pf1/core.mjs',
 'experiments/pf1/pilot.ts','experiments/pf1/finalize-journal.mjs',
 'experiments/pf1/seal.sh','experiments/pf1/PF1_SYNTHETIC_PILOT_WORK_ORDER.md'];
const files=sources.map(path=>({path,sha256:sha(path)}));
const passed=Object.values(gate).every(Boolean);
const lines=[
 '# PF-1 synthetic pilot engineering report','',
 '**Decision: '+(passed?'PASS SYNTHETIC ENGINEERING ONLY':'FAIL / INCOMPLETE — NO LIVE START')+'**','',
 'No live drand/NIST inflow was used. No beacon rounds were admitted. No live genesis was created.',
 'No permission to begin live exploration is implied by an engineering PASS.','',
 '## Fixed engineering criteria','',
 '| Criterion | Verdict |','|---|---|',
 ...Object.entries(gate).map(([k,v])=>'| '+k+' | '+(v?'PASS':'FAIL / NOT VERIFIED')+' |'),
 '','## Controls','',
 '- Pure recurrence candidates: '+a.controls.negative.detectedCandidates+'; encounters: '+a.controls.negative.encounters+'.',
 '- Constructed recovery: '+a.controls.positive.confirmed+'/'+a.controls.positive.instances+' confirmed.',
 '- Confirmed pair naming accuracy 100%: '+a.controls.positive.namedCorrect+'.',
 '- Sham parity: '+a.controls.positive.shamPass+'.',
 '- Separate positive challenge graph: '+a.controls.positive.positiveGraphDigest+'.',
 '','## Amelia-Orange synthetic description (never used to tune)','',
 '- Steps: '+a.amelia.steps+'. Synthetic tape SHA-256: '+a.amelia.tapeDigest+'.',
 '- Detected candidates: '+a.amelia.candidatesFound+'; probed: '+a.amelia.candidatesProbed+'; deferred: '+a.amelia.candidatesDeferred+'.',
 '- Journalled Amelia synthetic encounters: '+a.amelia.encounters+'.',
 '- Entity encounter counts: '+JSON.stringify(a.amelia.entityCounts)+'.',
 '- Historical depth against effective influence (samples each 1,000 steps): '+JSON.stringify(a.amelia.memoryDepthVsEffectiveInfluence)+'.',
 '','## Resource and journal evidence','',
 '- Simulated inflow: '+a.amelia.resource.simulatedHours+' hours.',
 '- Elapsed: '+a.amelia.resource.elapsedWallSeconds+' seconds.',
 '- Seconds per simulated hour: '+a.amelia.resource.secondsPerSimHour+'; budget: '+a.amelia.resource.budgetSecondsPerSimHour+'.',
 '- Full journal entries (including constructed controls): '+journal.length+'.',
 '- Silent ledger: '+JSON.stringify(ledger)+'.',
 '- Local RFC3161 seals verified: '+(seals?.localVerified??0)+'; FreeTSA verified offline: '+!!seals?.freeTsaVerified+'.',
 '- FreeTSA pinned root SHA256: '+(seals?.freeTsaRootSha256||'NO VERIFIED ROOT')+'.',
 '','## Pilot constants and source SHA-256','',
 '- Source substrate pin: '+PILOT.sourceCommit+'.',
 '- Scanner window (pilot starting value, subject to separate live-stage freeze): '+PILOT.windowSteps+' steps.',
 '- Memory recovery delta (pilot starting value): '+PILOT.memoryMargin+'.',
 '- Maximum forks per candidate: '+PILOT.forksPerCandidate+'; max horizon: '+PILOT.forkSteps+'.',
 ...files.map(x=>'- '+x.path+': SHA-256 '+x.sha256),
 '','## Limitations and boundaries','',
 'Constructed positive controls demonstrate recognisability of a built-in goal mechanism, not a natural mind.',
 'A finding in the descriptive Amelia arm does not establish mindedness, agency or an Outside message.',
 'Journal replay reuses saved TSA request times; it must not mint new timestamp receipts.',
 'All live parameters, encounter margins and the live start require further operator review and explicit approval.',''
];
writeFileSync('experiments/pf1/PILOT_REPORT.md',lines.join('\n'));
writeFileSync(root+'/report-verdict.json',JSON.stringify({passed,gate,sha256:sha('experiments/pf1/PILOT_REPORT.md')},null,2)+'\n');
console.log('PF1_REPORT',passed?'PASS_SYNTHETIC_ONLY':'NO_GO',JSON.stringify(gate));
if(!passed)process.exitCode=3;
