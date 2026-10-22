"""AD2 constructed-only pre-flight gate: no beacon, no FreeTSA, no lease, no repository writes.
1. Statically reproduce the AD1 workflow O1 defect (undefined `h`) and show AD2 has none.
2. In a throwaway `git archive HEAD` copy, run the exact AD2 workflow O1 blocks against a
   constructed AD2 bundle, then two synthetic 20-round batches through the unchanged
   RUN -> AD1 canonical rehash -> SEAL -> CHECK path and the independent replay, with an
   offline stand-in for the RFC3161 Sealer. Nothing produced here is ever committed.
"""
import ast,builtins,hashlib,json,os,pathlib,re,shutil,subprocess,sys,tempfile
REPO=pathlib.Path.cwd()
AD1='.github/workflows/pf2-live-observe-ad1.yml'
AD2='.github/workflows/pf2-live-observe-ad2.yml'
sha=lambda b:hashlib.sha256(b).hexdigest()
def blocks(wf):
    text=(REPO/wf).read_text()
    found=re.findall(r"python - <<'PY'\n(.*?)\n\s*PY\n",text,re.S)
    out=[]
    for b in found:
        lines=b.split('\n');ind=min(len(l)-len(l.lstrip()) for l in lines if l.strip())
        out.append('\n'.join(l[ind:] for l in lines))
    return out
def undefined(src):
    tree=ast.parse(src);bound=set(dir(builtins))
    for n in ast.walk(tree):
        if isinstance(n,ast.Name) and isinstance(n.ctx,(ast.Store,ast.Del)):bound.add(n.id)
        elif isinstance(n,ast.arg):bound.add(n.arg)
        elif isinstance(n,(ast.Import,ast.ImportFrom)):
            bound.update((a.asname or a.name).split('.')[0] for a in n.names)
        elif isinstance(n,(ast.FunctionDef,ast.ClassDef)):bound.add(n.name)
    return sorted({n.id for n in ast.walk(tree) if isinstance(n,ast.Name) and isinstance(n.ctx,ast.Load) and n.id not in bound})
def static():
    old=[undefined(b) for b in blocks(AD1)]
    assert ['h'] in old,'AD2_MUST_REPRODUCE_AD1_UNDEFINED_H '+repr(old)
    new=[undefined(b) for b in blocks(AD2)]
    assert all(not x for x in new),'AD2_UNDEFINED_NAMES '+repr(new)
    print('PF2_AD2_STATIC_AD1_DEFECT_REPRODUCED_AND_AD2_CLEAN',json.dumps({'ad1':old,'ad2':new}))
SHIM='''import json,pathlib
import drift1a_c1.beacon as b
Real=b.Sealer
class OfflineStandInSealer:
    # Genuine LIVE receipts (genesis, AD1) are verified by the real pinned C1 Sealer offline.
    def seal(self,folder,imprint,before=float('inf')):
        p=pathlib.Path(folder);p.mkdir(parents=True,exist_ok=True)
        (p/'attempt-0000.tsr').write_bytes(b'AD2_UNIT_ONLY'+imprint.encode())
        (p/'receipt.json').write_text(json.dumps({'status':'PASS','token':'attempt-0000.tsr','imprint':imprint,'mode':'AD2_UNIT_ONLY'}))
        return {'status':'PASS'}
    def verify(self,folder,imprint,before=float('inf')):
        r=json.loads((pathlib.Path(folder)/'receipt.json').read_text())
        if r.get('mode')=='LIVE':return Real().verify(folder,imprint,before)
        assert r['imprint']==imprint and r['mode']=='AD2_UNIT_ONLY';return {'status':'PASS'}
b.Sealer=OfflineStandInSealer
'''
def run(cmd,cwd,env):
    r=subprocess.run(cmd,cwd=cwd,env=env,capture_output=True,text=True)
    if r.returncode:raise RuntimeError('AD2_UNIT_STEP_FAILED '+repr(cmd)+'\n'+r.stdout[-1500:]+r.stderr[-1500:])
    print(r.stdout.strip().splitlines()[-1][:300] if r.stdout.strip() else repr(cmd))
def inbox(path,g,start):
    rows=[]
    for t in range(start,start+20):
        sig=hashlib.sha256(b'PF2_AD2_SYNTHETIC_%d'%t).digest()*3
        rows.append({'tick':t,'round':g['R0']+20*t,'randomness':sha(sig),'signature':sig.hex(),
          'roundTime':g['futureFirstRoundUnix']+60*t,'observedAtUTC':'AD2_UNIT_ONLY',
          'source':'C1_PF1_PINNED_QUICKNET_BLS_VERIFIED'})
    path.write_text(json.dumps({'schema':'PF2_TRANSIENT_VERIFIED_INBOX_V1','genesisDigest':g['genesisDigest'],
      'startingTick':start,'count':20,'receipts':rows,'liveVerified':True,'noNotifications':True}))
