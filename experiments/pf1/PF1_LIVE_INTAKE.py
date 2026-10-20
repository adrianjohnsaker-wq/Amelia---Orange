"""PF1 live intake: fetch *only* currently published, unadmitted Quicknet rounds.
Uses EXACT pinned C1 BLS implementation, no synthetic/archived fallback.
Must be run ONLY AFTER remotely acknowledged exclusive PF1 lease.
The inbox is transient; admission occurs only after nine-arm commit + seal.
"""
import json,os,pathlib,time
from datetime import datetime,timezone
from drift1a_c1.beacon import LiveBeacon,round_time,current_round
ROOT=pathlib.Path('experiments/pf1/live')
def main():
    if os.environ.get('PF1_LIVE_ADMISSION_OPERATOR_AUTHORISED')!='true':
        raise RuntimeError('LIVE_ADMISSION_NOT_AUTHORISED')
    if os.environ.get('PF1_REMOTE_LEASE_ACKNOWLEDGED')!='true':
        raise RuntimeError('MISSING_REMOTE_PF1_LEASE_ACK')
    if os.getenv('DRIFT_C1_ENABLE_LIVE')=='true':
        raise RuntimeError('MUST_NOT_MANUALLY_ACTIVATE_C1')
    genesis=json.loads((ROOT/'GENESIS.json').read_text())
    state=json.loads((ROOT/'STATE.json').read_text())
    ledger=json.loads((ROOT/'SILENT_LEDGER.json').read_text())
    assert genesis['schema']=='PF1_LIVE_GENESIS_V1'
    assert genesis['genesisDoesNotAdmitRound'] is True
    assert genesis['C1GridOffsetRounds']==0
    assert genesis['R0']%20==0
    assert state['status']=='running','PF1_HALTED_OPERATOR_RECOVERY_REQUIRED'
    assert state['admittedTicks']==len(ledger['rows'])
    assert state['lastAdmittedRound']==(genesis['R0']+20*(state['admittedTicks']-1) if state['admittedTicks'] else None)
    max_ticks=int(os.environ.get('PF1_MAX_LIVE_TICKS','20'))
    if not 1<=max_ticks<=20:raise ValueError('MAX_PER_DISPATCH_OUTSIDE_PROSPECTIVE_BUDGET')
    r0=genesis['R0']
    tick=state['admittedTicks']
    now=time.time()
    # quicknet period 3s; every 20 rounds is exactly 60s; published is >= release time.
    newest=current_round(now-3)
    last_allowed=(newest-r0)//20
    remaining=max(0,last_allowed+1-tick)
    count=min(max_ticks,remaining)
    if count==0:
        print('PF1_LIVE_NO_PUBLISHED_ROUND_YET',
              json.dumps({'nextRound':r0+20*tick,'publishedCurrentRound':newest,'admittedTicks':tick}))
        # Keep the no-input inbox explicit, so the runner knows not to stage a tick.
        result={'schema':'PF1_VERIFIED_LIVE_INBOX_V1','genesisDigest':genesis['genesisDigest'],
                'startingTick':tick,'count':0,'receipts':[],'liveVerified':True}
    else:
        verifier=LiveBeacon()
        rows=[]
        for t in range(tick,tick+count):
            round_id=r0+20*t
            if round_time(round_id)>now-3:raise RuntimeError('FUTURE_ROUND_NOT_ADMISSIBLE')
            record=verifier.fetch(round_id)
            verifier.verify(record,round_id)
            rows.append({'tick':t,'round':round_id,
               'signature':record['signature'],'randomness':record['randomness'],
               'roundTime':round_time(round_id),
               'observedAtUTC':datetime.now(timezone.utc).isoformat().replace('+00:00','Z'),
               'source':'LIVE_DRAND_QUICKNET_REAL_BLS_C1_PINNED'})
        assert len(rows)==count
        result={'schema':'PF1_VERIFIED_LIVE_INBOX_V1',
          'genesisDigest':genesis['genesisDigest'],'startingTick':tick,
          'count':count,'receipts':rows,'liveVerified':True}
    out=pathlib.Path(os.environ['PF1_LIVE_INBOX'])
    out.write_text(json.dumps(result,sort_keys=True,indent=2)+'\n')
    print('PF1_VERIFIED_LIVE_INTAKE_READY',json.dumps({
      'new':count,'first':result['receipts'][0]['round'] if count else None,
      'last':result['receipts'][-1]['round'] if count else None,
      'nextTick':tick+count,'source':'C1_BLS', 'live':True}))
if __name__=='__main__':main()
