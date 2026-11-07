"""Require all verified calibration replays, then freeze paired offsets."""
import hashlib,json,subprocess,sys
from pathlib import Path
if len(sys.argv)!=5:raise SystemExit('Usage: aggregate-cal.py REGISTRATION AUDITOR INPUT OUTPUT')
pp,audit,root,out=map(Path,sys.argv[1:]);pb=pp.read_bytes();p=json.loads(pb);H=lambda x:hashlib.sha256(x).hexdigest();support=audit.parent.parent/'dynamic/audit-support.py'
for k,f in [('calAuditSha256',audit),('calAggregateSha256',Path(__file__)),('auditSupportSha256',support)]:assert H(f.read_bytes())==p[k]
out.mkdir(parents=True,exist_ok=True);got={};bad=[]
for f in sorted(root.rglob('calibration.json')):
 try:
  b=f.read_bytes();d=json.loads(b);lid=d['lineage'];assert lid not in got
  re=json.loads((f.parent/'replay-audit.json').read_text());assert re['status']=='VERIFIED' and re['originalSha256']==H(b) and re['registrationSha256']==H(pb) and re['replayScriptSha256']==p['replaySha256']
  q=subprocess.run([sys.executable,str(audit),str(pp),str(f),str(support)],capture_output=True,text=True)
  if q.returncode:raise ValueError(q.stderr[-700:])
  got[lid]=(d,b,re)
 except Exception as ex:bad.append({'path':str(f),'error':str(ex)})
missing=sorted(set(p['lineages'])-set(got));status='FROZEN' if not missing and not bad and set(got)==set(p['lineages']) else 'INCOMPLETE'
result={'schema':'amelia.warp-gate-causal-choice/v1','status':status,'registrationSha256':H(pb),'missing':missing,'problems':bad,'lineages':{}}
for i,lid in enumerate(p['lineages']):
 if lid in got:
  d,b,re=got[lid];(out/f'calibration-{i+1:02}.json').write_bytes(b);(out/f'replay-audit-{i+1:02}.json').write_text(json.dumps(re,indent=2)+'\n');result['lineages'][lid]={'chosen':d['chosen'],'counts':d['counts'],'shardSha256':H(b)}
(out/'choice.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'status':status,'missing':missing,'problems':bad,'choice':{k:v['chosen'] for k,v in result['lineages'].items()}}))
if status!='FROZEN':raise SystemExit(1)
