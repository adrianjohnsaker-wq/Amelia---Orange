import copy
import json
import subprocess
import sys
import tempfile
import threading
import unittest
from collections import Counter
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from legacy_engine import Config, Entropy, gate, signature, numogram_graph
from reactor import ALL_OPS, FAMILY, Reactor, digest, matrix_definition
from storage import SQLiteJournal, SupabaseJournal


def make(seed=41, populate=False):
    return Reactor(Config(seed=seed, initial_agents=1, max_genome=128),
                   Entropy("seeded", seed), populate=populate)


class ModelTests(unittest.TestCase):
    def test_graph_and_matrix(self):
        cells = matrix_definition()
        self.assertEqual(sum(map(len, numogram_graph().values())), 29)
        self.assertEqual(len(cells), 45)
        self.assertEqual(len({tuple(c["pair"]) for c in cells}), 45)
        self.assertEqual({c["initial_opcode"] for c in cells}, set(ALL_OPS))
        self.assertEqual({FAMILY[x] for x in ALL_OPS}, {"chrono", "zino", "ampy"})
        self.assertEqual([c["address"] for c in cells], [f"{i:02d}" for i in range(45)])

    def test_possession_changes_next_host_instruction_and_conserves_energy(self):
        w = make(); a = w.add_agent(1, "100"); b = w.add_agent(1, "8765"); b.ip = 2
        self.assertEqual(signature(a.genome), gate(b.zone) % 9)
        self.assertTrue(w.infect(a, b))
        self.assertEqual(b.genome, "8710065")
        self.assertAlmostEqual(a.energy + b.energy, 12)
        w.act(b)
        self.assertEqual([e for e in w.log if e["event"] == "execute"][-1]["operand"], 1)
        b.zone = 2
        self.assertFalse(w.infect(a, b))

    def test_necrotic_reconstitution_debits_pool_and_keeps_ancestry(self):
        w = make(); a = w.add_agent(9, "123456", energy=5)
        old_tags = a.origins.copy()
        w.kill(a, "test_shock")
        self.assertFalse(w.agents)
        self.assertEqual(w.corpses[1].zone, 0)
        before = w.resources[0]
        w.advance(until_time=2.1)
        self.assertEqual(len(w.agents), 1)
        e = next(e for e in w.log if e["event"] == "reconstitute")
        self.assertEqual(e["archived"], "123456")
        self.assertEqual(e["origins"], old_tags)
        self.assertEqual(sum(x != y for x, y in zip(e["archived"], e["genome"])), 1)
        self.assertAlmostEqual(w.resources[0], before - 4)
        self.assertAlmostEqual(w.reactor_spent, 4)

    def test_empty_bank_cannot_reconstitute_even_with_energy(self):
        w = make(); self.assertTrue(w.resources[0] >= 4)
        w.advance(until_time=20)
        self.assertFalse(w.agents)
        self.assertEqual(w.count["reconstitute"], 0)
        self.assertTrue(w.queue)  # the substrate clock continues

    def test_clock_congestion_freeze_and_feedback(self):
        w = make(); a = w.add_agent(7, "1234"); b = w.add_agent(7, "5678")
        fast = w.rate(a); b.zone = 1; self.assertGreater(w.rate(a), fast)
        a.zone = 1; self.assertLess(w.rate(a), fast)
        w.schedule_agent(b); old = b.next_due; w.freeze(b, 2)
        self.assertAlmostEqual(b.next_due, old + 2)
        a.zone = 7; before = a.heat; w.execute(a, "catastrophe", 3)
        self.assertGreater(a.heat, before)
        hotter_rate = w.rate(a); a.heat = before; self.assertGreater(hotter_rate, w.rate(a))

    def test_splice_and_corruption_operate_across_and_within_zones(self):
        w = make(); a = w.add_agent(1, "123456"); b = w.add_agent(8, "987654")
        self.assertTrue(w.timesplice(a)); self.assertNotEqual(a.origins, [a.ident] * len(a.origins))
        b.zone = 1; before = b.ip; w.execute(a, "corrupt", 2)
        self.assertNotEqual(before, b.ip)

    def test_prophecy_shadow_targets_share_window(self):
        w = make(); a = w.add_agent(1, "1234", energy=10); w.add_agent(1, "5678")
        w.broadcast(a, 3); self.assertEqual(len(w.bet_traces), 1)
        w.actions += 1; w.resolve_forecasts(1)
        trace = next(iter(w.bet_traces.values()))
        self.assertEqual(trace["opportunities"], 1)
        self.assertEqual(sum(trace["seen"]), 1)
        w.advance(until_time=4)
        self.assertTrue(w.completed_bets)

    def test_opcode_mutation_is_replayable_and_per_cell(self):
        w = make(); before = w.matrix.copy(); w.mutate_matrix()
        e = w.log[-1]; idx = int(e["address"])
        self.assertNotEqual(before[idx], w.matrix[idx])
        self.assertEqual(sum(a != b for a, b in zip(before, w.matrix)), 1)
        self.assertEqual(w.matrix[idx], [x for x in ALL_OPS if x != before[idx]][e["sample"] % 14])


