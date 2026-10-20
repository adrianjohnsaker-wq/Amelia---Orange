"""Prospective PF1-only admission lease. Not authorised for LIVE operation.
Conservative one-shot push with no stale-claim rebase; synthetic race tested.
This does not modify pinned C1. No network beacon fetching anywhere.
"""
import pathlib
import subprocess
from drift1a_c1.runner import claim

BRANCH='amelia-1.0'
def git(*args):
    p=subprocess.run(['git',*args],capture_output=True,text=True)
    return p

def acquire(identifier, remote='origin',branch=BRANCH):
    if not identifier or any(x not in '0123456789-' for x in identifier):
        raise ValueError('invalid prospective workflow lease identity')
    if git('status','--porcelain').stdout.strip():
        raise RuntimeError('dirty working tree: never discard scientific changes')
    r=git('fetch',remote,branch)
    if r.returncode:raise RuntimeError('cannot fetch authoritative branch: '+r.stderr)
    r=git('checkout','-B','pf1-lease-attempt','FETCH_HEAD')
    if r.returncode:raise RuntimeError('cannot checkout authoritative HEAD: '+r.stderr)
    root=pathlib.Path('drift1a_c1/runner_state')
    # Recheck ALL unresolved leases from remote state; not just our local claim.
    pending=sorted(p.name for p in (root/'leases').glob('*.json')
                   if not (root/'completions'/p.name).exists())
    if pending:raise RuntimeError('already leased; NO ADMISSION: '+repr(pending))
    claim(root,identifier)
    for cmd in [('add','--','drift1a_c1/runner_state'),
                ('commit','-m','PF1-synthetic prospective exclusive lease '+identifier)]:
        r=git(*cmd)
        if r.returncode:raise RuntimeError('cannot persist prospective claim: '+r.stderr)
    r=git('push',remote,'HEAD:'+branch)
    if r.returncode:
        # IMPORTANT: No rebase of stale claim. No second push.
        raise RuntimeError('REMOTE_MOVED: stale lease rejected, NO ADMISSION: '+r.stderr)
    # Require independently fetched remote confirmation and no other open lease.
    r=git('fetch',remote,branch)
    if r.returncode:raise RuntimeError('push not independently confirmable')
    active=git('ls-tree','-r','--name-only','FETCH_HEAD')
    if active.returncode:raise RuntimeError('cannot verify remote lease tree')
    rows=active.stdout.splitlines()
    paths=[x for x in rows if x.startswith('drift1a_c1/runner_state/leases/') and x.endswith('.json')]
    completed=set(x.replace('/completions/','/leases/') for x in rows
                  if x.startswith('drift1a_c1/runner_state/completions/'))
    unresolved=sorted(x for x in paths if x not in completed)
    required='drift1a_c1/runner_state/leases/'+identifier+'.json'
    if unresolved!=[required]:
        raise RuntimeError('remote lease state differs: NO ADMISSION: '+repr(unresolved))
    return dict(status='PUSH_CONFIRMED',admission_authorized=True,identifier=identifier,
                pushed_commit=git('rev-parse','HEAD').stdout.strip(),unresolved=unresolved)

if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser();parser.add_argument('identifier')
    args=parser.parse_args()
    print(acquire(args.identifier))
