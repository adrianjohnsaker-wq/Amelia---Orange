"""A separate, event-driven cybergothic Numogram reactor.

Digits execute only in this virtual machine; no digit string is native code.
This extends the archived 2026-11-13 prototype and does not import Amelia.
"""
from __future__ import annotations

import copy
import hashlib
import heapq
import json
import random
from collections import Counter
from dataclasses import asdict

from legacy_engine import Agent, Config, Corpse, Entropy, Forecast, PAIRS, World
from legacy_engine import gate, numogram_graph, signature

CHRONO = ("freeze", "replay", "prophecy", "delay", "recall")
ZINO = ("infect", "fission", "scavenge", "timesplice", "decoy")
AMPY = ("overclock", "invert", "shrapnel", "catastrophe", "corrupt")
ALL_OPS = CHRONO + ZINO + AMPY
FAMILY = {**{x: "chrono" for x in CHRONO}, **{x: "zino" for x in ZINO},
          **{x: "ampy" for x in AMPY}}


def matrix_definition():
    """45 independent pair addresses; this is an experimental, not CCRU, mapping."""
    cells = []
    for index, (a, b) in enumerate(PAIRS):
        family = ZINO if a + b == 9 else AMPY if b >= 7 else CHRONO
        opcode = family[(a + 2 * b) % len(family)]
        cells.append({"address": f"{index:02d}", "pair": [a, b],
                      "initial_family": FAMILY[opcode], "initial_opcode": opcode})
    return cells


def canonical(obj):
    return json.dumps(obj, sort_keys=True, separators=(",", ":"),
                      ensure_ascii=True, allow_nan=False).encode()


def digest(obj):
    return hashlib.sha256(canonical(obj)).hexdigest()


def tuples(v):
    return tuple(tuples(x) for x in v) if isinstance(v, list) else v


