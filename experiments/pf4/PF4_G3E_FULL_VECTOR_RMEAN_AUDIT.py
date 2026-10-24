#!/usr/bin/env python3
"""PF4 G3E: independent R_mean audit of prospective *calibration* exports.

Only accepts already-produced synthetic calibration. Does not run the receiver,
retrieve any physical beacon, authorise source exposure, or seal an analysis.
Schema is a handoff INTERFACE, not evidence the external package matches it.

Required JSON:
 {"schema":"PF4_G3E_FULL_VECTOR_EXPORT_V1",
  "sourceRule":"SHA256(UTF8('PF4-NULL|seed|t'))",
  "futureTargetRead":false,
  "runs":[
    {"code":"vstar"|"vstar_shift1"|"zero", "seed":1000,
     "finalVFull":[{11 edge:value, ...} x9],
     "R_all":number, "R_mean":number,
     "deaths":integer, "zone4Visits":integer,
     "perEdgeMaxima":{"0>9":number, ... 11 keys}
     }
  ]}
Also accepts optional initialVFull, verifies EXACT numeric equality to known
code, and optional CSV export with same code/seed/R_all/R_mean.
Nothing is inferred from an absent field; fail closed.
"""
import argparse,csv,hashlib,json,math,statistics
from pathlib import Path
FULL=("0>9","1>8","2>7","3>6","4>5","1>2","2>4","4>7","7>8","8>9","9>1")
ACTIVE=tuple(e for e in FULL if e!="3>6")
EXPECTED_COUNTS={"vstar":400,"vstar_shift1":400,"zero":100}
SPOTS={"vstar":(.09772266196640947,3,391),
       "vstar_shift1":(.13581857356356242,6,408),
       "zero":(.487091064453125,31,215)}
C0_SHA="de0d86764a300abe5187b06a379be1beefed859942784d12cd6a672f81702925"
RULE="SHA256(UTF8('PF4-NULL|seed|t'))"
TOL=1.e-12

def require(v,msg):
    if not v:raise ValueError("PF4_G3E_FAIL_CLOSED "+msg)
def numeric(x,msg):
    require(type(x) in (int,float) and math.isfinite(x),msg+" NOT_FINITE_NUMERIC")
    return float(x)
def code_state(x):
    require(type(x)==list and len(x)==9,"CODE_MUST_HAVE_9_LINEAGES")
    for k,a in enumerate(x):
        require(type(a)==dict and set(a)==set(FULL),"CODE_BAD_EDGES_"+str(k))
        for e in FULL:numeric(a[e],"CODE_"+str(k)+"_"+e)
    return x
def base_states(raw):
    require(hashlib.sha256(raw).hexdigest()==C0_SHA,"VSTAR_SHA_MISMATCH")
    vstar=code_state(json.loads(raw))
    return {
      "vstar":[dict(x) for x in vstar],
      "vstar_shift1":[dict(vstar[(k+1)%9]) for k in range(9)],
      "zero":[{e:0. for e in FULL} for _ in range(9)]
    }
def measurements(start,end):
    diffs={(k,e):abs(end[k][e]-start[k][e])
           for k in range(9) for e in FULL}
    return {
      "R_all":max(diffs.values()),
      "R_mean":sum(diffs[k,e] for k in range(9) for e in ACTIVE)/90,
      "perEdgeMaxima":{e:max(diffs[k,e] for k in range(9)) for e in FULL},
      "perLineageMean":[sum(diffs[k,e] for e in ACTIVE)/10 for k in range(9)]}
def near(x,y):
    return abs(numeric(x,"REPORTED"),numeric(y,"EXPECTED")) if False else abs(float(x)-float(y))<=TOL
def quantile(v,p):
    xs=sorted(v);q=(len(xs)-1)*p;a=int(q);b=min(a+1,len(xs)-1)
    return xs[a]+(xs[b]-xs[a])*(q-a)
def csv_audit(path,runs):
    with path.open(newline="",encoding="utf8") as f:
        rows=list(csv.DictReader(f))
    require(len(rows)==900,"CSV_NOT_900_ROWS")
    keys=set(rows[0])
    mandatory={"code","seed","R_all","R_mean","deaths","zone4Visits"}
    require(keys>=mandatory,"CSV_MISSING_COLUMNS "+str(sorted(mandatory-keys)))
    seen=set()
    for row in rows:
        k=(row["code"],int(row["seed"]))
        require(k in runs,"CSV_UNKNOWN_CODE_SEED_"+str(k))
        require(k not in seen,"CSV_DUPLICATE_"+str(k));seen.add(k)
        ref=runs[k]
        for field in ("R_all","R_mean"):
            require(near(float(row[field]),ref[field]),"CSV_"+field+"_MISMATCH_"+str(k))
        for field in ("deaths","zone4Visits"):
            require(int(row[field])==ref[field],"CSV_"+field+"_MISMATCH_"+str(k))
        # Edge columns are accepted in either literal "0>9" or "max_0>9"
        for e in FULL:
            cand=[col for col in (e,"max_"+e,"edgeMax_"+e) if col in keys]
            require(len(cand)<=1,"CSV_DUPLICATE_EDGE_COLUMN_"+e)
            if cand:
                require(near(float(row[cand[0]]),ref["perEdgeMaxima"][e]),
                        "CSV_EDGE_MAX_DIFFER_"+e+"_"+str(k))
    require(len(seen)==900,"CSV_OMITTED_ROWS")
    return {"sha256":hashlib.sha256(path.read_bytes()).hexdigest(),"rows":len(rows)}
