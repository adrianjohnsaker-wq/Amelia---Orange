"""A1 live catch-up orchestrator (operational only; NOT a scientific source).

External live permission is supplied ONLY by the approved Actions workflow.
All old pinned PF1/C1 scripts are invoked unchanged. Each 1..20 verified-round
batch receives its OWN seal, full-chain check, commit, push and remote-head
confirmation while the SAME remotely exclusive PF1 lease remains open.

Fail closed on any science/seal/input error. Never infer missing quicknet ticks.
Never rebase a stale push; remote lease remains unresolved if remote diverges.
"""
import json,os,pathlib,subprocess,time,sys
from datetime import datetime,timezone

ROOT=pathlib.Path("experiments/pf1")
LIVE=ROOT/"live"
BATCH=20
CAP=480
WALL_LIMIT_SECONDS=35*60
STOP_MARGIN_SECONDS=5*60
ARMS=("C","R01","R02","R03","R04","R05","R06","R07","R08")
PIN="f1875b5eea5339eb1ac73e50b5df6b103d0cabe9"
MANIFEST_SHA="b48dc2fa512b7e7ee77ea951309b826cb67b63ba728fb6bbeb35d6476d52a699"

def utc():
    return datetime.now(timezone.utc).isoformat().replace("+00:00","Z")

def cmd(*argv,check=True):
    result=subprocess.run(argv,capture_output=True,text=True)
    if check and result.returncode:
        raise RuntimeError("COMMAND_FAILED "+repr(argv)+" code="+str(result.returncode)+" "+result.stderr[-900:])
    if result.stdout.strip():
        print("PF1_A1_COMMAND",argv[0],result.stdout[-4000:].strip(),flush=True)
    return result

def git(*args):
    return cmd("git",*args).stdout.strip()

def info():
    gen=json.loads((LIVE/"GENESIS.json").read_text())
    state=json.loads((LIVE/"STATE.json").read_text())
    ledger=json.loads((LIVE/"SILENT_LEDGER.json").read_text())
    assert gen["schema"]=="PF1_LIVE_GENESIS_V1"
    assert gen["R0"]%20==0 and (gen["R0"]-33158540)%20==0
    assert gen["PF1ReferenceDomain"]=="PF1-REF-i|"
    assert state["genesisDigest"]==gen["genesisDigest"]==ledger["genesisDigest"]
    assert state["status"]=="running","PF1_HALTED_NO_AUTOMATIC_RESTART"
    assert len(state["arms"])==9 and tuple(a["id"] for a in state["arms"])==ARMS
    assert state["admittedTicks"]==len(ledger["rows"])
    assert state["lastAdmittedRound"]==(gen["R0"]+20*(state["admittedTicks"]-1) if state["admittedTicks"] else None)
    assert state["headDigest"]==(ledger["rows"][-1]["digest"] if ledger["rows"] else gen["genesisDigest"])
    return gen,state

def assert_authorised_environment():
    assert os.environ.get("PF1_A1_OPERATOR_APPROVED")=="true","A1_OPERATOR_APPROVAL_MISSING"
    assert os.environ.get("PF1_LIVE_ADMISSION_OPERATOR_AUTHORISED")=="true"
    assert os.environ.get("DRIFT_C1_ENABLE_LIVE")=="false","C1_WRITE_FORBIDDEN"
    assert os.environ.get("PF1_MAX_LIVE_TICKS")=="20","BATCH_BOUND_MUST_BE_20"
    assert os.environ.get("PF1_A1_MAX_TICKS")=="480","A1_HARD_CAP_MUST_BE_480"
    assert os.environ.get("PF1_A1_REHEARSAL_PASS")=="true","A1_REHEARSAL_NOT_PASSED"
    assert os.environ.get("PF1_REMOTE_LEASE_ACKNOWLEDGED")!="true","LEASE_CANNOT_BE_REUSED_FROM_ENV"
    assert os.environ.get("PF1_LEASE"),"PF1_LEASE_REQUIRED"
    assert os.environ.get("PF1_LIVE_INBOX"),"PF1_LIVE_INBOX_REQUIRED"

