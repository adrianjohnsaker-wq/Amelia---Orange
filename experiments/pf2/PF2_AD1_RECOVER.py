"""PF2 AD1 explicit, narrow administrative reopening from failed-at-tick0
first genuine admission. No synthetic input, no changes to 18 lineage state,
no rewriting any signed genesis, no notifications. This is NOT a new R0.
"""
import os,json,pathlib,hashlib,datetime
ROOT=pathlib.Path('experiments/pf2/live')
def sha(b):return hashlib.sha256(b).hexdigest()
def main():
 assert os.environ.get('PF2_AD1_RECOVERY_OPERATOR_CONTINUE')=='true'
 assert os.environ.get('PF2_OPERATIONAL_AD1_SEAL_VERIFIED')=='true'
 assert os.environ.get('DRIFT_C1_ENABLE_LIVE')=='false'
 gen=json.loads((ROOT/'GENESIS.json').read_text())
 statefile=ROOT/'STATE.json'
 raw=statefile.read_bytes()
 state=json.loads(raw)
 assert gen['schema']=='PF2_LIVE_GENESIS_V1' and gen['approvedByOperator']
 assert state['status']=='halted'
 assert state['genesisDigest']==gen['genesisDigest']=='6edb50ea3bdb6595cac20399c06142506ec1f35b8079fb556850eb20ca48b723'
 assert state['admittedTicks']==0 and state['lastAdmittedRound'] is None
 assert state['headDigest']==gen['genesisDigest'] and state['sealedBatchCount']==0
 assert state['engine']['tick']==0 and len(state['engine']['receivers'])==18
 assert all(r['lastTick']==0 and r['lifeZones']==[0] and
  all(v==0 for v in r['V'].values()) for r in state['engine']['receivers'])
 assert len(state['pandemonium']['track'])==18
 assert state['notificationsSent']==0 and state['notificationsEnabled'] is False
 assert state['openHalt']['lastSealedTick']==0
 assert state['openHalt']['lastSealedHead']==gen['genesisDigest']
 assert 'PF2_CHAIN_TICK_0' in state['openHalt']['reason']
 assert not list((ROOT/'chunks').glob('*.json')),'UNEXPECTED_PF2_DURABLE_DATA'
 assert not (ROOT/'PENDING_BATCH.json').exists()
 assert not (ROOT/'.PF2_STATE_NEW.tmp').exists()
 repo=pathlib.Path('drift1a_c1/runner_state')
 leases={p.name for p in (repo/'leases').glob('*.json')}
 completions={p.name for p in (repo/'completions').glob('*.json')}
 assert leases-completions==set(),'OTHER_PF1_RECORDER_OWNING_LEASE'
 assert '39851244654-1.json' in completions
 receipt=ROOT/'RECOVERY_AD1.json'
 assert not receipt.exists(),'RECOVERY_ALREADY_CONSUMED'
 oldHalt=state['openHalt'].copy()
 currentTime=datetime.datetime.now(datetime.timezone.utc).isoformat()
 note={'schema':'PF2_AD1_ONE_TIME_HALT_RECOVERY_V1',
  'originalFailedOwnerRun':39851244654,
  'rootCause':'JS_JSON_STRINGIFY_INSERTION_ORDER_VS_SORTED_PYTHON_SIGNED_ARCHIVE',
  'atUTC':currentTime,'priorStateSHA256':sha(raw),
  'originalHalt':oldHalt,'oldHead':state['headDigest'],
  'newHead':state['headDigest'],'oldTicks':0,'newTicks':0,
  'scienceModified':False,'genesisModified':False,
  'lineageStatesModified':False,'C1Modified':False,'PF1Modified':False,
  'notificationsSent':0,'nextAdmitRequiresPF1ExclusiveLease':True,
  'signedOperationalAmendment':'experiments/pf2/operational_ad1/seal/receipt.json',
  'registeredDay30Unchanged':True}
 with receipt.open('x') as f:f.write(json.dumps(note,sort_keys=True,indent=2)+'\n')
 state['status']='running'
 state['openHalt']=None
 state['recoveredFromHalt']={'receiptPath':'experiments/pf2/live/RECOVERY_AD1.json',
   'originalFailedOwnerRun':39851244654,'recoveryAtUTC':currentTime,
   'noObservationsAdded':True}
 state['notificationsEnabled']=False
 state['notificationsSent']=0
 out=ROOT/'.AD1_REOPEN_NEXT.tmp'
 assert not out.exists()
 out.write_text(json.dumps(state,sort_keys=True,indent=2)+'\n')
 out.replace(statefile)
 assert json.loads(statefile.read_text())['headDigest']==gen['genesisDigest']
 print('PF2_AD1_RECOVERY_PASS_ZERO_TICKS_ORIGINAL_GENESIS_UNCHANGED',
  json.dumps({'R0':gen['R0'],'ticks':0,'originalHaltSaved':True,
    'nextLiveInputStillRequiresRemoteLease':True,'noNotifications':True}))
if __name__=='__main__':main()
