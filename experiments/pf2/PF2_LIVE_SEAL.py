"""PF2 journal-only verified batch sealing; uses PF1/C1 Sealer unchanged.
No live admission without operator-approved PF2 genesis and shared exclusive
PF1 safe lease. Serializes a complete 1..20-round batch and seals it before
state advancement; no notifications, email, chat pushes or webhooks.
"""
import hashlib,json,os,pathlib
from drift1a_c1.beacon import Sealer
ROOT=pathlib.Path('experiments/pf2/live')
def sha(b):return hashlib.sha256(b).hexdigest()
def jsonread(p):return json.loads(p.read_text())
def save_create_only(p,body):
    p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('x',encoding='utf-8') as f:f.write(json.dumps(body,sort_keys=True,indent=2)+'\n')
def main():
    assert os.getenv('PF2_GENESIS_OPERATOR_APPROVED')=='true'
    assert os.getenv('PF2_LIVE_ADMISSION_OPERATOR_AUTHORISED')=='true'
    assert os.getenv('PF2_REMOTE_SHARED_LEASE_ACKNOWLEDGED')=='true'
    assert os.getenv('DRIFT_C1_ENABLE_LIVE')=='false'
    p=pathlib.Path(os.environ['PF2_PENDING_BATCH'])
    batch=jsonread(p)
    g=jsonread(ROOT/'GENESIS.json')
    state=jsonread(ROOT/'STATE.json')
    assert batch['schema']=='PF2_PENDING_VERIFIED_BATCH_V1'
    assert batch['genesisDigest']==g['genesisDigest']==state['genesisDigest']
    assert batch['noNotifications'] is True
    assert batch['PF1StateMutated'] is False and batch['C1StateMutated'] is False
    assert batch['startTick']==state['admittedTicks']
    assert batch['previousHead']==state['headDigest']
    assert 0<=batch['count']<=20 and batch['count']==len(batch['rows'])
    if batch['count']==0:
        assert batch['finalHead']==state['headDigest']
        print('PF2_ZERO_BATCH_NOT_ADMITTED_NO_SEAL');return
    first=batch['startTick']
    folder=ROOT/'chunk_seals'/('%08d'%first)
    if folder.exists():raise RuntimeError('CHUNK_SEAL_ALREADY_EXISTS_NO_OVERWRITE')
    chunk_path=ROOT/'chunks'/('%08d'%first+'.json')
    if chunk_path.exists():raise RuntimeError('CHUNK_ALREADY_ARCHIVED_NO_OVERWRITE')
    prepared={k:v for k,v in batch.items() if k!='proposedNextState'}
    imprint=sha(json.dumps(prepared,sort_keys=True,separators=(',',':')).encode())
    sealer=Sealer()
    sealer.seal(folder,imprint)
    verified=sealer.verify(folder,imprint)
    receipt=jsonread(folder/'receipt.json')
    assert verified['status']=='PASS' and receipt['status']=='PASS'
    token=folder/receipt['token']
    archive={**prepared,
        'signedImprint':imprint,
        'rfc3161Receipt':str(folder/'receipt.json'),
        'rfc3161TokenSHA256':sha(token.read_bytes()),
        'verifiedStatus':'PASS',
        'notificationsSent':0}
    # Both result and signed receipt are create-only; no rewriting old chunks.
    save_create_only(chunk_path,archive)
    nextstate=batch['proposedNextState']
    assert nextstate['headDigest']==batch['finalHead']
    assert nextstate['admittedTicks']==state['admittedTicks']+batch['count']
    # Atomic state update only after durable signed chunk exists.
    tmp=ROOT/'.PF2_STATE_NEW.tmp'
    if tmp.exists():raise RuntimeError('STALE_PENDING_PF2_STATE_REQUIRES_RECOVERY')
    tmp.write_text(json.dumps(nextstate,sort_keys=True,indent=2)+'\n')
    tmp.replace(ROOT/'STATE.json')
    p.unlink()
    print('PF2_SIGNED_DURABLE_CHUNK_READY_FOR_EXCLUSIVE_COMMIT',
      json.dumps({'firstTick':first,'count':batch['count'],
       'head':nextstate['headDigest'],'receipt':archive['rfc3161Receipt'],
       'noNotifications':True,'PF1Unchanged':True,'C1Unchanged':True}))
if __name__=='__main__':main()
