#!/usr/bin/env python3
"""PF4 Gate 3: auditor of a *submitted* synthetic calibration package.

A successful structural check DOES NOT establish exchangeability or p exactness.
Never fetch or score prospective future target rounds; no network access.
For submitted files only: --package /path/to/calibration.json --out /tmp/pf4-g3
Use --self-test to test schema invariants without real calibration values.
"""
import argparse
import copy
import hashlib
import json
import math
from pathlib import Path
from statistics import median

SCHEMA="PF4_G3_CALIBRATION_PACKAGE_V1"
C0_SHA="de0d86764a300abe5187b06a379be1beefed859942784d12cd6a672f81702925"
RANGE=range(400)
def exact_hash(s):
    return isinstance(s,str) and len(s)==64 and all(c in '0123456789abcdef' for c in s)
def score(x):
    return isinstance(x,(float,int)) and not isinstance(x,bool) and math.isfinite(x) and 0<=x<=2
def fail(msg):
    raise ValueError("PF4_G3_INVALID_PACKAGE:"+str(msg))
def validate(payload):
    if not isinstance(payload,dict) or payload.get("schema")!=SCHEMA:
        fail("UNKNOWN_SCHEMA")
    for forbidden in ("observedFutureScore","futureTarget","targetWindowResidual","liveFutureResidual","pValue"):
        if forbidden in payload:fail("PROSPECTIVE_TARGET_OR_INFERENCE_PRESENT_"+forbidden)
    if payload.get("candidateCodeSha256")!=C0_SHA:fail("CANDIDATE_CODE_SHA_CHANGED")
    if payload.get("referenceDomain")!="PF2-REF-i|":fail("REFERENCE_DOMAIN_WRONG")
    if payload.get("ticksPerWorld")!=20160:fail("WRONG_WORLD_TICKS")
    if payload.get("lineages")!=9:fail("LINEAGES_MUST_BE_ONE_WORLD_WITH_NINE_ARMS")
    source=payload.get("source",{})
    if source.get("type")!="synthetic_32byte_standin":fail("INVALID_SYNTHETIC_NULL_SOURCE")
    if not exact_hash(source.get("runnerSha256")) or not exact_hash(source.get("adapterSha256")):
        fail("RUNNER_OR_ADAPTER_SHA_MISSING")
    if not isinstance(source.get("generatorDescription"),str) or len(source["generatorDescription"])<15:
        fail("UNSPECIFIED_SYNTHETIC_GENERATOR")
    worlds=payload.get("worlds")
    if not isinstance(worlds,list) or len(worlds)!=400:
        fail("NEED_PRECISELY_400_SYNTHETIC_WORLDS")
    ids=set();tapes=set();r0=[];rshift=[];zero=[]
    for i,w in enumerate(worlds):
        if not isinstance(w,dict):fail("NON_OBJECT_WORLD_"+str(i))
        label=w.get("worldId")
        if not isinstance(label,str) or not label or label in ids:
            fail("DUPLICATE_OR_MISSING_WORLD_ID_"+str(i))
        ids.add(label)
        raw=w.get("tapeSha256")
        if not exact_hash(raw) or raw in tapes:
            fail("DUPLICATE_OR_MISSING_TAPE_HASH_"+str(i))
        tapes.add(raw)
        codes=w.get("residuals")
        if not isinstance(codes,dict) or set(codes)-{"Vstar","lineageShift","zeroCode"}:
            fail("UNKNOWN_CODES_OR_MISSING_RESIDUAL_MAP_"+str(i))
        if not all(k in codes for k in ("Vstar","lineageShift")):
            fail("MISSING_PAIRED_CODE_"+str(i))
        if not (score(codes["Vstar"]) and score(codes["lineageShift"])):
            fail("INVALID_PRIMARY_OR_CONTROL_RESIDUAL_"+str(i))
        r0.append(codes["Vstar"]);rshift.append(codes["lineageShift"])
        if "zeroCode" in codes:
            if not score(codes["zeroCode"]):fail("INVALID_ZERO_CODE_RESIDUAL_"+str(i))
            zero.append(codes["zeroCode"])
    if len(zero)!=100:fail("NEED_EXACTLY_100_ZERO_CODE_CHECKS")
    past=payload.get("pastPublishedQuicknet",[])
    if not isinstance(past,list):fail("HISTORICAL_WINDOWS_NOT_LIST")
    prefix=payload.get("publishedPrefixParity")
    if not isinstance(prefix,dict) or prefix.get("status")!="verified":
        fail("G2_PARITY_NOT_VERIFIED")
    if prefix.get("ticks",0)<1731:fail("G2_PREFIX_TOO_SHORT")
    if prefix.get("independentAdapterSha256")!=source["adapterSha256"]:
        fail("G2_G3_ADAPTER_CODE_IDENTITY_MISMATCH")
    historical=[];windows=[];hids=set()
    for i,w in enumerate(past):
        if w.get("ticks")!=20160 or w.get("stride")!=20:
            fail("HISTORICAL_WINDOW_NOT_FULL_EXACT_LIVE_MAPPING_"+str(i))
        if w.get("verifiedBLS") is not True or w.get("verifiedRFC3161") is not True:
            fail("PAST_WINDOW_PROVENANCE_NOT_VERIFIED_"+str(i))
        if w.get("chainHash")!=payload.get("chainHash"):
            fail("CHAIN_ID_MISMATCH_"+str(i))
        if not score(w.get("VstarRAll")):fail("PAST_WORLD_R_INVALID_"+str(i))
        start=w.get("firstRound")
        if not isinstance(start,int) or start<=0 or start in hids:
            fail("INVALID_HISTORICAL_START_ROUND_"+str(i))
        hids.add(start);windows.append((start,start+20*(20160-1)))
        historical.append(w["VstarRAll"])
    for (lo,hi),(lo2,hi2) in zip(sorted(windows),sorted(windows)[1:]):
        if lo2<=hi:fail("HISTORICAL_WINDOWS_OVERLAP")
    # Structural calibration audit only. Historical compatibility requires
    # a separately preregistered comparison, equivalence margin and N.
    r0s=sorted(r0)
    counts=sum(a<b for a,b in zip(r0,rshift))
    ties=sum(a==b for a,b in zip(r0,rshift))
    stats={
     "schema":"PF4_G3_STRUCTURAL_AUDIT_V1",
     "status":"NULL_PACKAGE_STRUCTURALLY_VALID" if not past else "NULL_PACKAGE_AND_PAST_WINDOWS_STRUCTURALLY_VALID",
     "wholeWorldNullCount":len(worlds),
     "controlLineageShiftCount":len(rshift),"zeroCodeChecks":len(zero),
     "historicalFullQuicknetWindows":len(past),
     "primaryRAllQuantiles":{
       "min":r0s[0],"q01NearestRank":r0s[3],"q05NearestRank":r0s[19],
       "median":median(r0),"q95NearestRank":r0s[379],"max":r0s[-1]
     },
     "specificityDiagnostic":{"VstarLowerThanLineageShift":counts,
       "ties":ties,"VstarHigher":400-counts-ties,
       "medianPairedShiftMinusVstar":median([b-a for a,b in zip(r0,rshift)])},
     "pastQuicknetDiagnostic":{
       "RAll":historical,
       "countsBelowSyntheticMedian":sum(v<median(r0) for v in historical)
     },
     "nullExchangeabilityDemonstrated":False,
     "physicalFutureBoundaryTestPerformed":False,
     "retrocausalitySupported":False,
     "notes":[
       "Drand unpredictability and SHA256 PRF do not alone prove exact exchangeability.",
       "Past-PF2 prefix of 1731 ticks is not one full 20160-tick reference window.",
       "Historical calibration equivalence margin and independent window count must be locked before inspection.",
       "Nine derived arms of each world are not nine null replicates.",
       "Do not use synthetic null data to calculate an observed p without an independently sealed future code and target."]
    }
    return stats

