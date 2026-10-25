#!/usr/bin/env python3
"""Studio08 original-project import admission.

Reads original source bytes only. It never constructs a new Studio07 world.
First verifies the complete role manifest and all original eight intact/lesion
states, then invokes read-only TypeScript AST inventory on the SHA256-pinned
original Studio07 runner. The AST report is a REVIEW QUEUE, not proof of
complete hash-input dependence. No Studio08 scientific run is started.
"""
import argparse
import json
from pathlib import Path
import subprocess
import sys

from archive_gate import validate as source_validate, _resolve
from studio07_world_checkpoint_gate import validate as world_validate

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--archive-root",required=True)
    p.add_argument("--source-manifest",required=True)
    p.add_argument("--checkpoint-index",required=True)
    args=p.parse_args()
    root=Path(args.archive_root).resolve()
    src=source_validate(root,args.source_manifest)
    states=world_validate(root,args.checkpoint_index)
    runner=next((entry for entry in src["files"] if
                 entry["role"]=="studio07_runner"),None)
    if runner is None:
        raise RuntimeError("original Studio07 runner not in verified manifest")
    original=_resolve(root,runner["path"])
    inv=Path(__file__).with_name("studio07_serializer_inventory.mjs")
    cmd=["node",str(inv),"--source",str(original),
         "--sha256",runner["sha256"]]
    run=subprocess.run(cmd,capture_output=True,text=True,check=False)
    if run.returncode!=0:
        raise RuntimeError("original source inventory failed: "+run.stderr[:1500])
    scan=json.loads(run.stdout)
    print(json.dumps({
      "status":"STUDIO08_ORIGINAL_IMPORT_CUSTODY_PASS_NOT_SCIENTIFIC_REPLAY",
      "verifiedSourceFiles":src["roles"],
      "verifiedWorldPairs":states["verifiedPairs"],
      "verifiedWorldStateReferences":states["verifiedWorldStateReferences"],
      "sourceRunnerSha256":runner["sha256"],
      "sourceRunner":runner["path"],
      "originalCodeExecuted":False,
      "scientificRunPerformed":False,
      "manualReviewStillRequired":True,
      "originalSourceHashCandidateInventory":scan,
    },sort_keys=True))

if __name__=="__main__":
    try:main()
    except (OSError,KeyError,ValueError,RuntimeError,json.JSONDecodeError) as e:
        print("STUDIO08_ORIGINAL_IMPORT_BLOCKED:",e,file=sys.stderr)
        sys.exit(2)
