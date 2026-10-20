"""PF1 fail-closed live halt after a failed lease-held admission/seal attempt.
Use ONLY after restoring the last committed scientific state; record reason, start.
Never auto-resume, never call C1, never notify about encounters.
"""
import json,os,pathlib
from datetime import datetime,timezone
ROOT=pathlib.Path('experiments/pf1/live')
def main():
    if os.getenv('PF1_REMOTE_LEASE_ACKNOWLEDGED')!='true':
        raise RuntimeError('NO_REMOTE_PF1_LEASE')
    path=ROOT/'STATE.json'
    data=json.loads(path.read_text())
    assert data['schema']=='PF1_LIVE_RUNTIME_STATUS_V1'
    if data['status']=='halted':
        print('PF1_ALREADY_HALTED_EXISTING_REASON_UNCHANGED')
        return
    reason=os.environ.get('PF1_HALT_REASON','Unclassified verification, processing, sealing or persistence failure')
    data['status']='halted'
    data['openHalt']={'startedUTC':datetime.now(timezone.utc).isoformat().replace('+00:00','Z'),
       'reason':reason[:1000]}
    path.write_text(json.dumps(data,sort_keys=True,indent=2)+'\n')
    print('PF1_HALTED_FAIL_CLOSED',json.dumps({
       'lastAdmittedRound':data['lastAdmittedRound'],
       'start':data['openHalt']['startedUTC'],'reason':data['openHalt']['reason'],
       'encounterNotifications':0,'C1Altered':False}))
if __name__=='__main__':main()