def dynamic(c1pin):
    with tempfile.TemporaryDirectory() as td:
        td=pathlib.Path(td);copy=td/'orange';copy.mkdir()
        tar=subprocess.run(['git','archive','HEAD'],cwd=REPO,capture_output=True,check=True).stdout
        subprocess.run(['tar','-x','-C',str(copy)],input=tar,check=True)
        assert (REPO/'node_modules').is_dir(),'AD2_UNIT_NEEDS_NPM_INSTALL'
        (copy/'node_modules').symlink_to(REPO/'node_modules')
        (td/'shim').mkdir();(td/'shim'/'sitecustomize.py').write_text(SHIM)
        (copy/'experiments/pf2/live/chunks').mkdir(parents=True,exist_ok=True)
        # constructed AD2 bundle + stand-in seal so the exact AD2 O1 code paths execute
        g=json.loads((copy/'experiments/pf2/live/GENESIS.json').read_text())
        h=lambda p:sha((copy/p).read_bytes())
        files=[AD2,'experiments/pf2/PF2_AD2_PREFLIGHT_UNIT.py']
        bundle={'schema':'PF2_AD2_OPERATIONAL_SHA256_V1','genesisDigest':g['genesisDigest'],
          'AD1BundleSHA256':h('experiments/pf2/operational_ad1/seal/AD1_SIGNED_BUNDLE.json'),
          'originalAdmittedTicksAtSeal':0,'scienceChanged':False,'originalReceiverChanged':False,
          'notificationsEnabled':False,'sourceOfFailedPreflightEvidence':'39854098920',
          'sourceSHA256':[{'path':f,'sha256':h(f)} for f in files]}
        sd=copy/'experiments/pf2/operational_ad2/seal';sd.mkdir(parents=True)
        (sd/'AD2_SIGNED_BUNDLE.json').write_text(json.dumps(bundle,sort_keys=True,indent=2)+'\n')
        env=dict(os.environ,PYTHONPATH=f"{td/'shim'}:{c1pin}:{copy/'experiments/pf1'}",
          PYTHONDONTWRITEBYTECODE='1',DRIFT_C1_ENABLE_LIVE='false')
        subprocess.run([sys.executable,'-c',"import sitecustomize,drift1a_c1.beacon as b;b.Sealer().seal(%r,%r)"%(str(sd),h('experiments/pf2/operational_ad2/seal/AD2_SIGNED_BUNDLE.json'))],env=env,check=True)
        subprocess.run(['git','init','-q'],cwd=copy,check=True)  # O1 shell is git-free; blocks run as python
        for i,b in enumerate(blocks(AD2)):
            if 'PF2_APPROVED_ACTUAL_R0' in b or 'PF2_GENUINE_ONE_RFC3161' in b:
                run([sys.executable,'-c',b],copy,env)
        env.update(PF2_GENESIS_OPERATOR_APPROVED='true',PF2_LIVE_ADMISSION_OPERATOR_AUTHORISED='true',
          PF2_REMOTE_SHARED_LEASE_ACKNOWLEDGED='true',PF2_OPERATIONAL_AD1_SEAL_VERIFIED='true',
          PF2_MAX_LIVE_TICKS='20',PF2_LIVE_INBOX=str(td/'inbox.json'),PF2_PENDING_BATCH=str(td/'pending.json'))
        for start in (0,20):
            inbox(td/'inbox.json',g,start)
            run(['npx','tsx','experiments/pf2/PF2_LIVE_RUN.mjs'],copy,env)
            run([sys.executable,'experiments/pf2/PF2_CANONICAL_CHAIN_AD1.py'],copy,env)
            run([sys.executable,'experiments/pf2/PF2_LIVE_SEAL.py'],copy,env)
            run([sys.executable,'experiments/pf2/PF2_LIVE_CHECK.py'],copy,env)
        run(['npx','tsx','experiments/pf2/PF2_REPLAY.mjs'],copy,env)
        s=json.loads((copy/'experiments/pf2/live/STATE.json').read_text())
        assert s['admittedTicks']==40 and s['sealedBatchCount']==2
    real=json.loads((REPO/'experiments/pf2/live/STATE.json').read_text())
    assert real['admittedTicks']==0,'AD2_UNIT_MUST_NOT_TOUCH_REAL_STATE'
    print('PF2_AD2_OFFLINE_TWO_BATCH_PIPELINE_AND_REPLAY_PASS',json.dumps({'syntheticOnly':True,
      'standInSealer':True,'realStateUnchanged':True,'noNotifications':True}))
if __name__=='__main__':
    static()
    dynamic(sys.argv[1] if len(sys.argv)>1 else os.environ['PF2_C1_PIN'])