def audit(data,vstar_bytes,csv_path=None,require_spots=True):
    require(data.get("schema")=="PF4_G3E_FULL_VECTOR_EXPORT_V1","WRONG_SCHEMA")
    require(data.get("sourceRule")==RULE,"WRONG_INPUT_DOMAIN")
    require(data.get("futureTargetRead") is False,"FUTURE_TARGET_USED")
    states=base_states(vstar_bytes)
    rows=data.get("runs")
    require(type(rows)==list and len(rows)==900,"NOT_900_ROWS")
    scored={}
    for r in rows:
        require(type(r)==dict,"BAD_RUN")
        kind=r.get("code");seed=r.get("seed")
        require(kind in EXPECTED_COUNTS,"BAD_CODE")
        require(type(seed)==int and seed>=0,"BAD_SEED")
        key=(kind,seed)
        require(key not in scored,"DUPLICATE_CODE_SEED")
        start=states[kind]
        if "initialVFull" in r:
            code_state(r["initialVFull"])
            require(all(r["initialVFull"][k][e]==start[k][e]
                        for k in range(9) for e in FULL),"BAD_REPORTED_INITIAL_CODE")
        end=code_state(r.get("finalVFull"))
        m=measurements(start,end)
        require(near(r.get("R_all"),m["R_all"]),"R_ALL_DIFFERS_"+str(key))
        require(near(r.get("R_mean"),m["R_mean"]),"R_MEAN_DIFFERS_"+str(key))
        if "perEdgeMaxima" in r:
            d=r["perEdgeMaxima"]
            require(type(d)==dict and set(d)==set(FULL),"BAD_EDGE_MAXIMA")
            for e in FULL:
                require(near(d[e],m["perEdgeMaxima"][e]),
                        "EDGE_MAX_DIFFERS_"+str(key)+"_"+e)
        deaths=r.get("deaths");visits=r.get("zone4Visits")
        require(type(deaths)==int and deaths>=0,"INVALID_DEATHS")
        require(type(visits)==int and 0<=visits<=9*20160,"INVALID_VISITS")
        scored[key]={**m,"deaths":deaths,"zone4Visits":visits}
    for kind,n in EXPECTED_COUNTS.items():
        seeds={seed for code,seed in scored if code==kind}
        require(len(seeds)==n,"WRONG_CODE_WORLD_COUNT_"+kind)
    s0={seed for code,seed in scored if code=="vstar"}
    s1={seed for code,seed in scored if code=="vstar_shift1"}
    sz={seed for code,seed in scored if code=="zero"}
    require(s0==s1,"VSTAR_SHIFT_NOT_PAIRED")
    require(sz==set(sorted(s0)[:100]),"BLANK_SUBSET_NOT_FIRST_100_SEEDS")
    if require_spots:
        require(1000 in sz,"MISSING_SPOT_SEED1000")
        for kind,(res,death,z4) in SPOTS.items():
            x=scored[kind,1000]
            require(near(x["R_all"],res) and x["deaths"]==death and x["zone4Visits"]==z4,
                    "INDEPENDENT_SPOT_MISMATCH_"+kind)
    pairs=[(seed,scored["vstar_shift1",seed]["R_mean"]-scored["vstar",seed]["R_mean"])
           for seed in sorted(s0)]
    effects=[effect for _,effect in pairs]
    family={
      "total":len(effects),
      "meanPairedAdvantage":statistics.mean(effects),
      "sdPairedAdvantage":statistics.stdev(effects),
      "fractionPositive":sum(x>0 for x in effects)/400,
      "fractionNegative":sum(x<0 for x in effects)/400,
      "ties":sum(x==0 for x in effects),
      "percentiles":{str(q):quantile(effects,q/100) for q in (1,5,10,50,90,95,99)}
    }
    desc={}
    for kind in EXPECTED_COUNTS:
        arr=[scored[kind,seed]["R_mean"] for seed in sorted(s0 if kind!="zero" else sz)]
        desc[kind]={"n":len(arr),"mean":statistics.mean(arr),
                    "median":statistics.median(arr),
                    "p01":quantile(arr,.01),"p99":quantile(arr,.99),
                    "min":min(arr),"max":max(arr)}
    result={
      "schema":"PF4_G3E_CALIBRATION_FULL_VECTOR_INTEGRITY_V1",
      "status":"OFFLINE_CALIBRATION_INTEGRITY_PASS_NOT_FUTURE_BOUNDARY_SEALED",
      "n":len(scored),"nineLineages":True,"activeEdges":list(ACTIVE),
      "perRunTotalVComponents":99,"meanResidualComponents":90,
      "pairedRmean":family,
      "RmeanByCode":desc,
      "csvCheck":csv_audit(csv_path,scored) if csv_path else None,
      "provenance":{
        "sourceSHA256":hashlib.sha256(json.dumps(data,sort_keys=True).encode()).hexdigest(),
        "originalVstarSHA256":C0_SHA,
        "independentFullSimulationReproduced":False,
        "physicalQuicknetWorldCompatibilityEstablished":False,
        "exchangeabilityProved":False,
        "independentRFC3161Seal":False},
      "interpretation":"QA compares vectors with reported measures and reports descriptive null only; final four-window statistic remains unregistered."
    }
    return result
