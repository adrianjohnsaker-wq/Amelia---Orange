"""AD1 constructed-only golden serialization unit: no beacon, no genesis, no leases.
The deliberately different insertion and stored sorted encodings expose the
signed V1 journal defect; prospective AD1 corrects only previous/head/digest.
"""
import os,tempfile,json,hashlib,pathlib,copy
from PF2_CANONICAL_CHAIN_AD1 import main
sha=lambda b:hashlib.sha256(b).hexdigest()
def v1digest(row):
 return sha(json.dumps({k:v for k,v in row.items() if k!='digest'},
  separators=(',',':'),ensure_ascii=False).encode())
def newrow(t,prior,nonce):
 sig=bytes([t+1])*48
 v={'choiceZone':4,'ratio':0.0,'fromZone':4,'toZone':7,'inputCueZone':5,
    'valueTerms':{'4>7':0.015,'4>5':-0.125},
    'journalEvents':[{'b':2,'a':1,'z':-0.00000001}]}
 events=[copy.deepcopy(v) for _ in range(18)]
 row={'tick':t,'round':33298740+20*t,'randomness':sha(sig),
  'signature':sig.hex(),'roundTime':1792699584+60*t,
  'verification':'REAL_QUICKNET_BLS_VERIFIED_WITH_PINNED_C1_PF1',
  'armEvents':events,'pandemoniumExposure':{'R00-learner':{'scannedSteps':1,'eligibleCandidates':0}},
  'createdForkIDs':[],'confirmedEncounters':[],'previous':prior}
 row['digest']=v1digest(row)
 return row
def test():
 first=newrow(0,'PF2_AD1_SYNTHETIC_GENESIS',0)
 second=newrow(1,first['digest'],1)
 rows=[first,second]
 oldEvents=copy.deepcopy([x['armEvents'] for x in rows])
 oldDetector=copy.deepcopy([x['pandemoniumExposure'] for x in rows])
 originalHead=second['digest']
 batch={'schema':'PF2_PENDING_VERIFIED_BATCH_V1',
   'genesisDigest':'PF2_AD1_SYNTHETIC_GENESIS',
   'startTick':0,'count':2,'previousHead':'PF2_AD1_SYNTHETIC_GENESIS',
   'finalHead':originalHead,'rows':rows,
   'proposedNextState':{'admittedTicks':2,'engine':{'tick':2},
     'headDigest':originalHead},'noNotifications':True,
   'PF1StateMutated':False,'C1StateMutated':False}
 originalSave=json.loads(json.dumps(batch,sort_keys=True))
 pre=originalSave['rows'][0]
 assert v1digest(pre)!=pre['digest'], 'TEST_MUST_REPRODUCE_REAL_V1_HASH_FAILURE'
 with tempfile.TemporaryDirectory() as td:
  p=pathlib.Path(td)/'pending.json'
  p.write_text(json.dumps(batch))
  os.environ.update({'PF2_GENESIS_OPERATOR_APPROVED':'true',
  'PF2_LIVE_ADMISSION_OPERATOR_AUTHORISED':'true',
  'PF2_REMOTE_SHARED_LEASE_ACKNOWLEDGED':'true',
  'DRIFT_C1_ENABLE_LIVE':'false',
  'PF2_OPERATIONAL_AD1_SEAL_VERIFIED':'true',
  'PF2_PENDING_BATCH':str(p)})
  main()
  corrected=json.loads(p.read_text())
  assert [x['armEvents'] for x in corrected['rows']]==oldEvents
  assert [x['pandemoniumExposure'] for x in corrected['rows']]==oldDetector
  assert corrected['chainSerializationRepair']['inputEventsChanged'] is False
  assert corrected['chainSerializationRepair']['receiverStateChanged'] is False
  assert corrected['chainSerializationRepair']['scannerResultsChanged'] is False
  prior=corrected['previousHead']
  for row in corrected['rows']:
   assert row['previous']==prior
   assert v1digest(row)==row['digest']
   prior=row['digest']
  assert corrected['finalHead']==prior==corrected['proposedNextState']['headDigest']
  assert prior!=originalHead
  assert corrected['proposedNextState']['admittedTicks']==2
  print('PF2_AD1_V1_FAILURE_REPRODUCED_CANONICAL_ARCHIVE_AND_UNCHANGED_SCIENCE_PASS',
   json.dumps({'originalV1Head':originalHead,'canonicalHead':prior,
    'rows':2,'syntheticOnly':True,'receiverChanged':False,
    'candidateDataChanged':False,'noNotifications':True}))
if __name__=='__main__':test()
