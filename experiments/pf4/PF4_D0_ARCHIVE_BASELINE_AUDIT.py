#!/usr/bin/env python3
"""PF4 D0 / exploratory archived self-consistency and scar benchmark audit.
No new input, no beacon discovery, no statistical significance test, no seal.
Outputs to /tmp, never modifies the signed original experiments/studio files.
"""
from pathlib import Path
import argparse
import hashlib
import json
import math

ROOT = Path("experiments/studio")
EDGES = ('0>9','1>8','2>7','3>6','4>5','1>2','2>4','4>7','7>8','8>9','9>1')
EXPECTED_BASE = {
  "W1":0.1549603616896011,
  "W2":0.11032361426056797,
  "W3":0.1632282080554582,
  "W4":0.07616177602793499,
}

def load(name):
    return json.loads((ROOT/name).read_text(encoding="utf-8"))

def validate(c):
    assert isinstance(c,list) and len(c)==9, "CODE_NOT_NINE_LINEAGES"
    for k,v in enumerate(c):
        assert set(v)==set(EDGES), ("EDGE_KEYS_INCOMPLETE",k)
        for e,x in v.items():
            assert isinstance(x,(float,int)) and math.isfinite(x), ("NONFINITE_CODE",k,e)
    return c

def infinity_norm(c,d):
    return max(abs(a[e]-b[e]) for a,b in zip(validate(c),validate(d)) for e in EDGES)

def maxrecs(record):
    return max(record["maxResidual"])

def deaths(record):
    assert len(record["deaths"])==9
    return sum(record["deaths"])

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--output",default="/tmp/pf4-d0")
    args=parser.parse_args()
    out=Path(args.output).resolve()
    assert str(out).startswith("/tmp/") or str(out).startswith("/mnt/data/")
    sums={}
    for s in (ROOT/"SHA256SUMS.txt").read_text().splitlines():
        digest,path=s.split("  ./",1)
        assert len(digest)==64
        sums[path]=digest
    assert len(sums)==65
    # All studio manifest entries remain untouched; no checksums redefined.
    for path,digest in sums.items():
        data=(ROOT/path).read_bytes()
        actual=hashlib.sha256(data).hexdigest()
        assert actual==digest,("ARCHIVE_SHA256_MISMATCH",path)
    c0=validate(load("outputs/loop/Vstar.json"))
    raw=(ROOT/"outputs/loop/Vstar.json").read_bytes()
    c0sha=hashlib.sha256(raw).hexdigest()
    assert c0sha==sums["outputs/loop/Vstar.json"]
    loop=load("outputs/loop/loop_log.json")
    loopB=load("outputs/loopB/loop_log.json")
    assert len(loop)==30 and [r["pass"] for r in loop]==list(range(30))
    assert len(loopB)==21 and loopB[0]["pass"]==-1
    assert all(len(r["traces"])==9 and len(r["deaths"])==9 for r in loop+loopB)
    assert infinity_norm(c0,loop[-1]["Vend"])==0
    stableHistory=all(r["traces"]==loop[-1]["traces"] for r in loop[20:])
    assert stableHistory, "LAST_TEN_PASSES_TRACES_DIFFER"
    # The published final code is the *end* of pass 29, not its beginning.
    preceding_step_residual=infinity_norm(loop[-1]["Vstart"],loop[-1]["Vend"])
    assay=load("outputs/scar/scar_assay.json")
    own=assay["V* in its own world"]
    assert deaths(own)==0 and own["zone4Visits"]==434
    assert deaths(assay["naive (zero code)"])==32
    assert deaths(assay["erase scar: V* with 4>5 = 0"])==36
    assert deaths(assay["transplant scar: zero code + V*(4>5)"])==9
    assert assay["dormant: V* with 3>6 = 0.9"]["sameTraceAsVstar"]==[True]*9
    baseline={}
    for w,expected in EXPECTED_BASE.items():
        a=assay[f"V* in unseen world {w}"]
        b=assay[f"naive in unseen world {w}"]
        obs=maxrecs(a)
        assert abs(obs-expected)<1e-14,("UNSEEN_WORLD_DRIFT_CHANGES",w,obs)
        baseline[w]={"deathsWithCode":deaths(a),"deathsWithoutCode":deaths(b),
            "R_all":obs,"R_allZeroCode":maxrecs(b),
            "sourceType":"synthetic NS|lineage|tick",
            "perLineageR":a["maxResidual"]}
    summary={
        "schema":"PF4_D0_ARCHIVE_BASELINE_AUDIT_V1",
        "status":"PASS_REPO_ARCHIVE_READONLY_NOT_PROSPECTIVE_NOT_SEALED",
        "repositoryCommit":"dd48820ff2ac5e97bd2f9a327ce113a0b02d93ff",
        "candidateCode":{"path":"experiments/studio/outputs/loop/Vstar.json",
            "sha256":c0sha,"lineages":9,"edges":len(EDGES),
            "cells":9*len(EDGES),"isFinalCodeOfPass29":True},
        "manifest":{"filesChecked":65,"allSha256Verified":True},
        "loopFromZero":{"passes":30,"firstPassDeaths":sum(loop[0]["deaths"]),
            "lastPassDeaths":sum(loop[-1]["deaths"]),
            "firstZeroDeathPass":next(r["pass"] for r in loop if not any(r["deaths"])),
            "pass29StartEndResidual":preceding_step_residual},
        "codeSelfReexecution":{
            "deathCount":deaths(own),
            "R_all":maxrecs(own),
            "numericFixedPointExact":maxrecs(own)==0,
            "historyDigestStableSincePass20":stableHistory},
        "scarIntervention":{
            "naiveDeaths":deaths(assay["naive (zero code)"]),
            "scarErasedDeaths":deaths(assay["erase scar: V* with 4>5 = 0"]),
            "scarTransplantDeaths":deaths(assay["transplant scar: zero code + V*(4>5)"]),
            "allNineDormantEdgeTraceDigestsEqual":True},
        "oldFourSyntheticWorlds":baseline,
        "oldFourRRange":[min(v["R_all"] for v in baseline.values()),max(v["R_all"] for v in baseline.values())],
        "liveThresholdStatus":"NOT_CALIBRATED_FOR_PF2_QUICKNET_INPUT_MAPPING",
        "liveSampleSeen":False,
        "caveats":[
            "Four analysed synthetic worlds cannot define an inferential live threshold.",
            "Studio NS|lineage|tick is different from live Quicknet source -> PF2 reference input mapping.",
            "Nine reference input streams are transformations of one physical beacon source.",
            "V* numerically approaches a fixed point but does not equal it exactly at the documented final pass.",
            "A prospective anomaly cannot alone identify retrocausal information transfer."]
        }
    out.mkdir(parents=True,exist_ok=True)
    (out/"PF4_D0_ARCHIVE_BASELINE_AUDIT.json").write_text(json.dumps(summary,indent=2)+"\n")
    print("PF4_D0_ARCHIVE_BASELINE_AUDIT_PASS "+json.dumps({
        "manifest":summary["manifest"],"candidateSha256":c0sha,
        "ownWorldR":maxrecs(own),"oldWResiduals":{w:v["R_all"] for w,v in baseline.items()},
        "liveThresholdStatus":summary["liveThresholdStatus"]}))
if __name__=="__main__":main()
