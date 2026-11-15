import copy
import json
import sqlite3
import subprocess
import sys
import tempfile
import unittest
from collections import Counter
from pathlib import Path

from echo_checkpoint import load_echo, save_echo
from encounter_trial import find_encounter, finish_delivery
from strict_trial import create_strict_root
from viral_echo_study import install_trace_and_echo, run_branch


class EchoCheckpointTests(unittest.TestCase):
    def test_mid_echo_checkpoint_resumes_in_new_process(self):
        world=create_strict_root(33991)
        e=find_encounter(world,set(),world.contacted_packets,90.,Counter())
        alts=copy.deepcopy(world.packets[e.packet]['alternatives'])
        expected=run_branch(world,e,alts,'experienced_echo')
        clone=copy.deepcopy(world)
        finish_delivery(clone,e.packet,e.recipient,'experienced',trial=True)
        trace=install_trace_and_echo(clone,e.recipient,e.time,alts['experienced']['code'],alts,'experienced_echo')
        for n in (3,6,12):clone.advance(until_time=e.time+n)
        self.assertGreater(len(trace.echo_events),0)
        self.assertIn(e.recipient,clone.agents)
        with tempfile.TemporaryDirectory() as tmp:
            db=Path(tmp)/'echo.sqlite'
            save_echo(db,clone,trace,alts,'experienced_echo')
            process=subprocess.run([sys.executable,'echo_checkpoint.py',str(db),'--until',str(e.time+36)],
                                   check=True,text=True,capture_output=True)
            got=json.loads(process.stdout)
            self.assertEqual(got['state_sha256'],expected['final_state_sha256'])
            self.assertEqual(got['event_sha256'],expected['event_sha256'])
            self.assertEqual(got['actions'],expected['actions'])
            self.assertEqual(got['echoes'],expected['echoes'])
            self.assertEqual(got['transitions'],expected['transitions'])
            self.assertEqual(got['environment'],expected['environment_future'])
            self.assertEqual(got['first_loss'],expected['first_loss'])
            self.assertEqual(got['first_death'],expected['first_death'])
            with sqlite3.connect(db) as con:
                con.execute("UPDATE echo_checkpoint SET payload=payload || ' '")
            with self.assertRaisesRegex(ValueError,'digest mismatch'):
                load_echo(db)


if __name__=='__main__':unittest.main()
