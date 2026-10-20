"""PF1 prelive: fork two C1 lease contenders against ephemeral local bare Git.
RUNS ONLY IN TEMP DIRECTORY. No remote GitHub pushes, no beacon or live genesis.
Tests pinned C1 lease_push.acquire() under genuine concurrent Git process races.
"""
import concurrent.futures
import hashlib
import json
import os
import pathlib
import subprocess
import sys
import tempfile
import time
from threading import Event

PIN='f1875b5eea5339eb1ac73e50b5df6b103d0cabe9'
def git(*argv, cwd=None, check=True):
    p=subprocess.run(['git',*argv],cwd=cwd,text=True,capture_output=True)
    if check and p.returncode:raise RuntimeError(f"git {argv} failed: {p.stderr}")
    return p
def test():
    assert os.getenv('DRIFT_C1_ENABLE_LIVE')!='true'
    c1=os.environ['PF1_PINNED_C1_DIR']
    assert git('rev-parse','HEAD',cwd=c1).stdout.strip()==PIN
    trials=[]
    # Distinct lease IDs each run, never reuse a root after the first remote push.
    with tempfile.TemporaryDirectory(prefix='pf1-lease-git-race-') as tmp:
        root=pathlib.Path(tmp)
        for trial in range(6):
            directory=root/f'trial-{trial}'
            directory.mkdir()
            bare=directory/'origin.git'
            git('init','--bare',str(bare))
            seed=directory/'seed'
            git('clone',str(bare),str(seed))
            git('config','user.email','pf1.synthetic@example.invalid',cwd=seed)
            git('config','user.name','PF1 Synthetic Fixture',cwd=seed)
            lease=seed/'drift1a_c1/runner_state'
            lease.mkdir(parents=True,exist_ok=True)
            (lease/'.keep').write_text('synthetic-only\n')
            git('add','.',cwd=seed)
            git('commit','-m','synthetic empty lease branch',cwd=seed)
            git('push','origin','HEAD:amelia-1.0',cwd=seed)
            contenders=[]
            for i in range(2):
                dest=directory/f'worker-{i}'
                git('clone','--branch','amelia-1.0',str(bare),str(dest))
                git('config','user.email','pf1.synthetic@example.invalid',cwd=dest)
                git('config','user.name',f'Synthetic Worker {i}',cwd=dest)
                contenders.append(dest)
            starter=Event()
            def run_worker(i):
                starter.wait()
                code="from drift1a_c1.lease_push import acquire; print(acquire('"+str(trial*2+i+1)+"-1'))"
                env={**os.environ,'PYTHONPATH':c1,
                     'DRIFT_C1_ENABLE_LIVE':'false','PF1_NO_NETWORK':'1'}
                result=subprocess.run([sys.executable,'-c',code],cwd=contenders[i],
                                      env=env,capture_output=True,text=True,timeout=45)
                return dict(worker=i,code=result.returncode,
                            stdout=result.stdout[-1000:],stderr=result.stderr[-1200:])
            with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
                futures=[pool.submit(run_worker,i) for i in range(2)]
                starter.set()
                outcomes=[f.result() for f in futures]
            record=git('ls-tree','-r','--name-only','amelia-1.0',cwd=bare).stdout.splitlines()
            leases=[x for x in record if x.startswith('drift1a_c1/runner_state/leases/') and x.endswith('.json')]
            approved=sum(o['code']==0 for o in outcomes)
            # Two acknowledged workers OR two durable leases is an unsafe race.
            unsafe=approved>1 or len(leases)>1
            trials.append(dict(trial=trial+1,workers=outcomes,acknowledgedAcquisitions=approved,
                               committedLeaseCount=len(leases),committedLeases=leases,
                               unsafeMultipleAdmissible=unsafe))
    out={'schema':'PF1_C1_GIT_LEASE_RACE_V1','mode':'LOCAL_EPHEMERAL_GIT_ONLY',
         'sourcePin':PIN,'trials':len(trials),'results':trials,
         'unsafeTrials':sum(x['unsafeMultipleAdmissible'] for x in trials),
         'allTrialsSingleWinner':all(x['acknowledgedAcquisitions']==1 and x['committedLeaseCount']==1 for x in trials),
         'realGitHubRemoteNotTested':True,'scientificConstantsUnchanged':True,
         'noLiveBeacon':True,'noGenesis':True,'liveStartAuthorised':False}
    path=pathlib.Path(os.environ['PF1_RACE_OUTPUT'])
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(out,indent=2,sort_keys=True)+'\n')
    print('PF1_C1_EPHEMERAL_GIT_LEASE_RACE',json.dumps({k:out[k] for k in
          ['trials','unsafeTrials','allTrialsSingleWinner','realGitHubRemoteNotTested']}))
    # preserve evidence even if unsafe; report is a NO-GO
    if not out['allTrialsSingleWinner']:raise SystemExit(3)
if __name__=='__main__':test()
