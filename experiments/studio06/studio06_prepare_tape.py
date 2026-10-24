#!/usr/bin/env python3
"""Studio 06: READ-ONLY, fail-closed PF-2 Quicknet tape extraction.

This file does not run the Stone Tape, write to PF-2, or perform live intake.
--inspect: structural diagnostic, *not* BLS verification or scientific evidence.
--write: requires existing authoritative PF2_LIVE_CHECK + PF2_REPLAY to PASS first.
No complete 20,160-tick window -> no tape output.
Run from the repository root. Python stdlib; Node22 required for --write.
"""
import argparse
import hashlib
import json
import pathlib
import re
import subprocess
import sys

HEX64 = re.compile(r"^[0-9a-f]{64}$")
HEX = re.compile(r"^[0-9a-fA-F]+$")
NAME = re.compile(r"^[0-9]{8}\.json$")
EXPECTED_VERIFICATION = "REAL_QUICKNET_BLS_VERIFIED_WITH_PINNED_C1_PF1"
LENGTH = 20160
STEP = 20

def need(ok, message):
    if not ok:
        raise RuntimeError(message)

def digest_bytes(blob):
    return hashlib.sha256(blob).hexdigest()

def ref_input(raw_hex, k):
    """Mirror PF2_REFERENCE_INPUT.mjs. k=0 uses raw hex; k=1..8 domain hash."""
    need(bool(HEX64.fullmatch(raw_hex)), "not 32-byte randomness hex")
    need(0 <= k <= 8, "reference arm out of range")
    if k == 0:
        return raw_hex
    return digest_bytes(("PF2-REF-" + str(k) + "|").encode("ascii") + bytes.fromhex(raw_hex))

def inspect_archive(root):
    root = pathlib.Path(root)
    genesis = json.loads((root / "GENESIS.json").read_bytes())
    need(genesis.get("schema") == "PF2_LIVE_GENESIS_V1", "unexpected genesis schema")
    r0 = genesis["R0"]
    need(isinstance(r0, int), "invalid R0")
    g_digest = genesis["genesisDigest"]
    previous = g_digest
    count = 0
    selected = []
    names = sorted(p for p in (root / "chunks").iterdir() if NAME.fullmatch(p.name))
    need(bool(names), "no published chunks")
    for p in names:
        chunk = json.loads(p.read_bytes())
        need(int(p.stem) == count == chunk.get("startTick"), "chunk start or missing tick: " + p.name)
        need(chunk.get("genesisDigest") == g_digest, "genesis digest differs: " + p.name)
        need(chunk.get("previousHead") == previous, "cross-chunk head broken: " + p.name)
        need(chunk.get("verifiedStatus") == "PASS", "chunk not verified PASS: " + p.name)
        need(bool(re.fullmatch(r"[0-9a-f]{64}", str(chunk.get("rfc3161TokenSHA256", "")))),
             "missing chunk token digest: " + p.name)
        rows = chunk.get("rows")
        need(isinstance(rows, list) and len(rows) == chunk.get("count") and len(rows) > 0,
             "row/count mismatch: " + p.name)
        for row in rows:
            need(row.get("tick") == count, "noncontiguous 0-based tick")
            need(row.get("round") == r0 + STEP * count, "wrong Quicknet round")
            need(row.get("previous") == previous, "row previous digest mismatch")
            need(row.get("verification") == EXPECTED_VERIFICATION,
                 "row lacks upstream BLS-verified marker")
            randomness = row.get("randomness")
            signature = row.get("signature")
            need(isinstance(randomness, str) and bool(HEX64.fullmatch(randomness)),
                 "invalid randomness format")
            need(isinstance(signature, str) and bool(HEX.fullmatch(signature)) and
                 len(signature) % 2 == 0, "invalid signature hex")
            need(digest_bytes(bytes.fromhex(signature)) == randomness,
                 "randomness != SHA256(signature)")
            need(isinstance(row.get("roundTime"), int), "invalid release time")
            need(re.fullmatch(r"[0-9a-f]{64}", str(row.get("digest", ""))) is not None,
                 "invalid linked row digest")
            selected.append({"tick": count, "round": row["round"],
                             "roundTime": row["roundTime"], "randomness": randomness})
            previous = row["digest"]
            count += 1
        need(previous == chunk.get("finalHead"), "chunk terminal digest mismatch: " + p.name)
    return {"genesisDigest": g_digest, "R0": r0, "chunks": len(names),
            "ticks": count, "head": previous, "rows": selected}

