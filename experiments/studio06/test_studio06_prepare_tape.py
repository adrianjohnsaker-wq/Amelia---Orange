#!/usr/bin/env python3
"""Read-only engineering tests. Constructed fixture: NO new scientific observations."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

MODULE = Path(__file__).with_name("studio06_prepare_tape.py")
spec = importlib.util.spec_from_file_location("studio06_prepare_tape", MODULE)
s = importlib.util.module_from_spec(spec)
spec.loader.exec_module(s)

SIG = ("975c078949efe3f8267a3653b9305784f566d2dea235ea12dcae2fb8adfbd9"
       "f73797277d72b0a18186c81edc57fae519")
RAND = "842d051853231ab4c713dd50ca8d243d67b1c551f3e5be174ccac621f2e33546"

class TestStudio06Tape(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "chunks").mkdir()
        self.g = {"schema": "PF2_LIVE_GENESIS_V1", "genesisDigest": "0" * 64,
                  "R0": 33298740}
        self.row = {"tick": 0, "round": 33298740, "roundTime": 1792699584,
                    "randomness": RAND, "signature": SIG,
                    "verification": s.EXPECTED_VERIFICATION,
                    "previous": "0" * 64, "digest": "a" * 64}
        self.chunk = {"startTick": 0, "genesisDigest": "0" * 64,
                      "previousHead": "0" * 64, "finalHead": "a" * 64,
                      "verifiedStatus": "PASS", "rfc3161TokenSHA256": "1" * 64,
                      "count": 1, "rows": [self.row]}

    def save(self):
        (self.root / "GENESIS.json").write_text(json.dumps(self.g))
        (self.root / "chunks" / "00000000.json").write_text(json.dumps(self.chunk))

    def test_pf2_mapping_exact_vectors(self):
        self.assertEqual(s.ref_input("00" * 32, 0), "00" * 32)
        self.assertEqual(s.ref_input("00" * 32, 1),
            "832e36ecaf79197a6f6a31dc40306ef187185db110ad4cdc464907b5d3bd6108")
        self.assertEqual(s.ref_input("00" * 32, 8),
            "2fa7c614fc47ad87a05b3835dcd83d5f9560e7ffa94700995551a09c8d020cc1")

    def test_one_verified_fixture_is_structurally_readable(self):
        self.save()
        r = s.inspect_archive(self.root)
        self.assertEqual(r["ticks"], 1)
        self.assertEqual(r["rows"][0]["randomness"], RAND)

    def test_false_signature_is_rejected(self):
        self.row["randomness"] = "f" * 64
        self.save()
        with self.assertRaisesRegex(RuntimeError, "randomness != SHA256"):
            s.inspect_archive(self.root)

    def test_round_gap_is_rejected(self):
        self.row["round"] += 20
        self.save()
        with self.assertRaisesRegex(RuntimeError, "wrong Quicknet round"):
            s.inspect_archive(self.root)

    def test_incomplete_window_emits_no_tape(self):
        self.save()
        result = s.inspect_archive(self.root)
        dest = self.root / "tape.json"
        with self.assertRaisesRegex(RuntimeError, "INCOMPLETE"):
            s.write_window(result, 0, 20160, dest)
        self.assertFalse(dest.exists())

    def test_old_chunk_head_is_rejected(self):
        self.chunk["finalHead"] = "f" * 64
        self.save()
        with self.assertRaisesRegex(RuntimeError, "terminal digest"):
            s.inspect_archive(self.root)

if __name__ == "__main__":
    unittest.main()
