import unittest

from digit_world import decode
from legacy_engine import signature
from stop_trial import ARMS, eligible, run_seed


class StopTrialTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.row=run_seed(41120,retain=True)

    def test_natural_encounter_has_three_silent_transferred_digits(self):
        r=self.row;p=r['selection'];s=p['span'];g=p['before'];i=p['target_ip'];code=p['payload'];z=p['zone']
        self.assertEqual(len(code),3)
        self.assertGreaterEqual(i,s['body']);self.assertLessEqual(i,s['stop'])
        self.assertEqual(g[s['stop']:s['stop']+2],'09')
        broken=g[:s['stop']]+'00'+g[s['stop']+2:]
        self.assertEqual(signature(g),signature(broken))
        original=g[:i]+code+g[i:];altered=broken[:i]+code+broken[i:]
        self.assertTrue(all(decode(original,j,z,'self')['nop'] for j in range(i,i+3)))
        self.assertTrue(all(not decode(altered,j,z,'self')['nop'] for j in range(i,i+3)))

    def test_six_arms_keep_contact_costs_and_sham_removes_insertion(self):
        p=self.row['selection']
        for arm in ARMS:
            with self.subTest(arm=arm):
                ledger=self.row['ledgers'][arm]
                marker=next(e for e in ledger if e['event']=='trial_contact')
                self.assertEqual(marker['payload'],p['payload'])
                self.assertEqual(signature(marker['before']),signature(marker['edited']))
                self.assertEqual(len(marker['transmitted']),len(marker['before'])+3)
                self.assertEqual(marker['after'],marker['edited'] if arm.endswith('exposure') else marker['transmitted'])
                prior=[e for e in ledger[:ledger.index(marker)] if e['event']=='infection'][-1]
                self.assertEqual(prior['attacker'],p['attacker'])
                self.assertEqual(prior['target'],p['target'])
                self.assertGreaterEqual(prior['energy_transferred'],0)

    def test_natural_control_and_environment_match(self):
        o=self.row['outputs']
        self.assertTrue(o['intact_transfer']['natural_trajectory_verified'])
        self.assertTrue(all(o[x]['future_environment']==o[ARMS[0]]['future_environment'] for x in ARMS))

    def test_payload_is_read_under_both_actual_stop_states_in_fixture(self):
        o=self.row['outputs']
        for arm in ('intact_transfer','ruptured_transfer','active_transfer'):
            self.assertEqual(o[arm]['short']['first_action_reads_payload'],1)
        self.assertEqual(o['intact_transfer']['short']['first_action_nop'],1)
        self.assertEqual(o['ruptured_transfer']['short']['first_action_nop'],0)
        self.assertEqual(o['active_transfer']['short']['first_action_nop'],0)

    def test_experiment_uses_digit_strings_without_per_digit_labels(self):
        for ledger in self.row['ledgers'].values():
            marker=next(e for e in ledger if e['event']=='trial_contact')
            self.assertIsInstance(marker['after'],str)
            self.assertNotIn('origins',marker)


if __name__=='__main__':unittest.main()