class Reactor(World):
    def __init__(self, config, entropy, populate=True):
        super().__init__(config, entropy, populate=populate)
        self.matrix = [x["initial_opcode"] for x in matrix_definition()]
        self.flight_mode = "transient"
        self.flight_theta = 12
        self.weight_mode = "uniform"
        # This archival memory is independent of the capped, consumable corpse
        # field. Every copied digit retains its original ancestry tag.
        self.archive = {}
        self.reconstitution = True
        self.reactor_input = 0.0
        self.reactor_spent = 0.0
        self.pulse_period = 2.0
        self.pulse_renewal = 0.18
        self.reconstitution_cost = 4.0
        # Locally biased virtual mutation, never a claim of real time reversal.
        self.steering_mode = "off"  # off, sham, target, wrong_target
        self.steering_cost = .05
        self.feedback_gain = 1.35
        self.trace_counter = 0
        self.bet_traces = {}
        self.completed_bets = []

    def corpse(self, zone, genome, origin, cause, origins=None):
        c = super().corpse(zone, genome, origin, cause, origins)
        self.archive[c.ident] = {"corpse": c.ident, "zone": c.zone,
                                 "genome": c.genome, "origin": c.origin,
                                 "origins": c.origins.copy(), "cause": c.cause}
        self.emit("archive_store", corpse=c.ident, origin=origin, cause=cause,
                  genome=c.genome, origins=c.origins.copy())
        return c

    def pulse(self):
        gain = min(self.pulse_renewal, max(0., 8.0 - self.resources[0]))
        self.resources[0] += gain
        self.reactor_input += gain
        if not self.agents and self.reconstitution and self.cfg.recycling and self.archive:
            if self.resources[0] >= self.reconstitution_cost:
                # Choosing from a finite stored archive is explicit, and energy
                # is debited before the host comes into existence.
                source = self.archive[self.rng.choice(sorted(self.archive))]
                code = source["genome"]
                position = self.rng.randrange(len(code))
                new_digit = (int(code[position]) + 1 + self.rng.randrange(9)) % 10
                code = code[:position] + str(new_digit) + code[position + 1:]
                self.resources[0] -= self.reconstitution_cost
                self.reactor_spent += self.reconstitution_cost
                host = self.add_agent(self.rng.choice((1, 2, 4, 5)), code,
                                      energy=self.reconstitution_cost,
                                      lineage=source["origin"])
                if host is None:
                    raise AssertionError("reconstitution could not create host")
                host.origins = source["origins"][:len(host.genome)].copy()
                host.origin_history = [host.origins.copy()]
                self.emit("reconstitute", agent=host.ident, source_corpse=source["corpse"],
                          source_agent=source["origin"], archived=source["genome"],
                          genome=host.genome, mutation_position=position,
                          origins=host.origins.copy(), energy_debit=self.reconstitution_cost,
                          pool_after=round(self.resources[0], 9))
        self.enqueue(self.now + self.pulse_period, "reactor", 0)

    def mutate_matrix(self):
        address = self.rng.randrange(45)
        raw = self.entropy.next()
        before = self.matrix[address]
        choices = [x for x in ALL_OPS if x != before]
        after = choices[raw % len(choices)]
        self.matrix[address] = after
        self.emit("opcode_mutation", address=f"{address:02d}", pair=list(PAIRS[address]),
                  before=before, after=after, before_family=FAMILY[before],
                  after_family=FAMILY[after], sample=raw)

    def execute(self, agent, op, operand):
        peers = self.occupants(agent.zone, agent.ident)
        if op in ("freeze", "replay", "prophecy", "infect", "fission", "scavenge",
                  "timesplice", "overclock", "invert", "shrapnel"):
            return super().execute(agent, op, operand)
        if op == "delay" and peers:
            target = self.rng.choice(peers)
            self.freeze(target, delay=0.75 + .15 * operand)
            self.emit("chrono_delay", agent=agent.ident, target=target.ident)
        elif op == "recall" and peers:
            target = self.rng.choice(peers)
            if len(target.history) > 1:
                before = target.genome
                target.genome, target.ip = target.history[-2]
                target.origins = target.origin_history[-2].copy()
                self.emit("chrono_recall", agent=agent.ident, target=target.ident,
                          before=before, after=target.genome, ip=target.ip)
        elif op == "decoy" and agent.energy > .4:
            size = min(6, len(agent.genome))
            code = (agent.genome + agent.genome)[agent.ip:agent.ip + size]
            tags = (agent.origins + agent.origins)[agent.ip:agent.ip + size]
            agent.energy -= .3
            c = self.corpse(agent.zone, code, agent.ident, "decoy_opcode", tags)
            self.emit("zino_decoy", agent=agent.ident, corpse=c.ident, cost=.3)
        elif op == "catastrophe":
            # Accelerating positive feedback: both heat and heat-dependent clock
            # rate rise; the inherited threshold actually fragments the agent.
            before = agent.heat
            agent.heat = min(12., agent.heat * self.feedback_gain + .8)
            agent.energy -= .12
            self.emit("ampy_feedback", agent=agent.ident, zone=agent.zone,
                      heat_before=round(before, 8), heat_after=round(agent.heat, 8))
        elif op == "corrupt" and peers:
            for target in peers:
                before = target.ip
                target.ip = (target.ip + 1 + operand) % len(target.genome)
                self.emit("address_corruption", agent=target.ident, source=agent.ident,
                          zone=agent.zone, before=before, after=target.ip)
            self.emit("ampy_corrupt", agent=agent.ident, zone=agent.zone, targets=len(peers))

    def mutate_genome(self, agent, reason):
        forecasts = [f for f in self.forecasts.values() if f.zone == agent.zone
                     and f.agent in self.agents and self.agents[f.agent].energy > self.steering_cost]
        if self.steering_mode == "off" or not forecasts:
            return super().mutate_genome(agent, reason)
        if self.steering_mode not in ("sham", "target", "wrong_target"):
            raise ValueError("unknown attractor steering mode")
        f = min(forecasts, key=lambda f: f.ident)
        owner = self.agents[f.agent]
        # The same candidate and cost are generated in all arms; steering can
        # select a replacement candidate only at an existing mutation event.
        position = self.rng.randrange(len(agent.genome))
        before = agent.genome
        old = int(before[position])
        random_candidate = (old + 1 + self.rng.randrange(9)) % 10
        collective_before = sum(signature(a.genome) for a in self.occupants(agent.zone)) % 9
        aimed = f.target if self.steering_mode != "wrong_target" else (f.target + 4) % 9
        delta = (aimed - collective_before) % 9
        selected = (old + delta) % 9 if self.steering_mode != "sham" and delta else random_candidate
        agent.genome = before[:position] + str(selected) + before[position + 1:]
        owner.energy -= self.steering_cost
        collective_after = (collective_before - old + selected) % 9
        self.emit("genome_mutation", agent=agent.ident, zone=agent.zone, position=position,
                  before=before, after=agent.genome, reason=reason)
        self.emit("attractor_engage", mode=self.steering_mode, prophecy=f.ident,
                  owner=owner.ident, subject=agent.ident, zone=agent.zone, target=f.target,
                  aimed=aimed, collective_before=collective_before,
                  collective_after=collective_after, candidate=random_candidate,
                  selected=selected, cost=self.steering_cost)

    def broadcast(self, agent, target):
        previous = self.next_forecast
        super().broadcast(agent, target)
        if self.next_forecast != previous:
            f = self.forecasts[self.next_forecast]
            # The entire target-space is shadowed, using the same observations
            # and window. These are controls, not independent forecasts.
            self.bet_traces[f.ident] = {"id": f.ident, "target": f.target,
                                       "zone": f.zone, "expires": f.expires,
                                       "created_action": f.created_action,
                                       "seen": [False] * 9, "opportunities": 0}
            self.enqueue(f.expires, "bet_audit", f.ident)

    def resolve_forecasts(self, changed_zone):
        for trace in self.bet_traces.values():
            if (trace["zone"] == changed_zone and self.actions > trace["created_action"]
                    and self.now <= trace["expires"]):
                total = sum(signature(a.genome) for a in self.occupants(changed_zone)) % 9
                trace["seen"][total] = True
                trace["opportunities"] += 1
        return super().resolve_forecasts(changed_zone)

    def finish_bet_trace(self, ident):
        trace = self.bet_traces.pop(ident, None)
        if trace is not None:
            self.completed_bets.append(trace)
            self.emit("bet_audit", prophecy=ident, target=trace["target"],
                      opportunities=trace["opportunities"], seen=trace["seen"])

    def advance(self, *, until_time=None, until_actions=None, max_events=1000000):
        if until_time is None and until_actions is None:
            raise ValueError("a finite horizon is required")
        if not self.started:
            self.started = True
            for a in list(self.agents.values()):
                self.schedule_agent(a)
            self.enqueue(self.now + self.pulse_period, "reactor", 0)
        processed = 0
        while self.queue:
            if until_actions is not None and self.actions >= until_actions:
                break
            when, serial, kind, ident, token = heapq.heappop(self.queue)
            if until_time is not None and when > until_time:
                heapq.heappush(self.queue, (when, serial, kind, ident, token))
                self.now = max(self.now, until_time)
                break
            processed += 1
            if processed > max_events:
                raise RuntimeError("event limit reached before requested horizon")
            if kind == "agent":
                agent = self.agents.get(ident)
                if agent is None or agent.token != token:
                    continue
                self.now = when
                self.act(agent)
            elif kind == "ferment" and ident in self.corpses:
                self.now = when
                self.ferment(ident)
            elif kind == "forecast" and ident in self.forecasts:
                self.now = when
                self.expire_forecast(ident)
            elif kind == "bet_audit" and ident in self.bet_traces:
                self.now = when
                self.finish_bet_trace(ident)
            elif kind == "reactor":
                self.now = when
                self.pulse()
        return processed

    def snapshot(self):
        return json.loads(canonical({"schema": 1, "config": asdict(self.cfg),
                "graph": self.graph, "matrix": self.matrix,
                "agents": {str(k): asdict(v) for k, v in self.agents.items()},
                "corpses": {str(k): asdict(v) for k, v in self.corpses.items()},
                "forecasts": {str(k): asdict(v) for k, v in self.forecasts.items()},
                "waiting": sorted(self.waiting_corpses),
                "resources": self.resources, "inverted_until": self.inverted_until,
                "queue": self.queue, "serial": self.serial, "next_agent": self.next_agent,
                "next_corpse": self.next_corpse, "next_forecast": self.next_forecast,
                "now": self.now, "actions": self.actions, "count": dict(self.count),
                "transitions": dict(self.transitions), "zone_actions": dict(self.zone_actions),
                "high_water": self.high_water, "started": self.started,
                "rng": self.rng.getstate(), "entropy_mode": self.entropy.mode,
                "entropy_rng": self.entropy.rng.getstate(), "entropy_input": self.entropy.input,
                "entropy_used": self.entropy.used,
                "entropy_sensor": str(self.entropy.sensor_path) if self.entropy.sensor_path else None,
                "flight_mode": self.flight_mode, "flight_theta": self.flight_theta,
                "weight_mode": self.weight_mode, "warp_dwell": self.warp_dwell,
                "flight_gates": {str(k): sorted(v) for k, v in self.flight_gates.items()},
                "archive": self.archive, "reconstitution": self.reconstitution,
                "reactor_input": self.reactor_input, "reactor_spent": self.reactor_spent,
                "pulse_period": self.pulse_period, "pulse_renewal": self.pulse_renewal,
                "reconstitution_cost": self.reconstitution_cost,
                "steering_mode": self.steering_mode, "steering_cost": self.steering_cost,
                "feedback_gain": self.feedback_gain,
                "bet_traces": self.bet_traces, "completed_bets": self.completed_bets,
                "log_length": len(self.log), "log_hash": digest(self.log)}))

    @classmethod
    def restore(cls, s, events):
        from pathlib import Path
        if s["schema"] != 1 or s["log_length"] != len(events) or s["log_hash"] != digest(events):
            raise ValueError("checkpoint or event ledger has changed")
        entropy = Entropy(s["entropy_mode"], s["config"]["seed"], samples=s["entropy_input"],
                          sensor_path=Path(s["entropy_sensor"]) if s["entropy_sensor"] else None)
        w = cls(Config(**s["config"]), entropy, populate=False)
        w.graph = {int(k): tuple(v) for k, v in s["graph"].items()}
        w.matrix = list(s["matrix"])
        # Insertion order affects random selection in the inherited ecology.
        # IDs are monotone, whereas canonical JSON sorts their keys lexically.
        ordered = lambda d: sorted(d.items(), key=lambda item: int(item[0]))
        w.agents = {int(k): Agent(**v) for k, v in ordered(s["agents"])}
        w.corpses = {int(k): Corpse(**v) for k, v in ordered(s["corpses"])}
        w.forecasts = {int(k): Forecast(**v) for k, v in ordered(s["forecasts"])}
        w.waiting_corpses = set(s["waiting"])
        for key in ("resources", "inverted_until", "serial", "next_agent", "next_corpse",
                    "next_forecast", "now", "actions", "high_water", "started", "flight_mode",
                    "flight_theta", "weight_mode", "reconstitution", "reactor_input",
                    "reactor_spent", "pulse_period", "pulse_renewal", "reconstitution_cost",
                    "steering_mode", "steering_cost", "feedback_gain",
                    "completed_bets"):
            setattr(w, key, copy.deepcopy(s[key]))
        w.queue = [tuple(row) for row in s["queue"]]
        heapq.heapify(w.queue)
        w.count = Counter(s["count"])
        w.transitions = Counter(s["transitions"])
        w.zone_actions = Counter({int(k): v for k, v in s["zone_actions"].items()})
        w.rng.setstate(tuples(s["rng"]))
        w.entropy.rng.setstate(tuples(s["entropy_rng"]))
        w.entropy.used = list(s["entropy_used"])
        w.warp_dwell = {int(k): v for k, v in s["warp_dwell"].items()}
        w.flight_gates = {int(k): {tuple(e) for e in v} for k, v in s["flight_gates"].items()}
        w.archive = {int(k): v for k, v in ordered(s["archive"])}
        w.bet_traces = {int(k): v for k, v in ordered(s["bet_traces"])}
        w.log = copy.deepcopy(events)
        return w
