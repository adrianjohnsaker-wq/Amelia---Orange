import unittest
from collections import Counter
from legacy_engine import Config,Entropy
from assemblage import Assemblage

class ExtendedTests(unittest.TestCase):
    def w(self):return Assemblage(Config(seed=123,initial_agents=1),Entropy("seeded",123),populate=False)

    def test_vector_selects_an_observed_successful_fragment(self):
        w=self.w();a=w.add_agent(1,"63126312",energy=10);a.ip=2
        w.minds[a.ident]["programs"]={"6312":[4,.48],"1263":[4,.02]}
        w.vector_mode="intact";w.cargo_policy="experienced";self.assertTrue(w.shed(a))
        self.assertEqual(w.packets[1]["code"],"6312")
        self.assertTrue([e for e in w.log if e["event"]=="vector_shed"][-1]["experienced"])

    def test_temporal_orientation_is_charged_and_expires(self):
        w=self.w();a=w.add_agent(1,"0000");m=w.minds[a.ident]
        m["intent"]=2;m["intent_ttl"]=2;before=a.energy
        w.forage(a);self.assertEqual(m["focus"],2);self.assertEqual(m["intent_ttl"],1)
        self.assertAlmostEqual(a.energy,before-.01+.12)
        w.forage(a);w.forage(a);self.assertEqual(m["focus"],0)

    def test_archival_portfolio_uses_existing_past_channel_experience(self):
        w=self.w()
        for zone in range(10):w.field[zone]=[1.,0.,0.]
        for i in range(3):
            a=w.add_agent(1,"12345");mind=w.minds[a.ident]
            mind["channel_visits"][0]=1;mind["channel_harvest"][0]=i*.12
            w.kill(a,"fixture")
        w.archive_mode="portfolio";w.resources[0]=8.;w.pulse()
        result=[e for e in w.log if e["event"]=="reconstitute"][-1]
        self.assertEqual(result["source_corpse"],3)

if __name__=="__main__":unittest.main()
