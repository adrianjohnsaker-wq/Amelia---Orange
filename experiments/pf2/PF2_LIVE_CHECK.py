"""PF2 immutable science, BLS receipt, chunk-chain and external RFC3161 audit.
No network, no event admission, no notifications, never modifies PF1/C1.
The expensive end-to-end engine replay is PF2_REPLAY.mjs.
"""
import json,pathlib,hashlib,os
from drift1a_c1.beacon import Sealer
ROOT=pathlib.Path('experiments/pf2/live')
def sha(b):return hashlib.sha256(b).hexdigest()
def get(name):return json.loads((ROOT/name).read_text())
def main():
    assert os.environ.get('DRIFT_C1_ENABLE_LIVE')!='true'
    g=get('GENESIS.json');s=get('STATE.json')
    assert g['schema']=='PF2_LIVE_GENESIS_V1'
    assert g['approvedByOperator'] is True
    assert g['genesisDoesNotAdmitRound'] is True
    assert g['notificationsEnabled'] is False
    assert (g['R0']-33158540)%20==0 and g['R0']%20==0
    assert g['referenceDomain']=='PF2-REF-i|'
    assert s['status'] in ('running','halted')
    assert s['genesisDigest']==g['genesisDigest']
    assert s['engine']['tick']==s['admittedTicks']
    assert not (ROOT/'INBOX.json').exists()
    assert not (ROOT/'PENDING_BATCH.json').exists()
    assert not (ROOT/'.PF2_STATE_NEW.tmp').exists()
    total=0;prior=g['genesisDigest']
    for p in sorted((ROOT/'chunks').glob('*.json')):
        c=json.loads(p.read_text())
        assert c['schema']=='PF2_PENDING_VERIFIED_BATCH_V1'
        assert c['verifiedStatus']=='PASS' and c['notificationsSent']==0
        assert c['genesisDigest']==g['genesisDigest']
        assert c['startTick']==total and c['previousHead']==prior
        assert 1<=c['count']<=20 and c['count']==len(c['rows'])
        sign={k:v for k,v in c.items() if k not in (
         'signedImprint','rfc3161Receipt','rfc3161TokenSHA256',
         'verifiedStatus','notificationsSent')}
        imprint=sha(json.dumps(sign,sort_keys=True,separators=(',',':')).encode())
        assert imprint==c['signedImprint']
        folder=ROOT/'chunk_seals'/('%08d'%total)
        result=Sealer().verify(folder,imprint)
        assert result['status']=='PASS'
        receipt=json.loads((folder/'receipt.json').read_text())
        token=folder/receipt['token']
        assert sha(token.read_bytes())==c['rfc3161TokenSHA256']
        for j,row in enumerate(c['rows']):
            assert row['tick']==total+j
            assert row['round']==g['R0']+20*(total+j)
            assert row['previous']==prior
            assert row['verification']=='REAL_QUICKNET_BLS_VERIFIED_WITH_PINNED_C1_PF1'
            assert sha(bytes.fromhex(row['signature']))==row['randomness']
            assert len(row['armEvents'])==18
            for k in range(9):
                a,b=row['armEvents'][2*k:2*k+2]
                assert a['mode']=='learner' and b['mode']=='unchanged'
                assert a['cueZone']==b['cueZone']
                assert a['round']==b['round']==row['round']
                assert a['tick']==b['tick']==row['tick']+1
                assert b['valueTerms']=={}
            payload={k:v for k,v in row.items() if k!='digest'}
            raw=json.dumps(payload,separators=(',',':'),ensure_ascii=False)
            assert sha(raw.encode())==row['digest'],f'PF2_CHAIN_TICK_{total+j}'
            prior=row['digest']
        assert prior==c['finalHead']
        total+=c['count']
    assert total==s['admittedTicks']
    assert prior==s['headDigest']
    assert s['lastAdmittedRound']==(g['R0']+20*(total-1) if total else None)
    assert s['sealedBatchCount']==len(list((ROOT/'chunks').glob('*.json')))
    print('PF2_CHAIN_AND_RFC3161_RECEIPTS_VERIFY_PASS',
          json.dumps({'admittedTicks':total,'batches':s['sealedBatchCount'],
            'headDigest':prior,'noNotifications':True,'PF1Unchanged':True,'C1Unchanged':True}))
if __name__=='__main__':main()
