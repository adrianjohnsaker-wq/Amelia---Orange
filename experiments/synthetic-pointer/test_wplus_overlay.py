#!/usr/bin/env python3
"""Test the hash-locked W+ overlay builder using the operator-supplied runner."""
import hashlib
import importlib.util
import sys
import tempfile
from pathlib import Path

if len(sys.argv) != 2:
    raise SystemExit("usage: python3 test_wplus_overlay.py /path/to/caesura4.txt")
source = Path(sys.argv[1])
module_file = Path(__file__).with_name("build_wplus_overlay.py")
spec = importlib.util.spec_from_file_location("build_wplus_overlay", module_file)
module = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(module)
before = source.read_bytes()
assert hashlib.sha256(before).hexdigest() == module.EXPECTED_SOURCE_SHA256
with tempfile.TemporaryDirectory(prefix="sxi-wplus-test-") as directory:
    root = Path(directory)
    overlay = root / "overlay.mjs"
    generated_hash = module.build(source, overlay)
    assert generated_hash == hashlib.sha256(overlay.read_bytes()).hexdigest()
    assert b"SXI W+ overlay v1" in overlay.read_bytes()
    try:
        module.build(source, overlay)
        raise AssertionError("existing output was overwritten")
    except FileExistsError:
        pass
    altered = root / "altered.txt"
    altered.write_bytes(before + b"\n")
    try:
        module.build(altered, root / "must-not-exist.mjs")
        raise AssertionError("altered runner was accepted")
    except ValueError as error:
        assert "SHA-256 mismatch" in str(error)
    assert not (root / "must-not-exist.mjs").exists()
assert source.read_bytes() == before
print("PASS: exact source guard, deterministic output, tamper rejection, create-only output")
