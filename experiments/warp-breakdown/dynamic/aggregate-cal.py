"""Audit all calibration shards and freeze the route choice per lineage and gain."""
import hashlib,json,subprocess,sys
from pathlib import Path
if len(sys.argv)!=5:raise SystemExit('Usage: aggregate-cal.py REGISTRATION AUDITOR INPUT OUTPUT')
pp,audit,root,out=map(Path,sys.argv[1:]);pb=pp.read_bytes();p=json.loads(pb);H=lambda x:hashlib.sha256(x).hexdigest();here=audit.parent
for k,f in [('calAuditSha256',audit),('calAggregateSha256',Path(__file__)),('auditSupportSha256',here/'audit-support.py')]:assert H(f.read_bytes())==p[k]
out.mkdir(parents=True,exist_ok=True);got={};bad=[]
for f in sorted(root.rglob('calibration.json')):
 try:
  data=f.read_bytes();d=json.loads(data);lid=d['lineage'];assert lid not in got
  replay=json.loads((f.parent/'replay-audit.json').read_text());assert replay['status']=='VERIFIED' and replay['originalSha256']==H(data) and replay['registrationSha256']==H(pb) and replay['replayScriptSha256']==p['replaySha256']
  q=subprocess.run([sys.executable,str(audit),str(pp),str(f),str(here/'audit-support.py')],capture_output=True,text=True)
  if q.returncode:raise ValueError(q.stderr[-600:])
  got[lid]=(d,data,replay)
 except Exception as e:bad.append({'path':str(f),'error':str(e)})
missing=sorted(set(p['lineages'])-set(got));outcome={'schema':'amelia.warp-dynamic-selection/v1','registrationSha256':H(pb),'status':'INCOMPLETE' if missing or bad else 'FROZEN','missing':missing,'problems':bad,'lineages':{}}
for i,lid in enumerate(p['lineages']):
 if lid in got:
  d,b,r=got[lid];(out/f'calibration-{i+1:02}.json').write_bytes(b);(out/f'replay-audit-{i+1:02}.json').write_text(json.dumps(r,indent=2)+'\n')
  outcome['lineages'][lid]={'selected':d['selected'],'counts':d['counts'],'shardSha256':H(b)}
(out/'selection.json').write_text(json.dumps(outcome,indent=2)+'\n');print(json.dumps({'status':outcome['status'],'missing':missing,'problems':bad,'selection':{k:v['selected'] for k,v in outcome['lineages'].items()}}))
if outcome['status']!='FROZEN':raise SystemExit(1)
