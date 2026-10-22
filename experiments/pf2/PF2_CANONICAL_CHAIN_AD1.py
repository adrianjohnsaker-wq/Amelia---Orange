"""PF-2 operational AD1: canonicalize only signed journal hash-chain metadata
at the V1->V1 batch boundary before the ORIGINAL unchanged Python batch sealer
and original unchanged Python chain verifier.

Root cause (live start Actions 39851244654, first tick):
- PF2_LIVE_RUN.mjs produced a SHA256 over JS JSON.stringify(row) in insertion order.
- PF2_LIVE_SEAL.py correctly persists JSON sort_keys=True (including nested).
- PF2_LIVE_CHECK.py hashes serialized *persisted* sorted row.
- Hashes were therefore of different bytes; the verifier correctly failed.

Fix:
- Preserve every input, original receiver event and scanner readout EXACTLY.
- For each uncommitted row, recompute SHA256 of canonical sorted, minified
  UTF-8 JSON; rethread preceding and following hash references ONLY.
- Version-mark this metadata transformation and assert no event changed.
- Applied before any per-batch external RFC3161 seal and remote publication.
- Both the V1 receiver and the original V1 verifier remain byte-identical.
"""
import os,pathlib,json,hashlib,copy
def canonical(x):
 return json.dumps(x,sort_keys=True,separators=(',',':'),ensure_ascii=False,allow_nan=False).encode('utf8')
def sha(x):return hashlib.sha256(x).hexdigest()
def main():
 assert os.environ.get('PF2_GENESIS_OPERATOR_APPROVED')=='true'
 assert os.environ.get('PF2_LIVE_ADMISSION_OPERATOR_AUTHORISED')=='true'
 assert os.environ.get('PF2_REMOTE_SHARED_LEASE_ACKNOWLEDGED')=='true'
 assert os.environ.get('DRIFT_C1_ENABLE_LIVE')=='false'
 assert os.environ.get('PF2_OPERATIONAL_AD1_SEAL_VERIFIED')=='true'
 p=pathlib.Path(os.environ['PF2_PENDING_BATCH'])
 b=json.loads(p.read_text())
 assert b['schema']=='PF2_PENDING_VERIFIED_BATCH_V1'
 assert b['noNotifications'] is True
 assert b['PF1StateMutated'] is False and b['C1StateMutated'] is False
 rows=b['rows']
 n=b['count']
 assert n==len(rows) and 1<=n<=20
 assert 'chainSerializationRepair' not in b
 nextstate=b['proposedNextState']
 assert nextstate['admittedTicks']==b['startTick']+n
 assert nextstate['engine']['tick']==nextstate['admittedTicks']
 assert b['finalHead']==nextstate['headDigest']
 original_events=[copy.deepcopy(r['armEvents']) for r in rows]
 original_scanner=[copy.deepcopy((r.get('pandemoniumExposure'),
    r.get('createdForkIDs'),r.get('confirmedEncounters'))) for r in rows]
 original_head=b['finalHead']
 v1prior=b['previousHead']
 for row in rows:
  assert row['previous']==v1prior,'PF2_V1_CHAIN_BROKEN_BEFORE_REPAIR'
  v1prior=row['digest']
 assert v1prior==original_head
 prior=b['previousHead']
 for i,row in enumerate(rows):
  assert row['tick']==b['startTick']+i
  assert row['verification']=='REAL_QUICKNET_BLS_VERIFIED_WITH_PINNED_C1_PF1'
  assert hashlib.sha256(bytes.fromhex(row['signature'])).hexdigest()==row['randomness']
  assert len(row['armEvents'])==18
  row['previous']=prior
  payload={k:v for k,v in row.items() if k!='digest'}
  row['digest']=sha(canonical(payload))
  prior=row['digest']
 b['finalHead']=prior
 nextstate['headDigest']=prior
 b['chainSerializationRepair']={
  'schema':'PF2_AD1_CANONICAL_SORTED_JSON_SHA256_V1',
  'originalV1HeadSHA256':original_head,
  'canonicalHeadSHA256':prior,
  'inputEventsChanged':False,
  'receiverStateChanged':False,
  'scannerResultsChanged':False,
  'source':'Versioned operational repair after failed V1 first live attempt, no science parameter change',
  'noNotifications':True}
 assert [r['armEvents'] for r in rows]==original_events
 assert [(r.get('pandemoniumExposure'),r.get('createdForkIDs'),r.get('confirmedEncounters'))
  for r in rows]==original_scanner
 assert nextstate['admittedTicks']==b['startTick']+n
 assert nextstate['headDigest']==rows[-1]['digest']
 # Check exactly the same archive serialization the V1 seal script writes.
 archived=json.loads(json.dumps(b,sort_keys=True,allow_nan=False))
 previous=b['previousHead']
 for r in archived['rows']:
  assert r['previous']==previous
  payload={k:v for k,v in r.items() if k!='digest'}
  assert sha(json.dumps(payload,separators=(',',':'),ensure_ascii=False,
                        allow_nan=False).encode())==r['digest']
  previous=r['digest']
 assert previous==b['finalHead']
 p.write_text(json.dumps(b,sort_keys=True,indent=2,ensure_ascii=False,
                        allow_nan=False)+'\n')
 print('PF2_AD1_CANONICAL_HASH_CHAIN_CORRECTED_ONLY_METADATA',
    json.dumps({'startTick':b['startTick'],'count':n,
      'originalV1Head':original_head,'signedCanonicalHead':prior,
      'eventsChanged':False,'scannerChanged':False,
      'noNotifications':True}))
if __name__=='__main__':main()
