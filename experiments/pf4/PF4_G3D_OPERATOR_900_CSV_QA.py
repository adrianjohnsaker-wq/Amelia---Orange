#!/usr/bin/env python3
"""PF4 G3d / check operator's CSV of 900 synthetic null world runs.

Read-only and completely offline, does not access physical or future beacon.
Checks the three previously published seed-1000 results and 400/400/100
coverage before reporting descriptive calibration. Does not imply exact
exchangeability or repair missing provenance after the fact.
"""
import argparse,csv,hashlib,json,math,re,statistics
from pathlib import Path
EXPECTED={
"vstar":(.09772266196640947,3,391),
"vstar_shift1":(.13581857356356242,6,408),
"zero":(.487091064453125,31,215)}
COLS={
"code":("code","arm","condition"),
"seed":("seed","world_seed","worldSeed"),
"R_all":("R_all","r_all","Rall"),
"R_active":("R_active","r_active","Ractive"),
"deaths":("deaths","death_count","deathCount"),
"zone4Visits":("zone4Visits","zone4_visits","z4_visits","visits_zone4")}
N={"vstar":400,"vstar_shift1":400,"zero":100}
def fail(s):raise ValueError("PF4_G3D_CSV_FAIL: "+s)
def resolve(names,k):
    matches=[x for x in COLS[k] if x in names]
    if len(matches)!=1:fail("Missing or ambiguous column "+k+":"+",".join(names))
    return matches[0]
def read(path):
    raw=path.read_bytes()
    if b'\x00' in raw:fail("NUL in CSV")
    try:text=raw.decode('utf-8-sig')
    except UnicodeDecodeError:fail("CSV not UTF8")
    lines=text.splitlines()
    if len(lines)<2:fail("empty CSV")
    rows=list(csv.DictReader(lines))
    if len(rows)!=900:fail("Expected exactly 900 rows, got "+str(len(rows)))
    names=list(rows[0])
    m={k:resolve(names,k) for k in COLS}
    allowed=set(N)
    data={c:{} for c in allowed}
    for i,r in enumerate(rows):
        code=r[m['code']]
        if code not in allowed:fail("Unexpected code label "+str(code))
        try:
            seed=int(r[m['seed']])
            R=float(r[m['R_all']]);A=float(r[m['R_active']])
            d=int(r[m['deaths']]);z=int(r[m['zone4Visits']])
        except (ValueError,TypeError):fail("Non-numeric score in row "+str(i+2))
        if str(seed)!=r[m['seed']].strip():fail("Noncanonical seed string")
        if seed in data[code]:fail("Duplicate code+seed "+code+str(seed))
        if any(not math.isfinite(x) or x<0 for x in (R,A)) or not(0<=A<=R+1e-12):
            fail("invalid residual values in row "+str(i+2))
        if d<0 or z<0 or z>9*20160:fail("invalid deaths/zone visits")
        data[code][seed]=(R,A,d,z)
    for code,n in N.items():
        if len(data[code])!=n:fail("Wrong count for "+code)
    ks=set(data["vstar"])
    if set(data["vstar_shift1"])!=ks:fail("vstar and shift seeds not paired")
    if set(data["zero"])!=set(sorted(ks)[:100]):
        fail("Zero-code worlds must be the 100 lowest sorted seeds, unless predeclared otherwise")
    if 1000 not in set(data["zero"]):fail("spot seed 1000 missing")
    for code,vals in EXPECTED.items():
        got=data[code][1000]
        if not (got[0]==vals[0] and got[2]==vals[1] and got[3]==vals[2]):
            fail("Expected seed 1000 "+code+" spot differs: "+repr(got))
    return raw,names,data
def percentile(xs,p):
    s=sorted(xs);index=(len(s)-1)*p/100
    low=int(index);high=min(low+1,len(s)-1)
    return s[low]+(s[high]-s[low])*(index-low)
