import copy
import unittest
from collections import Counter

from encounter_trial import find_encounter
from strict_trial import create_strict_root
from viral_echo_study import (labels_for_shuffle, run_branch, scrub_ancestry,
                              install_trace_and_echo, ECHO_COST)


class ViralEchoTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.world = create_strict_root(33991)
        cls.encounter = find_encounter(cls.world, set(), cls.world.contacted_packets, 90., Counter())
        if cls.encounter is None:
            raise AssertionError('fixture did not find a first contact')
        cls.alts = copy.deepcopy(cls.world.packets[cls.encounter.packet]['alternatives'])

    def test_shuffle_mapping_preserves_digit_and_origin_pairs(self):
        e, s = self.alts['experienced'], self.alts['shuffled']
        order = labels_for_shuffle(e, s)
        self.assertEqual(sorted(order), list(range(len(e['code']))))
        self.assertEqual(''.join(e['code'][i] for i in order), s['code'])
        self.assertEqual([e['origins'][i] for i in order], s['origins'])

    def test_observer_tags_do_not_change_ecology(self):
        for arm in ('natural', 'experienced_echo', 'shuffled_echo'):
            a, x = run_branch(self.world, self.encounter, self.alts, arm, tagged=True, return_world=True)
            b, y = run_branch(self.world, self.encounter, self.alts, arm, tagged=False, return_world=True)
            self.assertEqual(scrub_ancestry(x.snapshot()), scrub_ancestry(y.snapshot()))
            self.assertEqual(scrub_ancestry(x.log), scrub_ancestry(y.log))
            self.assertEqual(a['environment_future'], b['environment_future'])
            self.assertTrue(all(a['timepoints'][k]['uptake']==b['timepoints'][k]['uptake'] for k in a['timepoints']))

    def test_fragment_mutation_and_recovery_are_detected(self):
        # Use a separate actual fork immediately after insertion for a controlled fixture.
        from encounter_trial import finish_delivery
        world = copy.deepcopy(self.world)
        finish_delivery(world, self.encounter.packet, self.encounter.recipient, 'experienced', trial=True)
        code = self.alts['experienced']['code']
        trace = install_trace_and_echo(world, self.encounter.recipient, self.encounter.time,
                                      code, self.alts, 'natural')
        host = world.agents[self.encounter.recipient]
        self.assertTrue(trace.inspect()['intact'])
        position = host.ip
        old = host.genome[position]
        host.genome = host.genome[:position]+str((int(old)+1)%10)+host.genome[position+1:]
        world.emit('genome_mutation', agent=host.ident, position=position)
        self.assertFalse(trace.inspect()['intact'])
        self.assertEqual(trace.before_first_loss['event'], 'genome_mutation')
        host.genome = host.genome[:position]+old+host.genome[position+1:]
        world.emit('genome_mutation', agent=host.ident, position=position)
        self.assertTrue(trace.inspect()['intact'])
        self.assertEqual([x['intact'] for x in trace.transitions], [False, True])

    def test_echoes_cost_energy_and_begin_on_fourth_host_action(self):
        for arm, variant in [('experienced_echo','experienced'),('shuffled_echo','shuffled')]:
            result, world = run_branch(self.world, self.encounter, self.alts, arm, return_world=True)
            self.assertTrue(any(e['reason'] is None for e in result['echoes']))
            for ev in result['echoes']:
                self.assertGreaterEqual(ev['action'], 4)
                self.assertEqual((ev['action']-4)%3, 0)
                self.assertEqual(ev['variant'], variant)
                if ev['reason'] is None:
                    self.assertEqual(ev['energy_cost'], ECHO_COST)
                    self.assertEqual(ev['code'], self.alts[variant]['code'])
            self.assertTrue(all(len(a.genome)<=world.cfg.max_genome for a in world.agents.values()))
            self.assertTrue(all(not r['original_intact'] or r['intact'] for r in result['timepoints'].values()))

    def test_existing_and_echo_arms_share_environment(self):
        data = [run_branch(self.world, self.encounter, self.alts, arm)
                for arm in ('natural','experienced_echo','shuffled_echo')]
        self.assertTrue(all(r['environment_future'] == data[0]['environment_future'] for r in data))


if __name__ == '__main__':
    unittest.main()
