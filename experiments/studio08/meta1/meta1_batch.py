#!/usr/bin/env python3
"""Studio08 META1 pilot validation and 32-world registered science execution.

NO silent replacements, no auto rerun, no pilot world can enter science.
Science requires a SHA256-bound launch seal created after QA but before results.
"""
import argparse,gzip,hashlib,json,os,subprocess,sys
from pathlib import Path
from meta1_trace_validator import validate,seed_for
ROOT=Path(__file__).resolve().parents[3]
BASE=Path(__file__).resolve().parent
RUN=BASE/"meta1_runner.mjs"
VAL=BASE/"meta1_trace_validator.py"
RUNTIME=ROOT/"experiments"/"studio08"/"runtime_mirror"
SENSORS=ROOT/"experiments"/"studio08"/"code"/"closed_circuit_sensors.mjs"
SELECTOR=ROOT/"experiments"/"studio08"/"code"/"learning_cue_gate.mjs"
PROTOCOL=BASE/"META1_PRECOMMIT.md"
SEAL=BASE/"META1_LAUNCH_SEAL.json"
ARMS=("adaptive","round_robin","no_cue")
SCENARIOS=("intact","lesion")
def hashfile(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for block in iter(lambda:f.read(1048576),b""):h.update(block)
    return h.hexdigest()
def run(*args):
    call=["node","--experimental-strip-types","--no-warnings",str(RUN),*map(str,args)]
    proc=subprocess.run(call,capture_output=True,text=True)
    if proc.returncode:
        raise RuntimeError(f"original committed-model runner failed: {call[-4:]}\n{proc.stderr[-1800:]}")
    return proc.stdout.strip().splitlines()[-1]
def validate_seal():
    if not SEAL.is_file():raise RuntimeError("SCIENCE NOT SEALED: missing META1_LAUNCH_SEAL.json")
    data=json.loads(SEAL.read_text())
    if data.get("status")!="FROZEN_BEFORE_META1_SCIENCE" or data.get("schema")!="STUDIO08_META1_LAUNCH_V1":
        raise RuntimeError("invalid pre-run seal")
    expected={
      "meta1_runner.mjs":RUN,
      "meta1_trace_validator.py":VAL,
      "META1_PRECOMMIT.md":PROTOCOL,
      "closed_circuit_sensors.mjs":SENSORS,
      "learning_cue_gate.mjs":SELECTOR
    }
    for name,file in expected.items():
        if data["sha256"].get(name)!=hashfile(file):
            raise RuntimeError(f"seal source mismatch: {name}")
    if data.get("worldCount")!=32 or data.get("arms")!=list(ARMS) or data.get("scenarios")!=list(SCENARIOS):
        raise RuntimeError("seal design/count mismatch")
    return data
def execute_world(world,output,scenarios=SCENARIOS,arms=ARMS):
    output.mkdir(parents=True,exist_ok=True)
    seed=seed_for(world)
    ck=output/f"{world}.genesis.json"
    if ck.exists():raise RuntimeError("refuse to overwrite checkpoint")
    run("genesis",RUNTIME,world,seed,ck)
    x=json.loads(ck.read_text())
    if x["seedHex"]!=seed or x["worldId"]!=world or not x.get("lineageSha256"):
        raise RuntimeError("genesis source identity mismatch")
    receipts=[]
    for scenario in scenarios:
      for arm in arms:
        t=output/f"{world}__{scenario}__{arm}.jsonl.gz"
        s=output/f"{world}__{scenario}__{arm}.json"
        if t.exists() or s.exists():raise RuntimeError("refuse overwritten prior run")
        run("run",RUNTIME,ck,world,scenario,arm,t,s)
        report=validate(t,world,scenario,arm)
        summary=json.loads(s.read_text())
        if summary["traceSha256"]!=hashfile(t) or summary["traceRows"]!=35000:
            raise RuntimeError("summary and full trace digest inconsistent")
        if summary["initialWorldSha256"]!=x["lineageSha256"]:
            raise RuntimeError("not a paired lineage start")
        receipts.append({
          "worldId":world,"seedHex":seed,"scenario":scenario,"arm":arm,
          "initialWorldSha256":x["lineageSha256"],
          "summaryPath":s.name,"summarySha256":hashfile(s),
          "tracePath":t.name,"traceSha256":hashfile(t),
          "ticks":report["ticks"],"learnedCreditEvents":report["credits"],
          "sourceInputPolicy":"shared_deterministic_time_varying_external_input"})
    return {"worldId":world,"seedHex":seed,"genesisSha256":hashfile(ck),
      "initialWorldSha256":x["lineageSha256"],"receipts":receipts}
def qa(out):
    x=execute_world("META1-P0",out,scenarios=("intact",))
    # Reproduce the adaptive run independently from the same genesis byte blob.
    dest=out/"repeat";dest.mkdir(exist_ok=True)
    ck=out/"META1-P0.genesis.json"
    a=dest/"repeat.jsonl.gz";s=dest/"repeat.json"
    run("run",RUNTIME,ck,"META1-P0","intact","adaptive",a,s)
    validate(a,"META1-P0","intact","adaptive")
    original=out/"META1-P0__intact__adaptive.jsonl.gz"
    if hashfile(a)!=hashfile(original):
        raise RuntimeError("paired P0 adaptive clean replay not deterministic")
    # Alter the self-cue by setting illegal magnitude; structural checker MUST reject.
    corrupt=dest/"tampered.jsonl.gz"
    with gzip.open(original,"rt") as f:
        rows=f.readlines()
    row=json.loads(rows[100])
    row["selectedCueMagnitude"]=0.99
    rows[100]=json.dumps(row)+"\n"
    with gzip.open(corrupt,"wt") as f:f.writelines(rows)
    try:
        validate(corrupt,"META1-P0","intact","adaptive")
    except ValueError as e:
        if "cue amplitude contract" not in str(e):
            raise RuntimeError("tamper was rejected for wrong reason: "+str(e))
    else:raise RuntimeError("tampered cue was accepted")
    meta={"status":"META1_ENG_TEST_PASS_NOT_SCIENCE","world":"META1-P0",
          "independentAdaptiveTraceReplayedByteIdentical":True,
          "modifiedCueRejected":True,"armReceipts":x["receipts"]}
    (out/"QA_RECEIPT.json").write_text(json.dumps(meta,indent=2)+"\n")
    print(json.dumps({"status":meta["status"],"comparedTraces":3,"replay":True,"tamperReject":True}))
def science(shard,out):
    seal=validate_seal()
    worlds=[f"META1-W{i:02d}" for i in range(shard*8,shard*8+8)]
    receipt=[]
    for world in worlds:
        receipt.append(execute_world(world,out))
        print(json.dumps({"world":world,"status":"SCIENCE_WORLD_TRACES_VERIFIED","arms":6}),flush=True)
    values={
      "schema":"STUDIO08_META1_SHARD_V1","status":"RESULTS_COLLECTED_NOT_INDEPENDENTLY_REEXECUTED",
      "sealSha256":hashfile(SEAL),"shard":shard,"worlds":receipt
    }
    (out/"SHARD_RECEIPT.json").write_text(json.dumps(values,indent=2)+"\n")
    print(json.dumps({"status":"META1_SCIENCE_SHARD_COMPLETE","shard":shard,"worlds":8,"traces":48}),flush=True)
if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--mode",choices=["qa","science"],required=True)
    p.add_argument("--shard",type=int,choices=[0,1,2,3])
    p.add_argument("--output",required=True)
    a=p.parse_args()
    out=Path(a.output).resolve()
    if out.exists():raise RuntimeError("never overwrite output directory")
    out.mkdir(parents=True)
    if a.mode=="qa":qa(out)
    else:
        if a.shard is None:raise RuntimeError("science needs --shard")
        science(a.shard,out)
