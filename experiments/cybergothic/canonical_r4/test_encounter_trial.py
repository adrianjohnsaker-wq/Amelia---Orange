import copy
import subprocess
import sys
import tempfile
import unittest
from collections import Counter
from pathlib import Path
from legacy_engine import Config,Entropy
from portable import PortableAssemblage
from reactor import digest
from encounter_trial import ARMS,EncounterWorld,EncounterJournal,balanced_schedule,create_root,find_encounter,finish_delivery,run_seed

def base(seed,cls):
    w=cls(Config(seed=seed,initial_agents=36,max_agents=180,max_genome=1000000),Entropy("seeded",seed))
    w.recovery_floor=8;w.pulse_renewal=.6;w.steering_mode="target";w.feedback_gain=1.8
    w.archive_mode="random";w.forecast_mode="learned";w.vector_mode="intact";w.cargo_policy="experienced"
    w.temporal_hold=3;w.salvage_feedback=True;w.temporal_retention=.85;w.portable_bets=True
    w.advance(until_time=30.)
    for ident in sorted(w.agents)[::2]:w.kill(w.agents[ident],"shared_ecological_shock")
    w.cfg.max_genome=512;return w

class EncounterTests(unittest.TestCase):
    def test_instrumented_packets_leave_prior_ecology_unchanged(self):
        old=base(31991,PortableAssemblage);new=create_root(31991)
        old.advance(until_time=70.);new.advance(until_time=70.)
        self.assertEqual(old.log,new.log)
        self.assertEqual(old.rng.getstate(),new.rng.getstate())
        self.assertEqual(old.environment_rng.getstate(),new.environment_rng.getstate())

    def test_manual_scheduler_reproduces_unintervened_ecology(self):
        a=create_root(31991);b=copy.deepcopy(a);a.advance(until_time=70.)
        used_hosts=set();used_packets=set();excluded=Counter()
        while True:
            encounter=find_encounter(b,used_hosts,used_packets,70.,excluded)
            if encounter is None:break
            used_hosts.add(encounter.recipient)
            finish_delivery(b,encounter.packet,encounter.recipient,"experienced")
        self.assertEqual(a.log,b.log)
        self.assertEqual(digest(a.snapshot()),digest(b.snapshot()))

    def test_conditions_have_same_host_energy_and_original_fork(self):
        w=create_root(31991);e=find_encounter(w,set(),set(),100.,Counter());self.assertIsNotNone(e)
        packet=w.packets[e.packet];choices=packet["alternatives"];snapshot=digest(w.snapshot());out=[]
        self.assertEqual(Counter(choices["experienced"]["code"]),Counter(choices["shuffled"]["code"]))
        self.assertEqual(Counter(zip(choices["experienced"]["code"],choices["experienced"]["origins"])),
                         Counter(zip(choices["shuffled"]["code"],choices["shuffled"]["origins"])))
        for arm in ARMS:
            c=copy.deepcopy(w);self.assertEqual(digest(c.snapshot()),snapshot)
            finish_delivery(c,e.packet,e.recipient,arm,trial=True)
            out.append((c.agents[e.recipient].energy,c.rng.getstate(),len(c.agents[e.recipient].genome)))
        self.assertTrue(out[0]==out[1]==out[2])

    def test_known_fragments_can_change_the_hosts_action(self):
        w=EncounterWorld(Config(seed=7,initial_agents=1),Entropy("seeded",7),populate=False)
        donor=w.add_agent(1,"16120612",energy=10);host=w.add_agent(1,"9999",energy=6)
        w.minds[donor.ident]["programs"]={"0612":[4,.4],"1612":[4,.04]}
        w.vector_mode="intact";w.cargo_policy="experienced";self.assertTrue(w.shed(donor))
        w.packets[1]["zone"]=1;w.field[1]=[1.,0.,0.]
        outcomes={}
        for arm in ("experienced","pointer"):
            c=copy.deepcopy(w);finish_delivery(c,1,host.ident,arm,trial=True)
            c.forage(c.agents[host.ident]);outcomes[arm]=c.log[-1]
        self.assertEqual(outcomes["experienced"]["focus"],0)
        self.assertEqual(outcomes["pointer"]["focus"],1)
        self.assertGreater(outcomes["experienced"]["intake"],outcomes["pointer"]["intake"])

    def test_randomization_is_reproducible_balanced_and_recorded(self):
        seq=balanced_schedule(99,8);counts=Counter(seq)
        self.assertEqual(seq,balanced_schedule(99,8))
        self.assertLessEqual(max(counts.values())-min(counts.values()),1)
        a=run_seed(31991,2,6.);b=run_seed(31991,2,6.)
        self.assertGreater(len(a["trials"]),0)
        self.assertEqual(a,b)
        for trial in a["trials"]:
            self.assertEqual(set(trial["outcomes"]),set(ARMS))
            self.assertIn(trial["continuation_assignment"],ARMS)
            self.assertEqual(len({len(trial["before"]["alternatives"][x]["code"]) for x in ARMS}),1)

    def test_paused_encounter_survives_a_fresh_process(self):
        w=create_root(31991);e=find_encounter(w,set(),set(),100.,Counter());self.assertIsNotNone(e)
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/"encounter.sqlite";j=EncounterJournal(path);j.save(w);j.close()
            code=("from encounter_trial import EncounterJournal,finish_delivery;import sys;"
                  "j=EncounterJournal(sys.argv[1]);w=j.load();p=w.pending_trial;"
                  "finish_delivery(w,p['packet'],p['recipient'],'pointer',trial=True);"
                  "w.advance(until_time=p['time']+6.);j.save(w);j.close()")
            subprocess.run([sys.executable,"-c",code,str(path)],check=True)
            finish_delivery(w,e.packet,e.recipient,"pointer",trial=True);w.advance(until_time=e.time+6.)
            j=EncounterJournal(path);restored=j.load();j.close()
            self.assertEqual(w.log,restored.log)
            self.assertEqual(digest(w.snapshot()),digest(restored.snapshot()))

if __name__=="__main__":unittest.main()