def published_budget(gen,state,now=None):
    # Mirrors the existing LIVE_INTAKE 3-second safety gap exactly.
    from drift1a_c1.beacon import current_round
    now=time.time() if now is None else now
    latest=current_round(now-3)
    return max(0,(latest-gen["R0"])//20+1-state["admittedTicks"])

def assert_remote_head():
    local=git("rev-parse","HEAD")
    remote=git("fetch","origin","main") or git("rev-parse","FETCH_HEAD")
    head=git("rev-parse","FETCH_HEAD")
    if head!=local:
        raise RuntimeError("PF1_A1_REMOTE_MOVED_NO_STALE_REBASE local="+local+" remote="+head)
    return head

def assert_batch_only_mutations():
    # Generated evidence and lease completion ONLY. Ignore ignored npm/node_modules.
    modified=git("status","--porcelain","--untracked-files=all").splitlines()
    for item in modified:
        if not item:continue
        path=item[3:]
        if not (path.startswith("experiments/pf1/live/") or path.startswith("drift1a_c1/runner_state/")):
            raise RuntimeError("A1_UNEXPECTED_WORKTREE_MUTATION "+item)
    return True

def restore_last_committed_live():
    cmd("git","restore","--","experiments/pf1/live/")
    # Runner checkout is ephemeral, and this only removes UNTRACKED failed
    # PF1 batch evidence. No canonical/pinned files are touched.
    cmd("git","clean","-fd","--","experiments/pf1/live/")
    assert_batch_only_mutations()

def execute_batch():
    # The original admission, runtime, journal sealing and verifier files
    # are all frozen by genesis SHA256 checks. Do NOT clone/inline their logic.
    cmd("python","experiments/pf1/PF1_LIVE_INTAKE.py")
    inbox=json.loads(pathlib.Path(os.environ["PF1_LIVE_INBOX"]).read_text())
    assert inbox["schema"]=="PF1_VERIFIED_LIVE_INBOX_V1"
    assert inbox["liveVerified"] is True
    before=info()[1]["admittedTicks"]
    assert inbox["startingTick"]==before
    n=inbox["count"]
    assert 0<=n<=20 and len(inbox["receipts"])==n
    if n==0:return 0
    assert all(x["tick"]==before+i for i,x in enumerate(inbox["receipts"]))
    cmd("npx","tsx","experiments/pf1/PF1_LIVE_RUN.ts")
    cmd("python","experiments/pf1/PF1_LIVE_SEAL.py")
    cmd("python","experiments/pf1/PF1_LIVE_CHECK.py")
    end=info()[1]["admittedTicks"]
    assert end==before+n
    return n

def commit_and_confirm_batch(lease, batch_number, n):
    assert 1<=n<=20
    assert_batch_only_mutations()
    cmd("git","add","--","experiments/pf1/live/")
    cmd("git","diff","--cached","--check")
    msg="PF1 A1 live verified seal and durable batch "+str(batch_number)+" ("+str(n)+" rounds) lease "+lease
    cmd("git","commit","-m",msg)
    # Stale push MUST be rejected; never force or rebase.
    cmd("git","push","origin","HEAD:main")
    head=assert_remote_head()
    print("PF1_A1_DURABLE_BATCH_COMMITTED",json.dumps({"batch":batch_number,"rounds":n,"head":head,"ticks":info()[1]["admittedTicks"],"UTC":utc()}),flush=True)

def complete_lease(lease,kind):
    assert_remote_head()
    cmd("python","-m","drift1a_c1.runner","complete",lease)
    assert_batch_only_mutations()
    cmd("git","add","--","drift1a_c1/runner_state/")
    cmd("git","diff","--cached","--check")
    cmd("git","commit","-m","PF1 A1 "+kind+" durable exclusive lease completion "+lease)
    cmd("git","push","origin","HEAD:main")
    h=assert_remote_head()
    print("PF1_A1_LEASE_COMPLETED",json.dumps({"head":h,"lease":lease,"kind":kind}),flush=True)

def main():
    assert_authorised_environment()
    cmd("git","-C","../c1-pin","rev-parse","HEAD")
    assert cmd("git","-C","../c1-pin","rev-parse","HEAD").stdout.strip()==PIN
    cmd("sha256sum","-c", "-",check=False) if False else None
    import hashlib
    assert hashlib.sha256((ROOT/"PF1_GENESIS_MANIFEST_DRAFT.json").read_bytes()).hexdigest()==MANIFEST_SHA
    gen,started=info()
    from PF1_SAFE_LEASE import acquire
    lease=os.environ["PF1_LEASE"]
    begin=time.monotonic()
    result=acquire(lease,branch="main")
    assert result["status"]=="PUSH_CONFIRMED" and result["admission_authorized"]
    os.environ["PF1_REMOTE_LEASE_ACKNOWLEDGED"]="true"
    assert_remote_head()
    git("config","user.name","PF1 authorised A1 recorder")
    git("config","user.email","41898282+github-actions[bot]@users.noreply.github.com")
    print("PF1_A1_REMOTE_LEASE_ACQUIRED",json.dumps({"lease":lease,"startTick":started["admittedTicks"],"head":result["pushed_commit"],"UTC":utc()}),flush=True)
    batches=0
    accepted=0
    failure=None
    try:
        while accepted<CAP:
            # Stop with >=5min unused within our 35-minute maximum.
            if time.monotonic()-begin>=WALL_LIMIT_SECONDS-STOP_MARGIN_SECONDS:
                print("PF1_A1_TIME_BUDGET_STOPS_GRACEFULLY")
                break
            assert_remote_head()
            gen,st=info()
            due=published_budget(gen,st)
            print("PF1_A1_BACKLOG",json.dumps({"admitted":st["admittedTicks"],"dueUnadmitted":due,"UTC":utc(),"acceptedThisDispatch":accepted}),flush=True)
            if due==0:break
            n=execute_batch()
            if n==0:break
            if accepted+n>CAP:raise RuntimeError("PF1_A1_DISPATCH_CAP_EXCEEDED")
            batches+=1
            commit_and_confirm_batch(lease,batches,n)
            accepted+=n
    except Exception as exc:
        failure=exc
        print("PF1_A1_FAIL_CLOSED_BATCH_ERROR",repr(exc),flush=True)
        # In case of a stale remote HEAD, do NOT write/complete any lease.
        # Its unresolved remote lease prevents parallel automatic admission.
        assert_remote_head()
        restore_last_committed_live()
        os.environ["PF1_HALT_REASON"]="A1 batch verification/sealing/commit failure; lease "+lease+"; "+str(exc)[:750]
        cmd("python","experiments/pf1/PF1_LIVE_HALT.py")
        assert_batch_only_mutations()
        cmd("git","add","--","experiments/pf1/live/")
        cmd("git","diff","--cached","--check")
        cmd("git","commit","-m","PF1 A1 FAIL-CLOSED HALT at last durably admitted prefix lease "+lease)
        cmd("git","push","origin","HEAD:main")
        assert_remote_head()
    if failure is None:
        complete_lease(lease,"SUCCESS")
        print("PF1_A1_SUCCESS",json.dumps({"batches":batches,"newAdmittedRounds":accepted,"startTick":started["admittedTicks"],"endTick":info()[1]["admittedTicks"],"UTC":utc(),"backlogUnadmitted":published_budget(*info())}),flush=True)
    else:
        complete_lease(lease,"HALTED")
        raise RuntimeError("PF1_A1_FAILED_AND_HALTED "+str(failure))

if __name__=="__main__":main()
