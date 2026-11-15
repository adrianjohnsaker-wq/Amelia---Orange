import copy
import tempfile
import unittest
from pathlib import Path
from legacy_engine import Config, Entropy, signature
from reactor import Reactor, digest
from storage import SQLiteJournal


class ExtensionTests(unittest.TestCase):
    def root(self):
        w=Reactor(Config(seed=31001,initial_agents=1),Entropy("seeded",31001),populate=False)
        owner=w.add_agent(1,"123456",energy=10)
        subject=w.add_agent(1,"543210",energy=8)
        total=sum(signature(a.genome) for a in w.occupants(1))%9
        w.broadcast(owner,(total+4)%9)
        return w,subject.ident

    def test_attractor_uses_existing_mutation_and_matches_cost(self):
        root, ident=self.root(); traces={}
        for mode in ("target","wrong_target","sham"):
            w=copy.deepcopy(root); w.steering_mode=mode
            w.mutate_genome(w.agents[ident],"fixture")
            e=w.log[-1];traces[mode]=e
            self.assertEqual(e["event"],"attractor_engage")
            self.assertEqual(e["cost"],.05)
        self.assertEqual(traces["target"]["collective_after"],traces["target"]["target"])
        self.assertNotEqual(traces["wrong_target"]["collective_after"],traces["wrong_target"]["target"])
        self.assertEqual(traces["target"]["candidate"],traces["sham"]["candidate"])

    def test_feedback_gain_changes_heat(self):
        w,_=self.root(); a=w.agents[1];a.heat=2;w.feedback_gain=.8;w.execute(a,"catastrophe",1);low=a.heat
        a.heat=2;w.feedback_gain=1.8;w.execute(a,"catastrophe",1);self.assertGreater(a.heat,low)

    def test_new_mechanism_settings_survive_checkpoint(self):
        w,_=self.root();w.steering_mode="target";w.feedback_gain=1.8;w.advance(until_time=3.0)
        with tempfile.TemporaryDirectory() as d:
            j=SQLiteJournal(Path(d)/"r.sqlite");j.save(w);recovered=j.load();j.close()
        self.assertEqual(recovered.steering_mode,"target");self.assertEqual(recovered.feedback_gain,1.8)
        w.advance(until_time=8.0);recovered.advance(until_time=8.0)
        self.assertEqual(digest(w.snapshot()),digest(recovered.snapshot()))


if __name__=="__main__":unittest.main()
