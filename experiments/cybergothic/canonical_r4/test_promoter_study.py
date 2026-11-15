import copy
import unittest
from collections import Counter
from types import SimpleNamespace

from encounter_trial import find_encounter
from promoter_study import (ARMS, TAG_BASE, PromoterRuntime, allele_allowed,
                            choose_instruction, run_branch)
from strict_trial import create_strict_root


class PromoterTests(unittest.TestCase):
    def agent(self, zone, header='3', ip=0):
        return SimpleNamespace(zone=zone,ip=ip,genome=header+'1234'+'7',
                               origins=[TAG_BASE-i for i in range(5)]+[42])

    def test_zone_rotated_and_syzygy_rules(self):
        group={TAG_BASE}
        allowed=choose_instruction(self.agent(3),'zone',group)
        blocked=choose_instruction(self.agent(4),'zone',group)
        wrong=choose_instruction(self.agent(4),'rotated',group)
        paired=choose_instruction(self.agent(6),'syzygy',group)
        opened=choose_instruction(self.agent(4),'open',group)
        self.assertEqual((allowed['kind'],allowed['ip']),('payload',1))
        self.assertEqual((blocked['kind'],blocked['ip']),('ordinary',5))
        self.assertEqual((wrong['kind'],wrong['ip']),('payload',1))
        self.assertEqual((paired['kind'],paired['ip']),('payload',1))
        self.assertEqual((opened['kind'],opened['ip']),('payload',1))
        self.assertEqual(sum(s.get('kind')=='payload' for s in blocked['skipped']),4)

    def test_real_header_digit_changes_activation_after_mutation(self):
        a=self.agent(4,header='3')
        self.assertEqual(choose_instruction(a,'zone',{TAG_BASE})['kind'],'ordinary')
        a.genome='4'+a.genome[1:]
        self.assertEqual(choose_instruction(a,'zone',{TAG_BASE})['kind'],'payload')
        self.assertEqual(choose_instruction(a,'zone',{TAG_BASE})['header'],4)

    def test_fragmented_cassette_fails_closed(self):
        a=SimpleNamespace(zone=3,ip=0,genome='3182347',origins=[TAG_BASE,TAG_BASE-1,42,
                           TAG_BASE-2,TAG_BASE-3,TAG_BASE-4,42])
        x=choose_instruction(a,'zone',{TAG_BASE})
        self.assertEqual((x['kind'],x['ip']),('ordinary',2))
        self.assertEqual(x['skipped'][-1]['kind'],'fragmented')

    def test_fully_blocked_genome_is_quiescent(self):
        a=self.agent(4);a.genome=a.genome[:5];a.origins=a.origins[:5]
        x=choose_instruction(a,'zone',{TAG_BASE})
        self.assertEqual(x['kind'],'quiescent')
        self.assertIsNone(x['ip'])

    def test_quiescence_pays_cost_and_reschedules(self):
        w=create_strict_root(34991)
        a=next(iter(w.agents.values()))
        a.zone=4;a.ip=0;a.genome='31234';a.origins=[TAG_BASE-i for i in range(5)]
        a.energy=2.;a.heat=0.;a.age=0
        w.forecasts.clear()
        runtime=PromoterRuntime(w,a.ident,{'experienced':{'code':'1234'},'shuffled':{'code':'4321'}},
                                header=3,mode='zone',start=w.now)
        old_token=a.token;start=len(w.log);runtime.act(a)
        self.assertEqual(a.age,1)
        self.assertAlmostEqual(a.energy,1.76)
        self.assertGreater(a.token,old_token)
        self.assertGreater(a.next_due,w.now)
        self.assertTrue(runtime.actions[-1]['quiescent'])
        self.assertFalse(any(x['event'] in ('execute','field_harvest') for x in w.log[start:]))

    def test_real_copies_obey_gates_and_share_environment(self):
        w=create_strict_root(34991)
        e=find_encounter(w,set(),w.contacted_packets,90.,Counter())
        self.assertIsNotNone(e)
        alts=copy.deepcopy(w.packets[e.packet]['alternatives'])
        results=[run_branch(w,e,alts,mode) for mode in ARMS]
        for mode,result in zip(ARMS,results):
            self.assertEqual(result['environment_future'],results[0]['environment_future'])
            for d in result['decisions']:
                c=d['choice']
                if c['kind']=='payload':
                    self.assertTrue(allele_allowed(mode,c['header'],d['zone']))
                for s in c['skipped']:
                    if s['kind']=='payload':
                        self.assertFalse(allele_allowed(mode,s['header'],d['zone']))
            for ev in result['echoes']:
                self.assertGreaterEqual(ev['action'],4)
                self.assertEqual((ev['action']-4)%3,0)
                if ev['reason'] is None:self.assertEqual(ev['cost'],.05)


if __name__=='__main__':unittest.main()
