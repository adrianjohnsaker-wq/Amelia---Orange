#!/usr/bin/env python3
"""S1 32-world paired outcome validator and exact one-sided McNemar analysis.

NO model integration, no world generation, no guesswork. Scientific execution
is BLOCKED unless real original-model source admission, original Studio07
replay evidence, exact pre-run registration and all 384 unmodified trace
files are supplied. This script can analyze completed records; it cannot
certify model identity or independent worlds without external evidence.

Usage:
  python3 s1_science_analysis.py --results RESULTS.json --trace-root TRACE_ROOT \
    --registration REGISTRATION.md --source-admission RECEIPT.json \
    --replay-receipt ORIGINAL_REPLAY.json
  python3 s1_science_analysis.py --self-test
"""
import argparse
import hashlib
import json
from math import comb
from pathlib import Path, PurePosixPath
import random
import tempfile

SCHEMA="STUDIO08_S1_FRESH_32W_PAIRED_RESULTS_V1"
ARMS=("adaptive","round_robin","fixed_surface_decline24",
      "fixed_house_flux24","no_cue","asm_reference")
SCENARIOS=("intact","lesion")
WORLDS=tuple(f"S1-W{k:02d}" for k in range(32))
DECISIONS=("held","restored","circuit","haunted","other")
SHA_CHARS="0123456789abcdef"

def assert_true(predicate,msg):
    if not predicate: raise ValueError(msg)

def valid_hash(value):
    return isinstance(value,str) and len(value)==64 and all(c in SHA_CHARS for c in value)

def sha(data):
    return hashlib.sha256(data).hexdigest()

