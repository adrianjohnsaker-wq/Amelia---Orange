import json
import subprocess
import sys
import tempfile
import threading
import unittest
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from legacy_engine import Config,Entropy
from reactor import digest
from portable import PortableAssemblage
from portable_io import PortableCloudJournal

class PortableCliTests(unittest.TestCase):
    def test_cli_starts_and_reopens_current_version(self):
        with tempfile.TemporaryDirectory() as d:
            path=str(Path(d)/"run.sqlite")
            def call(*args):
                return json.loads(subprocess.run([sys.executable,"portable_cli.py",*args],check=True,capture_output=True,text=True).stdout)
            self.assertTrue(call("init","--db",path)["portable_claims"])
            self.assertEqual(call("advance","--db",path,"--duration","12")["model_time"],12.)
            self.assertEqual(call("status","--db",path)["model_time"],12.)

    def test_cloud_stub_reconstructs_portable_type(self):
        class Stub(BaseHTTPRequestHandler):
            row=None
            def log_message(self,*args):pass
            def respond(self,status,value):
                self.send_response(status);self.send_header("Content-Type","application/json");self.end_headers()
                self.wfile.write(json.dumps(value).encode())
            def do_POST(self):
                type(self).row=json.loads(self.rfile.read(int(self.headers["Content-Length"])))
                self.respond(201,[type(self).row])
            def do_GET(self):self.respond(200,[] if type(self).row is None else [type(self).row])
        server=ThreadingHTTPServer(("127.0.0.1",0),Stub)
        t=threading.Thread(target=server.serve_forever,daemon=True);t.start()
        try:
            w=PortableAssemblage(Config(seed=71,initial_agents=3),Entropy("seeded",71));w.temporal_retention=.85;w.portable_bets=True
            w.advance(until_time=8.);j=PortableCloudJournal(f"http://127.0.0.1:{server.server_port}","key","jwt","run",isolated=True)
            self.assertEqual(j.save(w,0),1);x,revision=j.read();self.assertEqual(revision,1)
            self.assertIsInstance(x,PortableAssemblage);self.assertTrue(x.portable_bets)
            w.advance(until_time=16.);x.advance(until_time=16.);self.assertEqual(digest(w.snapshot()),digest(x.snapshot()))
        finally:server.shutdown();server.server_close();t.join()

if __name__=="__main__":unittest.main()
