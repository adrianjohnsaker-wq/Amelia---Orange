# PF_S1 (storage-and-recovery addendum, 29 Oct 2026): byte copy of PF2_A1_CATCHUP_AD1.py plus storage hooks marked
# PF_S1: the live STATE.json is joined from Git shards before use and split before every commit. Admission, runtime,
# canonical chain, sealing, checking, lease and halt logic are unchanged.
"""PF2 AD1 post-genesis A1 catch-up driver with signed canonical ledger hashing.
Reuses the EXACT untouched PF1_SAFE_LEASE.acquire() exclusive durable
remote-claim code; 20 verified Quicknet rounds per signed batch, no more
than 480 per invocation, 35-minute budget and 5-minute push margin.
No schedules, notifications, automatic genesis or C1/PF1 modifications.
ONLY usable after an explicit operator GENESIS approval AND distinct
LIVE-ADMISSION approval. Existing PF1 workflows are never invoked.
"""
import os,sys,json,pathlib,subprocess,time,hashlib
from datetime import datetime,timezone
from drift1a_c1.beacon import current_round
sys.path.insert(0,'experiments/pf1')
from PF1_SAFE_LEASE import acquire  # REUSE real previously race-tested method, no changes
ROOT=pathlib.Path('experiments/pf2/live')
sys.path.insert(0,'experiments/pf_storage')  # PF_S1
from PF_SHARD import join_all,split_all  # PF_S1
S1_FILES=[ROOT/'STATE.json']  # PF_S1
BATCH=20;CAP=480;WALL_LIMIT=35*60;STOP_MARGIN=5*60
def cmd(*argv):
    r=subprocess.run(argv,capture_output=True,text=True)
    if r.returncode:raise RuntimeError('PF2_COMMAND_FAILURE '+repr(argv)+' '+r.stderr[-1100:])
    return r.stdout.strip()
def remote_check():
    local=cmd('git','rev-parse','HEAD')
    cmd('git','fetch','origin','main')
    head=cmd('git','rev-parse','FETCH_HEAD')
    if head!=local:raise RuntimeError('PF2_REMOTE_MOVED_NO_REBASE_NO_ADMISSION')
    return head
def state():
    g=json.loads((ROOT/'GENESIS.json').read_text())
    s=json.loads((ROOT/'STATE.json').read_text())
    assert s['admittedTicks']==s['engine']['tick']
    assert s['genesisDigest']==g['genesisDigest']
    assert s['status']=='running'
    assert g['approvedByOperator'] and (g['R0']-33158540)%20==0
    return g,s
