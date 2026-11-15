import copy
import json
import subprocess
import sys
import tempfile
import unittest
from dataclasses import fields
from pathlib import Path
from unittest.mock import patch

from digit_world import DigitJournal,DigitWorld,decode,parse_genome
from digit_study import mutation_created_introns
from legacy_engine import Agent,Config,Corpse,Entropy
from reactor import digest


class DigitGrammarTests(unittest.TestCase):
    def test_codon_grammar_parses_promoter_and_intron(self):
        genome='1'+'803456709'+'2'+'60777709'+'3'
        self.assertEqual(parse_genome(genome),
            (('gene',1,4,8,10,3),('intron',11,13,17,19,None)))
        self.assertFalse(decode(genome,4,3,'self')['nop'])
        self.assertTrue(decode(genome,4,4,'self')['nop'])
        self.assertFalse(decode(genome,4,4,'promoter_open')['nop'])
        self.assertTrue(decode(genome,13,3,'self')['nop'])
        self.assertFalse(decode(genome,13,3,'intron_active')['nop'])
        self.assertFalse(decode(genome,13,3,'literal')['nop'])

    def test_first_stop_non_nested_and_incomplete_start(self):
        self.assertEqual(parse_genome('606080912'),(('intron',0,2,5,7,None),))
        self.assertEqual(parse_genome('123807856'),())
        self.assertFalse(decode('123807856',3,7,'self')['nop'])

    def test_single_digit_mutation_can_create_intron(self):
        e={'before':'6112309','after':'6012309'}
        self.assertEqual(mutation_created_introns(e),[{'start':0,'end':7,'sequence':'6012309'}])
        self.assertEqual(mutation_created_introns({'before':'6012309','after':'6013309'}),[])

    def test_horizontal_infection_can_create_a_new_intron_boundary(self):
        w=DigitWorld(Config(seed=38991,initial_agents=1,max_agents=180,max_genome=512),Entropy('seeded',38991))
        target=next(iter(w.agents.values()));target.zone=1;target.genome='612309';target.ip=1
        attacker=w.add_agent(1,'0001',energy=5.)
        self.assertEqual(parse_genome(target.genome),())
        self.assertTrue(w.infect(attacker,target))
        self.assertEqual(target.genome,'600012309')
        self.assertEqual(parse_genome(target.genome)[0][0],'intron')

    def test_genetic_objects_have_no_ancestry_arrays(self):
        self.assertNotIn('origins',{f.name for f in fields(Agent)})
        self.assertNotIn('origin_history',{f.name for f in fields(Agent)})
        self.assertNotIn('origins',{f.name for f in fields(Corpse)})
        w=DigitWorld(Config(seed=38991,initial_agents=12,max_agents=180,max_genome=512),Entropy('seeded',38991))
        w.advance(until_time=20.)
        state=w.snapshot()
        for a in state['agents'].values():
            self.assertNotIn('origins',a);self.assertNotIn('origin_history',a)
        for c in state['corpses'].values():self.assertNotIn('origins',c)
        for p in state['assemblage']['packets'].values():self.assertNotIn('origins',p)
        for c in state['archive'].values():self.assertNotIn('origins',c)

    def test_intronic_nop_consumes_one_action_without_opcode(self):
        w=DigitWorld(Config(seed=38991,initial_agents=1,max_agents=180,max_genome=512),Entropy('seeded',38991))
        a=next(iter(w.agents.values()));a.zone=1;a.genome='607777091';a.ip=2;a.energy=5.;a.heat=0.;a.age=0
        w.minds[a.ident]['intent_ttl']=0;w.forecasts.clear()
        previous=copy.deepcopy(w.minds[a.ident]['programs']);t=a.token;start=len(w.log)
        with patch.object(w.rng,'random',return_value=1.0):w.act(a)
        self.assertEqual(a.ip,3);self.assertGreater(a.token,t)
        self.assertEqual(w.minds[a.ident]['programs'],previous)
        self.assertEqual(sum(e['event']=='digit_nop' for e in w.log[start:]),1)
        self.assertTrue(next(e for e in w.log[start:] if e['event']=='field_harvest')['neutralized'])

    def test_digit_checkpoint_resumes_in_new_process_and_rejects_tampering(self):
        w=DigitWorld(Config(seed=38992,initial_agents=24,max_agents=180,max_genome=512),Entropy('seeded',38992))
        w.parser_mode='self';w.advance(until_time=30.);clone=copy.deepcopy(w);w.advance(until_time=70.)
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/'digits.sqlite';j=DigitJournal(path);j.save(clone);j.close()
            script="from digit_world import DigitJournal;from reactor import digest;import sys,json;j=DigitJournal(sys.argv[1]);w=j.load();j.close();w.advance(until_time=70.);print(json.dumps([digest(w.snapshot()),digest(w.log)]))"
            p=subprocess.run([sys.executable,'-c',script,str(path)],capture_output=True,text=True,check=True)
            self.assertEqual(json.loads(p.stdout),[digest(w.snapshot()),digest(w.log)])
            import sqlite3
            with sqlite3.connect(path) as db:
                state=json.loads(db.execute('SELECT state FROM checkpoint WHERE singleton=1').fetchone()[0])
                state['digit_genome']['parser_mode']='literal'
                db.execute('UPDATE checkpoint SET state=? WHERE singleton=1',(json.dumps(state),))
            j=DigitJournal(path)
            with self.assertRaises(ValueError):j.load()
            j.close()


if __name__=='__main__':unittest.main()
