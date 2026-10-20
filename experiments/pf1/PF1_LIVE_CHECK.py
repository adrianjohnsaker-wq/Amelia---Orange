"""Fail-closed pre-commit PF1 live integrity check (no new input/no network)."""
import hashlib,json,os,pathlib
from drift1a_c1.beacon import Sealer
from drift1a_c1.common import digest
ROOT=pathlib.Path('experiments/pf1/live')
ARMS=('C','R01','R02','R03','R04','R05','R06','R07','R08')
COUNTS=('scannedSteps','candidatesDetected','eligibleCandidates','forkInstancesProbed','confirmedEncounters')
def file(name):return json.loads((ROOT/name).read_text())
def main():
    if os.environ.get('PF1_REMOTE_LEASE_ACKNOWLEDGED')!='true':
        raise RuntimeError('REMOTE_EXCLUSIVE_LEASE_REQUIRED')
    g,s,l,j=(file(x) for x in ('GENESIS.json','STATE.json','SILENT_LEDGER.json','JOURNAL.json'))
    assert g['schema']=='PF1_LIVE_GENESIS_V1'
    assert g['R0']%20==0 and (g['R0']-33158540)%20==0
    assert s['genesisDigest']==l['genesisDigest']==j['genesisDigest']==g['genesisDigest']
    assert s['status'] in ('running','halted')
    assert len(s['arms'])==9 and [x['id'] for x in s['arms']]==list(ARMS)
    assert s['admittedTicks']==len(l['rows'])
    assert s['lastAdmittedRound']==(g['R0']+20*(s['admittedTicks']-1) if s['admittedTicks'] else None)
    Sealer().verify(ROOT/'genesis_seal',g['genesisDigest'],
                    __import__('drift1a_c1.beacon',fromlist=['round_time']).round_time(g['R0']))
    assert not (ROOT/'PENDING_JOURNAL.json').exists(),'UNSEALED_LIVE_JOURNAL_PENDING'
    for rownum,row in enumerate(l['rows']):
        assert row['tick']==rownum and row['round']==g['R0']+20*rownum
        assert row['verification']=='REAL_DRAND_QUICKNET_BLS_VERIFIED_C1_PINNED'
        assert hashlib.sha256(bytes.fromhex(row['signature'])).hexdigest()==row['randomness']
        assert row['previous']==(g['genesisDigest'] if rownum==0 else l['rows'][rownum-1]['digest'])
        assert set(row['armExposure'])==set(ARMS)
        for a in ARMS:
            assert set(row['armExposure'][a])==set(COUNTS)
            assert all(type(row['armExposure'][a][n]) is int and row['armExposure'][a][n]>=0 for n in COUNTS)
        payload={k:v for k,v in row.items() if k!='digest'}
        # JS object JSON.stringify uses insertion order; Python json.loads preserves it.
        packed=json.dumps(payload,separators=(',',':'),ensure_ascii=False)
        assert hashlib.sha256(packed.encode()).hexdigest()==row['digest'],f'LEDGER_DIGEST_FAIL_TICK_{rownum}'
    assert s['headDigest']==(l['rows'][-1]['digest'] if l['rows'] else g['genesisDigest'])
    for arm in s['arms']:
        assert arm['events']==s['admittedTicks']
        assert len(arm['zones'])==s['admittedTicks']+1
        assert len(arm['state']['memoryState']['events'])==s['admittedTicks']
    expected=0
    for idx,e in enumerate(j['entries']):
        assert e['entryIndex']==idx and e['notificationsSent']==0
        assert e['previous']==(g['genesisDigest'] if idx==0 else j['entries'][idx-1]['digest'])
        receipt=ROOT/'journal_seals'/('%08d'%idx)
        Sealer().verify(receipt,e['signedImprint'])
        token=json.loads((receipt/'receipt.json').read_text())['token']
        assert hashlib.sha256((receipt/token).read_bytes()).hexdigest()==e['rfc3161TokenSha256']
        prepared={k:v for k,v in e.items() if k not in
                  ('rfc3161Receipt','rfc3161TokenSha256','externalSealTimestampUTC','signedImprint','digest')}
        assert digest(prepared)==e['signedImprint']
        assert digest({k:v for k,v in e.items() if k!='digest'})==e['digest']
        expected+=1
    assert s['sealedJournalCount'] in (expected,0),'INCONSISTENT_JOURNAL_COUNT'
    print('PF1_LIVE_CHAIN_AND_SEALS_PASS',json.dumps({
      'admittedTicks':len(l['rows']),
      'lastAdmittedRound':s['lastAdmittedRound'],
      'nineArmPFMExactCounts':True,'journalEntries':expected,
      'unsealedJournals':0,'encounterNotifications':0,
      'C1Changed':False,'headDigest':s['headDigest']}))
if __name__=='__main__':main()
