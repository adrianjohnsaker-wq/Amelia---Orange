#!/usr/bin/env python3
"""Collate 384 independently preserved original-model arm receipts.

This is an evidence collector, not a new simulator. It refuses all missing or
duplicate arms, mismatched source/registration, changed traces, unmatched
initial states and substituted seed values. The final science_analysis.py
enforces the endpoint classifications and exact paired primary test.
"""
import argparse
import json
import hashlib
from pathlib import Path
from science_analysis import ARMS,SCENARIOS,WORLDS,SCHEMA,sha,valid_hash,digest

def require(value,reason):
    if not value: raise ValueError(reason)
def classify(scenario,m):
    positive="held" if scenario=="intact" else "restored"
    if m["lastSeasonDeaths"]==0 and m["lastSeasonRoutes"]>=6.5 and m["lastSeasonPull27"]>=0.5:
        return positive
    if m["lastSeasonDeaths"]==0 and m["lastSeasonRoutes"]<=4.5:
        return "circuit"
    if m["lastSeasonDeaths"]>0 and m["lastSeasonPull45"]>=0.05:
        return "haunted"
    return "other"

def collect(records_root,trace_root,registration,source_receipt,replay_receipt):
    records_root=Path(records_root).resolve()
    trace_root=Path(trace_root).resolve()
    registration=Path(registration)
    source=json.loads(Path(source_receipt).read_bytes())
    replay=json.loads(Path(replay_receipt).read_bytes())
    require(source.get("status")=="STUDIO08_ORIGINAL_IMPORT_CUSTODY_PASS_NOT_SCIENTIFIC_REPLAY",
            "original-source admission receipt missing")
    require(replay.get("status")=="STUDIO07_ORIGINAL_EIGHT_WORLD_REPLAY_VERIFIED" and
            replay.get("fullTraceDigestsMatched") is True,
            "original eight-world reproduction has not passed")
    root_hash=sha(registration.read_bytes())
    source_hash=source.get("sourceRunnerSha256")
    replay_hash=digest(replay_receipt)
    require(valid_hash(source_hash),"original runner SHA256 missing")
    entries={}
    receipts=sorted(records_root.glob("*.arm.json"))
    require(len(receipts)==384,"expected exactly 384 original arm receipts, found "+str(len(receipts)))
    for f in receipts:
        x=json.loads(f.read_bytes())
        require(x.get("schema")=="STUDIO08_S1_ORIGINAL_ARM_RECORD_V1","bad receipt schema: "+f.name)
        wid,scenario,arm=x.get("worldId"),x.get("scenario"),x.get("arm")
        require(wid in WORLDS and scenario in SCENARIOS and arm in ARMS,
                "unknown world/scenario/arm in "+f.name)
        key=(wid,scenario,arm)
        require(key not in entries,"duplicate exact outcome "+str(key))
        require(x.get("registrationSha256")==root_hash and
                x.get("sourceRunnerSha256")==source_hash and
                x.get("originalReplayReceiptSha256")==replay_hash,
                "different research source/registration in "+f.name)
        require(x.get("sourceInputCalls")==0,"incoming external signal in "+f.name)
        require(x.get("traceRows",0)>0,"no raw transitions in "+f.name)
        file=Path(x.get("tracePath","")).resolve()
        require(file.is_relative_to(trace_root),"trace path outside immutable trace root")
        require(file.is_file() and file.stat().st_size>128,
                "trace missing or implausibly short")
        require(x.get("traceSha256")==digest(file),"modified raw trace "+f.name)
        relative=file.relative_to(trace_root).as_posix()
        metrics=x.get("outcomeMetrics")
        require(isinstance(metrics,dict),"original science metrics missing")
        entries[key]={
          "initialWorldSha256":x.get("initialWorldSha256"),
          "lastSeasonDeaths":metrics.get("lastSeasonDeaths"),
          "lesionSeasonDeaths":metrics.get("lesionSeasonDeaths"),
          "lastSeasonRoutes":metrics.get("lastSeasonRoutes"),
          "lastSeasonPull27":metrics.get("lastSeasonPull27"),
          "lastSeasonPull45":metrics.get("lastSeasonPull45"),
          "class":classify(scenario,metrics),
          "tracePath":relative,"traceSha256":x["traceSha256"]
        }
    worlds=[]
    for wid in WORLDS:
        arm_sources=[entries[(wid,scenario,arm)]
                     for scenario in SCENARIOS for arm in ARMS]
        initials={x["initialWorldSha256"] for x in arm_sources}
        require(len(initials)==1 and valid_hash(next(iter(initials))),
                "fork initial states did not match for world "+wid)
        worlds.append({
          "worldId":wid,
          "seedHex":sha(("STUDIO08-S1-V1|"+wid).encode()),
          "initialWorldSha256":next(iter(initials)),
          "scenarios":{scenario:{arm:entries[(wid,scenario,arm)]
                                 for arm in ARMS} for scenario in SCENARIOS}
        })
    require(len({w["initialWorldSha256"] for w in worlds})==32,
            "worlds do not have distinct original model initial state")
    return {
      "schema":SCHEMA,
      "registrationSha256":root_hash,
      "sourceDigest":source_hash,
      "originalReplayReceiptSha256":replay_hash,
      "worlds":worlds,
      "collectorWarning":"Must run independent source audit and full paired science_analysis.py before interpretation."
    }

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--records-root",required=True)
    p.add_argument("--trace-root",required=True)
    p.add_argument("--registration",required=True)
    p.add_argument("--source-admission",required=True)
    p.add_argument("--replay-receipt",required=True)
    p.add_argument("--output",required=True)
    a=p.parse_args()
    result=collect(a.records_root,a.trace_root,a.registration,a.source_admission,a.replay_receipt)
    output=Path(a.output)
    if output.exists():raise FileExistsError("never overwrite a science result")
    output.write_text(json.dumps(result,indent=2,sort_keys=True)+"\n")
    print(json.dumps({"status":"STUDIO08_S1_384_RAW_RECORDS_COLLATED_PENDING_INDEPENDENT_ANALYSIS",
                      "worlds":len(result["worlds"]),"rawTraceRecords":384,
                      "resultSha256":digest(output)}))
