import tempfile
import unittest
from pathlib import Path
from legacy_engine import Config,Entropy
from reactor import digest
from portable import PortableAssemblage,PortableJournal

class PortableTests(unittest.TestCase):
    def test_remote_reward_conserves_field_energy(self):
        w=PortableAssemblage(Config(seed=5,initial_agents=1),Entropy("seeded",5),populate=False)
        a=w.add_agent(2,"1234",energy=6);w.field[1][2]=1.;w.portable_bets=True
        w.emit("fate_reveal",zone=1,owner=a.ident,chosen=2,learned=2,persistence=1,actual=2,epoch=1,reward=0.)
        self.assertEqual(a.energy,6.25);self.assertEqual(w.field[1][2],.75)
        self.assertEqual(w.count["remote_fate_reward"],1)

    def test_forecast_levy_is_transferred_from_residents(self):
        w=PortableAssemblage(Config(seed=5,initial_agents=1),Entropy("seeded",5),populate=False)
        owner=w.add_agent(2,"1234",energy=6);donor=w.add_agent(1,"5678",energy=4)
        w.field[1][2]=1.;w.portable_bets=True
        w.emit("fate_reveal",zone=1,owner=owner.ident,chosen=2,learned=2,persistence=1,actual=2,epoch=1,reward=0.)
        self.assertAlmostEqual(owner.energy+donor.energy+sum(map(sum,w.field)),40.)
        self.assertAlmostEqual(w.log[-1]["total"],.1)

    def test_portable_state_persists(self):
        w=PortableAssemblage(Config(seed=6,initial_agents=3),Entropy("seeded",6));w.portable_bets=True
        w.temporal_retention=.85;w.advance(until_time=15.)
        with tempfile.TemporaryDirectory() as d:
            j=PortableJournal(Path(d)/"x.sqlite");j.save(w);r=j.load();j.close()
        self.assertTrue(r.portable_bets);w.advance(until_time=30.);r.advance(until_time=30.)
        self.assertEqual(digest(w.snapshot()),digest(r.snapshot()))

if __name__=="__main__":unittest.main()
