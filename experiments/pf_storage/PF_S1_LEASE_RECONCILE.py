"""PF S1 amendment 5: audit before completing a PF-1 or PF-2 lease left open when a live run's batch push was refused
(a push to main landed while the lease was active, and the no-stale-rebase guard stopped the run before it could close
its lease).

Read-only. It asserts that the given lease is the only open lease, that it belongs to the given experiment's committed
prefix, and that the joined state is a clean, running, fully committed prefix with the expected tick count. The
workflow (.github/workflows/pf-s1-a5.yml) then runs the pinned PFx_LIVE_CHECK.py and writes exactly one C1-native
completion. The uncommitted batch of the failed run is excluded; its rounds are re-admitted by the unchanged catch-up.

  python PF_S1_LEASE_RECONCILE.py <lease e.g. 41472901972-1> <pf1|pf2> <expected admitted ticks>
"""
import json,pathlib,sys
def main(lease,pf,ticks):
    ticks=int(ticks); assert pf in ('pf1','pf2'),pf
    root=pathlib.Path('drift1a_c1/runner_state')
    assert (root/'leases'/f'{lease}.json').exists(),'NO_SUCH_LEASE'
    assert not (root/'completions'/f'{lease}.json').exists(),'ALREADY_COMPLETED'
    un=sorted(p.name for p in (root/'leases').glob('*.json') if not (root/'completions'/p.name).exists())
    assert un==[f'{lease}.json'],'OTHER_OWNER_ACTIVE_OR_LEASE_CHANGED '+repr(un)
    live=pathlib.Path(f'experiments/{pf}/live')
    s=json.loads((live/'STATE.json').read_text())
    assert s['status']=='running' and s.get('openHalt') is None,('NOT_RUNNING',s['status'])
    assert s['admittedTicks']==ticks,('UNEXPECTED_TICKS',s['admittedTicks'],ticks)
    if pf=='pf1':
        l=json.loads((live/'SILENT_LEDGER.json').read_text())
        assert len(l['rows'])==ticks and s['headDigest']==l['rows'][-1]['digest']
        assert not (live/'PENDING_JOURNAL.json').exists()
    else:
        assert s['engine']['tick']==ticks and len(s['engine']['receivers'])==18
        for n in ('PENDING_BATCH.json','.PF2_STATE_NEW.tmp','INBOX.json'): assert not (live/n).exists(),n
    assert s.get('notificationsSent',0)==0
    print('PF_S1_A5_PREFIX_AUTHORITATIVE_UNCOMMITTED_BATCH_EXCLUDED',json.dumps({'lease':lease,'pf':pf,'ticks':ticks,
          'head':s['headDigest'],'lastAdmittedRound':s['lastAdmittedRound']}))
if __name__=='__main__':main(*sys.argv[1:])
