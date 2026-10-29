"""PF S1 pre-seal unit (operational only): no live input, no lease, no repository writes.
1. Static: each S1 catch-up is its original byte for byte plus added lines only, every one marked PF_S1 or a header comment.
2. In a throwaway `git archive HEAD` copy, PF-1 STATE.json and SILENT_LEDGER.json and PF-2 STATE.json are split into
   shards, deleted, and joined back; the bytes must be identical (SHA-256). A corrupted shard must be refused; growth must
   re-split cleanly.
3. The unchanged pinned verifiers PF1_LIVE_CHECK.py and PF2_LIVE_CHECK.py must pass on the joined copies.
   python PF_S1_UNIT.py <c1-pin dir>
"""
import difflib, hashlib, os, pathlib, shutil, subprocess, sys, tempfile
REPO = pathlib.Path.cwd(); sys.path.insert(0, str(REPO / "experiments/pf_storage"))
import PF_SHARD
sha = lambda p: hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
PAIRS = [("experiments/pf1/operations/PF1_A1_CATCHUP.py", "experiments/pf1/operations/PF1_A1_CATCHUP_S1.py"),
         ("experiments/pf2/PF2_A1_CATCHUP_AD1.py", "experiments/pf2/PF2_A1_CATCHUP_S1.py")]
FILES = ["experiments/pf1/live/STATE.json", "experiments/pf1/live/SILENT_LEDGER.json", "experiments/pf2/live/STATE.json"]

def static():
    for a, b in PAIRS:
        A, B = (REPO / a).read_text().splitlines(), (REPO / b).read_text().splitlines()
        ops = difflib.SequenceMatcher(a=A, b=B, autojunk=False).get_opcodes()
        assert all(t in ("equal", "insert") for t, *_ in ops), "PF_S1_ORIGINAL_LINE_CHANGED " + b
        added = [l for t, i1, i2, j1, j2 in ops if t == "insert" for l in B[j1:j2]]
        assert all("PF_S1" in l or l.startswith("# ") for l in added), "PF_S1_UNMARKED_ADDITION " + b
        print("PF_S1_STATIC_ADDITIVE_ONLY", b, len(added), "lines added, 0 changed")

def dynamic(c1pin):
    with tempfile.TemporaryDirectory() as td:
        copy = pathlib.Path(td) / "orange"; copy.mkdir()
        tar = subprocess.run(["git", "archive", "HEAD"], cwd=REPO, capture_output=True, check=True).stdout
        subprocess.run(["tar", "-x", "-C", str(copy)], input=tar, check=True)
        for f in FILES:
            p = copy / f; s0 = sha(p)
            PF_SHARD.split(p); p.unlink(); PF_SHARD.join(p)
            assert sha(p) == s0, "PF_S1_ROUND_TRIP_CHANGED_BYTES " + f
            print("PF_S1_ROUND_TRIP_IDENTICAL", f, s0, len(list(PF_SHARD.shard_dir(p).glob("part-*.bin"))), "parts")
        # a corrupted shard must be refused
        part = sorted(PF_SHARD.shard_dir(copy / FILES[0]).glob("part-*.bin"))[0]
        good = part.read_bytes(); part.write_bytes(good[:-1] + bytes([good[-1] ^ 1]))
        try: PF_SHARD.join(copy / FILES[0]); raise AssertionError("PF_S1_CORRUPTION_NOT_DETECTED")
        except AssertionError as e:
            if "NOT_DETECTED" in str(e): raise
            print("PF_S1_CORRUPT_SHARD_REFUSED")
        part.write_bytes(good); PF_SHARD.join(copy / FILES[0])
        # growth re-splits cleanly (stale parts removed)
        g = pathlib.Path(td) / "grow.bin"; g.write_bytes(os.urandom(PF_SHARD.PART * 2 + 5)); PF_SHARD.split(g)
        g.write_bytes(os.urandom(PF_SHARD.PART + 7)); PF_SHARD.split(g); assert len(list(PF_SHARD.shard_dir(g).glob("part-*.bin"))) == 2
        g.unlink(); PF_SHARD.join(g); print("PF_S1_GROWTH_AND_SHRINK_RESPLIT_PASS")
        env = dict(os.environ, PYTHONPATH=str(c1pin), DRIFT_C1_ENABLE_LIVE="false", PYTHONDONTWRITEBYTECODE="1")
        for script, extra in (("experiments/pf1/PF1_LIVE_CHECK.py", {"PF1_REMOTE_LEASE_ACKNOWLEDGED": "true"}), ("experiments/pf2/PF2_LIVE_CHECK.py", {})):
            r = subprocess.run([sys.executable, script], cwd=copy, env={**env, **extra}, capture_output=True, text=True)
            assert r.returncode == 0, "PF_S1_PINNED_VERIFIER_FAILED " + script + "\n" + r.stdout[-800:] + r.stderr[-800:]
            print("PF_S1_PINNED_VERIFIER_PASS_ON_JOINED_BYTES", script, r.stdout.strip().splitlines()[-1][:220])

if __name__ == "__main__":
    static(); dynamic(sys.argv[1] if len(sys.argv) > 1 else os.environ["PF_C1_PIN"])
    print("PF_S1_UNIT_PASS")
