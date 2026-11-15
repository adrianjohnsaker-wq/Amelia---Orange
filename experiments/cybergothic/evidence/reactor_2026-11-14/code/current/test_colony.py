import tempfile
import unittest
from pathlib import Path
from legacy_engine import Config,Entropy
from reactor import Reactor,digest
from storage import SQLiteJournal

class ColonyTests(unittest.TestCase):
    def test_seed_multiple_hosts_from_archive_and_debit_each(self):
        w=Reactor(Config(seed=42,initial_agents=1),Entropy("seeded",42),populate=False)
        a=w.add_agent(9,"12345");w.kill(a,"test");w.recovery_floor=4
        w.advance(until_time=4.01)
        self.assertEqual(w.count["reconstitute"],2)
        self.assertEqual(w.reactor_spent,8)
        self.assertEqual(len(w.agents),2)
        self.assertEqual({e["source_corpse"] for e in w.log if e["event"]=="reconstitute"},{1})

    def test_recovery_settings_survive_checkpoint(self):
        w=Reactor(Config(seed=42,initial_agents=1),Entropy("seeded",42))
        w.recovery_floor=4;w.pulse_renewal=.6;w.advance(until_time=4.)
        with tempfile.TemporaryDirectory() as d:
            j=SQLiteJournal(Path(d)/"run.sqlite");j.save(w);r=j.load();j.close()
        self.assertEqual(r.recovery_floor,4);self.assertEqual(r.pulse_renewal,.6)
        w.advance(until_time=8.);r.advance(until_time=8.)
        self.assertEqual(digest(w.snapshot()),digest(r.snapshot()))

if __name__=="__main__":unittest.main()
