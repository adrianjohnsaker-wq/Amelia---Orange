"""Finalize ONLY true PF1 encounter journal entries by RFC3161; no notifications.
A trial fork cannot enter the scientific journal without a verified public token.
Already finalized entries cannot be replaced. Called before ledger commit.
"""
import hashlib,json,os,pathlib
from datetime import datetime,timezone
from drift1a_c1.beacon import Sealer
from drift1a_c1.common import digest
ROOT=pathlib.Path('experiments/pf1/live')
def save(p,x):p.write_text(json.dumps(x,sort_keys=True,indent=2)+'\n')
def main():
    if os.environ.get('PF1_REMOTE_LEASE_ACKNOWLEDGED')!='true':
        raise RuntimeError('PF1_JOURNAL_REQUIRES_REMOTE_LEASE')
    pending=ROOT/'PENDING_JOURNAL.json'
    if not pending.exists():
        print('PF1_JOURNAL_NO_PENDING_SEAL');return
    p=json.loads(pending.read_text())
    assert p['schema']=='PF1_PENDING_LIVE_JOURNAL_FOR_EXTERNAL_RFC3161_V1'
    assert p['noNotifications'] is True
    jfile=ROOT/'JOURNAL.json'
    journal=json.loads(jfile.read_text())
    assert journal['schema']=='PF1_LIVE_JOURNAL_V1'
    assert p['priorJournalCount']==len(journal['entries'])
    sealer=Sealer()
    for raw in p['pending']:
        assert raw['schema']=='PF1_LIVE_ENCOUNTER_V1'
        assert raw['notificationsSent']==0
        assert raw['scientificInterpretation'].startswith('Operational PF1-A1')
        index=len(journal['entries'])
        previous=journal['entries'][-1]['digest'] if index else journal['genesisDigest']
        entry=dict(raw,entryIndex=index,previous=previous)
        imprint=digest(entry)
        folder=ROOT/'journal_seals'/('%08d'%index)
        sealer.seal(folder,imprint)
        verified=sealer.verify(folder,imprint)
        receipt=json.loads((folder/'receipt.json').read_text())
        assert receipt['status']=='PASS'
        assert verified['status']=='PASS'
        token=folder/receipt['token']
        entry['rfc3161Receipt']='experiments/pf1/live/journal_seals/%08d/receipt.json'%index
        entry['rfc3161TokenSha256']=hashlib.sha256(token.read_bytes()).hexdigest()
        entry['externalSealTimestampUTC']=datetime.fromtimestamp(verified['comparison_time_unix'],timezone.utc).isoformat().replace('+00:00','Z')
        entry['signedImprint']=imprint
        entry['digest']=digest(entry)
        journal['entries'].append(entry)
    save(jfile,journal)
    state_path=ROOT/'STATE.json'
    state=json.loads(state_path.read_text())
    state['sealedJournalCount']=len(journal['entries'])
    save(state_path,state)
    pending.unlink()
    print('PF1_LIVE_JOURNAL_ONLY_SEALED',json.dumps({
      'new':len(p['pending']),'total':len(journal['entries']),
      'noPush':True,'noEmail':True,'noChat':True,'noWebhooks':True,
      'noNotifications':True
    }))
if __name__=='__main__':main()
