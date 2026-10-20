"""PF1 LIVE GENESIS (explicit operator authorised 2026-10-20T22:36:51Z).
This code only creates an immutable, timestamp-sealed genesis & empty initial
state. LIVE ROUND ADMISSION IS A SEPARATE PROCESS; no C1 workflow is invoked.
If a prospective seal fails, preserve the attempt and do NOT create genesis.
"""
import hashlib,json,os,pathlib,subprocess,time
from datetime import datetime,timezone
from drift1a_c1.beacon import LiveBeacon,Sealer,first_round,round_time,QUICKNET
from drift1a_c1.common import digest,cj
ROOT=pathlib.Path('experiments/pf1')
LIVE=ROOT/'live'
SOURCE='b48dc2fa512b7e7ee77ea951309b826cb67b63ba728fb6bbeb35d6476d52a699'
C1='f1875b5eea5339eb1ac73e50b5df6b103d0cabe9'
INITIAL='1e7521b671cf2a36328c3041c96e996dd8516c8996a3f84e782fed2564fad76d'
ARMS=['C']+['R%02d'%i for i in range(1,9)]
def sha(b):return hashlib.sha256(b).hexdigest()
def stablewrite(path,body):
    path=pathlib.Path(path)
    path.parent.mkdir(parents=True,exist_ok=True)
    if path.exists():raise ValueError('IMMUTABLE_FILE_ALREADY_EXISTS: '+str(path))
    path.write_bytes(cj(body))