class PersistenceTests(unittest.TestCase):
    def test_disk_restart_in_new_python_process_exact_and_rollback(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "reactor.sqlite"
            w = make(populate=True); w.advance(until_time=8)
            journal = SQLiteJournal(path); journal.save(w)
            saved_digest = digest(journal.load().snapshot())
            w.advance(until_time=10)
            with self.assertRaises(RuntimeError): journal.save(w, inject_failure=True)
            self.assertEqual(saved_digest, digest(journal.load().snapshot()))
            journal.close()
            code = ("from storage import SQLiteJournal; import sys; "
                    "j=SQLiteJournal(sys.argv[1]); w=j.load(); w.advance(until_time=20); "
                    "j.save(w); j.close()")
            subprocess.run([sys.executable, "-c", code, str(path)], check=True)
            direct = make(populate=True); direct.advance(until_time=8); direct.advance(until_time=20)
            journal = SQLiteJournal(path); restored = journal.load(); journal.close()
            self.assertEqual(direct.log, restored.log)
            self.assertEqual(digest(direct.snapshot()), digest(restored.snapshot()))

    def test_tampering_is_detected(self):
        with tempfile.TemporaryDirectory() as d:
            j = SQLiteJournal(Path(d) / "run.sqlite"); w = make(populate=True)
            w.advance(until_time=3); j.save(w)
            j.db.execute("UPDATE events SET body='{}' WHERE seq=1"); j.db.commit()
            with self.assertRaisesRegex(ValueError, "integrity"): j.load()
            j.close()

    def test_reconstitution_after_process_restart(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "run.sqlite"; w = make(); a = w.add_agent(9, "12345")
            w.kill(a, "test_shock"); j = SQLiteJournal(path); j.save(w); j.close()
            subprocess.run([sys.executable, "-c",
                "from storage import SQLiteJournal; import sys; j=SQLiteJournal(sys.argv[1]); "
                "w=j.load(); w.advance(until_time=2.1); j.save(w)", str(path)], check=True)
            j = SQLiteJournal(path); recovered = j.load(); j.close()
            self.assertEqual(recovered.count["reconstitute"], 1)
            self.assertEqual(len(recovered.agents), 1)


class RestStub(BaseHTTPRequestHandler):
    row = None
    def log_message(self, *args): pass
    def reply(self, status, value):
        raw = json.dumps(value).encode(); self.send_response(status)
        self.send_header("Content-Type", "application/json"); self.end_headers(); self.wfile.write(raw)
    def body(self): return json.loads(self.rfile.read(int(self.headers["Content-Length"])))
    def do_GET(self): self.reply(200, [] if type(self).row is None else [type(self).row])
    def do_POST(self):
        if type(self).row is not None: return self.reply(409, {})
        type(self).row = self.body(); self.reply(201, [type(self).row])
    def do_PATCH(self):
        revision = int(parse_qs(urlparse(self.path).query)["revision"][0].split(".")[1])
        if type(self).row is None or type(self).row["revision"] != revision: return self.reply(200, [])
        type(self).row.update(self.body()); self.reply(200, [type(self).row])


class RestAdapterTests(unittest.TestCase):
    def test_http_contract_and_revision_conflict(self):
        RestStub.row = None
        server = ThreadingHTTPServer(("127.0.0.1", 0), RestStub)
        thread = threading.Thread(target=server.serve_forever, daemon=True); thread.start()
        try:
            adapter = SupabaseJournal(f"http://127.0.0.1:{server.server_port}", "test-key", "test-jwt", "run", isolated=True)
            w = make(populate=True); w.advance(until_time=3)
            self.assertEqual(adapter.save(w, 0), 1)
            restored, revision = adapter.read(); self.assertEqual(revision, 1)
            self.assertEqual(digest(restored.snapshot()), digest(w.snapshot()))
            w.advance(until_time=6); self.assertEqual(adapter.save(w, 1), 2)
            with self.assertRaisesRegex(RuntimeError, "concurrently"): adapter.save(w, 1)
            RestStub.row["payload"]["events"][0]["event"] = "tampered"
            with self.assertRaisesRegex(ValueError, "integrity"): adapter.read()
        finally:
            server.shutdown(); server.server_close(); thread.join()

    def test_requires_isolation_and_secure_transport(self):
        with self.assertRaises(ValueError): SupabaseJournal("https://example.com", "key", "jwt", "run")
        with self.assertRaises(ValueError): SupabaseJournal("http://example.com", "key", "jwt", "run", isolated=True)
        with self.assertRaises(ValueError): SupabaseJournal("https://example.com", "sb_secret_bad", "jwt", "run", isolated=True)


if __name__ == "__main__": unittest.main()
