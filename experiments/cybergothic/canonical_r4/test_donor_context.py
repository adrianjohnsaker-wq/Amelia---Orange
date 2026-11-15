import copy
import unittest
from collections import Counter
from types import SimpleNamespace
from unittest.mock import patch

from donor_context_study import (ARMS,ContextRuntime,arm_spec,choose_slide,
                                 context_allowed,donor_provenance,run_branch)
from encounter_trial import find_encounter
from promoter_study import TAG_BASE,choose_instruction
from strict_trial import create_strict_root


class DonorContextTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.world=create_strict_root(35991)
        cls.encounter=find_encounter(cls.world,set(),cls.world.contacted_packets,90.,Counter())
        if cls.encounter is None:raise AssertionError('fixture missing contact')
        cls.packet=cls.world.packets[cls.encounter.packet]
        cls.alts=copy.deepcopy(cls.packet['alternatives'])

    def test_productive_zone_is_documented_before_shedding(self):
        p=donor_provenance(self.world,self.packet)
        best=max(s['intake'] for s in p['samples'])
        self.assertEqual(p['peak_intake'],best)
        self.assertEqual(p['productive_zone'],next(s['zone'] for s in p['samples'] if s['intake']==best))
        self.assertEqual(p['productive_syzygy'],9-p['productive_zone'])
        self.assertTrue(all(s['execute_event']<p['shed_event'] for s in p['samples']))
        self.assertEqual(len(p['samples']),self.packet['candidate_info']['experienced_observations'][0])
        for s in p['samples']:
            e=self.world.log[s['execute_event']];h=self.world.log[s['forage_event']]
            self.assertEqual((e['zone'],h['intake']),(s['zone'],s['intake']))

    def test_slide_uses_each_blocked_digit_jump_skips_cassette(self):
        a=SimpleNamespace(zone=4,ip=0,genome='312347',origins=[TAG_BASE-i for i in range(5)]+[99])
        for expected in (1,2,3,4):
            c=choose_slide(a,'zone',{TAG_BASE})
            self.assertEqual((c['kind'],c['ip']),('nop',expected))
            a.ip=(c['ip']+1)%len(a.genome)
        self.assertEqual(choose_slide(a,'zone',{TAG_BASE})['ip'],5)
        a.ip=0
        self.assertEqual((choose_instruction(a,'zone',{TAG_BASE})['kind'],
                          choose_instruction(a,'zone',{TAG_BASE})['ip']),('ordinary',5))

    def test_encounter_control_preserves_donor_header_and_yokes_zone(self):
        header,mode,policy,variant,offset=arm_spec('encounter_slide',3,6)
        self.assertEqual((header,mode,policy,variant,offset),(3,'offset','slide','experienced',3))
        self.assertTrue(context_allowed(mode,header,6,offset))
        self.assertFalse(context_allowed(mode,header,3,offset))
        self.assertTrue(context_allowed(mode,4,7,offset))  # same offset after header mutation
        a=SimpleNamespace(zone=6,ip=0,genome='312347',origins=[TAG_BASE-i for i in range(5)]+[99])
        selected=choose_slide(a,mode,{TAG_BASE},offset)
        self.assertEqual((selected['kind'],selected['ip']),('payload',1))

    def test_nop_consumes_one_action_without_executing_or_learning_payload(self):
        w=copy.deepcopy(self.world);a=next(iter(w.agents.values()))
        a.zone=4;a.ip=0;a.genome='312347';a.origins=[TAG_BASE-i for i in range(5)]+[99]
        a.energy=5.;a.heat=0.;a.age=0
        w.forecasts.clear();w.minds[a.ident]['intent_ttl']=0
        before_focus=w.minds[a.ident]['focus'];programs=copy.deepcopy(w.minds[a.ident]['programs'])
        alts={'experienced':{'code':'1234'},'shuffled':{'code':'4321'}}
        rt=ContextRuntime(w,a.ident,alts,3,'zone','slide',w.now)
        start=len(w.log);old_token=a.token;old_actions=w.actions
        with patch.object(w.rng,'random',return_value=1.0):w.act(a)
        self.assertEqual(a.ip,2)
        self.assertEqual(w.actions,old_actions+1)
        self.assertGreater(a.token,old_token)
        self.assertEqual(w.minds[a.ident]['focus'],before_focus)
        self.assertEqual(w.minds[a.ident]['programs'],programs)
        events=w.log[start:]
        self.assertEqual(sum(e['event']=='promoter_nop' for e in events),1)
        harvest=[e for e in events if e['event']=='field_harvest']
        self.assertEqual(len(harvest),1);self.assertTrue(harvest[0]['neutralized'])
        self.assertEqual(rt.actions[-1]['selection']['kind'],'nop')

    def test_all_branches_share_exogenous_environment_and_use_donor_header(self):
        p=donor_provenance(self.world,self.packet)
        results=[run_branch(self.world,self.encounter,self.alts,p['productive_zone'],arm) for arm in ARMS]
        self.assertTrue(all(r['header']==p['productive_zone'] for r in results))
        self.assertTrue(all(r['environment_future']==results[0]['environment_future'] for r in results))
        for arm,r in zip(ARMS,results):
            for d in r['decisions']:
                c=d['choice']
                if c['kind']=='payload':
                    self.assertTrue(context_allowed(r['mode'],c['header'],d['zone'],r['offset']))
                elif c['kind']=='nop' and c['reason']=='out_of_zone':
                    self.assertFalse(context_allowed(r['mode'],c['header'],d['zone'],r['offset']))


if __name__=='__main__':unittest.main()
