"""PF2 S1 amendment 4: explicit, narrow administrative reopening of a fail-closed PF-2 halt whose ONLY cause is an
RFC3161 timestamp request that did not return PASS while sealing a verified batch (PF2_LIVE_SEAL / Sealer).

First use: the 30 Oct 2026 20:33 UTC halt at tick 8750 (lease 41119460619-1). The same audited path may be used again,
by an operator-dispatched run of .github/workflows/pf-s1-a4.yml, for a later halt with exactly this cause.
Generalises PF2_S1_RECOVER.py (amendment 0, tick 7150) without changing it.

No input, lineage state, chain, chunk, seal or genesis is changed; the halted prefix (admittedTicks = lastSealedTick,
headDigest = lastSealedHead) is kept exactly. Rounds published while halted are admitted afterwards by the unchanged
catch-up from the next unadmitted round. No notifications. This is NOT a new R0.
"""
import os,json,pathlib,hashlib,datetime
ROOT=pathlib.Path('experiments/pf2/live')
GENESIS_DIGEST='6edb50ea3bdb6595cac20399c06142506ec1f35b8079fb556850eb20ca48b723'
def sha(b):return hashlib.sha256(b).hexdigest()
def main():
 assert os.environ.get('PF2_S1_A4_OPERATOR_CONTINUE')=='true'
 assert os.environ.get('PF2_S1_A4_SEAL_VERIFIED')=='true'
 assert os.environ.get('DRIFT_C1_ENABLE_LIVE')=='false'
 expect=os.environ.get('PF2_S1_A4_EXPECT_TICK')
 gen=json.loads((ROOT/'GENESIS.json').read_text())
 statefile=ROOT/'STATE.json'
 raw=statefile.read_bytes()
 state=json.loads(raw)
 assert gen['schema']=='PF2_LIVE_GENESIS_V1' and gen['approvedByOperator']
 assert state['status']=='halted'
 assert state['genesisDigest']==gen['genesisDigest']==GENESIS_DIGEST
 h=state['openHalt']
 assert h['operatorRecoveryRequired'] is True
 assert 'PF2_LIVE_SEAL.py' in h['reason'] and 'RFC3161' in h['reason'],'NOT_THE_TIMESTAMP_HALT'
 ticks=state['admittedTicks']
 assert h['lastSealedTick']==ticks==state['engine']['tick']
 if expect is not None: assert ticks==int(expect),('UNEXPECTED_TICK',ticks,expect)
 assert h['lastSealedHead']==state['headDigest']
 assert state['lastAdmittedRound']==gen['R0']+20*(ticks-1)
 assert len(state['engine']['receivers'])==18
 assert state['notificationsSent']==0 and state['notificationsEnabled'] is False
 assert not (ROOT/'PENDING_BATCH.json').exists() and not (ROOT/'.PF2_STATE_NEW.tmp').exists()
 assert not (ROOT/'INBOX.json').exists()
 repo=pathlib.Path('drift1a_c1/runner_state')
 leases={p.name for p in (repo/'leases').glob('*.json')}
 completions={p.name for p in (repo/'completions').glob('*.json')}
 assert leases-completions==set(),'ANOTHER_RECORDER_OWNS_A_LEASE'
 receipt=ROOT/f'RECOVERY_S1_A4_{ticks}.json'
 assert not receipt.exists(),'RECOVERY_ALREADY_CONSUMED'
 now=datetime.datetime.now(datetime.timezone.utc).isoformat()
 note={'schema':'PF2_S1_A4_HALT_RECOVERY_V1',
  'rootCause':'RFC3161_TIMESTAMP_REQUEST_DID_NOT_RETURN_PASS_DURING_PF2_LIVE_SEAL',
  'atUTC':now,'priorStateSHA256':sha(raw),'originalHalt':h,
  'oldHead':state['headDigest'],'newHead':state['headDigest'],
  'oldTicks':ticks,'newTicks':ticks,
  'scienceModified':False,'genesisModified':False,'lineageStatesModified':False,
  'C1Modified':False,'PF1Modified':False,'notificationsSent':0,
  'nextAdmitRequiresPF1ExclusiveLease':True,
  'signedOperationalAmendment':'experiments/pf_storage/seal_a4/receipt.json',
  'priorRecovery':state.get('recoveredFromHalt'),
  'gapNote':'rounds published while halted are admitted by the unchanged catch-up from the next unadmitted round; nothing is back-filled by hand',
  'registeredDay30Unchanged':True}
 with receipt.open('x') as f:f.write(json.dumps(note,sort_keys=True,indent=2)+'\n')
 state['status']='running'
 state['openHalt']=None
 state['recoveredFromHalt']={'receiptPath':str(receipt),'recoveryAtUTC':now,'noObservationsAdded':True}
 state['notificationsEnabled']=False
 state['notificationsSent']=0
 out=ROOT/'.S1_A4_REOPEN_NEXT.tmp'
 assert not out.exists()
 out.write_text(json.dumps(state,sort_keys=True,indent=2)+'\n')
 out.replace(statefile)
 s2=json.loads(statefile.read_text())
 assert s2['headDigest']==h['lastSealedHead'] and s2['admittedTicks']==ticks and s2['status']=='running'
 print('PF2_S1_A4_RECOVERY_PASS_PREFIX_KEPT',json.dumps({'ticks':ticks,'head':s2['headDigest'],'receipt':str(receipt),'noNotifications':True}))
 gh=os.environ.get('GITHUB_OUTPUT')
 if gh: open(gh,'a').write(f'receipt={receipt}\nticks={ticks}\n')
if __name__=='__main__':main()
