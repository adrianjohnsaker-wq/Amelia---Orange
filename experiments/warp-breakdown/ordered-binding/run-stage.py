"""Run each historical origin twice and audit inputs, paths and binding probes."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import hashlib,json,os,shutil,subprocess,sys
if len(sys.argv)!=5:raise SystemExit('run-stage.py CHECKPOINT REG RUN OUTPUT_DIR')
checkpoint,reg,run,base=(Path(x).resolve() for x in sys.argv[1:]);P=Path(__file__).resolve().parent;support=P.parent/'dynamic/audit-support.py';compare=P.parent/'dynamic/compare-replay.py';project=Path.cwd();p=json.loads(reg.read_text());r=json.loads(run.read_text());H=lambda x:hashlib.sha256(x.read_bytes()).hexdigest();assert H(checkpoint)==p['checkpointSha256'] and H(reg)==r['registrationSha256']
for f,h in p['scripts'].items():assert H(P/f)==h,f
paths={'audit-support.py':support,'compare-replay.py':compare,'common.ts':P.parent/'dynamic/common.ts','prepare.mjs':P.parent/'dynamic/prepare.mjs','adapter.mjs':P.parent/'oracle-rerun/adapter.mjs','quota.mjs':P.parent/'access/quota.mjs','fullgraph-controller.mjs':P.parent/'fullgraph/controller.mjs'}
for f,h in p['support'].items():assert H(paths[f])==h,f
for f,h in p['oracleFiles'].items():assert H(project/'oracle_wbd4_source'/f)==h,f
base.mkdir(parents=True,exist_ok=False)
def cmd(args,env=None):
 q=subprocess.run(args,env=env,capture_output=True,text=True)
 if q.returncode:raise RuntimeError({'args':args,'stdout':q.stdout,'stderr':q.stderr})
 return q.stdout
def one(i):
 lid=p['lineages'][i];d=base/lid;d.mkdir();env=dict(os.environ,WARP_ORDER_ORIGIN=str(i))
 for tag in ('original','replay'):cmd(['node',str(P/'dataset.ts'),str(checkpoint),str(reg),str(run),str(d/tag)],env)
 shutil.copy2(d/'original/result.json',d/'result.json');cmd(['python3',str(compare),str(reg),str(d/'result.json'),str(d/'replay/result.json'),str(d/'replay-proof.json')]);cmd(['python3',str(P/'audit.py'),str(reg),str(run),str(d/'result.json'),str(support),str(d/'audit.json')]);print(lid,'replayed and audited',flush=True)
with ThreadPoolExecutor(max_workers=4) as x:list(x.map(one,range(len(p['lineages']))))
print(json.dumps({'status':'ALL_ORIGINS_VERIFIED','phase':r['phase']}),flush=True)
