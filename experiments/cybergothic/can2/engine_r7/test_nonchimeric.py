import unittest

from classify import path_to
from legacy_engine import Config,Entropy
from nonchimeric import NonChimericWorld,candidates


class ComparatorTests(unittest.TestCase):
    def test_real_donor_only_stop_keeps_preexisting_donor_marker(self):
        w=NonChimericWorld(Config(seed=45671,initial_agents=1,max_agents=40,max_genome=512),
                           Entropy('seeded',45671),populate=False)
        donor=w.add_agent(0,'0900',8);host=w.add_agent(0,'6012456',8);host.ip=6
        self.assertTrue(w.infect(donor,host));c=w.nonchim_first
        self.assertIsNotNone(c);self.assertEqual(c['span']['form'],'unclosed_frame')
        self.assertIn(donor.ident,c['baseline_edge_carriers'])
        self.assertNotIn(host.ident,c['baseline_edge_carriers'])
        inherited=w.shadow.agents[host.ident].edges[c['span']['stop']]
        original=w.shadow.agents[donor.ident].edges[0]
        self.assertIsNotNone(path_to(w.shadow.nodes,inherited,original));w.shadow.audit(w)

    def test_hybrid_boundary_is_not_donor_only(self):
        event={'event':'infection','before':'601209','after':'601206809',
               'target_ip':5,'payload':'680'}
        self.assertEqual(candidates(event),[])


if __name__=='__main__':unittest.main()
