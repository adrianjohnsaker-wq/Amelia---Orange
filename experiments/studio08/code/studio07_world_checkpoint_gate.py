#!/usr/bin/env python3
"""Studio 08 — verify all eight ORIGINAL Studio07 checkpoint pairs by bytes.

This is a READ-ONLY, fail-closed import gate. It does not recreate missing
worlds, infer their states or run science. A world pair is a pair of original
checkpoint *files* copied unchanged from the already-existing project archive.

Manifest schema:
{
  "schema":"STUDIO08_EIGHT_WORLD_ORIGINAL_CHECKPOINTS_V1",
  "source":"operator_working_project_original",
  "worlds":[
    {"worldId":"W00",
     "intact":{"path":"...","sha256":"<64 hex>"},
     "lesion":{"path":"...","sha256":"<64 hex>"}}
     ... W01..W07 ...
  ]
}

If checkpoint data were originally embedded in another file, archive the
original exact file and document its addressable ranges in an independently
reviewed adapter; DO NOT extract and relabel a new file as original bytes.
"""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import tempfile

WORLD_IDS=tuple(f"W{i:02d}" for i in range(8))
SCHEMA="STUDIO08_EIGHT_WORLD_ORIGINAL_CHECKPOINTS_V1"
SOURCE="operator_working_project_original"

def need(condition, message):
    if not condition: raise ValueError(message)

def safe_file(root,path):
    need(isinstance(path,str) and path and "\\" not in path,"nonempty posix-relative path required")
    parts=PurePosixPath(path)
    need(not parts.is_absolute() and parts.parts and
         all(p not in (".","..") for p in parts.parts) and
         not str(parts).startswith("~"), "unsafe path: "+path)
    dest=(root/path).resolve()
    need(dest.is_relative_to(root),"path escapes archive: "+path)
    need(dest.is_file(),"original checkpoint missing: "+path)
    need(dest.stat().st_size>0,"original checkpoint empty: "+path)
    return dest