def fake():
    s={e:0. for e in FULL}
    rows=[]
    for kind,n in EXPECTED_COUNTS.items():
        for idx in range(n):
            seed=1000+idx
            x=[dict(s) for _ in range(9)]
            # Synthetic fixture without realistic dynamics.
            x[0]["1>8"]=.1+(idx%200)/10000
            # Define values from a zero-code mock Vstar to test shape,
            # not as proof of genuine code updates.
            rows.append({"code":kind,"seed":seed,"finalVFull":x,
                         "deaths":0,"zone4Visits":0})
    return rows
def selftest(vstar_bytes):
    states=base_states(vstar_bytes)
    data={"schema":"PF4_G3E_FULL_VECTOR_EXPORT_V1","sourceRule":RULE,
          "futureTargetRead":False,"runs":[]}
    for kind,n in EXPECTED_COUNTS.items():
        for idx in range(n):
            start=states[kind]
            end=[dict(v) for v in start]
            end[0]["1>8"]+=.01+idx/1000000
            m=measurements(start,end)
            data["runs"].append({"code":kind,"seed":1000+idx,
                                "finalVFull":end,"R_all":m["R_all"],
                                "R_mean":m["R_mean"],"deaths":0,
                                "zone4Visits":0,"perEdgeMaxima":m["perEdgeMaxima"]})
    r=audit(data,vstar_bytes,require_spots=False)
    require(r["n"]==900,"MOCK_BASE_FAIL")
    def corrupted(f):
        x=json.loads(json.dumps(data))
        f(x)
        try:audit(x,vstar_bytes,require_spots=False)
        except(ValueError,TypeError):return
        raise AssertionError("FAIL_NOT_DETECTED")
    corrupted(lambda x:x["runs"][0].update(R_mean=.5))
    corrupted(lambda x:x["runs"].pop())
    corrupted(lambda x:x["runs"][0]["finalVFull"][0].update({"1>8":float("nan")}))
    corrupted(lambda x:x["runs"][2].update(seed=1000))
    corrupted(lambda x:x.update(futureTargetRead=True))
    corrupted(lambda x:x["runs"][4]["perEdgeMaxima"].update({"4>5":0.99}))
    print("PF4_G3E_FULL_VECTOR_RMEAN_QA_MOCK_AND_CORRUPTION_TESTS_PASS")
def main():
    p=argparse.ArgumentParser()
    p.add_argument("--self-test",action="store_true")
    p.add_argument("--json")
    p.add_argument("--csv")
    p.add_argument("--out")
    x=p.parse_args()
    vstar=Path("experiments/studio/outputs/loop/Vstar.json").read_bytes()
    if x.self_test:selftest(vstar);return
    if not x.json or not x.out:p.error("Actual --json export and --out path required")
    o=Path(x.out).resolve()
    require(str(o).startswith("/tmp/") or str(o).startswith("/mnt/data/"),"BAD_OUTPUT_DESTINATION")
    require(not o.exists(),"OUTPUT_EXISTS")
    result=audit(json.loads(Path(x.json).read_text()),vstar,Path(x.csv) if x.csv else None)
    o.parent.mkdir(parents=True,exist_ok=True)
    o.write_text(json.dumps(result,indent=2)+"\n")
    print("PF4_G3E_900_WORLD_FULL_VECTOR_RMEAN_QA_PASS_NOT_PROSPECTIVE",json.dumps(result["pairedRmean"]))
if __name__=="__main__":main()
