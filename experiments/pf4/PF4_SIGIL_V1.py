#!/usr/bin/env python3
"""PF4 / Spare-inspired sigil reduction — PROTOCOL V1, pre-text and unsealed.

Implements only the construction of a second, exploratory PF4 candidate code.
No statement is embedded in this source and no target beacon values are read.
No future-source fetch, no live intake, no signed-source changes.

Protocol identity is the exact UTF-8 bytes of THIS FILE at the reviewed commit.
The experimenter may supply the statement only AFTER this algorithm is locked.

Usage:
  python3 experiments/pf4/PF4_SIGIL_V1.py --self-test
  python3 experiments/pf4/PF4_SIGIL_V1.py --out /tmp/private-pf4-candidate-unique

Second command prompts silently via a TTY. It is compute-intensive:
30 successive whole-history passes × nine lineages × 20,160 steps per pass.
No raw inscription is echoed, saved, or passed on a command line.
It is NOT an automatic statistical test, commitment, encryption or sealing.
"""
from __future__ import annotations
import argparse
import getpass
import hashlib
import json
import math
from pathlib import Path
import subprocess
import sys
import tempfile

CODE_VERSION = "PF4-SIGIL-V1"
DOMAIN = b"AMELIA-PF4-SIGIL-V1\x00"
EDGES = ("0>9","1>8","2>7","3>6","4>5",
         "1>2","2>4","4>7","7>8","8>9","9>1")
N_LINEAGES = 9
N_TICKS = 20160
N_PASSES = 30
ROOT = Path(__file__).resolve().parents[2]
RUNNER = ROOT/"experiments"/"studio"/"code"/"bootstrap_run.mjs"
RUNTIME = ROOT/"experiments"/"studio"/"runtime_mirror"

def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def reduction(statement: str) -> str:
    """Uppercase ASCII A-Z, remove nonletters, preserve FIRST occurrence only.

    Input must be a SINGLE LINE of printable ASCII. No vowels are singled out.
    No Unicode transliteration. The exact newline delimiter is NOT part of text.
    This faithfully fixes a reproducible operation, not an efficacy claim.
    """
    if not statement or len(statement)>256:
        raise ValueError("Statement length must be 1..256 printable ASCII characters.")
    if any(ord(ch)<32 or ord(ch)>126 for ch in statement):
        raise ValueError("Non-ASCII or control character: rejected, never silently changed.")
    letters = "".join(c for c in statement.upper() if "A"<=c<="Z")
    sigil = "".join(dict.fromkeys(letters))
    if not sigil:
        raise ValueError("Statement must contain at least one A..Z letter.")
    return sigil

def world_namespace(statement: str) -> tuple[str,str,str]:
    """Fully specified seed -> input mapping, compatible with bootstrap_run.mjs.

    Once NS is built, each synthetic world tick input is exactly:
       NS + "|" + decimal lineage index (0..8) + "|" + decimal tick (1..20160).
    That runner takes the first byte SHA256 of the string, modulo 10, as cue.
    This source never reads any real beacon byte.
    """
    sigil=reduction(statement)
    digest=sha(DOMAIN + sigil.encode("ascii"))
    ns="PF4S1-"+digest
    # Raw and reduced hashes are metadata, not cryptographic secrecy for phrases.
    return ns, sha(b"PF4-RAW-STATEMENT-V1\x00"+statement.encode("ascii")), digest

def null_code() -> list[dict[str,float]]:
    return [{e:0.0 for e in EDGES} for _ in range(N_LINEAGES)]

def norm(a,b):
    return max(abs(a[k][e]-b[k][e]) for k in range(N_LINEAGES) for e in EDGES)

def validate_code(code):
    if not isinstance(code,list) or len(code)!=N_LINEAGES:
        raise ValueError("Not precisely nine lineages")
    for c in code:
        if set(c)!=set(EDGES):
            raise ValueError("Not precisely eleven expected edges")
        if not all(type(c[e]) in (int,float) and math.isfinite(c[e]) for e in EDGES):
            raise ValueError("Nonfinite inherited code")

