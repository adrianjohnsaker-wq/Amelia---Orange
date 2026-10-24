#!/usr/bin/env python3
"""PF4 Gate 3 post-hoc package auditor, not a prospective sealing action.

No network calls, no prediction of future beacon and no claim of exact
physical-to-synthetic exchangeability. Only accepts 400 *completed* prior
source-matched synthetic calibration worlds with full provenance.
Run: python3 experiments/pf4/PF4_G3_CALIBRATION_AUDITOR.py --input /tmp/pf4-g3-package.json --out /tmp/pf4-g3
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import statistics

CANDIDATE_SHA = "de0d86764a300abe5187b06a379be1beefed859942784d12cd6a672f81702925"
SCHEMA = "PF4_G3_CALIBRATION_EXPORT_V1"
ALLOWED_CONTROLS={"lineage_shift","blank"}
def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def check_digest(s):
    assert isinstance(s,str) and len(s)==64 and all(c in "0123456789abcdef" for c in s), "BAD_DIGEST"
def finite_score(value):
    assert type(value) in (float,int) and math.isfinite(value) and 0<=value<=2, "NONFINITE_OR_INVALID_RESIDUAL"
    return float(value)
def quantile(xs,p):
    assert xs and 0<=p<=1
    ordered=sorted(xs)
    pos=(len(ordered)-1)*p
    lo=int(math.floor(pos));hi=int(math.ceil(pos))
    return ordered[lo]+(ordered[hi]-ordered[lo])*(pos-lo)
def gate(path):
    data=json.loads(Path(path).read_text())
    assert data.get("schema")==SCHEMA, "G3_EXPORT_SCHEMA_MISSING"
    assert data.get("candidateCodeSha256")==CANDIDATE_SHA, "C0_NOT_ARCHIVED_VSTAR"
    source=data.get("source",{})
    assert source.get("kind")=="PREDECLARED_SYNTHETIC_32_BYTE_UNIFORM_MODEL", "GENERATOR_NOT_DECLARED"
    assert source.get("domainSeparation")=="PF2-REF-i|", "NOT_EXACT_PF2_MAPPING"
    assert source.get("ticksPerWorld")==20160, "WORLD_TICKS_MISMATCH"
    assert source.get("armsPerWorld")==9, "NOT_NINE_ARMS"
    assert source.get("disjointFromFutureTarget") is True, "FUTURE_NOT_WALLED_OFF"
    assert source.get("independentSeeds") is True, "SEED_INDEPENDENCE_NOT_ASSERTED"
    check_digest(source.get("generatorSourceSha256"));check_digest(source.get("adapterSourceSha256"))
    assert source.get("seedSelectionDeclaredBeforeCalibration") is True, "SEED_SELECTION_NOT_FROZEN"
    raw=data.get("worlds")
    assert type(raw)==list and len(raw)==400, "G3_REQUIRES_EXACTLY_400_COMPLETE_WORLDS"
    ids=set();seeds=set();digests=set()
    rows=[];blank_count=0
    for i,w in enumerate(raw):
        assert type(w)==dict
        index=w.get("index");assert index==i, "NOT_CONTIGUOUS_WORLD_ORDER"
        world_id=w.get("worldId");assert isinstance(world_id,str) and world_id and world_id not in ids
        ids.add(world_id)
        sd=w.get("seedHex");check_digest(sd)
        assert sd not in seeds, "DUPLICATE_GENERATOR_SEED";seeds.add(sd)
        td=w.get("tapeSha256");check_digest(td)
        assert td not in digests, "DUPLICATE_WORLD_TAPE";digests.add(td)
        assert w.get("inputCount")==20160, "INCOMPLETE_WORLD"
        scores=w.get("R_all")
        assert isinstance(scores,dict) and set(scores).issubset({"C0",*ALLOWED_CONTROLS}), "BAD_CODE_SCORE_FAMILY"
        assert {"C0","lineage_shift"}.issubset(scores), "MISSING_PREDECLARED_CONTROL"
        if "blank" in scores:
            blank_count+=1
            assert i<100, "BLANK_ONLY_FIRST_HUNDRED_WORLDS_DECLARED"
        elif i<100:raise AssertionError("BLANK_MISSING_IN_FIRST_HUNDRED")
        rows.append({"index":i,"C0":finite_score(scores["C0"]),
                     "lineage_shift":finite_score(scores["lineage_shift"]),
                     "blank":finite_score(scores["blank"]) if "blank" in scores else None})
    assert blank_count==100, "BLANK_CONTROL_COUNT"
    if "declaredBeforeRunSha256" in data:check_digest(data["declaredBeforeRunSha256"])
    c0=[w["C0"] for w in rows]
    shifts=[w["lineage_shift"] for w in rows]
    blank=[w["blank"] for w in rows[:100]]
    physical=data.get("publishedHistoricalFullWindows",[])
    assert isinstance(physical,list)
    historic=[]
    for i,w in enumerate(physical):
        assert w.get("publishedBeforePF4Freeze") is True
        assert w.get("ticks")==20160 and w.get("arms")==9
        assert w.get("inputMapping")=="PF2-REF-i|"
        assert w.get("initialCodeSha256")==CANDIDATE_SHA
        assert isinstance(w.get("firstRound"),int) and isinstance(w.get("lastRound"),int)
        assert w["lastRound"]-w["firstRound"]==20*(20160-1)
        r=finite_score(w.get("R_all"))
        historic.append(r)
    # These diagnostics NEVER substitute for preregistered statistical calibration.
    report={
       "schema":"PF4_G3_CALIBRATION_INPUT_AUDIT_V1",
       "status":"SOURCE_MANIFEST_CHECKS_PASS_DISTRIBUTIONAL_EXCHANGEABILITY_NOT_PROVEN",
       "source":source,
       "worldsComplete":400,"blankControlsComplete":100,
       "uniqueInputTapeHashes":len(digests),
       "nullC0":{"min":min(c0),"max":max(c0),"mean":statistics.mean(c0),
                 "median":statistics.median(c0),
                 "q01":quantile(c0,.01),"q05":quantile(c0,.05),
                 "q10":quantile(c0,.10),"q90":quantile(c0,.90),
                 "q95":quantile(c0,.95),"q99":quantile(c0,.99)},
       "lineageShift":{"median":statistics.median(shifts),
                       "pairedC0SmallerCount":sum(a<b for a,b in zip(c0,shifts)),
                       "pairedTieCount":sum(a==b for a,b in zip(c0,shifts))},
       "blank":{"median":statistics.median(blank),
                "pairedC0SmallerCount":sum(c0[i]<blank[i] for i in range(100))},
       "historicalFullWindows":{"count":len(historic),"values":historic,
         "empiricalC0Percentile":[sum(x<=r for x in c0)/400 for r in historic]},
       "historicalCompatibility":"UNRESOLVED_NO_COMPLETE_PAST_WINDOWS" if not historic else
        "REQUIRES_PREDECLARED_EQUIVALENCE_MARGIN_AND_SOURCE_VALIDATION",
       "liveInferenceStatus":"NOT_STARTED_NO_FUTURE_BEACON_EXAMINED",
       "limitations":[
           "Synthetic worlds not automatically exchangeable with physical Quicknet worlds.",
           "Nine PF2 arms per world are correlated derivations of one input tape.",
           "Manifest verifies metadata shape only; replay original generator and source receipt verification separately.",
           "Four studio W1–W4 synthetic residuals are not a prospective decision threshold.",
           "Do not derive exact p-values on the future target before independent genesis and time seal.",
           "Retrospective published windows require complete 20160-tick length and physical provenance."]
    }
    return report
def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--input",required=True)
    ap.add_argument("--out",required=True)
    a=ap.parse_args()
    output=Path(a.out).resolve()
    assert str(output).startswith("/tmp/") or str(output).startswith("/mnt/data/")
    assert output!=Path(a.input).resolve()
    report=gate(a.input)
    output.mkdir(parents=True,exist_ok=True)
    (output/"PF4_G3_CALIBRATION_AUDIT.json").write_text(json.dumps(report,indent=2)+"\n")
    print("PF4_G3_COMPLETED_NULL_CALIBRATION_PACKAGE_AUDIT_PASS "+json.dumps({
        "n":report["worldsComplete"],
        "q01":report["nullC0"]["q01"],"median":report["nullC0"]["median"],
        "historicalCompatibility":report["historicalCompatibility"],
        "noFutureTarget":True}))
if __name__=="__main__":main()
