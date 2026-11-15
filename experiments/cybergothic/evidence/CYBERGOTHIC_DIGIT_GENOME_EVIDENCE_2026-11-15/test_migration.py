import json
import subprocess
import sys
import unittest
from pathlib import Path


class MigrationTests(unittest.TestCase):
    def test_literal_mode_matches_three_frozen_parent_projections(self):
        references=json.loads(Path('reference_literal_hashes.json').read_text())
        for seed,expected in references.items():
            p=subprocess.run([sys.executable,'migration_projection.py',seed],text=True,capture_output=True,check=True)
            self.assertEqual(json.loads(p.stdout),expected)


if __name__=='__main__':unittest.main()