def published_budget(g,s):
    return min(max(0,(current_round(time.time()-3)-g['R0'])//20+1-s['admittedTicks']),max(0,86400-s['admittedTicks']))
def assert_allowed_files_only():
    rows=subprocess.run(['git','status','--porcelain','--untracked-files=all'],capture_output=True,text=True,check=True).stdout.splitlines()
    for row in rows:
        if not row:continue
        p=row[3:]
        if not (p.startswith('experiments/pf2/live/') or p.startswith('drift1a_c1/runner_state/')):
            raise RuntimeError('PF2_UNEXPECTED_WORKTREE_MUTATION '+row)
def batch():
    cmd('python','experiments/pf2/PF2_LIVE_INTAKE.py')
    inbox=json.loads(pathlib.Path(os.environ['PF2_LIVE_INBOX']).read_text())
    n=inbox['count']
    assert 0<=n<=BATCH and inbox['liveVerified'] and inbox['noNotifications']
    if n==0:return 0
    cmd('npx','tsx','experiments/pf2/PF2_LIVE_RUN.mjs')
    cmd('python','experiments/pf2/PF2_CANONICAL_CHAIN_AD1.py')
    cmd('python','experiments/pf2/PF2_LIVE_SEAL.py')
    cmd('python','experiments/pf2/PF2_LIVE_CHECK.py')
    if state()[1]['admittedTicks']>=43200:
        cmd('python','experiments/pf2/PF2_DAY30_EVALUATE.py')
    # Periodic full replay belongs to separate read-only workflow, never
    # silently omitted from scheduled weekly report.
    return n
def commit_batch(lease,bnum,n):
    assert 1<=n<=BATCH
    assert_allowed_files_only()
    split_all(S1_FILES)  # PF_S1
    cmd('git','add','--','experiments/pf2/live/')
    cmd('git','diff','--cached','--check')
    cmd('git','commit','-m',f'PF2 verified 18-arm BLS + RFC3161 A1 batch {bnum} {n} lease {lease}')
    cmd('git','push','origin','HEAD:main')  # never force, never rebase stale state
    remote_check()
def complete_lease(lease):
    remote_check()
    cmd('python','-m','drift1a_c1.runner','complete',lease)
    assert_allowed_files_only()
    cmd('git','add','--','drift1a_c1/runner_state/')
    cmd('git','diff','--cached','--check')
    cmd('git','commit','-m','PF2 verified shared exclusive lease completion '+lease)
    cmd('git','push','origin','HEAD:main')
    remote_check()
def main():
    assert os.getenv('PF2_OPERATIONAL_AD1_SEAL_VERIFIED')=='true','AD1_EXTERNAL_RFC3161_APPROVAL_MISSING'
    assert os.getenv('PF2_GENESIS_OPERATOR_APPROVED')=='true','MISSING_OPERATOR_GENESIS_APPROVAL'
    assert os.getenv('PF2_LIVE_ADMISSION_OPERATOR_AUTHORISED')=='true','MISSING_SEPARATE_LIVE_ADMISSION'
    assert os.getenv('PF2_A1_OPERATOR_APPROVED')=='true','MISSING_A1_APPROVAL'
    assert os.getenv('DRIFT_C1_ENABLE_LIVE')=='false','C1_MUST_REMAIN_OFF'
    assert os.getenv('PF2_MAX_LIVE_TICKS')=='20'
    assert os.getenv('PF2_A1_MAX_TICKS')=='480'
    assert os.getenv('PF2_REMOTE_SHARED_LEASE_ACKNOWLEDGED')!='true'
    join_all(S1_FILES)  # PF_S1
    lease=os.environ['PF2_LEASE']
    assert lease and all(c in '0123456789-' for c in lease)
    g,start=state()
    cmd('git','config','user.name','PF2 approved A1 recorder')
    cmd('git','config','user.email','41898282+github-actions[bot]@users.noreply.github.com')
    claimed=acquire(lease,branch='main')
    assert claimed['status']=='PUSH_CONFIRMED' and claimed['admission_authorized']
    os.environ['PF2_REMOTE_SHARED_LEASE_ACKNOWLEDGED']='true'
    remote_check()
    starttime=time.monotonic();accepted=0;bnum=0
    try:
        while accepted<CAP and time.monotonic()-starttime<WALL_LIMIT-STOP_MARGIN:
            remote_check()
            g,s=state()
            due=published_budget(g,s)
            if due==0:break
            n=batch()
            if n==0:break
            if accepted+n>CAP:raise RuntimeError('PF2_DISPATCH_CAP_EXCEEDED')
            bnum+=1;commit_batch(lease,bnum,n);accepted+=n
    except Exception as e:
        print('PF2_A1_FAIL_CLOSED_BATCH_ERROR',repr(e),flush=True)
        # Match the original PF1 A1 recovery: only after checking that our
        # leased remote HEAD is still authoritative may we discard a local
        # partially staged chunk, preserve the last signed prefix and halt.
        # Never alter canonical, C1 or PF1 source/history.
        remote_check()
        cmd('git','restore','--','experiments/pf2/live/')
        cmd('git','clean','-fd','--','experiments/pf2/live/')
        join_all(S1_FILES)  # PF_S1: rebuild the last committed state
        assert_allowed_files_only()
        os.environ['PF2_HALT_REASON']='PF2_A1 sealed batch failed: '+str(e)[:720]
        cmd('python','experiments/pf2/PF2_LIVE_HALT.py')
        split_all(S1_FILES)  # PF_S1
        assert_allowed_files_only()
        cmd('git','add','--','experiments/pf2/live/')
        cmd('git','diff','--cached','--check')
        cmd('git','commit','-m','PF2 A1 FAIL-CLOSED HALT at last verified prefix lease '+lease)
        cmd('git','push','origin','HEAD:main')
        remote_check()
        complete_lease(lease)
        raise RuntimeError('PF2_A1_HALTED_OPERATOR_RECOVERY_REQUIRED: '+str(e))
    complete_lease(lease)
    print('PF2_A1_BATCHES_COMMITTED_NO_NOTIFICATIONS',json.dumps({
     'accepted':accepted,'batches':bnum,'admittedTicks':state()[1]['admittedTicks'],
     'backlog':published_budget(*state()),
     'noNotifications':True,'noC1Writes':True,'noPF1Writes':True}))
if __name__=='__main__':main()
