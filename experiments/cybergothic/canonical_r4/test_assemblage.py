import copy
import json
import subprocess
import sys
import tempfile
import unittest
import threading
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from collections import Counter

from legacy_engine import Config, Entropy, signature
from reactor import digest
from assemblage import Assemblage, AssemblageJournal, AssemblageCloudJournal


def world(seed=11, populate=False):
    return Assemblage(Config(seed=seed, initial_agents=1, max_genome=256),
                      Entropy("seeded",seed),populate=populate)


class AssemblageTests(unittest.TestCase):
    def test_ordered_genome_changes_embodied_activity(self):
        a=world(); one=a.add_agent(1,"436"); two=a.add_agent(1,"346")
        self.assertEqual(Counter(one.genome),Counter(two.genome))
        a.minds[one.ident]["focus"]=0; a.minds[two.ident]["focus"]=0
        a.forage(one); first=a.log[-1]; a.forage(two);second=a.log[-1]
        self.assertEqual(first["focus"],1);self.assertEqual(second["focus"],0)

    def test_external_environment_is_exogenous_and_replayable(self):
        x=world(populate=True);y=copy.deepcopy(x)
        x.vector_mode="intact";y.vector_mode="off";x.forecast_mode="learned"
        x.advance(until_time=60.);y.advance(until_time=60.)
        a=[e["signals"] for e in x.log if e["event"]=="environment"]
        b=[e["signals"] for e in y.log if e["event"]=="environment"]
        self.assertEqual(a,b);self.assertEqual(len(a),10)

    def test_fate_commit_precedes_reveal_for_same_epoch(self):
        w=world(populate=True);w.forecast_mode="learned";w.advance(until_time=36.)
        commits={}
        reveals=0
        for e in w.log:
            if e["event"]=="fate_commit": commits[e["zone"],e["epoch"]]=e
            elif e["event"]=="fate_reveal":
                c=commits[e["zone"],e["epoch"]];reveals+=1
                self.assertLess(c["time"],e["time"])
                self.assertEqual(c["chosen"],e["chosen"])
        self.assertGreater(reveals,0)

    def test_vector_inserts_code_at_host_instruction_pointer(self):
        w=world();a=w.add_agent(1,"1000",energy=10);b=w.add_agent(1,"8765",energy=10)
        b.ip=2; w.vector_mode="intact";self.assertTrue(w.shed(a))
        packet=w.packets[1];packet["zone"]=1
        self.assertEqual(packet["gate_signature"],signature(a.genome))
        before=b.genome;cargo=packet["code"];w.deliver_vector(1)
        self.assertEqual(b.genome,before[:2]+cargo+before[2:])
        self.assertEqual(w.count["vector_infection"],1)
        self.assertEqual(b.origins[2:2+len(cargo)],packet["origins"])

    def test_ampy_salvage_debits_dying_agent_and_funds_cthell(self):
        w=world();a=w.add_agent(1,"1234",energy=10);w.resources[0]=2.;w.salvage_feedback=True
        w.kill(a,"meltdown")
        e=[e for e in w.log if e["event"]=="ampy_salvage"][0]
        self.assertAlmostEqual(e["energy_to_vault"],3.5)
        self.assertAlmostEqual(w.ampy_vault,3.5)
        w.reconstitution=False
        w.pulse()
        self.assertAlmostEqual(w.resources[0],5.68)
        death=[e for e in w.log if e["event"]=="death"][0]
        self.assertEqual(death["energy"],6.5)

    def test_guided_archive_uses_past_efficiency_and_shuffles_order_only(self):
        w=world();sources=[]
        for i,code in enumerate(("12345","67890","11123")):
            a=w.add_agent(1,code);w.minds[a.ident]["harvest"]=(i+1)*.2
            w.minds[a.ident]["forages"]=10;w.kill(a,"test");sources.append(a.ident)
        w.resources[0]=8;w.recovery_floor=1;w.archive_mode="guided";w.pulse()
        e=[e for e in w.log if e["event"]=="reconstitute"][-1]
        self.assertEqual(e["source_corpse"],3)
        v=world()
        for i,code in enumerate(("12345","67890","11123")):
            a=v.add_agent(1,code);v.minds[a.ident]["harvest"]=(i+1)*.2
            v.minds[a.ident]["forages"]=10;v.kill(a,"test")
        v.resources[0]=8;v.recovery_floor=1;v.archive_mode="shuffled";v.pulse()
        e=[e for e in v.log if e["event"]=="reconstitute"][-1]
        self.assertEqual(Counter(e["pre_mutation"]),Counter(e["archived"]))

    def test_persistent_scheduler_field_packets_and_rng_resume_exactly(self):
        w=world(populate=True);w.archive_mode="guided";w.vector_mode="intact"
        w.salvage_feedback=True;w.forecast_mode="learned";w.advance(until_time=20.)
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/"archive.sqlite";j=AssemblageJournal(path);j.save(w);j.close()
            code=("from assemblage import AssemblageJournal;import sys;"
                  "j=AssemblageJournal(sys.argv[1]);w=j.load();w.advance(until_time=40.0);j.save(w);j.close()")
            subprocess.run([sys.executable,"-c",code,str(path)],check=True)
            w.advance(until_time=40.);j=AssemblageJournal(path);other=j.load();j.close()
            self.assertEqual(w.log,other.log)
            self.assertEqual(digest(w.snapshot()),digest(other.snapshot()))

    def test_isolated_cloud_contract_retains_extended_state(self):
        class Stub(BaseHTTPRequestHandler):
            row=None
            def log_message(self,*args):pass
            def respond(self,status,value):
                self.send_response(status);self.send_header("Content-Type","application/json")
                self.end_headers();self.wfile.write(json.dumps(value).encode())
            def do_POST(self):
                type(self).row=json.loads(self.rfile.read(int(self.headers["Content-Length"])))
                self.respond(201,[type(self).row])
            def do_GET(self):self.respond(200,[] if type(self).row is None else [type(self).row])
        server=ThreadingHTTPServer(("127.0.0.1",0),Stub)
        thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
        try:
            w=world(populate=True);w.vector_mode="intact";w.forecast_mode="learned";w.advance(until_time=8.)
            j=AssemblageCloudJournal(f"http://127.0.0.1:{server.server_port}","key","jwt","run",isolated=True)
            self.assertEqual(j.save(w,0),1);other,revision=j.read();self.assertEqual(revision,1)
            self.assertEqual(digest(w.snapshot()),digest(other.snapshot()))
            w.advance(until_time=20.);other.advance(until_time=20.)
            self.assertEqual(digest(w.snapshot()),digest(other.snapshot()))
        finally:
            server.shutdown();server.server_close();thread.join()

    def test_full_population_loss_recovers_from_persisted_experience(self):
        w=world(seed=51,populate=True);w.recovery_floor=4;w.pulse_renewal=.6
        w.archive_mode="guided";w.salvage_feedback=True;w.advance(until_time=10.)
        for a in list(w.agents.values()):w.kill(a,"controlled_shock")
        self.assertFalse(w.agents);self.assertTrue(w.archive)
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/"shock.sqlite";j=AssemblageJournal(path);j.save(w);j.close()
            code=("from assemblage import AssemblageJournal;import sys;"
                  "j=AssemblageJournal(sys.argv[1]);w=j.load();w.advance(until_time=30.0);j.save(w);j.close()")
            subprocess.run([sys.executable,"-c",code,str(path)],check=True)
            w.advance(until_time=30.);j=AssemblageJournal(path);other=j.load();j.close()
            self.assertGreater(other.count["reconstitute"],0)
            self.assertEqual(digest(w.snapshot()),digest(other.snapshot()))

if __name__=="__main__":unittest.main()
