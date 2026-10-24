#!/usr/bin/env python3
"""PF4 G3b: fail-closed validator for an OPERATOR-SUPPLIED 400-world null
calibration package. Never invent missing results, p-values or target windows.
Can validate a mock fixture with --self-test. Does not read future beacons.
"""
import argparse
from collections import Counter
import hashlib
import json
import math
from pathlib import Path
import statistics
import tempfile

EXPECTED_CODE="de0d86764a300abe5187b06a379be1beefed859942784d12cd6a672f81702925"
EXPECTED_TICKS=20160
N_WORLDS=400
N_BLANK=100
def digest(x):return isinstance(x,str) and len(x)==64 and all(c in "0123456789abcdef" for c in x)
def fail(msg):raise ValueError("PF4_G3B_FAIL_CLOSED: "+msg)
def score(x,key):
    if not isinstance(x,dict) or not isinstance(x.get(key),(int,float)):
        fail("missing numeric "+key)
    value=x[key]
    if isinstance(value,bool) or not math.isfinite(value) or value<0:fail("invalid "+key)
    return float(value)
def pct(v,p):
    v=sorted(v)
    idx=(len(v)-1)*p/100
    lo=int(idx);hi=min(lo+1,len(v)-1)
    return v[lo]+(v[hi]-v[lo])*(idx-lo)
def audit(pack):
    if pack.get("schema")!="PF4_G3_OPERATOR_NULL_PACKAGE_V1":
        fail("unrecognised top-level schema")
    if pack.get("targetBeaconSampleUsed") is not False:fail("future target exposure not explicitly FALSE")
    if pack.get("usesExactPF2InputDomain") is not True:fail("live adapter mapping not attested")
    if pack.get("codeSHA256")!=EXPECTED_CODE:fail("wrong Vstar candidate checksum")
    for required in ("adapterSHA256","generatorSHA256","generatorSpecSHA256"):
        if not digest(pack.get(required)):fail("missing provenance digest "+required)
    rows=pack.get("worlds")
    if not isinstance(rows,list) or len(rows)!=N_WORLDS:
        fail("require exactly 400 independent whole-world records")
    ids=set();tapeDigests=set();sourceTags=set()
    vstar=[];shift=[];blank=[];blankIds=[]
    for i,r in enumerate(rows):
        if not isinstance(r,dict):fail("malformed world "+str(i))
        wid=r.get("worldId")
        if type(wid) is not int or not (0<=wid<N_WORLDS) or wid in ids:
            fail("duplicate/missing or out-of-range worldId")
        ids.add(wid)
        if r.get("ticks")!=EXPECTED_TICKS or r.get("lineages")!=9:
            fail("each world must have 20160 ticks and nine lineages")
        td=r.get("inputTapeSHA256")
        if not digest(td) or td in tapeDigests:fail("missing or duplicated raw input tape digest")
        tapeDigests.add(td)
        if r.get("source")!="SYNTHETIC_SHA256_BYTES":fail("unexpected source")
        sourceTags.add(r.get("source"))
        arms=r.get("arms")
        if not isinstance(arms,dict) or not {"VSTAR","SHIFT"}.issubset(arms):fail("missing paired arms")
        a=arms["VSTAR"];b=arms["SHIFT"]
        if a.get("codeSHA256")!=EXPECTED_CODE:fail("wrong Vstar score code")
        if not digest(b.get("codeSHA256")):fail("missing shifted code sha")
        if a.get("codeSHA256")==b.get("codeSHA256"):fail("shifted code equals original")
        vstar.append(score(a,"R_all"))
        shift.append(score(b,"R_all"))
        if "ZERO" in arms:
            blankIds.append(wid);blank.append(score(arms["ZERO"],"R_all"))
    if ids!=set(range(N_WORLDS)):fail("world IDs must be complete and sequential")
    if len(blank)!=N_BLANK:fail("exactly 100 blank-code scores required")
    if pack.get("blankWorldSelection")!="WORLD_ID_0_TO_99":
        fail("predeclared blank-code world selection required")
    if blankIds!=list(range(N_BLANK)):fail("blank-code missing/out of declared order")
    if len(set(round(x,16) for x in vstar))<8:
        fail("implausibly degenerate vstar calibration; investigate")
    # Observational code comparison, not a valid p-value or full exchangeability.
    pos=sum(x<y for x,y in zip(vstar,shift))
    ties=sum(x==y for x,y in zip(vstar,shift))
    return {
      "schema":"PF4_G3B_OPERATOR_CALIBRATION_QA_RESULT_V1",
      "status":"INTEGRITY_CHECK_PASS_EXCHANGEABILITY_UNDETERMINED",
      "nWorlds":N_WORLDS,"nBlankWorlds":N_BLANK,
      "candidateSHA256":EXPECTED_CODE,
      "source":"operator supplied synthetic calibration, not independently reproduced",
      "digestUniqueness":len(tapeDigests)==N_WORLDS,
      "gates":{"shape":True,"sourceMappingAttestation":True,
               "fullWorldCounts":True,"candidateFixed":True,
               "pairedControls":True,"rawGeneratorInspected":False,
               "historicalPhysicalCompatibility":False,
               "independentResidualRerun":False,
               "statisticalExchangeabilityEstablished":False,
               "prospectiveTimeSeal":False},
      "R_all_Vstar":{
        "min":min(vstar),"p01":pct(vstar,1),"p05":pct(vstar,5),
        "p10":pct(vstar,10),"median":statistics.median(vstar),
        "p90":pct(vstar,90),"max":max(vstar)},
      "R_all_shift":{
        "median":statistics.median(shift),"p01":pct(shift,1)},
      "R_all_blank":{
        "median":statistics.median(blank),"p01":pct(blank,1)},
      "pairedVstarVsShift":{
        "VstarLower":pos,"ties":ties,"ShiftLower":N_WORLDS-pos-ties,
        "interpretation":"EXPLORATORY_PAIRED_CODE_CONTRAST_NO_FUTURE_SAMPLE"},
      "limitations":[
        "This QA validates reported metrics and declared metadata, not 400 source tapes.",
        "World digests do not prove SHA256 generator/domain or nonselection.",
        "Verification requires the actual generator and raw tape/source hashes.",
        "No real future outcome or retrocausal inference.",
        "Archived 1731-prefix cue checks cannot certify full 14-day residual exchangeability."]}