def verify_upstream():
    # Read-only checks; PF-2 owns the scientific admission and seals.
    for command in ([sys.executable, "experiments/pf2/PF2_LIVE_CHECK.py"],
                    ["node", "--experimental-strip-types", "--no-warnings",
                     "experiments/pf2/PF2_REPLAY.mjs"]):
        result = subprocess.run(command, check=False)
        need(result.returncode == 0, "authoritative upstream verification failed: " +
             " ".join(command))

def write_window(result, start, length, output):
    need(length == LENGTH, "studio 06 requires exactly 20,160 ticks")
    need(start >= 0 and start + length <= result["ticks"],
         "INCOMPLETE: only " + str(result["ticks"]) +
         " contiguous published ticks exist; requested " + str(start + length))
    need(start % LENGTH == 0, "PF-2 window start must be a non-overlapping 14-day boundary")
    rows = result["rows"][start:start + length]
    manifest = {
        "schema": "STUDIO06_AUTHENTIC_QUICKNET_WINDOW_V1",
        "origin": "PF2_LIVE_CHECK_AND_PF2_REPLAY_VERIFIED_READ_ONLY",
        "genesisDigest": result["genesisDigest"],
        "R0": result["R0"],
        "windowStartTick": start,
        "length": length,
        "strideRounds": STEP,
        "referenceDomain": "PF2-REF-i|",
        "originalPF2HeadAtExtraction": result["head"],
        "originalPF2AdmittedTicksAtExtraction": result["ticks"],
        "rawRowsSha256": digest_bytes(json.dumps(rows, sort_keys=True,
                                                separators=(",", ":")).encode()),
        "rows": rows,
    }
    out = pathlib.Path(output)
    need(not out.exists(), "refusing to overwrite existing output: " + str(out))
    need(out.parent.exists(), "output directory must exist (avoid surprises)")
    payload = (json.dumps(manifest, sort_keys=True, separators=(",", ":")) + "\n").encode()
    tmp = out.with_name(out.name + ".studio06-tmp")
    need(not tmp.exists(), "temporary output already exists")
    tmp.write_bytes(payload)
    tmp.rename(out)
    print(json.dumps({"status": "READY_FOR_STUDIO05_ADAPTER",
                      "file": str(out), "sha256": digest_bytes(payload),
                      "firstRound": rows[0]["round"], "lastRound": rows[-1]["round"],
                      "ticks": length, "NOT_A_STONE_TAPE_RESULT": True}, sort_keys=True))

def main():
    p = argparse.ArgumentParser(description=__doc__)
    group = p.add_mutually_exclusive_group(required=True)
    group.add_argument("--inspect", action="store_true")
    group.add_argument("--write", metavar="OUTPUT_PATH")
    p.add_argument("--root", default="experiments/pf2/live")
    p.add_argument("--window-start", type=int, default=0)
    p.add_argument("--ticks", type=int, default=LENGTH)
    args = p.parse_args()
    if args.write:
        verify_upstream()
    result = inspect_archive(args.root)
    if args.inspect:
        print(json.dumps({
            "status": "STRUCTURAL_ONLY_NOT_BLS_AUDIT",
            "chunks": result["chunks"], "contiguousTicks": result["ticks"],
            "availableComplete14dayWindows": result["ticks"] // LENGTH,
            "firstRound": result["rows"][0]["round"],
            "lastRound": result["rows"][-1]["round"],
            "readyForReplication": result["ticks"] >= LENGTH,
            "noFilesWritten": True
        }, sort_keys=True))
    else:
        write_window(result, args.window_start, args.ticks, args.write)

if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, FileNotFoundError, ValueError, KeyError, json.JSONDecodeError) as exc:
        print("STUDIO06_INPUT_BLOCKED:", str(exc), file=sys.stderr)
        sys.exit(2)