def digest(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for block in iter(lambda:f.read(1024*1024),b""):
            h.update(block)
    return h.hexdigest()

def resolve_json_pointer(file, locator):
    """Check a world checkpoint inside an ORIGINAL shared JSON file, without extraction."""
    need(isinstance(locator,str) and locator.startswith("/") and len(locator)>1,
         "shared checkpoint requires nonempty RFC6901 JSON pointer")
    try: value=json.loads(file.read_bytes())
    except (ValueError, UnicodeDecodeError) as e:
        raise ValueError("JSON pointer source must be an original JSON file") from e
    for raw in locator.split("/")[1:]:
        need(not any(raw[i]=="~" and
                     (i+1>=len(raw) or raw[i+1] not in "01")
                     for i in range(len(raw))), "invalid JSON pointer escape")
        key=raw.replace("~1","/").replace("~0","~")
        if isinstance(value,dict):
            need(key in value,"missing JSON pointer segment")
            value=value[key]
        elif isinstance(value,list):
            need(key.isdigit() and (key=="0" or not key.startswith("0")),
                 "invalid array index in JSON pointer")
            idx=int(key)
            need(idx<len(value),"array index out of range in JSON pointer")
            value=value[idx]
        else:
            raise ValueError("JSON pointer traverses scalar")
    need(isinstance(value,(dict,list)) and len(value)>0,
         "checkpoint JSON pointer must select a nonempty state object or array")
    return value

def validate(root, manifest):
    root=Path(root).resolve()
    data=json.loads(Path(manifest).read_bytes())
    need(data.get("schema")==SCHEMA,"wrong checkpoint index schema")
    need(data.get("source")==SOURCE,"must reference operator's original project")
    worlds=data.get("worlds")
    need(isinstance(worlds,list) and len(worlds)==len(WORLD_IDS),
         "exactly eight independently identifiable checkpoint pairs required")
    worldids=[x.get("worldId") for x in worlds if isinstance(x,dict)]
    need(tuple(sorted(worldids))==WORLD_IDS,
         "world IDs must be unique exactly W00..W07")
    used=set()
    physical_files=set()
    verified=[]
    for row in worlds:
        rid=row["worldId"]
        digests={}
        for phase in ("intact","lesion"):
            entry=row.get(phase)
            need(isinstance(entry,dict),f"{rid} missing {phase} checkpoint")
            path=entry.get("path")
            expected=entry.get("sha256")
            need(isinstance(expected,str) and len(expected)==64 and
                 all(ch in "0123456789abcdef" for ch in expected),
                 f"{rid} invalid SHA256 for {phase}")
            locator=entry.get("locator")
            need(locator is None or (isinstance(locator,str) and
                                     locator.startswith("/")),
                 "invalid checkpoint locator")
            identity=(path,locator)
            need(identity not in used,f"checkpoint path/locator reused: {path} {locator}")
            used.add(identity)
            file=safe_file(root,path)
            actual=digest(file)
            need(actual==expected,
                 f"{rid} original SHA256 mismatch in {phase}: {path}")
            if locator is not None:
                resolve_json_pointer(file,locator)
            physical_files.add(path)
            digests[phase]={"path":path,"sha256":actual,
                            "bytes":file.stat().st_size,"locator":locator}
        verified.append({"worldId":rid,**digests})
    return {"status":"STUDIO08_EIGHT_ORIGINAL_WORLD_CHECKPOINT_HASHES_PASS_NOT_REPLAY",
            "worlds":verified, "verifiedPairs":len(verified),
            "verifiedSourceFiles":len(physical_files),
            "verifiedWorldStateReferences":len(used),
            "scienceRun":False,
            "allSourceFilesReadOnly":True}

def selftest():
    with tempfile.TemporaryDirectory() as directory:
        root=Path(directory)
        worlds=[]
        for wid in WORLD_IDS:
            row={"worldId":wid}
            for phase in ("intact","lesion"):
                path=f"{wid}-{phase}.json"
                payload=json.dumps({"fixture":"NOT_SCIENCE","worldId":wid,
                                    "phase":phase},sort_keys=True).encode()+b"\n"
                (root/path).write_bytes(payload)
                row[phase]={"path":path,"sha256":hashlib.sha256(payload).hexdigest()}
            worlds.append(row)
        m={"schema":SCHEMA,"source":SOURCE,"worlds":worlds}
        path=root/"index.json"
        path.write_text(json.dumps(m))
        need(validate(root,path)["verifiedPairs"]==8,"positive QA fixture rejected")
        # A missing checkpoint, digest change, duplicate and incomplete archive reject.
        cases=1
        destination=root/"W02-lesion.json"
        old=destination.read_bytes()
        destination.write_bytes(b"changed\n")
        try:
            validate(root,path);raise AssertionError("tampering not rejected")
        except ValueError as e: need("SHA256 mismatch" in str(e),"unexpected rejection")
        cases+=1
        destination.write_bytes(old)
        m["worlds"][2]["lesion"]["path"]="W00-intact.json"
        path.write_text(json.dumps(m))
        try:
            validate(root,path);raise AssertionError("path reuse not rejected")
        except ValueError as e: need("reused" in str(e),"unexpected reuse rejection")
        cases+=1
        m["worlds"][2]["lesion"]["path"]="W02-lesion.json"
        m["worlds"].pop()
        path.write_text(json.dumps(m))
        try:
            validate(root,path);raise AssertionError("seven worlds not rejected")
        except ValueError as e: need("exactly eight" in str(e),"unexpected size rejection")
        cases+=1
        # A single original combined JSON containing 16 states must be addressable
        # without splitting it into unoriginal files. All selectors are distinct.
        joined={wid:{"intact":{"state":"intact","wid":wid},
                     "lesion":{"state":"lesion","wid":wid}} for wid in WORLD_IDS}
        combined=root/"combined.json"
        combined.write_bytes(json.dumps({"worlds":joined}).encode())
        combined_sha=digest(combined)
        m["worlds"]=[{"worldId":wid,
                     "intact":{"path":"combined.json","sha256":combined_sha,
                               "locator":f"/worlds/{wid}/intact"},
                     "lesion":{"path":"combined.json","sha256":combined_sha,
                               "locator":f"/worlds/{wid}/lesion"}} for wid in WORLD_IDS]
        path.write_text(json.dumps(m))
        result=validate(root,path)
        need(result["verifiedWorldStateReferences"]==16 and
             result["verifiedSourceFiles"]==1,
             "failed to resolve all states in original single source")
        cases+=1
        print(json.dumps({"status":"STUDIO08_EIGHT_WORLD_GATE_SELFTEST_PASS",
                          "cases":cases,"fixtureOnly":True,"scientificWorldsImported":0}))

if __name__=="__main__":
    ap=argparse.ArgumentParser()
    which=ap.add_mutually_exclusive_group(required=True)
    which.add_argument("--check",action="store_true")
    which.add_argument("--self-test",action="store_true")
    ap.add_argument("--archive-root")
    ap.add_argument("--manifest")
    args=ap.parse_args()
    if args.self_test: selftest()
    else:
        need(bool(args.archive_root and args.manifest),
             "--archive-root and --manifest required")
        print(json.dumps(validate(args.archive_root,args.manifest),sort_keys=True))