def digest(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for c in iter(lambda:f.read(1024*1024),b""):
            h.update(c)
    return h.hexdigest()

def safe_trace(root,rel):
    assert_true(isinstance(rel,str) and bool(rel) and "\\" not in rel,
                "trace relative path required")
    parts=PurePosixPath(rel)
    assert_true(not parts.is_absolute() and all(x not in (".","..") for x in parts.parts),
                "unsafe trace path")
    file=(root/rel).resolve()
    assert_true(file.is_relative_to(root.resolve()),"trace escapes input root")
    assert_true(file.is_file() and file.stat().st_size>0,"trace missing or empty: "+rel)
    return file

def classify(scenario,row):
    last=row["lastSeasonDeaths"]
    routes=row["lastSeasonRoutes"]
    pull=row["lastSeasonPull27"]
    pull45=row["lastSeasonPull45"]
    success="held" if scenario=="intact" else "restored"
    if last==0 and routes>=6.5 and pull>=0.5: return success
    if last==0 and routes<=4.5: return "circuit"
    if last>0 and pull45>=0.05: return "haunted"
    return "other"

def exact_p(wins,losses):
    n=wins+losses
    if n==0:return 1.0
    return sum(comb(n,k) for k in range(wins,n+1))/(2**n)

def paired_bootstrap_ci(v):
    rng=random.Random(80710025)
    n=len(v)
    stats=[]
    for _ in range(20000):
        stats.append(sum(v[rng.randrange(n)] for _ in range(n))/n)
    stats.sort()
    return [stats[499],stats[19499]]  # fixed percentile indexes

def analyze_data(record,trace_root,registration_path,source_receipt,replay_receipt):
    trace_root=Path(trace_root).resolve()
    reg_bytes=Path(registration_path).read_bytes()
    assert_true(bool(reg_bytes),"registration empty")
    assert_true(record.get("schema")==SCHEMA,"wrong results schema")
    for name in ("registrationSha256","sourceDigest","originalReplayReceiptSha256"):
        assert_true(valid_hash(record.get(name)),"invalid/missing "+name)
    assert_true(record["registrationSha256"]==sha(reg_bytes),"unmatched preregistration bytes")
    assert_true(record["originalReplayReceiptSha256"]==digest(replay_receipt),
                "original Studio07 replay receipt digest mismatch")
    source=json.loads(Path(source_receipt).read_bytes())
    assert_true(source.get("status")=="STUDIO08_ORIGINAL_IMPORT_CUSTODY_PASS_NOT_SCIENTIFIC_REPLAY",
                "original source custody has not passed")
    assert_true(source.get("verifiedWorldPairs")==8,
                "old eight-world checkpoints not admitted")
    assert_true(valid_hash(source.get("sourceRunnerSha256")),
                "original runner hash unverified")
    assert_true(source.get("originalCodeExecuted") is False,
                "source admission receipt semantics invalid")
    replay=json.loads(Path(replay_receipt).read_bytes())
    assert_true(replay.get("status")=="STUDIO07_ORIGINAL_EIGHT_WORLD_REPLAY_VERIFIED",
                "original science replay not independently accepted")
    assert_true(replay.get("matchedWorlds")==8 and
                replay.get("exactCueSerializerVerified") is True and
                replay.get("fullTraceDigestsMatched") is True,
                "original Studio07 proof-of-parity incomplete")
    assert_true(replay.get("originalRunnerSha256")==source["sourceRunnerSha256"],
                "source-replay original runner identity mismatch")
    assert_true(record["sourceDigest"]==source["sourceRunnerSha256"],
                "science runner diverged from original source")
    worlds=record.get("worlds")
    assert_true(isinstance(worlds,list) and len(worlds)==32,
                "must admit exactly 32 fresh worlds")
    ids=[w.get("worldId") for w in worlds]
    assert_true(sorted(ids)==list(WORLDS),"missing/duplicate/out-of-order world IDs")
    seeds=set()
    states=set()
    traces=set()
    rows={}
    for w in worlds:
        wid=w["worldId"]
        seed=w.get("seedHex")
        baseline=w.get("initialWorldSha256")
        assert_true(valid_hash(seed) and valid_hash(baseline),
                    "world needs exact seed and complete initial state SHA256")
        # Frozen domain-separation rule. A world must be more than a new label.
        assert_true(seed==sha(("STUDIO08-S1-V1|"+wid).encode()),
                    "world seed does not match original fixed derivation")
        assert_true(seed not in seeds and baseline not in states,
                    "distinct worlds reuse seed or full initial state; no independent worlds")
        seeds.add(seed);states.add(baseline)
        cond=w.get("scenarios")
        assert_true(isinstance(cond,dict) and set(cond)==set(SCENARIOS),
                    "both intact and lesion scenarios required")
        rows[wid]={}
        for scenario in SCENARIOS:
            arms=cond[scenario]
            assert_true(isinstance(arms,dict) and set(arms)==set(ARMS),
                        "all six matched arms required for "+wid+"/"+scenario)
            rows[wid][scenario]={}
            for arm in ARMS:
                x=arms[arm]
                assert_true(x.get("initialWorldSha256")==baseline,
                            "fork is not same full initial state: "+wid+" "+arm)
                for field in ("lastSeasonDeaths","lesionSeasonDeaths","lastSeasonRoutes",
                              "lastSeasonPull27","lastSeasonPull45"):
                    value=x.get(field)
                    assert_true(isinstance(value,(int,float)) and not isinstance(value,bool)
                                and value==value and abs(value)!=float("inf") and value>=0,
                                "invalid "+field+" in "+wid+"/"+scenario+"/"+arm)
                assert_true(int(x["lastSeasonDeaths"])==x["lastSeasonDeaths"],
                            "last-season deaths must be integer")
                assert_true(int(x["lesionSeasonDeaths"])==x["lesionSeasonDeaths"],
                            "lesion deaths must be integer")
                assert_true(x["lastSeasonRoutes"]<=11 and
                            x["lastSeasonPull27"]<=1 and x["lastSeasonPull45"]<=1,
                            "outcome beyond physical measurement bounds")
                assert_true(x.get("class")==classify(scenario,x),
                            "outcome class miscomputed: "+wid+"/"+scenario+"/"+arm)
                trace=x.get("tracePath")
                traceSha=x.get("traceSha256")
                assert_true(valid_hash(traceSha),"trace digest missing")
                assert_true(trace not in traces,"trace used twice; outcomes not independently witnessed")
                traces.add(trace)
                path=safe_trace(trace_root,trace)
                assert_true(traceSha==digest(path),"trace bytes mismatched: "+str(trace))
                # A trace is an original model step log, not merely one synthetic success JSON.
                assert_true(path.stat().st_size>=128,"implausibly short original model trace: "+str(trace))
                rows[wid][scenario][arm]=x["class"]
    results={}
    for scenario,positive in (("intact","held"),("lesion","restored")):
        bits=[(
          int(rows[wid][scenario]["adaptive"]==positive),
          int(rows[wid][scenario]["round_robin"]==positive)
        ) for wid in WORLDS]
        wins=sum(a and not b for a,b in bits)
        losses=sum(b and not a for a,b in bits)
        ties=sum(a==b for a,b in bits)
        differences=[a-b for a,b in bits]
        results[scenario]={
            "successesAdaptive":sum(a for a,b in bits),
            "successesRoundRobin":sum(b for a,b in bits),
            "pairedAdaptiveOnly":wins,"pairedControlOnly":losses,
            "pairedTies":ties,
            "riskDifference":sum(differences)/32,
            "pairedBootstrap95PercentDescriptive":paired_bootstrap_ci(differences),
            "pOneSidedExactMcNemar":exact_p(wins,losses),
        }
    ranked=sorted(SCENARIOS,key=lambda x:results[x]["pOneSidedExactMcNemar"])
    last=0
    for i,scenario in enumerate(ranked):
        adjusted=min(1,(len(SCENARIOS)-i)*results[scenario]["pOneSidedExactMcNemar"])
        adjusted=max(last,adjusted)
        results[scenario]["pHolmAdjusted"]=adjusted
        results[scenario]["passesFamilyAlpha05"]=adjusted<=0.05
        last=adjusted
    return {
        "status":"STUDIO08_S1_ALL_32_WORLD_REPORTS_AND_HASHES_VERIFIED_FOR_ANALYSIS",
        "scientificClaimStatus":"INTERNAL_EVIDENCE_CHECKS_ONLY_NOT_INDEPENDENT_CERTIFICATION",
        "worlds":32,"verifiedOutcomeTraceFiles":len(traces),
        "registeredSourceDigest":record["sourceDigest"],
        "originalReplayReceiptSha256":record["originalReplayReceiptSha256"],
        "registeredProtocolSha256":record["registrationSha256"],
        "twoPrimaryEndpointsHolmCorrected":True,
        "analysis":results,
        "warning":"Passing manifest checks does not independently demonstrate original adapter fidelity, actual model execution or absence of preselection."
    }

def selftest():
    assert_true(exact_p(0,0)==1.0,"no-discordance exact p wrong")
    assert_true(exact_p(5,0)==0.03125,"5 wins p wrong")
    assert_true(exact_p(4,1)==0.1875,"4 wins 1 loss p wrong")
    assert_true(exact_p(0,3)==1.0,"all control wins p wrong")
    assert_true(paired_bootstrap_ci([0]*32)==[0,0],"bootstrap zero CI wrong")
    a={"lastSeasonDeaths":0,"lastSeasonRoutes":7,
       "lastSeasonPull27":.8,"lastSeasonPull45":0}
    assert_true(classify("intact",a)=="held","held classification")
    assert_true(classify("lesion",a)=="restored","restored classification")
    a["lastSeasonDeaths"]=1;a["lastSeasonPull45"]=.1
    assert_true(classify("lesion",a)=="haunted","haunted classification")
    with tempfile.TemporaryDirectory() as tmp:
        root=Path(tmp)
        f=root/"sample.jsonl";f.write_text("a"*130)
        assert_true(digest(f)==sha(f.read_bytes()),"file hash mismatch")
        try:
            safe_trace(root,"../escaped")
            raise AssertionError("path traversal accepted")
        except ValueError: pass
    print(json.dumps({"status":"STUDIO08_S1_ANALYSIS_ENGINEERING_SELFTEST_PASS",
                      "assertions":10,"scientificRun":False}))

if __name__=="__main__":
    p=argparse.ArgumentParser()
    op=p.add_mutually_exclusive_group(required=True)
    op.add_argument("--self-test",action="store_true")
    op.add_argument("--results")
    p.add_argument("--trace-root")
    p.add_argument("--registration")
    p.add_argument("--source-admission")
    p.add_argument("--replay-receipt")
    args=p.parse_args()
    if args.self_test: selftest()
    else:
        assert_true(all([args.trace_root,args.registration,args.source_admission,
                         args.replay_receipt]),"missing mandatory evidence paths")
        report=analyze_data(json.loads(Path(args.results).read_bytes()),
                            args.trace_root,args.registration,args.source_admission,
                            args.replay_receipt)
        print(json.dumps(report,indent=2,sort_keys=True))
