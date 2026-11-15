import copy
import json
import sqlite3
import subprocess
import sys
import tempfile
import unittest
from collections import Counter
from pathlib import Path

from encounter_trial import find_encounter
from promoter_checkpoint import load_promoter,save_promoter
from promoter_study import prepare_branch,run_branch
from strict_trial import create_strict_root


class PromoterCheckpointTests(unittest.TestCase):
    def test_checkpoint_resumes_identically_in_fresh_process_and_detects_tampering(self):
        world=create_strict_root(34991)
        e=find_encounter(world,set(),world.contacted_packets,90.,Counter())
        alts=copy.deepcopy(world.packets[e.packet]['alternatives'])
        expected,expected_world,expected_runtime=run_branch(world,e,alts,'zone',return_world=True)
        paused,runtime=prepare_branch(world,e,alts,'zone')
        for n in (3,6,12):paused.advance(until_time=e.time+n)
        with tempfile.TemporaryDirectory() as tmp:
            db=Path(tmp)/'promoter.sqlite'
            save_promoter(db,paused,runtime)
            process=subprocess.run([sys.executable,'promoter_checkpoint.py',str(db),'--until',str(e.time+36)],
                                   capture_output=True,text=True,check=True)
            result=json.loads(process.stdout)
            self.assertEqual(result['state_sha256'],expected['state_sha256'])
            self.assertEqual(result['event_sha256'],expected['event_sha256'])
            self.assertEqual(result['runtime'],json.loads(json.dumps(expected_runtime.snapshot())))
            with sqlite3.connect(db) as conn:
                conn.execute("UPDATE promoter_checkpoint SET payload=payload || ' '")
            with self.assertRaisesRegex(ValueError,'digest mismatch'):load_promoter(db)


if __name__=='__main__':unittest.main()