def mock():
    # Synthetic *fixture* for validator unit tests. Does NOT represent Amelia outcomes.
    v=hashlib.sha256
    h=lambda s:v(s.encode()).hexdigest()
    return {
      "schema":"PF4_G3_OPERATOR_NULL_PACKAGE_V1",
      "targetBeaconSampleUsed":False,
      "usesExactPF2InputDomain":True,
      "codeSHA256":EXPECTED_CODE,
      "adapterSHA256":h("test adapter"),"generatorSHA256":h("test generator"),
      "generatorSpecSHA256":h("test specification"),
      "blankWorldSelection":"WORLD_ID_0_TO_99",
      "worlds":[{
        "worldId":i,"ticks":EXPECTED_TICKS,"lineages":9,
        "inputTapeSHA256":h("NOT_REAL_TAPE_"+str(i)),
        "source":"SYNTHETIC_SHA256_BYTES",
        "arms":{
          "VSTAR":{"codeSHA256":EXPECTED_CODE,"R_all":0.1+i*.001},
          "SHIFT":{"codeSHA256":h("shifted code"),"R_all":0.15+i*.001},
          **({"ZERO":{"codeSHA256":h("zero code"),"R_all":0.5+i*.001}} if i<100 else {})}
      } for i in range(N_WORLDS)]}
def selftest():
    m=mock()
    r=audit(m)
    assert r["nWorlds"]==400 and r["pairedVstarVsShift"]["VstarLower"]==400
    def bad(change):
        p=json.loads(json.dumps(m))
        change(p)
        try:audit(p)
        except ValueError:return
        raise AssertionError("QA failed to reject intentionally broken mock")
    bad(lambda x:x["worlds"].pop())
    bad(lambda x:x["worlds"][1].update(worldId=0))
    bad(lambda x:x["worlds"][1].update(inputTapeSHA256=x["worlds"][0]["inputTapeSHA256"]))
    bad(lambda x:x["worlds"][120].update(ticks=1000))
    bad(lambda x:x["worlds"][99]["arms"].pop("ZERO"))
    bad(lambda x:x.update(targetBeaconSampleUsed=True))
    bad(lambda x:x.update(codeSHA256="0"*64))
    bad(lambda x:x["worlds"][0]["arms"]["VSTAR"].update(R_all=float('nan')))
    print("PF4_G3B_PACKAGE_SHAPE_AND_NEGATIVE_TESTS_PASS - MOCK ONLY")
def main():
    p=argparse.ArgumentParser()
    p.add_argument("--self-test",action="store_true")
    p.add_argument("--input")
    p.add_argument("--output")
    a=p.parse_args()
    if a.self_test:
        selftest();return
    if not a.input or not a.output:p.error("Need --input operator package JSON and --output separate derived JSON")
    inp=Path(a.input).resolve();out=Path(a.output).resolve()
    if inp==out:p.error("Do not overwrite operator package")
    if not(str(out).startswith("/tmp/") or str(out).startswith("/mnt/data/")):
        p.error("Output must be outside tracked scientific repo")
    r=audit(json.loads(inp.read_text()))
    out.parent.mkdir(parents=True,exist_ok=True)
    if out.exists():p.error("Output already exists; use a unique file")
    out.write_text(json.dumps(r,indent=2,allow_nan=False)+"\n")
    print("PF4_G3B_PACKAGE_INTEGRITY_PASS_NOT_EXCHANGEABILITY_PASS "+json.dumps(r["R_all_Vstar"]))
if __name__=="__main__":main()
