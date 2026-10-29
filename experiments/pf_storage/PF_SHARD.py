"""PF S1 storage (operational only; NOT a scientific source).

A live state file is kept in Git as fixed-size byte slices plus a manifest (`<file>.shards/`), and is joined back
to its exact bytes, SHA-256 checked, before any pinned PF-1/PF-2 code reads it. The pinned code reads and writes
the same full file as before; only how Git stores it changes. GitHub refuses any single file over 100 MiB.

  python PF_SHARD.py split <file> [...]    write <file>.shards/ from the current full file
  python PF_SHARD.py join <file> [...]     rebuild <file> from its shards (exact bytes, verified)
  python PF_SHARD.py verify <file> [...]   check that <file> and its shards agree
"""
import hashlib, json, os, pathlib, sys

PART = 40_000_000   # bytes per slice, well under GitHub's 100 MiB per-file limit
sha = lambda b: hashlib.sha256(b).hexdigest()

def shard_dir(path):
    p = pathlib.Path(path)
    return p.with_name(p.name + ".shards")

def split(path):
    p = pathlib.Path(path); raw = p.read_bytes(); d = shard_dir(p); d.mkdir(exist_ok=True)
    parts = []
    for i in range(0, max(len(raw), 1), PART):
        b = raw[i:i + PART]; name = f"part-{i // PART:03d}.bin"
        (d / name).write_bytes(b); parts.append({"name": name, "size": len(b), "sha256": sha(b)})
    keep = {x["name"] for x in parts}
    for old in d.glob("part-*.bin"):
        if old.name not in keep: old.unlink()
    manifest = {"schema": "PF_S1_SHARDS_V1", "file": p.name, "size": len(raw), "sha256": sha(raw), "partSize": PART, "parts": parts}
    (d / "MANIFEST.json").write_text(json.dumps(manifest, indent=1, sort_keys=True) + "\n")
    assert verify(p), "PF_S1_SPLIT_DID_NOT_ROUND_TRIP " + str(p)
    return manifest

def _assemble(path):
    d = shard_dir(path); m = json.loads((d / "MANIFEST.json").read_text())
    assert m["schema"] == "PF_S1_SHARDS_V1" and m["file"] == pathlib.Path(path).name
    names = sorted(x.name for x in d.glob("part-*.bin"))
    assert names == [x["name"] for x in m["parts"]], "PF_S1_SHARD_SET_MISMATCH " + str(path)
    raw = b""
    for x in m["parts"]:
        b = (d / x["name"]).read_bytes()
        assert len(b) == x["size"] and sha(b) == x["sha256"], "PF_S1_SHARD_CORRUPT " + x["name"]
        raw += b
    assert len(raw) == m["size"] and sha(raw) == m["sha256"], "PF_S1_JOIN_MISMATCH " + str(path)
    return raw, m

def join(path):
    p = pathlib.Path(path); raw, m = _assemble(p)
    tmp = p.with_name("." + p.name + ".pf_s1_join.tmp")
    tmp.write_bytes(raw); os.replace(tmp, p)
    assert sha(p.read_bytes()) == m["sha256"]
    return m["sha256"]

def verify(path):
    p = pathlib.Path(path); raw, m = _assemble(p)
    return p.exists() and sha(p.read_bytes()) == m["sha256"]

def present(path): return (shard_dir(path) / "MANIFEST.json").exists()
def join_all(paths): return {str(p): join(p) for p in paths if present(p)}
def split_all(paths): return {str(p): split(p)["sha256"] for p in paths if pathlib.Path(p).exists()}

if __name__ == "__main__":
    op, files = sys.argv[1], sys.argv[2:]
    for f in files:
        if op == "split": print("PF_S1_SPLIT", f, split(f)["sha256"])
        elif op == "join": print("PF_S1_JOIN", f, join(f))
        elif op == "verify": assert verify(f), "PF_S1_VERIFY_FAIL " + f; print("PF_S1_VERIFY_PASS", f)
        else: raise SystemExit("usage: PF_SHARD.py split|join|verify <file> ...")