def summarize(data):
    pair=[(seed, data["vstar_shift1"][seed][0]-data["vstar"][seed][0])
          for seed in sorted(data["vstar"])]
    return {"perCode":{
        k:{"N":len(v),"R_all":{"min":min(x[0] for x in v.values()),
            "p01":percentile([x[0] for x in v.values()],1),
            "p05":percentile([x[0] for x in v.values()],5),
            "median":statistics.median(x[0] for x in v.values()),
            "p95":percentile([x[0] for x in v.values()],95),
            "max":max(x[0] for x in v.values())},
            "deaths":{"median":statistics.median(x[2] for x in v.values())}}
            for k,v in data.items()},
        "paired":{"shiftMinusVstarMin":min(v for _,v in pair),
            "shiftMinusVstarMedian":statistics.median(v for _,v in pair),
            "shiftMinusVstarMax":max(v for _,v in pair),
            "shiftRGreaterThanVstar":sum(v>0 for _,v in pair),
            "exactTies":sum(v==0 for _,v in pair),
            "shiftRLessThanVstar":sum(v<0 for _,v in pair),
            "maxResidualAloneCanDiscriminateCodeIdentity":False,
            "note":"Descriptive; no sample-selection significance and no future specificity"}}
def mock():
    names=["code","seed","R_all","R_active","deaths","zone4Visits"]
    rows=[]
    for k,c in enumerate(("vstar","vstar_shift1","zero")):
        seeds=list(range(1000,1400 if c!="zero" else 1100))
        for seed in seeds:
            r=(.1+.0001*(seed-1000)+.03*k, .05, 3, 300+k)
            if seed==1000 and c in EXPECTED:
                y=EXPECTED[c]
                r=(y[0],.05,y[1],y[2])
            rows.append({a:v for a,v in zip(names,[c,seed,*r])})
    return names,rows
def selftest():
    names,rows=mock()
    import tempfile
    with tempfile.TemporaryDirectory() as d:
        f=Path(d)/"test.csv"
        def write():
            with f.open("w") as fp:
                w=csv.DictWriter(fp,fieldnames=names);w.writeheader();w.writerows(rows)
        write()
        _,_,data=read(f)
        assert len(data['vstar'])==400 and len(data['zero'])==100
        bad=rows.pop()
        write()
        try:read(f)
        except ValueError:pass
        else:raise AssertionError("Truncated CSV erroneously accepted")
        rows.append(bad)
        rows[0]['R_all']='nan';write()
        try:read(f)
        except ValueError:pass
        else:raise AssertionError("NaN erroneously accepted")
    print("PF4_G3D_CSV_900_ROW_SCHEMA_AND_CORRUPTION_MOCK_TESTS_PASS")
def main():
    p=argparse.ArgumentParser()
    p.add_argument('--self-test',action='store_true')
    p.add_argument('--csv')
    p.add_argument('--out')
    args=p.parse_args()
    if args.self_test:selftest();return
    if not args.csv or not args.out:p.error("Need --csv actual null_residuals.csv and --out /tmp/... summary")
    source=Path(args.csv)
    raw,names,data=read(source)
    summary={
      "schema":"PF4_G3D_OPERATOR_900_CSV_QA_V1",
      "status":"CSV_CONTENT_QA_ONLY_NOT_PHYSICAL_EXCHANGEABILITY",
      "sourceFileSHA256":hashlib.sha256(raw).hexdigest(),
      "nRows":900,
      "header":names,
      "sourceReexecutionCertified":False,
      "generatorSHA256Certified":False,
      "realSourceCompatibilityCertified":False,
      "futureBeaconRead":False,
      **summarize(data)}
    out=Path(args.out).resolve()
    if not(str(out).startswith('/tmp/') or str(out).startswith('/mnt/data/')):p.error("out not in scratch")
    if out.exists():p.error("cannot overwrite preexisting output")
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(summary,indent=2)+"\n")
    print("PF4_G3D_OPERATOR_CSV_900_QA_PASS_NOT_EXCHANGEABILITY "+json.dumps({
      "sha256":summary['sourceFileSHA256'],
      "paired":summary['paired'],
      "codes":{k:v['R_all']['median'] for k,v in summary['perCode'].items()}}))
if __name__=="__main__":main()
