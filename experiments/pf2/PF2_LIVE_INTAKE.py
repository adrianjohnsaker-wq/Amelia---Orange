"""PF2 read-only Quicknet intake — reused C1/PF1 LiveBeacon verification.
DO NOT run without post-manifest explicit OPERATOR genesis + live authorisation,
and independently PUSH-CONFIRMED shared PF1 safe lease. No notifications.
This code never touches PF1 or C1 data and never invents archived rounds.
"""
import json,os,pathlib,time,hashlib
from datetime import datetime,timezone
from drift1a_c1.beacon import LiveBeacon,current_round,round_time
ROOT=pathlib.Path('experiments/pf2/live')
MAX_PER_BATCH=20
def main():
    if os.getenv('PF2_GENESIS_OPERATOR_APPROVED')!='true':
        raise RuntimeError('PF2_GENESIS_NOT_OPERATOR_APPROVED')
    if os.getenv('PF2_LIVE_ADMISSION_OPERATOR_AUTHORISED')!='true':
        raise RuntimeError('PF2_LIVE_NOT_OPERATOR_AUTHORISED')
    if os.getenv('PF2_REMOTE_SHARED_LEASE_ACKNOWLEDGED')!='true':
        raise RuntimeError('PF2_SHARED_PF1_SAFE_LEASE_NOT_CONFIRMED')
    if os.getenv('DRIFT_C1_ENABLE_LIVE')=='true':
        raise RuntimeError('PF2_MUST_NEVER_MODIFY_C1')
    genesis=json.loads((ROOT/'GENESIS.json').read_text())
    status=json.loads((ROOT/'STATE.json').read_text())
    assert genesis['schema']=='PF2_LIVE_GENESIS_V1' and genesis['approvedByOperator']
    assert genesis['R0']%20==0 and (genesis['R0']-33158540)%20==0
    assert genesis['genesisDoesNotAdmitRound'] is True
    assert genesis['referenceDomain']=='PF2-REF-i|'
    assert status['status']=='running'
    assert status['genesisDigest']==genesis['genesisDigest']
    assert status['admittedTicks']==status['engine']['tick']
    maximum=int(os.getenv('PF2_MAX_LIVE_TICKS','20'))
    assert 1<=maximum<=20
    now=time.time()
    newest=current_round(now-3)
    due=max(0,(newest-genesis['R0'])//20+1-status['admittedTicks'])
    count=min(due,maximum)
    rows=[]
    if count:
        verifier=LiveBeacon()
        for t in range(status['admittedTicks'],status['admittedTicks']+count):
            round_id=genesis['R0']+20*t
            assert round_time(round_id)<=now-3
            rec=verifier.fetch(round_id)
            verifier.verify(rec,round_id)
            assert hashlib.sha256(bytes.fromhex(rec['signature'])).hexdigest()==rec['randomness']
            rows.append({'tick':t,'round':round_id,'randomness':rec['randomness'],
              'signature':rec['signature'],'roundTime':round_time(round_id),
              'observedAtUTC':datetime.now(timezone.utc).isoformat(),
              'source':'C1_PF1_PINNED_QUICKNET_BLS_VERIFIED'})
    output={'schema':'PF2_TRANSIENT_VERIFIED_INBOX_V1',
      'genesisDigest':genesis['genesisDigest'],
      'startingTick':status['admittedTicks'],'count':count,
      'receipts':rows,'liveVerified':True,'noNotifications':True}
    p=pathlib.Path(os.environ['PF2_LIVE_INBOX'])
    assert not str(p).startswith(str(ROOT)),'INBOX_MUST_BE_EPHEMERAL'
    p.write_text(json.dumps(output,sort_keys=True,indent=2)+'\n')
    print('PF2_VERIFIED_INBOX_READY',json.dumps({'count':count,
      'startTick':status['admittedTicks'],'lastRound':rows[-1]['round'] if rows else None,
      'notificationCount':0}))
if __name__=='__main__':main()
