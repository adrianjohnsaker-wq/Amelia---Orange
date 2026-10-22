"""PF-2 operator-approved REAL genesis: select a future, C1/PF1-aligned
quicknet R0; seal a single provenance bundle of exact operator registration,
normative reference receiver, both goldens, previously sealed approval
manifest, all science/operational sources, and the chosen R0 plus 18 empty
initial receiver states with one genuine RFC3161 timestamp BEFORE first
release. Does NOT fetch, admit, or schedule any live data.
"""
import hashlib,json,os,pathlib,time
from datetime import datetime,timezone
from drift1a_c1.beacon import LiveBeacon,Sealer,first_round,round_time,QUICKNET
from drift1a_c1.common import cj
ROOT=pathlib.Path('experiments/pf2')
LIVE=ROOT/'live'
PREGENSEAL=ROOT/'seal'
ORIGINAL={
 'experiments/pf2/PF2_RECEIVER_REGISTRATION_AND_WORK_ORDER.md':'12a641718fb6c23f81b9f31ce7bc1e966654a9f01c85d16853219e50604e8237',
 'experiments/pf2/receiver.mjs':'030a0685e7d48fb71706b6100d2291e2d132a776432a99a81d54ba90b9c9a4b7',
 'experiments/pf2/gold_learner.json':'a35799a04c77f5d574cfd772c832b9aa7391af3ccad490636219d2027e499510',
 'experiments/pf2/gold_unchanged.json':'e984bb291476b820875a48e566d562a5e571a95435c7157cb44dba9df39a539f',
}
OPERATIONAL=[
 'experiments/pf2/PF2_INITIAL_STATE.mjs',
 'experiments/pf2/PF2_LIVE_GENESIS.py',
 'experiments/pf2/PF2_WEEKLY_STATUS.py',
 'experiments/pf2/PF2_DAY30_EVALUATE.py',
 'experiments/pf2/PF2_LIVE_HALT.py',
 'experiments/pf2/PF2_A1_CATCHUP.py',
 'experiments/pf2/PF2_LIVE_INTAKE.py',
 'experiments/pf2/PF2_LIVE_RUN.mjs',
 'experiments/pf2/PF2_LIVE_SEAL.py',
 'experiments/pf2/PF2_LIVE_CHECK.py',
 'experiments/pf2/PF2_REPLAY.mjs',
 '.github/workflows/pf2-live-genesis.yml',
 '.github/workflows/pf2-live-observe.yml',
 '.github/workflows/pf2-weekly-committed.yml',
]
def sha(b):return hashlib.sha256(b).hexdigest()
def filehash(p):return sha(pathlib.Path(p).read_bytes())
def write_new(path,obj):
 path.parent.mkdir(parents=True,exist_ok=True)
 with path.open('xb') as f:f.write(cj(obj))
