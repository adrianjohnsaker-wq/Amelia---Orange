import copy
import tempfile
import unittest
from pathlib import Path
from legacy_engine import Config,Entropy
from reactor import digest
from adaptive import AdaptiveAssemblage,AdaptiveJournal

class AdaptiveTests(unittest.TestCase):
    def test_forgetting_only_decays_accumulated_observations(self):
        w=AdaptiveAssemblage(Config(seed=1,initial_agents=1),Entropy("seeded",1),populate=False)
        w.transitions_learned[0][0][0]=10.;w.temporal_retention=.8
        w.environment_step()
        self.assertGreaterEqual(w.transitions_learned[0][0][0],8.)
        self.assertLessEqual(w.transitions_learned[0][0][0],9.)

    def test_adaptive_checkpoint_replays_rng_and_field(self):
        w=AdaptiveAssemblage(Config(seed=2,initial_agents=3),Entropy("seeded",2));w.temporal_retention=.85
        w.advance(until_time=20.)
        with tempfile.TemporaryDirectory() as d:
            j=AdaptiveJournal(Path(d)/"state.sqlite");j.save(w);restored=j.load();j.close()
        w.advance(until_time=40.);restored.advance(until_time=40.)
        self.assertEqual(digest(w.snapshot()),digest(restored.snapshot()))

if __name__=="__main__":unittest.main()