def test():
    assert reduction("ABBACD -- AB!")=="ABCD"
    assert reduction("xyz XYZ")=="XYZ"
    assert reduction("A")=="A"
    for s in ("", " 012#$", "á", "ABC\nDEF", "A"*257):
        try: reduction(s)
        except ValueError: pass
        else: raise AssertionError(f"Invalid statement was accepted: {s!r}")
    s="ABBACD -- AB!"
    expected=sha(DOMAIN+b"ABCD")
    ns,raw,d=world_namespace(s)
    assert ns=="PF4S1-"+expected and d==expected
    assert raw==sha(b"PF4-RAW-STATEMENT-V1\x00"+s.encode("ascii"))
    assert reduction(s)==reduction("A B C D")
    print("PF4_SIGIL_PROTOCOL_V1_SELF_TEST_PASS")

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--self-test",action="store_true")
    ap.add_argument("--out",type=str,default=None)
    args=ap.parse_args()
    if args.self_test:
        if args.out: ap.error("--self-test cannot take --out")
        test()
        return
    if not args.out:
        ap.error("After protocol commit, provide --out outside the Git repository.")
    # Avoid re-entry via plain CLI parameters / shell history.
    if not sys.stdin.isatty():
        ap.error("Noninteractive mode disabled: statement must be typed privately at TTY.")
    output=Path(args.out).resolve()
    if not(str(output).startswith("/tmp/") or str(output).startswith("/mnt/data/")):
        ap.error("Only a new /tmp/... or /mnt/data/... output directory is allowed.")
    if output.exists(): ap.error("Output directory must not already exist.")
    if not RUNNER.exists() or not RUNTIME.exists():
        ap.error("Missing frozen studio runner/runtime. Fetch pinned repository commit.")
    statement=getpass.getpass("Write one private PF4 inscription statement: ")
    ns,raw_sha,sigil_sha=world_namespace(statement)
    # Never print or persist original statement or legible reduced sigil.
    del statement
    output.mkdir(parents=True,exist_ok=False)
    v=null_code()
    checkpoints=[]
    with tempfile.TemporaryDirectory(prefix="working-",dir=output) as wd:
        work=Path(wd)
        for n in range(N_PASSES):
            before=work/"start.json"
            after=work/"result.json"
            before.write_text(json.dumps(v,separators=(",",":"),allow_nan=False))
            p=subprocess.run(
                ["node","--experimental-strip-types","--no-warnings",
                 str(RUNNER),str(RUNTIME),"learner",str(N_LINEAGES),
                 str(N_TICKS),ns,str(after),str(before)],
                cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,text=True,
                check=False)
            if p.returncode:
                # Error is local tooling only; never outputs the statement.
                raise RuntimeError("Frozen studio runner failed: "+p.stderr[-1000:])
            data=json.loads(after.read_text())
            if data["ns"]!=ns or data["ticks"]!=N_TICKS or len(data["lineages"])!=N_LINEAGES:
                raise RuntimeError("Studio world domain or cohort mismatch")
            nxt=[l["finalVFull"] for l in data["lineages"]]
            validate_code(nxt)
            checkpoints.append({"pass":n,"deaths":sum(len(l["lives"]) for l in data["lineages"]),
                "maxChange":norm(v,nxt),
                "traceSha256":[l["traceSha256"] for l in data["lineages"]]})
            v=nxt
            print(f"PF4_SIGIL_V1 pass {n+1}/{N_PASSES} complete",flush=True)
    code_json=json.dumps(v,separators=(",",":"),ensure_ascii=True,allow_nan=False)+"\n"
    (output/"PF4_SIGIL_V1_CANDIDATE.json").write_bytes(code_json.encode("utf-8"))
    record={"schema":"PF4_SIGIL_V1_CANDIDATE_DESIGN_ONLY",
            "sealed":False,"registered":False,"futureBeaconQueried":False,
            "protocolSourceSha256":sha(Path(__file__).read_bytes()),
            "studioRunnerSha256":sha(RUNNER.read_bytes()),
            "studioRuntimeRoot":"experiments/studio/runtime_mirror",
            "originalStatementSha256":raw_sha,"reducedSigilSha256":sigil_sha,
            "worldNamespace":ns,
            "candidateSha256":sha(code_json.encode("utf-8")),
            "lineages":N_LINEAGES,"edgeCount":len(EDGES),
            "ticksPerPass":N_TICKS,"passes":N_PASSES,
            "inputRule":"PF4S1-SHA256(sigil) | k | tick",
            "checkpoints":checkpoints,
            "warning":"Do not interpret this as a sealed timestamp or knowledge of future rounds."}
    (output/"PF4_SIGIL_V1_DERIVATION_AUDIT.json").write_text(
         json.dumps(record,indent=2,allow_nan=False)+"\n")
    print("PF4_SIGIL_V1_DESIGN_DERIVATION_COMPLETE "
          +json.dumps({"candidateSha256":record["candidateSha256"],
                       "sourceSha256":record["protocolSourceSha256"],
                       "sealed":False,"futureBeaconQueried":False}))

if __name__=="__main__":
    main()