def main():
 if os.environ.get('PF2_GENESIS_OPERATOR_APPROVED')!='true':
  raise RuntimeError('OPERATOR_GENESIS_APPROVAL_MISSING')
 if os.environ.get('PF2_LIVE_ADMISSION_OPERATOR_AUTHORISED')!='true':
  raise RuntimeError('OPERATOR_LIVE_ADMISSION_APPROVAL_MISSING')
 if os.environ.get('DRIFT_C1_ENABLE_LIVE')!='false':
  raise RuntimeError('C1_MUST_REMAIN_UNTOUCHED')
 if (LIVE/'GENESIS.json').exists():raise RuntimeError('PF2_ALREADY_HAS_GENESIS_NO_RESEAL')
 old=json.loads((PREGENSEAL/'receipt.json').read_text())
 assert old['status']=='PASS' and old['singleTimestampTokenCount']==1
 assert old['genesisApproved'] is False and old['liveTicksAdmitted']==0
 approved=json.loads((ROOT/'PF2_GENESIS_MANIFEST_FOR_APPROVAL.json').read_text())
 assert approved['schema']=='PF2_RECEIVER_PREGENESIS_MANIFEST_V1'
 assert approved['statusGate']['genesisExists'] is False
 assert approved['beacon']['referenceDomain']=='PF2-REF-i|'
 assert approved['statusGate']['notificationsEnabled'] is False
 assert old['bundleSHA256']==filehash(PREGENSEAL/'PF2_SINGLE_SIGNED_SOURCE_BUNDLE.json')
 pinned=json.loads((PREGENSEAL/'PF2_SINGLE_SIGNED_SOURCE_BUNDLE.json').read_text())
 # The original 18:48 UTC pre-genesis seal is immutable. After explicit
 # live approval, ONLY the A1 operational driver was amended to add the
 # prospectively already registered day30 boundary and fail-closed lease
 # completion. Record both old and new byte digests. Any other mismatch
 # remains a fatal scientific provenance error. This does not rewrite the
 # original one-token registration/receiver/gold pre-genesis seal.
 permitted={'experiments/pf2/PF2_A1_CATCHUP.py':
   'Postapproval operational guard: cap day60, day30 single-prefix evaluation, PF1-compatible halted-prefix recovery and exclusive lease completion. No scientific receiver code changed.'}
 deviations=[]
 for item in pinned['sourceSHA256']:
  actual=filehash(item['path'])
  if actual!=item['sha256']:
   path=item['path']
   assert path in permitted,'ORIGINAL_PREGEN_SCIENCE_CHANGED '+path
   deviations.append({'path':path,'originalSignedSHA256':item['sha256'],
     'updatedForActualGenesisSHA256':actual,'disclosure':permitted[path]})
 assert len(deviations)==1 and deviations[0]['path']=='experiments/pf2/PF2_A1_CATCHUP.py', 'UNEXPECTED_PREGEN_DIFF_SET'
 for p,h in ORIGINAL.items():
  assert filehash(p)==h,'GOLD_OR_REGISTRATION_MUTATED '+p
 assert len(OPERATIONAL)==len(set(OPERATIONAL))
 for path in OPERATIONAL:assert pathlib.Path(path).is_file(),path
 pf1=json.loads(pathlib.Path('experiments/pf1/live/GENESIS.json').read_text())
 pf1manifest=json.loads(pathlib.Path('experiments/pf1/PF1_GENESIS_MANIFEST_DRAFT.json').read_text())
 for item in pf1['liveOperationalSourceHashes']+pf1manifest['immutableSource']['operationalSourceFileHashes']:
  assert filehash(item['path'])==item['sha256'],item['path']
 import subprocess
 frozen='b67ec92e1cec13e9500d87292d59605428fb467e'
 diff=subprocess.run(['git','diff','--quiet',frozen,'HEAD','--',
  'src/substrate','src/governance','src/ai/numogram','src/types/amelia.ts'])
 assert diff.returncode==0,'CANONICAL_CHANGED'
 LiveBeacon()  # C1's unchanged cryptographic known-answer BLS self-test, NO fetch
 init_path=pathlib.Path(os.environ['PF2_INITIAL_STATE_FILE'])
 ini=json.loads(init_path.read_text())
 assert ini['schema']=='PF2_INITIAL_EIGHTEEN_LINEAGES_V1'
 assert ini['initialAdmittedTicks']==0 and ini['liveInputConsumed'] is False
 assert len(ini['engine']['receivers'])==18 and ini['engine']['tick']==0
 assert len(ini['pandemonium']['track'])==18
 assert all(r['lastTick']==0 and r['lifeZones']==[0] and
  all(x==0 for x in r['V'].values()) for r in ini['engine']['receivers'])
 now=time.time()
 selected=first_round(now+600)
 release=round_time(selected)
 assert selected%20==0 and (selected-33158540)%20==0
 assert release>now+1199
 assert pf1['R0']%20==0 and selected>pf1['R0']
 assert QUICKNET['chain_hash']==approved['beacon']['chainHash']
 assert QUICKNET['scheme']==approved['beacon']['scheme']
 created=datetime.fromtimestamp(now,timezone.utc).isoformat().replace('+00:00','Z')
 first=datetime.fromtimestamp(release,timezone.utc).isoformat().replace('+00:00','Z')
 body={
  'schema':'PF2_LIVE_GENESIS_V1','mode':'LIVE',
  'operatorAuthorisation':'2026-10-22T19:29:20Z explicit genesis and live intake approval',
  'approvedByOperator':True,'notificationsEnabled':False,
  'encountersJournalOnly':True,'genesisDoesNotAdmitRound':True,
  'created_at':created,'created_unix':now,
  'futureFirstRoundTime':first,'futureFirstRoundUnix':release,
  'R0':selected,'stride':20,'periodSeconds':3,
  'chainHash':QUICKNET['chain_hash'],'scheme':QUICKNET['scheme'],
  'C1ReferenceR0':33158540,'C1GridOffsetRounds':0,
  'referenceDomain':'PF2-REF-i|',
  'referenceMapping':'C raw beacon, R01..R08 SHA256(ASCII PF2-REF-i| plus raw 32 bytes)',
  'PF1OriginalR0':pf1['R0'],'originalPF1GenesisSHA256':filehash('experiments/pf1/live/GENESIS.json'),
  'scienceCodeFrozenSourceCommit':frozen,
  'c1VerifierPinnedCommit':'f1875b5eea5339eb1ac73e50b5df6b103d0cabe9',
  'preGenesisSealBundleSHA256':old['bundleSHA256'],
  'postPreGenesisSignedSourceOperationalDeviations':deviations,
  'preGenesisSingleSealTokenSHA256':old['tokenSHA256'],
  'approvedManifestSHA256':filehash(ROOT/'PF2_GENESIS_MANIFEST_FOR_APPROVAL.json'),
  'initialEighteenStateSHA256':sha(init_path.read_bytes()),
  'sourceGitCommit':os.environ['PF2_GENESIS_SOURCE_SHA'],
  'arms':['C','R01','R02','R03','R04','R05','R06','R07','R08'],
  'modes':['learner','unchanged'],'lineageCount':18,
  'day30AdmittedTicks':43200,'P2_1DueAfterAdmittedTicks':43200,
  'P2_2MinimumEligibleDeaths':10,'P2_2ExtendIfSparseToTicks':86400,
  'P2_3DescriptiveOnly':True,
  'P2_1ThresholdLearnerDeathsOverControl':0.35,
  'P2_2FatalSinkCueThreshold':0.85,
  'noInterimConfirmatoryAnalysis':True,
  'noNotificationsOfAnyKind':True,
 }
 register_paths=list(ORIGINAL)+[
  'experiments/pf2/PF2_GENESIS_MANIFEST_FOR_APPROVAL.json',
  'experiments/pf2/AMELIA_THREE_STUDIOS_WORKING_PLAN.md',
  'experiments/pf2/PF2_EXIT_SCORE_OVERLAY.mjs',
  'experiments/pf2/PF2_RECEIVER_CORE.mjs',
  'experiments/pf2/PF2_REFERENCE_INPUT.mjs',
  'experiments/pf2/PF2_PANDEMONIUM.mjs',
  'experiments/pf1/PF1_SAFE_LEASE.py',
  'experiments/pf1/PF1_A1_R2_SCORER.mjs',
  'experiments/pf1/core.mjs',
  'experiments/pf1/a1-r2-graph-only/EXACT_NULL_CURVES.json',
 ]+OPERATIONAL
 source_hashes=[{'path':p,'sha256':filehash(p)} for p in register_paths]
 bundle={'schema':'PF2_ONE_ACTUAL_R0_SIGNED_GENESIS_SOURCE_BUNDLE_V1',
  'exactGenesisBody':body,'genesisBodySHA256':sha(cj(body)),
  'originalFourFileSHA256':[{'path':p,'sha256':h} for p,h in ORIGINAL.items()],
  'frozenSourceSHA256':source_hashes,
  'initialEighteenStateSHA256':sha(init_path.read_bytes()),
  'previousPreGenesisBundleSHA256':old['bundleSHA256'],
  'previousPreGenesisTokenSHA256':old['tokenSHA256'],
  'postOriginalPreGenesisOperationalDeviations':deviations,
  'noLiveInflowConsumed':True,'noSyntheticBeaconAsLive':True,
  'noNotifications':True,'tokenCount':1}
 folder=LIVE/'genesis_seal'
 assert not folder.exists(),'NO_GENESIS_SEAL_OVERWRITE'
 LIVE.mkdir(parents=True,exist_ok=True)
 write_new(LIVE/'GENESIS_SIGNED_BUNDLE.json',bundle)
 imprint=filehash(LIVE/'GENESIS_SIGNED_BUNDLE.json')
 sealer=Sealer()
 sealer.seal(folder,imprint,release)
 verified=sealer.verify(folder,imprint,release)
 receipt=json.loads((folder/'receipt.json').read_text())
 assert verified['status']=='PASS' and receipt['status']=='PASS'
 assert time.time()<release,'GENESIS_R0_ALREADY_PUBLISHED_ABORT'
 genesis=dict(body,genesisDigest=imprint,
  originalScienceSourceSHA256=source_hashes,
  sealReceiptPath='experiments/pf2/live/genesis_seal/receipt.json',
  sealBundlePath='experiments/pf2/live/GENESIS_SIGNED_BUNDLE.json')
 write_new(LIVE/'GENESIS.json',genesis)
 state={
  'schema':'PF2_LIVE_RUNTIME_STATUS_V1',
  'genesisDigest':imprint,'status':'running','admittedTicks':0,
  'lastAdmittedRound':None,'headDigest':imprint,'sealedBatchCount':0,
  'engine':ini['engine'],'pandemonium':ini['pandemonium'],
  'lastAdmissionAt':None,
  'notificationsEnabled':False,
  'notificationsSent':0,'openHalt':None,
 }
 write_new(LIVE/'STATE.json',state)
 (LIVE/'chunks').mkdir(exist_ok=True)
 (LIVE/'chunk_seals').mkdir(exist_ok=True)
 # create-only initial status, does not evaluate thresholds
 write_new(LIVE/'STATUS_BOOTSTRAP.json',{
  'schema':'PF2_INITIAL_ZERO_TICK_STATUS_V1','genesisDigest':imprint,
  'R0':selected,'firstRoundUTC':first,'admittedTicks':0,
  'liveRoundsFetched':0,'confirmedEncounters':0,
  'notificationsSent':0,'P2_1Status':'NOT_DUE',
  'P2_2Status':'NOT_DUE'})
 print('PF2_REAL_GENESIS_SIGNED_BUT_NOT_ADMITTED',json.dumps({
  'status':'PASS','R0':selected,'firstRoundUTC':first,
  'createdUTC':created,'leadSeconds':release-now,
  'genesisDigest':imprint,'verifiedExternalTimestamp':True,
  'oneGenesisToken':True,'initialLearnerControlLineages':18,
  'liveTicksAdmitted':0,'allNotificationsDisabled':True}))
if __name__=='__main__':main()
