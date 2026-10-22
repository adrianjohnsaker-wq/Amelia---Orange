"""PF2 fail-closed HALT at last durably committed, externally signed prefix.
No C1/PF1 writes, no mail/chat/push notifications; the data scheduler cannot
restart a halted experiment without separate operator recovery approval.
"""
import os,pathlib,json,datetime
ROOT=pathlib.Path('experiments/pf2/live')
def main():
 assert os.getenv('PF2_REMOTE_SHARED_LEASE_ACKNOWLEDGED')=='true'
 assert os.getenv('DRIFT_C1_ENABLE_LIVE')=='false'
 g=json.loads((ROOT/'GENESIS.json').read_text())
 f=ROOT/'STATE.json'
 st=json.loads(f.read_text())
 assert st['genesisDigest']==g['genesisDigest']
 assert st['admittedTicks']==st['engine']['tick']
 if st['status']=='halted':raise RuntimeError('ALREADY_HALTED_NO_OVERWRITE')
 assert st['status']=='running'
 st['status']='halted'
 st['openHalt']={'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
  'reason':os.getenv('PF2_HALT_REASON','UNSPECIFIED_VERIFICATION_FAILURE')[:850],
  'lastSealedTick':st['admittedTicks'],'lastSealedHead':st['headDigest'],
  'scientificResultsNotReinterpreted':True,
  'operatorRecoveryRequired':True}
 assert st['notificationsEnabled'] is False and st['notificationsSent']==0
 f.write_text(json.dumps(st,sort_keys=True,indent=2)+'\n')
 print('PF2_HALTED_AT_LAST_SIGNED_PREFIX_NO_NOTIFICATIONS',
  json.dumps(st['openHalt']))
if __name__=='__main__':main()
