import copy
import json
import sqlite3
import subprocess
import sys
import tempfile
import unittest
from collections import Counter
from pathlib import Path

from context_checkpoint import load_context,save_context
from donor_context_study import donor_provenance,prepare_branch,run_branch
from encounter_trial import find_encounter
from strict_trial import create_strict_root


class ContextCheckpointTests(unittest.TestCase):
    def test_each_phase_policy_resumes_in_new_process_and_detects_tampering(self):
        w=create_strict_root(35991);e=find_encounter(w,set(),w.contacted_packets,90.,Counter())
        p=w.packets[e.packet];alts=copy.deepcopy(p['alternatives']);pro=donor_provenance(w,p)
        with tempfile.TemporaryDirectory() as tmp:
            for arm in ('productive_slide','productive_jump','encounter_slide'):
                expected,_,rt=run_branch(w,e,alts,pro['productive_zone'],arm,return_world=True)
                paused,partial=prepare_branch(w,e,alts,pro['productive_zone'],arm)
                for h in (3,6,12):paused.advance(until_time=e.time+h)
                db=Path(tmp)/(arm+'.sqlite');save_context(db,paused,partial)
                proc=subprocess.run([sys.executable,'context_checkpoint.py',str(db),'--until',str(e.time+36)],
                                    text=True,capture_output=True,check=True)
                resumed=json.loads(proc.stdout)
                self.assertEqual(resumed['state_sha256'],expected['state_sha256'])
                self.assertEqual(resumed['event_sha256'],expected['event_sha256'])
                self.assertEqual(resumed['runtime'],json.loads(json.dumps(rt.snapshot())))
            with sqlite3.connect(db) as con:con.execute("UPDATE context_checkpoint SET payload=payload || ' '")
            with self.assertRaisesRegex(ValueError,'digest mismatch'):load_context(db)


if __name__=='__main__':unittest.main()
