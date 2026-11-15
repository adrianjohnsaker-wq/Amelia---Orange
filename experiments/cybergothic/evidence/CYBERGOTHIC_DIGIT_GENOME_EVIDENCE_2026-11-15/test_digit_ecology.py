import unittest
from unittest.mock import patch

from digit_world import DigitWorld,decode
from legacy_engine import Config,Entropy


class DigitEcologyTests(unittest.TestCase):
    def make_world(self):
        return DigitWorld(Config(seed=38991,initial_agents=1,max_agents=180,max_genome=512),Entropy('seeded',38991))

    def test_header_mutation_redirects_digit_only_gate(self):
        self.assertTrue(decode('803123409',3,4,'self')['nop'])
        self.assertFalse(decode('804123409',3,4,'self')['nop'])

    def test_timesplice_exchange_needs_no_ancestry(self):
        w=self.make_world();a=next(iter(w.agents.values()))
        a.zone=3;a.genome='123456';a.ip=1
        b=w.add_agent(6,'678901',energy=6.);b.ip=2
        before=(a.genome,b.genome)
        self.assertTrue(w.timesplice(a))
        self.assertNotEqual((a.genome,b.genome),before)
        self.assertFalse(hasattr(a,'origins'));self.assertFalse(hasattr(b,'origins'))

    def test_fission_and_decoy_need_no_ancestry(self):
        w=self.make_world();a=next(iter(w.agents.values()));a.genome='12345678';a.energy=8.
        with patch.object(w.rng,'random',return_value=0.):w.fission(a)
        self.assertEqual(len(w.agents),2)
        child=next(x for x in w.agents.values() if x.ident!=a.ident)
        self.assertEqual(child.genome,'5678');self.assertFalse(hasattr(child,'origins'))
        self.assertTrue(w.corpses);self.assertFalse(hasattr(next(iter(w.corpses.values())),'origins'))

    def test_necrotic_archive_reconstitutes_without_ancestry_arrays(self):
        w=self.make_world();w.recovery_floor=1;w.resources[0]=8.;a=next(iter(w.agents.values()))
        w.kill(a,'controlled_extinction');self.assertFalse(w.agents);self.assertTrue(w.archive)
        w.pulse();self.assertEqual(len(w.agents),1)
        host=next(iter(w.agents.values()));self.assertFalse(hasattr(host,'origins'))
        self.assertTrue(any(e['event']=='reconstitute' for e in w.log))
        self.assertTrue(all('origins' not in x for x in w.archive.values()))

    def test_vector_delivers_digit_string_without_ancestry_array(self):
        w=self.make_world();a=next(iter(w.agents.values()));a.zone=1;a.genome='123456';a.ip=2
        w.packets[99]={'id':99,'donor':-1,'source':2,'zone':1,'code':'6009','gate_signature':1,'ttl':1}
        w.deliver_vector(99)
        self.assertEqual(a.genome,'1260093456')
        self.assertNotIn(99,w.packets)
        self.assertFalse(hasattr(a,'origins'))


if __name__=='__main__':unittest.main()
