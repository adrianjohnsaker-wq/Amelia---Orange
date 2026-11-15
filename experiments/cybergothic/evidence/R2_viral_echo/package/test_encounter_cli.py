import json
import subprocess
import sys
import tempfile
import unittest
from collections import Counter
from pathlib import Path
from encounter_trial import EncounterJournal,create_root,find_encounter
from reactor import digest

class EncounterCliTests(unittest.TestCase):
    def test_cli_makes_separate_branch_and_preserves_source(self):
        with tempfile.TemporaryDirectory() as d:
            source=Path(d)/"source.sqlite";out=Path(d)/"out.sqlite"
            w=create_root(31991);find_encounter(w,set(),set(),198.,Counter());before=digest(w.snapshot())
            j=EncounterJournal(source);j.save(w);j.close()
            q=subprocess.run([sys.executable,"encounter_cli.py","status","--db",str(source)],check=True,capture_output=True,text=True)
            self.assertEqual(json.loads(q.stdout)["state_sha256"],before)
            subprocess.run([sys.executable,"encounter_cli.py","branch","--db",str(source),"--output",str(out),
                            "--condition","shuffled","--duration","2"],check=True,capture_output=True,text=True)
            j=EncounterJournal(source);original=j.load();j.close()
            self.assertEqual(digest(original.snapshot()),before)
            j=EncounterJournal(out);branch=j.load();j.close();self.assertIsNone(branch.pending_trial)
            blocked=subprocess.run([sys.executable,"encounter_cli.py","branch","--db",str(source),"--output",str(out),
                                    "--condition","pointer"],capture_output=True,text=True)
            self.assertNotEqual(blocked.returncode,0)

if __name__=="__main__":unittest.main()
