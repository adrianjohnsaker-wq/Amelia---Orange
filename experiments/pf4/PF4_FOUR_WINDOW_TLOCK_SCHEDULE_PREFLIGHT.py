#!/usr/bin/env python3
"""PF4 four-window schedule / tlock round preflight. NEVER SEALS.

Checks only *syntax and temporal ordering* of a future-approved schedule.
Does not generate, access, score, reveal, encrypt or admit a beacon.
Must be supplemented by independent time source and RFC3161 signing.
"""
import argparse
import json
import sys

CHAIN="52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971"
VSTAR="de0d86764a300abe5187b06a379be1beefed859942784d12cd6a672f81702925"
STRIDE=20
TICKS=20160
MIN_BUFFER=1200  # 1 hour Quicknet at 3 seconds per round
def check(d):
    if d.get("schema")!="PF4_FOUR_WINDOW_SCHEDULE_V1":raise ValueError("SCHEMA")
    if d.get("chainHash")!=CHAIN:raise ValueError("CHAIN")
    if d.get("stride")!=STRIDE or d.get("ticksPerWindow")!=TICKS:raise ValueError("CADENCE")
    if d.get("primaryCodeSHA256")!=VSTAR:raise ValueError("PRIMARY_CODE")
    aux=d.get("secondaryCodeSHA256")
    if not isinstance(aux,str) or len(aux)!=64 or not all(c in "0123456789abcdef" for c in aux) or aux==VSTAR:
        raise ValueError("SECONDARY_SHA_NOT_COMMITTED")
    for field in ("analysisSourceSHA256","inputAdapterSHA256","nullCalibrationSHA256"):
        value=d.get(field)
        if not isinstance(value,str) or len(value)!=64 or not all(c in "0123456789abcdef" for c in value):
            raise ValueError("MISSING_LOCK_"+field)
    latest=d.get("latestPublishedRoundAtCommit")
    if type(latest) is not int or latest<1:raise ValueError("MISSING_LAST_PUBLISHED_ROUND")
    windows=d.get("windows")
    if not isinstance(windows,list) or len(windows)!=4:raise ValueError("NOT_FOUR_WINDOWS")
    previous=None
    for i,w in enumerate(windows):
        if not isinstance(w,dict) or w.get("index")!=i+1:raise ValueError("WINDOW_INDEX")
        start,end=w.get("startRound"),w.get("endRound")
        if type(start) is not int or type(end) is not int:raise ValueError("WINDOW_ROUNDS")
        if start<=latest:raise ValueError("TARGET_ALREADY_PUBLISHED_AT_COMMIT")
        if end!=start+(TICKS-1)*STRIDE:raise ValueError("WINDOW_NOT_20160_TICKS")
        if previous is not None and start!=previous+STRIDE:
            raise ValueError("WINDOWS_NOT_CONSECUTIVE")
        previous=end
    unlock=d.get("unlockQuicknetRound")
    if type(unlock) is not int or unlock < previous+MIN_BUFFER:
        raise ValueError("UNLOCK_BEFORE_END_PLUS_1H_BUFFER")
    if d.get("endOfWindowSourceAvailableAtSeal") is not False:
        raise ValueError("FUTURE_SOURCE_MUST_BE_UNPUBLISHED")
    return {"schema":"PF4_SCHEDULE_STRUCTURE_CHECK_V1","status":"STRUCTURE_ONLY_VALID_NOT_SEALED",
            "fourWindows":4,"ticksPerWindow":TICKS,"firstRound":windows[0]["startRound"],
            "lastRound":windows[-1]["endRound"],"unlockRound":unlock,
            "buffersRounds":unlock-previous,"independentTimestampVerified":False,
            "BLSVerified":False,"sourceLeakageAudited":False,"codeCiphertextCreated":False,
            "registrationApproved":False}
def mock():
    x=39000000
    w=[{"index":i+1,"startRound":x+i*TICKS*STRIDE,
        "endRound":x+(i+1)*TICKS*STRIDE-STRIDE} for i in range(4)]
    h="1"*64
    return {"schema":"PF4_FOUR_WINDOW_SCHEDULE_V1",
      "chainHash":CHAIN,"stride":STRIDE,"ticksPerWindow":TICKS,
      "primaryCodeSHA256":VSTAR,"secondaryCodeSHA256":h,
      "analysisSourceSHA256":h,"inputAdapterSHA256":h,
      "nullCalibrationSHA256":h,
      "latestPublishedRoundAtCommit":x-20,
      "windows":w,"unlockQuicknetRound":w[-1]["endRound"]+MIN_BUFFER,
      "endOfWindowSourceAvailableAtSeal":False}
def selftest():
    base=mock()
    assert check(base)["status"]=="STRUCTURE_ONLY_VALID_NOT_SEALED"
    changes=[
      lambda x:x["windows"][0].update(startRound=x["windows"][0]["startRound"]-STRIDE),
      lambda x:x["windows"][1].update(startRound=x["windows"][1]["startRound"]+STRIDE),
      lambda x:x["windows"][3].update(endRound=x["windows"][3]["endRound"]-STRIDE),
      lambda x:x.update(unlockQuicknetRound=x["windows"][-1]["endRound"]+MIN_BUFFER-1),
      lambda x:x.update(latestPublishedRoundAtCommit=x["windows"][0]["startRound"]),
      lambda x:x.update(secondaryCodeSHA256=VSTAR),
      lambda x:x.update(endOfWindowSourceAvailableAtSeal=True)
    ]
    for change in changes:
        x=json.loads(json.dumps(base))
        change(x)
        try:check(x)
        except ValueError:pass
        else:raise AssertionError("FAILED_NEGATIVE_TEST")
    print("PF4_FOUR_WINDOW_SCHEDULE_AND_TLOCK_ROUND_UNIT_TESTS_PASS (MOCK ONLY)")
def main():
    p=argparse.ArgumentParser()
    p.add_argument("--self-test",action="store_true")
    p.add_argument("--schedule")
    a=p.parse_args()
    if a.self_test:selftest();return
    if not a.schedule:p.error("--schedule required to check a proposed operator-approved four-window JSON")
    with open(a.schedule) as f:d=json.load(f)
    print(json.dumps(check(d),sort_keys=True))
if __name__=="__main__":main()
