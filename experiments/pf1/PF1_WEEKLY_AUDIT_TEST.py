"""PF1 weekly reporting contract tests — entirely temporary fixtures.

These tests never create PF1 genesis in the repository or dispatch C1.
"""
import json
import tempfile
import pathlib
import shutil
import sys
from datetime import datetime, timezone, timedelta
from PF1_C1_WEEKLY_READONLY import read_pf1_status, ARM_IDS, EXPOSURE_FIELDS
from drift1a_c1.beacon import current_round

def make(root,now,halted=False):
    p=root/'experiments/pf1/live'
    p.mkdir(parents=True)
    published=current_round(now.timestamp())
    r0=(published//20)*20-100
    assert r0>0 and r0%20==0
    (p/'GENESIS.json').write_text(json.dumps({'schema':'PF1_LIVE_GENESIS_V1','R0':r0}))
    h={'startedUTC':(now-timedelta(minutes=7)).isoformat().replace('+00:00','Z'),
       'reason':'synthetic incident fixture — no real halt'} if halted else None
    (p/'STATE.json').write_text(json.dumps({
        'schema':'PF1_LIVE_RUNTIME_STATUS_V1','status':'halted' if halted else 'running',
        'admittedTicks':2,'lastAdmittedRound':r0+20,'openHalt':h
    }))
    rows=[]
    for k in range(2):
        rows.append({'tick':k,'round':r0+20*k,
                     'armExposure':{a:{
                         'scannedSteps':1,'candidatesDetected':int(a=='C' and k==1),
                         'eligibleCandidates':0,'forkInstancesProbed':0,
                         'confirmedEncounters':0
                     } for a in ARM_IDS}})
    (p/'SILENT_LEDGER.json').write_text(json.dumps({'schema':'PF1_LIVE_SILENT_LEDGER_V1','rows':rows}))
    return p

def main():
    now=datetime.now(timezone.utc)
    with tempfile.TemporaryDirectory(prefix='PF1-NO-GENESIS-TEST-') as d:
        root=pathlib.Path(d)
        no=read_pf1_status(root,now)
        assert no['status']=='no genesis'
        assert no['lastAdmittedRound'] is None
        assert no['roundsPendingCatchup'] is None
        assert no['silentLedgerExposureCountsPerArm'] is None
        assert no['openHalt'] is None
        p=make(root,now)
        active=read_pf1_status(root,now)
        assert active['status']=='running'
        assert active['roundsPendingCatchup']>=4
        assert active['silentLedgerExposureCountsPerArm']['C']['scannedSteps']==2
        assert active['silentLedgerExposureCountsPerArm']['R08']['scannedSteps']==2
        assert active['silentLedgerExposureCountsPerArm']['C']['candidatesDetected']==1
        assert active['openHalt'] is None
        data=json.loads((p/'STATE.json').read_text())
        data['status']='halted'
        data['openHalt']={'startedUTC':(now-timedelta(hours=1)).isoformat().replace('+00:00','Z'),
                          'reason':'synthetic durable lease incident'}
        (p/'STATE.json').write_text(json.dumps(data))
        stopped=read_pf1_status(root,now)
        assert stopped['status']=='halted'
        assert stopped['openHalt']['reason']=='synthetic durable lease incident'
        assert stopped['roundsPendingCatchup']>=4
        rows=json.loads((p/'SILENT_LEDGER.json').read_text())
        rows['rows'][1]['round']+=20
        (p/'SILENT_LEDGER.json').write_text(json.dumps(rows))
        try:read_pf1_status(root,now)
        except ValueError as e:assert 'GAP_DUPLICATE_OR_REORDER' in str(e)
        else:raise AssertionError('CORRUPTED_LIVE_LEDGER_WAS_ACCEPTED')
    print('PF1_WEEKLY_STATUS_FIXTURE_TESTS_PASS: no genesis, running, halted, catchup, nine arms, corruption fail-closed')

if __name__=='__main__':main()
