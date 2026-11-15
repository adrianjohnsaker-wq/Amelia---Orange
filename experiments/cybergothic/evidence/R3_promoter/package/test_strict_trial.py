import copy
import tempfile
import unittest
from collections import Counter
from pathlib import Path
from legacy_engine import Config,Entropy,gate
from reactor import digest
from encounter_trial import create_root,find_encounter,finish_delivery
from strict_trial import StrictJournal,StrictWorld,create_strict_root,run_seed

class StrictTests(unittest.TestCase):
    def test_first_contact_tracking_does_not_change_the_ecology(self):
        old=create_root(31991);new=create_strict_root(31991)
        self.assertEqual(old.log,new.log)
        self.assertEqual(old.rng.getstate(),new.rng.getstate())
        self.assertEqual(old.environment_rng.getstate(),new.environment_rng.getstate())
        prior={e["packet"] for e in new.log if e["event"]=="vector_infection"}
        self.assertTrue(prior.issubset(new.contacted_packets))
        old.advance(until_time=60.);new.advance(until_time=60.)
        self.assertEqual(old.log,new.log)

    def test_silent_contact_is_still_tracked(self):
        w=StrictWorld(Config(seed=9,initial_agents=1,max_genome=4),Entropy("seeded",9),populate=False)
        donor=w.add_agent(2,"1000");target=w.add_agent(1,"1111")
        w.packets[1]={"id":1,"donor":donor.ident,"source":2,"zone":1,"code":"1",
                      "origins":[donor.ident],"gate_signature":gate(1)%9,"ttl":1}
        w.deliver_vector(1)
        self.assertIn(1,w.contacted_packets);self.assertEqual(w.count["vector_infection"],0)
        self.assertEqual(target.genome,"1111")

    def test_saved_paused_contact_retains_prior_contact_history(self):
        w=create_strict_root(31991);e=find_encounter(w,set(),w.contacted_packets,90.,Counter())
        self.assertIsNotNone(e);self.assertIn(e.packet,w.contacted_packets)
        with tempfile.TemporaryDirectory() as d:
            j=StrictJournal(Path(d)/"strict.sqlite");j.save(w);other=j.load();j.close()
        self.assertEqual(w.contacted_packets,other.contacted_packets)
        finish_delivery(w,e.packet,e.recipient,"pointer",trial=True)
        finish_delivery(other,e.packet,e.recipient,"pointer",trial=True)
        w.advance(until_time=e.time+3.);other.advance(until_time=e.time+3.)
        self.assertEqual(digest(w.snapshot()),digest(other.snapshot()))

    def test_early_and_post_reversal_sampling_replays(self):
        a=run_seed(31991);b=run_seed(31991);self.assertEqual(a,b)
        phases=Counter(t["phase"] for t in a["trials"])
        self.assertGreater(phases["before"],0);self.assertGreater(phases["after"],0)
        self.assertTrue(all(t["before"]["time"]<=90 for t in a["trials"] if t["phase"]=="before"))
        self.assertTrue(all(t["before"]["time"]>=126 for t in a["trials"] if t["phase"]=="after"))

if __name__=="__main__":unittest.main()
