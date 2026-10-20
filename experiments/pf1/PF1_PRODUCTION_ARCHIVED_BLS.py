"""PF1 prospective adapter fixture. Archived, already-published C1 quicknet signatures only.
Runs from immutable C1 checkout. Never calls fetch(), never admits live rounds.
"""
import os,sys,json,hashlib,pathlib
from drift1a_c1.engine import Engine
from drift1a_c1.beacon import LiveBeacon,Sealer,round_time
def main():
 assert os.getenv('DRIFT_C1_ENABLE_LIVE')!='true'
 assert os.getenv('PF1_OFFLINE_ARCHIVE_ONLY')=='1'
 root=pathlib.Path('drift1a_c1/recorded_live')
 b=LiveBeacon()
 e=Engine(root,b,Sealer())
 records=[]
 for r in e.records():
  if len(records)>=72:break
  blob=r['beacon']
  b.verify(blob,blob['round'])
  assert blob['round']==e.g['R0']+20*len(records)
  assert r['round_time']==round_time(blob['round'])
  records.append({'recordIndex':len(records),'round':blob['round'],
      'randomness':blob['randomness'],'signature':blob['signature'],
      'scheduledTime':r['round_time'],'observedOriginalReceipt':r['received_at'],
      'archivedSource':'DRIFT1A_C1_RECORDED_LIVE_NOT_LIVE_INPUT'})
 assert len(records)==72
 assert len({r['round'] for r in records})==72
 from drift1a_c1.common import sha
 out={'schema':'PF1_VERIFIED_ARCHIVED_QUICKNET_FIXTURE_V1',
  'sourceRepo':'adrianjohnsaker-wq/Amelia-0.4',
  'sourceCommit':os.getenv('PF1_C1_SOURCE_SHA'),
  'genesisR0':e.g['R0'],'sourceChainHeadAtCheckout':e.head,
  'beaconId':'quicknet','stride':20,'mode':'ARCHIVED_ONLY_NO_LIVE_ADMISSION',
  'realBLSVerification':'PASS_ALL_72',
  'genuineVerifiedArchivedQuicknetRounds':72,
  'noNetworkRoundFetch':True,'noLiveRoundAdmission':True,
  'records':records}
 out['archiveRecordDigest']=hashlib.sha256(json.dumps(records,sort_keys=True,separators=(',',':')).encode()).hexdigest()
 p=pathlib.Path(os.environ['PF1_ARCHIVE_FILE'])
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
 print('PF1_ARCHIVED_BLS_FIXTURE',json.dumps({'rounds':72,'first':records[0]['round'],
   'last':records[-1]['round'],'digest':out['archiveRecordDigest'],'C1_source_head':e.head}))
if __name__=='__main__':main()
