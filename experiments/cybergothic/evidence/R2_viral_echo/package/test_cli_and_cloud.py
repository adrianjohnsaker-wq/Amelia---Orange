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
from adaptive import AdaptiveAssemblage
from adaptive_io import AdaptiveCloudJournal

class CliAndCloudTests(unittest.TestCase):
    def test_adaptive_cli_persists_configuration_and_continues(self):
        with tempfile.TemporaryDirectory() as d:
            db=str(Path(d)/"run.sqlite")
            def cmd(*x):return json.loads(subprocess.run([sys.executable,"adaptive_cli.py",*x],check=True,capture_output=True,text=True).stdout)
            self.assertEqual(cmd("init","--db",db)["temporal_retention"],1.)
            self.assertEqual(cmd("advance","--db",db,"--duration","8")["model_time"],8.)
            self.assertEqual(cmd("set-retention","--db",db,"--retention",".85")["temporal_retention"],.85)
            self.assertEqual(cmd("advance","--db",db,"--duration","8")["model_time"],16.)

    def test_cloud_stub_preserves_adaptive_type_and_rng(self):
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
            w=AdaptiveAssemblage(Config(seed=71,initial_agents=3),Entropy("seeded",71));w.temporal_retention=.85
            w.advance(until_time=8.);j=AdaptiveCloudJournal(f"http://127.0.0.1:{server.server_port}","key","jwt","run",isolated=True)
            self.assertEqual(j.save(w,0),1);x,revision=j.read();self.assertEqual(revision,1)
            self.assertIsInstance(x,AdaptiveAssemblage);self.assertEqual(x.temporal_retention,.85)
            w.advance(until_time=16.);x.advance(until_time=16.);self.assertEqual(digest(w.snapshot()),digest(x.snapshot()))
        finally:
            server.shutdown();server.server_close();t.join()

if __name__=="__main__":unittest.main()