def test():
    digest=lambda s:hashlib.sha256(s.encode()).hexdigest()
    one=lambda n:{"worldId":f"syn_{n:03d}",
                  "tapeSha256":digest(f"unique-synthetic-world-{n}"),
                  "residuals":{"Vstar":(n+1)/800,"lineageShift":(n+2)/800,
                               **({"zeroCode":.6} if n<100 else {})}}
    fixture={"schema":SCHEMA,"candidateCodeSha256":C0_SHA,
     "referenceDomain":"PF2-REF-i|","ticksPerWorld":20160,"lineages":9,
     "chainHash":"52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971",
     "source":{"type":"synthetic_32byte_standin",
       "generatorDescription":"SELFTEST ONLY SHA256 labelled sample, no real tapes",
       "runnerSha256":digest("runner"),"adapterSha256":digest("adapter")},
     "publishedPrefixParity":{"status":"verified","ticks":1731,
       "independentAdapterSha256":digest("adapter")},
     "worlds":[one(n) for n in RANGE],"pastPublishedQuicknet":[]}
    s=validate(fixture)
    assert s["wholeWorldNullCount"]==400 and s["zeroCodeChecks"]==100
    assert s["nullExchangeabilityDemonstrated"] is False
    broken=copy.deepcopy(fixture)
    broken["worlds"][5]["tapeSha256"]=broken["worlds"][3]["tapeSha256"]
    try:validate(broken)
    except ValueError as e:assert "DUPLICATE" in str(e)
    else:raise AssertionError("Duplicate tape was not rejected")
    broken=copy.deepcopy(fixture);broken["observedFutureScore"]=.001
    try:validate(broken)
    except ValueError as e:assert "PROSPECTIVE" in str(e)
    else:raise AssertionError("Future result was not rejected")
    print("PF4_G3_PACKAGE_SCHEMA_AND_FAIL_CLOSED_UNIT_PASS")

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--self-test",action="store_true")
    p.add_argument("--package",type=Path)
    p.add_argument("--out",type=Path,default=Path("/tmp/pf4-g3-audit"))
    args=p.parse_args()
    if args.self_test:
        test();return
    if not args.package or not args.package.is_file():
        p.error("--package must point to submitted JSON; G3 results not currently available")
    j=json.loads(args.package.read_text())
    out=validate(j)
    path=args.out.resolve()
    if not(str(path).startswith("/tmp/") or str(path).startswith("/mnt/data/")):
        p.error("--out must be /tmp/... or /mnt/data/...")
    path.mkdir(parents=True,exist_ok=True)
    (path/"PF4_G3_NULL_STRUCTURAL_AUDIT.json").write_text(json.dumps(out,indent=2)+"\n")
    print("PF4_G3_NULL_STRUCTURE_AUDIT_PASS_NOT_EXCHANGEABILITY "+json.dumps(out))
if __name__=="__main__":main()