def main():
    if os.environ.get('PF1_GENESIS_OPERATOR_AUTHORISED')!='true':
        raise RuntimeError('EXPLICIT_OPERATOR_AUTHORISATION_REQUIRED')
    if os.environ.get('DRIFT_C1_ENABLE_LIVE')=='true':
        raise RuntimeError('C1_LIVE_MODE_MUST_STAY_OFF')
    if (LIVE/'GENESIS.json').exists():
        raise RuntimeError('PF1_GENESIS_EXISTS_NO_REGENESIS')
    manifest=ROOT/'PF1_GENESIS_MANIFEST_DRAFT.json'
    assert sha(manifest.read_bytes())==SOURCE,'APPROVED_MANIFEST_SHA_MISMATCH'
    m=json.loads(manifest.read_text())
    assert m['beacon']['R0Alignment']=='ALIGNED_TO_C1_GRID_SAME_QUICKNET_SIGNAL'
    assert m['baseline']['referenceMappingIsPF1Specific'] is True
    assert m['incidentNotification']['encounterNotificationChannels']==[]
    assert not m['liveGenesisCreated'] and not m['liveStartAuthorised']
    assert m['immutableSource']['c1VerifierPinnedCommit']==C1
    assert m['immutableSource']['actualNineArmInitialStateSHA256']==INITIAL
    for item in m['immutableSource']['operationalSourceFileHashes']:
        assert sha(pathlib.Path(item['path']).read_bytes())==item['sha256'], 'CHANGED_FROZEN_SOURCE '+item['path']
    initial_path=ROOT/'registration-identities/PF1_NINE_ARM_INITIAL_STATE.json'
    assert sha(initial_path.read_bytes())==INITIAL
    initial=json.loads(initial_path.read_text())
    assert [x['id'] for x in initial['arms']]==ARMS
    assert all(x['initialMemoryEvents']==0 for x in initial['arms'])
    LiveBeacon() # cryptographic known answer and key check; NEVER fetch here
    now=time.time()
    # 10min minimum C1 charter + additional 10min safety buffer for RFC3161 and GitHub persistence
    first=first_round(now+600)
    assert first%20==0 and (first-33158540)%20==0
    assert round_time(first)>now+1199
    # Future round is selected once; genesis body intentionally distinct from approved unactivated draft.
    # The final live code must be pinned separately from the previously
    # approved scientific and archived-only integration hashes.
    live_sources=[
      'experiments/pf1/PF1_LIVE_GENESIS.py',
      'experiments/pf1/PF1_LIVE_INTAKE.py',
      'experiments/pf1/PF1_LIVE_RUN.ts',
      'experiments/pf1/PF1_LIVE_SEAL.py',
      'experiments/pf1/PF1_LIVE_CHECK.py',
      'experiments/pf1/PF1_LIVE_HALT.py',
      'experiments/pf1/PF1_REFERENCE_INPUT.mjs',
      'experiments/pf1/PF1_A1_R2_SCORER.mjs',
      'experiments/pf1/core.mjs',
      'experiments/pf1/a1-r2-graph-only/EXACT_NULL_CURVES.json'
    ]
    live_hashes=[{'path':p,'sha256':sha(pathlib.Path(p).read_bytes())} for p in live_sources]
    body=dict(schema='PF1_LIVE_GENESIS_V1',mode='LIVE',
      operatorAuthorisation='2026-10-20T22:36:51Z explicit: Start! Go! Authorize!',
      created_at=datetime.fromtimestamp(now,timezone.utc).isoformat().replace('+00:00','Z'),
      created_unix=now,R0=first,stride=20,periodSeconds=3,
      futureFirstRoundTime=datetime.fromtimestamp(round_time(first),timezone.utc).isoformat().replace('+00:00','Z'),
      chainHash=QUICKNET['chain_hash'],scheme=QUICKNET['scheme'],
      C1ReferenceR0=33158540,C1GridOffsetRounds=0,
      PF1ReferenceDomain='PF1-REF-i|',arms=ARMS,
      approvedManifestSHA256=SOURCE,initialStateSHA256=INITIAL,
      operatingCommit=os.environ['PF1_GENESIS_SOURCE_SHA'],
      frozenSubstrateCommit=m['immutableSource']['substrateFrozenCommit'],
      scannerSHA256=m['immutableSource']['scannerArtifactSHA256'],
      exactNullCurvesSHA256=m['immutableSource']['analyticNullCurveDigestToPin'],
      constantsSHA256=m['immutableSource']['pf1A1R2ConstantsSHA256'],
      c1VerifierSourceCommit=C1,liveOperationalSourceHashes=live_hashes,
      notificationsEnabled=False,encountersJournalOnly=True,
      genesisDoesNotAdmitRound=True)
    imprint=digest(body)
    folder=LIVE/'genesis_seal'
    folder.mkdir(parents=True,exist_ok=True)
    # Actual cryptographic RFC3161; its archive cannot be fabricated or replaced
    sealer=Sealer()
    sealer.seal(folder,imprint,round_time(first))
    sealer.verify(folder,imprint,round_time(first))
    final=dict(body,genesisDigest=imprint,
      sealReceiptPath='experiments/pf1/live/genesis_seal/receipt.json')
    stablewrite(LIVE/'GENESIS.json',final)
    state=dict(schema='PF1_LIVE_RUNTIME_STATUS_V1',
       status='running',admittedTicks=0,lastAdmittedRound=None,openHalt=None,
       genesisDigest=imprint,scienceCode=m['immutableSource']['actualGeneticAndOperationalAdapterCommitToPin'],
       arms=[dict(id=x['id'],state=x['state'],zones=[x['state']['currentZone']],
          lastSeenZones={str(x['state']['currentZone']):0},excursionsByPair={},
          lastDetectedByPair={},probedByHour={},events=0) for x in initial['arms']],
       pendingForks=[],sealedJournalCount=0,
       headDigest=imprint,lastAdmissionAt=None)
    stablewrite(LIVE/'STATE.json',state)
    stablewrite(LIVE/'SILENT_LEDGER.json',
      dict(schema='PF1_LIVE_SILENT_LEDGER_V1',rows=[],genesisDigest=imprint))
    stablewrite(LIVE/'JOURNAL.json',
      dict(schema='PF1_LIVE_JOURNAL_V1',entries=[],genesisDigest=imprint))
    assert not (LIVE/'INBOX.json').exists()
    print('PF1_REAL_GENESIS_SEALED',json.dumps({
      'R0':first,'genesisDigest':imprint,'createdUTC':body['created_at'],
      'firstRoundUTC':body['futureFirstRoundTime'],
      'leadSeconds':round_time(first)-now,'encounterNotifications':0,
      'admittedLiveRounds':0,'c1Modified':False,'sourceSHA':body['operatingCommit']}))
if __name__=='__main__':main()
