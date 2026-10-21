"""A1 predeployment synthetic rehearsal: disposable Git repository, ZERO live data.
Exercises the ACTUAL A1 git commit/push/check/restore helpers, not a pretend
in-memory save. The explicit synthetic ledger rows are NEVER admitted to PF1.
"""
import os,sys,subprocess,tempfile,json,pathlib,hashlib,importlib.util
from contextlib import contextmanager

SCRIPT=pathlib.Path(__file__).resolve().parent/'PF1_A1_CATCHUP.py'
spec=importlib.util.spec_from_file_location("pf1_a1_catchup_test",SCRIPT)
a1=importlib.util.module_from_spec(spec);spec.loader.exec_module(a1)
def sh(*args,cwd=None):
    x=subprocess.run(args,cwd=cwd,check=True,capture_output=True,text=True)
    return x.stdout.strip()
def write(root,path,record):
    p=root/path;p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(record,sort_keys=True)+'\n')
def read(root,path):return json.loads((root/path).read_text())

assert a1.BATCH==20 and a1.CAP==480
assert a1.WALL_LIMIT_SECONDS==2100 and a1.STOP_MARGIN_SECONDS==300
assert a1.CAP//a1.BATCH==24
os.environ.pop('PF1_A1_OPERATOR_APPROVED',None)
try:
    a1.assert_authorised_environment()
    raise AssertionError("operator gate did not reject no approval")
except AssertionError as exc:
    assert 'A1_OPERATOR_APPROVAL_MISSING' in str(exc)

with tempfile.TemporaryDirectory(prefix='pf1-a1-SYNTHETIC-') as td:
    tmp=pathlib.Path(td); remote=tmp/'REMOTE.git';local=tmp/'local';outside=tmp/'other'
    sh('git','init','--bare',str(remote))
    sh('git','clone',str(remote),str(local))
    sh('git','-C',str(local),'checkout','-b','main')
    sh('git','-C',str(local),'config','user.name','PF1 A1 synthetic test')
    sh('git','-C',str(local),'config','user.email','rehearsal@example.invalid')
    genesis={'schema':'PF1_LIVE_GENESIS_V1','R0':33244860,'C1GridOffsetRounds':0,
      'PF1ReferenceDomain':'PF1-REF-i|','genesisDigest':'SYNTHETIC_NOT_SEALED'}
    def state(n):
        return {'schema':'PF1_LIVE_RUNTIME_STATUS_V1','status':'running','admittedTicks':n,
          'genesisDigest':genesis['genesisDigest'],
          'headDigest':('SYNTHETIC_HEAD_'+str(n) if n else genesis['genesisDigest']),
          'lastAdmittedRound':(genesis['R0']+20*(n-1) if n else None),
          'arms':[{'id':id} for id in a1.ARMS]}
    def ledger(n):
        return {'genesisDigest':genesis['genesisDigest'],
          'rows':[{'tick':i,'round':genesis['R0']+20*i,'digest':'SYNTHETIC_HEAD_'+str(i+1)} for i in range(n)]}
    write(local,'experiments/pf1/live/GENESIS.json',genesis)
    write(local,'experiments/pf1/live/STATE.json',state(0))
    write(local,'experiments/pf1/live/SILENT_LEDGER.json',ledger(0))
    write(local,'experiments/pf1/live/JOURNAL.json',{'entries':[]})
    write(local,'drift1a_c1/runner_state/leases/100-1.json',{'lease':'100-1','synthetic':True})
    sh('git','-C',str(local),'add','.')
    sh('git','-C',str(local),'commit','-m','SYNTHETIC A1 rehearsal genesis and lease')
    sh('git','-C',str(local),'push','origin','HEAD:main')
    original=os.getcwd()
    os.chdir(local)
    try:
        assert a1.assert_remote_head()
        assert a1.info()[1]['admittedTicks']==0
        def simulate_batch(n):
            st=read(local,'experiments/pf1/live/STATE.json')
            start=st['admittedTicks']
            write(local,'experiments/pf1/live/STATE.json',state(start+n))
            write(local,'experiments/pf1/live/SILENT_LEDGER.json',ledger(start+n))
        simulate_batch(20)
        a1.commit_and_confirm_batch('100-1',1,20)
        assert a1.info()[1]['admittedTicks']==20
        durable_head=a1.assert_remote_head()
        simulate_batch(3)
        write(local,'experiments/pf1/live/PENDING_JOURNAL.json',{'synthetic':True})
        assert a1.info()[1]['admittedTicks']==23
        a1.restore_last_committed_live()
        assert a1.info()[1]['admittedTicks']==20
        assert not (local/'experiments/pf1/live/PENDING_JOURNAL.json').exists()
        assert a1.assert_remote_head()==durable_head
        # Re-do 20 .. 39 using committed state, no duplicate first batch.
        simulate_batch(20)
        a1.commit_and_confirm_batch('100-1',2,20)
        assert a1.info()[1]['admittedTicks']==40
        assert [x['tick'] for x in read(local,'experiments/pf1/live/SILENT_LEDGER.json')['rows']]==list(range(40))
        assert len(read(local,'experiments/pf1/live/SILENT_LEDGER.json')['rows'])==40
        # Verify that stale remote changes are NEVER rebased silently.
        sh('git','clone',str(remote),str(outside))
        sh('git','-C',str(outside),'config','user.name','remote conflicting writer')
        sh('git','-C',str(outside),'config','user.email','other@example.invalid')
        (outside/'competing-commit.txt').write_text('synthetic unrelated edit\n')
        sh('git','-C',str(outside),'add','competing-commit.txt')
        sh('git','-C',str(outside),'commit','-m','synthetic remote movement')
        sh('git','-C',str(outside),'push','origin','HEAD:main')
        try:
            a1.assert_remote_head()
            raise AssertionError('remote moved but A1 accepted stale HEAD')
        except RuntimeError as exc:
            assert 'REMOTE_MOVED_NO_STALE_REBASE' in str(exc)
        assert a1.info()[1]['admittedTicks']==40
        print('PF1_A1_SYNTHETIC_RECOVERY_AND_REMOTE_MOVE_PASS',json.dumps({
          'from':0,'firstCommit':20,'failureAtUncommitted':23,
          'recoveredDurable':20,'final':40,'duplicateAdmitted':0,
          'remoteDivergenceRejected':True,'scienceFilesModified':False}))
    finally:os.chdir(original)
print('PF1_A1_REHEARSAL_PASS: NEVER_FETCHED_REAL_BEACON, NO_LIVE_PF1_STATE_WRITE')
