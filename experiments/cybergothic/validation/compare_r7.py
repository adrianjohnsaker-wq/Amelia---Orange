"""Compare R7 populations regenerated from the sealed source against the archived population summaries."""
import json,gzip,glob,os,sys
S,OUT=sys.argv[1],sys.argv[2]
P={p['seed']:p for p in json.load(gzip.open(S))['populations']}
match=diff=elig=inel=0; diffs=[]
for f in sorted(glob.glob(os.path.join(OUT,'5*.json'))):
    if not os.path.getsize(f): continue
    r=json.loads(open(f).read()); s=r['seed']
    if not r['eligible']: inel+=1; 
    else:
        elig+=1; a=P.get(s)
        if a is None: diffs.append((s,'not in archive')); diff+=1; continue
        r2={k:v for k,v in r.items() if k not in ('lockdown',)}; a2={k:v for k,v in a.items() if k not in ('lockdown',)}
        bad=[k for k in set(r2)|set(a2) if r2.get(k)!=a2.get(k)]
        if bad: diff+=1; diffs.append((s,bad))
        else: match+=1
print(json.dumps({'eligible_regenerated':elig,'exact_match':match,'differ':diff,'ineligible':inel,'diffs':diffs[:10]}))
if len(sys.argv)>3:
    M=json.load(open(sys.argv[3])); sel=set(M['selected_seeds']); non=set(M['noneligible_seeds'])
    got_e=set();got_n=set()
    for f in glob.glob(os.path.join(OUT,'5*.json')):
        if os.path.getsize(f):
            r=json.loads(open(f).read()); (got_e if r['eligible'] else got_n).add(r['seed'])
    print(json.dumps({'manifest_selected':len(sel),'manifest_noneligible':len(non),
      'eligibility_agrees':got_e<=sel and got_n<=non,'checked':len(got_e|got_n),
      'wrong':sorted((got_e-sel)|(got_n-non))[:10]}))
