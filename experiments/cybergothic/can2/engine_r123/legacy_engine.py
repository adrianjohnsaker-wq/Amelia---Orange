"""Experimental cybergothic ALife engine, separate from Amelia Orange.

All digit code runs inside this tiny interpreter; it is never Python or machine code.
"""
from __future__ import annotations

import heapq
import itertools
import json
import math
import random
import time
from collections import Counter
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any
import topology as T


# From Amelia Orange's two files at 8f3bc33c4dc4a44da08ec40c42a8eec1008c79bc.
BASE_EDGES = {(0, 9), (1, 8), (2, 7), (3, 6), (4, 5), (1, 2),
              (2, 4), (4, 7), (7, 8), (8, 9), (9, 1)}
PAIRS = list(itertools.combinations(range(10), 2))
OPS = ("freeze", "replay", "prophecy", "infect", "fission", "scavenge", "timesplice",
       "overclock", "invert", "shrapnel")


def digital_root(n: int) -> int:
    return 0 if n == 0 else 1 + (n - 1) % 9


def gate(z: int) -> int:
    return digital_root(z * (z + 1) // 2)


def numogram_graph() -> dict[int, tuple[int, ...]]:
    edges = set(BASE_EDGES)
    for z in range(10):
        edges.update({(z, 9 - z), (z, abs(2 * z - 9)), (z, gate(z))})
    return {z: tuple(sorted(b for a, b in edges if a == z)) for z in range(10)}


def initial_matrix() -> list[str]:
    # A new experimental classification, not a CCRU demon-name mapping.
    result = []
    for a, b in PAIRS:
        group = T.family_of(a, b, OPS[3:7], OPS[7:], OPS[:3])
        result.append(group[(a + 2 * b) % len(group)])
    return result


def matrix_address(zone: int, operand: int) -> int:
    other = operand if operand != zone else 9 - zone
    return PAIRS.index(tuple(sorted((zone, other))))


def signature(genome: str) -> int:
    return sum(map(int, genome)) % 9


@dataclass
class Config:
    seed: int = 20261112
    actions: int = 3000
    initial_agents: int = 36
    max_agents: int = 180
    max_genome: int = 48
    max_corpses: int = 500
    infection: bool = True
    timesplice: bool = True
    recycling: bool = True
    meltdown: bool = True
    prophecy: bool = True
    local_clocks: bool = True
    opcode_mutation_probability: float = 0.025

    def validate(self) -> None:
        if not (1 <= self.initial_agents <= self.max_agents <= 5000):
            raise ValueError("require 1 <= initial agents <= max agents <= 5000")
        if not (1 <= self.actions <= 10_000_000):
            raise ValueError("actions must be between 1 and 10000000")
        if self.max_genome < 4 or self.max_corpses < 1:
            raise ValueError("max genome must be >= 4; max corpses must be >= 1")
        if not 0 <= self.opcode_mutation_probability <= 1:
            raise ValueError("opcode mutation probability must be in [0, 1]")


@dataclass
class Agent:
    ident: int
    zone: int
    genome: str
    energy: float = 6.0
    ip: int = 0
    heat: float = 0.0
    age: int = 0
    token: int = 0
    next_due: float = 0.0
    history: list[tuple[str, int]] = field(default_factory=list)
    # Observer only: one founder identity per digit, and snapshots matching
    # history. These tags never enter opcode choice or any random draw.
    origins: list[int] = field(default_factory=list)
    origin_history: list[list[int]] = field(default_factory=list)
    lineage: int = 0


@dataclass
class Corpse:
    ident: int
    zone: int
    genome: str
    origin: int
    cause: str
    fermented: bool = False
    origins: list[int] = field(default_factory=list)


@dataclass
class Forecast:
    ident: int
    agent: int
    zone: int
    target: int
    created_action: int
    expires: float


class Entropy:
    """One integer per mutation; live timing values are recorded for exact replay."""
    def __init__(self, mode: str, seed: int, samples: list[int] | None = None,
                 sensor_path: Path | None = None):
        if mode not in {"seeded", "live", "replay", "sensor"}:
            raise ValueError("invalid entropy mode")
        if mode == "sensor" and sensor_path is None:
            raise ValueError("sensor mode requires a telemetry path")
        self.mode = mode
        self.sensor_path = sensor_path
        self.rng = random.Random(seed ^ 0xC7E11)
        self.input = samples or []
        self.used: list[int] = []

    def next(self) -> int:
        if self.mode == "seeded":
            n = self.rng.getrandbits(64)
        elif self.mode == "live":
            # External to the model, but neither certified random nor an Outside signal.
            n = time.perf_counter_ns()
        elif self.mode == "sensor":
            n = int(self.sensor_path.read_text().strip())
            if n < 0:
                raise ValueError("telemetry must be a nonnegative integer")
        else:
            if len(self.used) >= len(self.input):
                raise ValueError("recorded entropy exhausted")
            n = int(self.input[len(self.used)])
        self.used.append(n)
        return n


class World:
    def __init__(self, config: Config, entropy: Entropy, populate: bool = True):
        config.validate()
        self.cfg, self.entropy = config, entropy
        self.rng = random.Random(config.seed)
        self.graph = numogram_graph()
        self.matrix = initial_matrix()
        self.agents: dict[int, Agent] = {}
        self.corpses: dict[int, Corpse] = {}
        self.waiting_corpses: set[int] = set()
        self.forecasts: dict[int, Forecast] = {}
        self.resources = [8.0] * 10
        self.inverted_until = [0.0] * 10
        self.queue: list[tuple[float, int, str, int, int]] = []
        self.serial = 0
        self.next_agent = self.next_corpse = self.next_forecast = 0
        self.now = 0.0
        self.actions = 0
        self.log: list[dict[str, Any]] = []
        self.count: Counter[str] = Counter()
        self.transitions: Counter[str] = Counter()
        self.zone_actions: Counter[int] = Counter()
        self.high_water = 0
        self.started = False
        # Experimental controls; the baseline behavior remains byte-replayable.
        self.flight_mode = "off"          # off, transient, persistent
        self.flight_theta = 12
        self.weight_mode = "weighted"    # weighted, uniform
        self.warp_dwell: dict[int, int] = {}
        # In the native single-Amelia runtime Warp-born gates persist in its
        # own qabbala. Here they are local to each independent virtual agent.
        self.flight_gates: dict[int, set[tuple[int, int]]] = {}
        if populate:
            for i in range(config.initial_agents):
                genome = "".join(str(self.rng.randrange(10)) for _ in range(12))
                self.add_agent(1 + i % 9, genome, energy=6 + self.rng.random())

    def emit(self, event: str, **details: Any) -> None:
        self.log.append({"time": round(self.now, 9), "action": self.actions,
                         "event": event, **details})
        self.count[event] += 1

    def enqueue(self, when: float, kind: str, ident: int, token: int = 0) -> None:
        self.serial += 1
        heapq.heappush(self.queue, (when, self.serial, kind, ident, token))

    def add_agent(self, zone: int, genome: str, energy: float = 6.0,
                  lineage: int | None = None, parent: int | None = None) -> Agent | None:
        if len(self.agents) >= self.cfg.max_agents:
            self.emit("population_cap", zone=zone)
            return None
        if not (0 <= zone <= 9 and genome and genome.isascii() and genome.isdigit()):
            raise ValueError("invalid zone or genome")
        self.next_agent += 1
        ident = self.next_agent
        if parent is None:
            origins = [ident] * len(genome)
        else:
            source = self.agents[parent]
            start = len(source.genome) // 2
            if genome != source.genome[start:]:
                raise AssertionError("unexpected non-suffix offspring")
            origins = source.origins[start:].copy()
        agent = Agent(ident, zone, genome[:self.cfg.max_genome], energy=energy,
                      lineage=ident if lineage is None else lineage,
                      origins=origins[:self.cfg.max_genome])
        agent.history.append((agent.genome, agent.ip))
        agent.origin_history.append(agent.origins.copy())
        self.agents[ident] = agent
        self.warp_dwell[ident] = 0
        self.flight_gates[ident] = set()
        self.high_water = max(self.high_water, len(self.agents))
        self.emit("birth", agent=ident, zone=zone, genome=agent.genome,
                  energy=round(energy, 6), lineage=agent.lineage, parent=parent)
        if self.started:
            self.schedule_agent(agent)
        return agent

    def occupants(self, zone: int, exclude: int | None = None) -> list[Agent]:
        return [a for a in self.agents.values() if a.zone == zone and a.ident != exclude]

    def rate(self, agent: Agent) -> float:
        if not self.cfg.local_clocks:
            return 1.0
        base = 2.8 if agent.zone in T.FURNACE else (0.8 if agent.zone in T.SLOW else 1.0)
        congestion = 1 + 0.10 * len(self.occupants(agent.zone))
        return min(8.0, base * (1 + 0.15 * agent.heat) / congestion)

    def schedule_agent(self, agent: Agent, due: float | None = None) -> None:
        agent.token += 1
        agent.next_due = self.now + 1 / self.rate(agent) if due is None else due
        self.enqueue(agent.next_due, "agent", agent.ident, agent.token)

    def freeze(self, target: Agent, delay: float = 1.5) -> None:
        old = target.next_due
        self.schedule_agent(target, max(self.now, old) + delay)
        self.emit("freeze", target=target.ident, previous_due=round(old, 6),
                  new_due=round(target.next_due, 6))

    def corpse(self, zone: int, genome: str, origin: int, cause: str,
               origins: list[int] | None = None) -> Corpse:
        if len(self.corpses) >= self.cfg.max_corpses:
            oldest = min(self.corpses)
            del self.corpses[oldest]
            self.waiting_corpses.discard(oldest)
            self.emit("corpse_cap_eviction", corpse=oldest)
        self.next_corpse += 1
        if origins is None:
            # The public low-level method can be used for manufactured test
            # corpses. Engine-internal calls supply the exact digit ancestry.
            origins = [origin] * len(genome)
        if len(origins) != len(genome):
            raise AssertionError("corpse ancestry length mismatch")
        corpse = Corpse(self.next_corpse, 0 if zone == 9 else zone,
                        genome[:self.cfg.max_genome], origin, cause,
                        origins=origins[:self.cfg.max_genome])
        self.corpses[corpse.ident] = corpse
        self.emit("corpse", corpse=corpse.ident, zone=corpse.zone, origin=origin,
                  cause=cause, genome=corpse.genome)
        if self.cfg.recycling:
            self.enqueue(self.now + (1.5 if corpse.zone == 0 else 3.0), "ferment", corpse.ident)
        return corpse

    def kill(self, agent: Agent, cause: str) -> None:
        if agent.ident not in self.agents:
            return
        del self.agents[agent.ident]
        self.warp_dwell.pop(agent.ident, None)
        self.flight_gates.pop(agent.ident, None)
        self.emit("death", agent=agent.ident, zone=agent.zone, cause=cause,
                  genome=agent.genome, energy=round(agent.energy, 6))
        corpse_zone = 0 if cause == "failed_prophecy" else agent.zone
        self.corpse(corpse_zone, agent.genome, agent.ident, cause, agent.origins)
        for ident, forecast in list(self.forecasts.items()):
            if forecast.agent == agent.ident:
                del self.forecasts[ident]
                self.emit("prophecy_cancelled", prophecy=ident, reason="owner_died")

    def ferment(self, ident: int) -> None:
        c = self.corpses.get(ident)
        if c is None or not self.cfg.recycling:
            return
        if c.zone != 0:
            self.emit("ferment", corpse=ident, previous_zone=c.zone, zone=0)
            c.zone = 0
            self.enqueue(self.now + 1.5, "ferment", ident)
            return
        if not c.fermented:
            before = c.genome
            pos = self.rng.randrange(len(before))
            digit = (int(before[pos]) + 1 + self.rng.randrange(9)) % 10
            c.genome = before[:pos] + str(digit) + before[pos + 1:]
            c.fermented = True
            self.emit("necrotic_mutation", corpse=ident, position=pos,
                      before=before, after=c.genome)
        hosts = [a for a in self.agents.values() if a.zone in T.RECYCLE_ZONES]
        if not hosts:
            self.emit("recycle_waiting", corpse=ident, reason="no_time_circuit_host")
            self.waiting_corpses.add(ident)
            return
        target = self.rng.choice(hosts)
        payload = c.genome[:min(4, len(c.genome))]
        old = target.genome
        target.genome = (old[:target.ip] + payload + old[target.ip:])[:self.cfg.max_genome]
        if target.genome == old:
            self.emit("recycle_waiting", corpse=ident, reason="splice_no_change")
            self.waiting_corpses.add(ident)
            return
        target.origins = (target.origins[:target.ip] + c.origins[:len(payload)] +
                          target.origins[target.ip:])[:self.cfg.max_genome]
        del self.corpses[ident]
        self.waiting_corpses.discard(ident)
        self.emit("reinject", corpse=ident, host=target.ident, zone=target.zone,
                  payload=payload, host_ip=target.ip, host_before=old, host_after=target.genome)

    def infect(self, attacker: Agent, target: Agent) -> bool:
        if not self.cfg.infection or attacker.zone != target.zone or attacker.ident == target.ident:
            return False
        if signature(attacker.genome) != gate(target.zone) % 9:
            return False
        payload = (attacker.genome + attacker.genome)[attacker.ip:attacker.ip + 3]
        payload_origins = (attacker.origins + attacker.origins)[attacker.ip:attacker.ip + 3]
        before = target.genome
        target.genome = (before[:target.ip] + payload + before[target.ip:])[:self.cfg.max_genome]
        if target.genome == before:
            return False
        target.origins = (target.origins[:target.ip] + payload_origins +
                          target.origins[target.ip:])[:self.cfg.max_genome]
        stolen = min(0.2, max(0.0, target.energy))
        target.energy -= stolen
        attacker.energy += stolen
        self.emit("infection", attacker=attacker.ident, target=target.ident, zone=target.zone,
                  signature=signature(attacker.genome), target_gate=gate(target.zone),
                  attacker_ip=attacker.ip, target_ip=target.ip, payload=payload, before=before, after=target.genome,
                  energy_transferred=round(stolen, 6))
        return True

    def scavenge(self, agent: Agent) -> bool:
        if not self.cfg.recycling:
            return False
        choices = [c for c in self.corpses.values() if c.zone == agent.zone]
        if not choices or len(agent.genome) >= self.cfg.max_genome:
            return False
        c = self.rng.choice(choices)
        before = agent.genome
        agent.genome = (before + c.genome)[:self.cfg.max_genome]
        agent.origins = (agent.origins + c.origins)[:self.cfg.max_genome]
        del self.corpses[c.ident]
        self.waiting_corpses.discard(c.ident)
        self.emit("scavenge", agent=agent.ident, corpse=c.ident, zone=agent.zone,
                  before=before, after=agent.genome)
        return True

    def timesplice(self, agent: Agent) -> bool:
        """Exchange code with a live agent at the twin, without moving either."""
        if not self.cfg.timesplice:
            return False
        peers = self.occupants(9 - agent.zone)
        if not peers:
            return False
        target = self.rng.choice(peers)
        before_a, before_b = agent.genome, target.genome
        a_code = (before_a + before_a)[agent.ip:agent.ip + 3]
        b_code = (before_b + before_b)[target.ip:target.ip + 3]
        before_a_origins, before_b_origins = agent.origins, target.origins
        a_origins = (before_a_origins + before_a_origins)[agent.ip:agent.ip + 3]
        b_origins = (before_b_origins + before_b_origins)[target.ip:target.ip + 3]
        after_a = (before_a[:agent.ip] + b_code + before_a[agent.ip:])[:self.cfg.max_genome]
        after_b = (before_b[:target.ip] + a_code + before_b[target.ip:])[:self.cfg.max_genome]
        if after_a == before_a and after_b == before_b:
            return False
        agent.genome, target.genome = after_a, after_b
        agent.origins = (before_a_origins[:agent.ip] + b_origins +
                         before_a_origins[agent.ip:])[:self.cfg.max_genome]
        target.origins = (before_b_origins[:target.ip] + a_origins +
                          before_b_origins[target.ip:])[:self.cfg.max_genome]
        self.emit("timesplice", agent=agent.ident, target=target.ident,
                  zone=agent.zone, target_zone=target.zone, agent_ip=agent.ip, target_ip=target.ip,
                  agent_code=a_code, target_code=b_code, before_agent=before_a,
                  after_agent=after_a, before_target=before_b, after_target=after_b)
        return True

    def fission(self, agent: Agent) -> None:
        if agent.energy < 4.0 or len(self.agents) >= self.cfg.max_agents:
            return
        child_genome = agent.genome[len(agent.genome) // 2:] or agent.genome
        energy = agent.energy * 0.42
        child = self.add_agent(agent.zone, child_genome, energy, agent.lineage, agent.ident)
        if child is not None:
            agent.energy -= energy
            self.emit("fission", parent=agent.ident, child=child.ident)
            if self.rng.random() < 0.15:
                decoy = self.corpse(agent.zone, child_genome, agent.ident, "decoy", child.origins)
                self.emit("decoy", agent=agent.ident, corpse=decoy.ident, zone=decoy.zone)

    def broadcast(self, agent: Agent, target: int) -> None:
        if not self.cfg.prophecy or agent.energy <= 1.0:
            return
        if any(f.agent == agent.ident for f in self.forecasts.values()):
            return
        self.next_forecast += 1
        f = Forecast(self.next_forecast, agent.ident, agent.zone, target % 9,
                     self.actions, self.now + 2.5)
        self.forecasts[f.ident] = f
        agent.energy -= 0.4
        self.enqueue(f.expires, "forecast", f.ident)
        self.emit("prophecy", prophecy=f.ident, agent=agent.ident, zone=agent.zone,
                  target=f.target, expires=round(f.expires, 9))

    def resolve_forecasts(self, changed_zone: int) -> None:
        for ident, f in list(self.forecasts.items()):
            if f.zone != changed_zone or self.actions <= f.created_action or self.now > f.expires:
                continue
            owner = self.agents.get(f.agent)
            if owner is None:
                continue
            members = self.occupants(f.zone)
            aggregate = sum(signature(a.genome) for a in members) % 9
            if aggregate != f.target:
                continue
            total = 0.0
            for donor in members:
                if donor.ident != owner.ident:
                    amount = min(max(0.0, donor.energy) * 0.30, 1.0)
                    donor.energy -= amount
                    total += amount
            owner.energy += total
            del self.forecasts[ident]
            self.emit("prophecy_success", prophecy=ident, agent=owner.ident, zone=f.zone,
                      target=f.target, collective=aggregate, energy_transferred=round(total, 6))

    def expire_forecast(self, ident: int) -> None:
        f = self.forecasts.pop(ident, None)
        if f is None:
            return
        self.emit("prophecy_failure", prophecy=ident, agent=f.agent, zone=f.zone, target=f.target)
        owner = self.agents.get(f.agent)
        if owner is not None:
            self.kill(owner, "failed_prophecy")

    def mutate_matrix(self) -> None:
        address = self.rng.randrange(45)
        raw = self.entropy.next()
        before = self.matrix[address]
        others = [op for op in OPS if op != before]
        after = others[raw % len(others)]
        self.matrix[address] = after
        self.emit("opcode_mutation", address=f"{address:02d}", pair=list(PAIRS[address]),
                  before=before, after=after, sample=raw)

    def mutate_genome(self, agent: Agent, reason: str) -> None:
        pos = self.rng.randrange(len(agent.genome))
        before = agent.genome
        old = int(before[pos])
        new = (old + 1 + self.rng.randrange(9)) % 10
        agent.genome = before[:pos] + str(new) + before[pos + 1:]
        self.emit("genome_mutation", agent=agent.ident, zone=agent.zone, position=pos,
                  before=before, after=agent.genome, reason=reason)

    def execute(self, agent: Agent, op: str, operand: int) -> None:
        peers = self.occupants(agent.zone, agent.ident)
        if op == "freeze" and peers:
            self.freeze(self.rng.choice(peers))
        elif op == "replay" and len(agent.history) > 1:
            before = agent.genome
            previous_genome, previous_ip = agent.history[-2]
            if len(agent.origin_history) != len(agent.history):
                raise AssertionError("genome and ancestry histories differ")
            agent.origins = agent.origin_history[-2].copy()
            agent.genome, agent.ip = previous_genome, previous_ip % len(previous_genome)
            self.emit("replay", agent=agent.ident, before=before, after=agent.genome, ip=agent.ip)
        elif op == "prophecy" and self.rng.random() < 0.30:
            self.broadcast(agent, operand)
        elif op == "infect" and peers:
            self.infect(agent, self.rng.choice(peers))
        elif op == "fission":
            self.fission(agent)
        elif op == "scavenge":
            self.scavenge(agent)
        elif op == "timesplice":
            self.timesplice(agent)
        elif op == "overclock":
            agent.heat += 1.1
            self.emit("overclock", agent=agent.ident, zone=agent.zone, heat=round(agent.heat, 4))
        elif op == "invert":
            self.inverted_until[agent.zone] = self.now + 4.0
            self.emit("invert", agent=agent.ident, zone=agent.zone,
                      until=round(self.inverted_until[agent.zone], 6))
        elif op == "shrapnel":
            agent.heat += 0.45
            agent.energy -= 0.25
            if peers:
                target = self.rng.choice(peers)
                self.mutate_genome(target, "shrapnel")
                if len(target.genome) > 1:
                    old_ip = target.ip
                    target.ip = (old_ip + 1 + self.rng.randrange(len(target.genome) - 1)) % len(target.genome)
                    self.emit("address_corruption", agent=target.ident, source=agent.ident,
                              zone=target.zone, before=old_ip, after=target.ip)
            self.emit("shrapnel", agent=agent.ident, zone=agent.zone)

    def act(self, agent: Agent) -> None:
        self.actions += 1
        z = agent.zone
        self.zone_actions[z] += 1
        agent.age += 1
        if z in T.RECYCLE_ZONES and self.waiting_corpses:
            corpse_id = min(self.waiting_corpses)
            self.waiting_corpses.remove(corpse_id)
            if corpse_id in self.corpses:
                self.enqueue(self.now + 1.5, "ferment", corpse_id)
        # Intake is drawn from a finite local pool; a small transfer from the twin
        # gives the ecological syzygy its explicit antagonism. Renewal is an input.
        twin = 9 - z
        transfer = min(0.08, self.resources[twin])
        self.resources[twin] -= transfer
        self.resources[z] += transfer
        intake = min(0.34, self.resources[z])
        self.resources[z] -= intake
        renewal = min(0.30, 8.0 - self.resources[z])
        self.resources[z] += renewal
        agent.energy += intake - 0.24 - (0.04 if z in T.FURNACE else 0.0) - 0.012 * agent.heat
        agent.heat = max(0.0, agent.heat - (0.08 if z in T.FURNACE else 0.22))

        before_genome = agent.genome
        before_ip = agent.ip
        operand = int(agent.genome[agent.ip])
        address = matrix_address(z, operand)
        op = self.matrix[address]
        self.emit("execute", agent=agent.ident, zone=z, ip=before_ip,
                  genome=before_genome, operand=operand, address=f"{address:02d}", opcode=op,
                  energy=round(agent.energy, 6), heat=round(agent.heat, 6),
                  twin=twin, twin_transfer=round(transfer, 6), intake=round(intake, 6),
                  renewal=round(renewal, 6), zone_resource=round(self.resources[z], 6),
                  twin_resource=round(self.resources[twin], 6))
        self.execute(agent, op, operand)
        if agent.ident not in self.agents:
            return
        agent.ip = (agent.ip + 1) % len(agent.genome)
        peers = self.occupants(z, agent.ident)
        if peers and self.rng.random() < 0.6:
            self.infect(agent, self.rng.choice(peers))
        if self.rng.random() < (0.12 if z in T.FURNACE else 0.035):
            self.mutate_genome(agent, "furnace" if z in T.FURNACE else "background")
        if self.rng.random() < self.cfg.opcode_mutation_probability:
            self.mutate_matrix()
        if z in T.RECYCLE_ZONES and agent.energy > 7.2 and self.rng.random() < 0.15:
            self.fission(agent)

        if self.cfg.meltdown and agent.heat >= 5:
            self.emit("meltdown", agent=agent.ident, zone=z, heat=round(agent.heat, 6))
            fragment_len = max(1, len(agent.genome) // 2)
            self.corpse(z, agent.genome[:fragment_len], agent.ident, "shrapnel",
                        agent.origins[:fragment_len])
            self.kill(agent, "meltdown")
        elif agent.energy <= 0 or agent.age >= 120:
            self.kill(agent, "starvation" if agent.energy <= 0 else "senescence")
        else:
            dwell = self.warp_dwell.get(agent.ident, 0)
            releasing = self.flight_mode != "off" and z in (3, 6) and dwell >= self.flight_theta
            if releasing:
                # No ND-1 activation or named input exists in this ecology.
                # Resource pools are an explicitly experimental local proxy;
                # low zone number wins exact ties, as in the native loop.
                allowed = (0, 1, 2, 4, 7, 8, 9)
                to = max(allowed, key=lambda c: (self.resources[c], -c))
                if self.flight_mode == "persistent":
                    edge = (z, to)
                    local_gates = self.flight_gates[agent.ident]
                    if edge not in local_gates and to not in self.graph[z]:
                        local_gates.add(edge)
                        self.emit("warp_born_gate", agent=agent.ident, source=z, target=to)
                self.emit("flight", agent=agent.ident, source=z, target=to,
                          mode=self.flight_mode, threshold=self.flight_theta,
                          dwell_before=dwell, selector="resource_proxy",
                          candidates={str(c): round(self.resources[c], 6) for c in allowed})
                agent.zone = to
                self.transitions[f"{z}->{to}"] += 1
                self.emit("move", agent=agent.ident, source=z, target=to, via="flight")
            elif self.rng.random() < 0.62:
                local = {target for source, target in self.flight_gates[agent.ident] if source == z}
                exits = tuple(sorted(set(self.graph[z]) | local)) if local else self.graph[z]
                # The uniform control removes the zone-number preference.
                weights = ([1.0] * len(exits) if self.weight_mode == "uniform" else
                           [(1 + 0.2 * (9 - to if self.inverted_until[z] > self.now else to))
                            for to in exits])
                to = self.rng.choices(exits, weights=weights, k=1)[0]
                agent.zone = to
                self.transitions[f"{z}->{to}"] += 1
                if to not in self.graph[z]:
                    self.emit("move", agent=agent.ident, source=z, target=to, via="warp_born_gate")
                else:
                    self.emit("move", agent=agent.ident, source=z, target=to)
            self.warp_dwell[agent.ident] = dwell + 1 if agent.zone in (3, 6) else 0
            agent.history.append((agent.genome, agent.ip))
            agent.history = agent.history[-8:]
            agent.origin_history.append(agent.origins.copy())
            agent.origin_history = agent.origin_history[-8:]
            self.schedule_agent(agent)
        self.resolve_forecasts(z)
        if agent.ident in self.agents and agent.zone != z:
            self.resolve_forecasts(agent.zone)
        # An audit boundary only; no state, scheduling or random draw changes.
        self.emit("action_end", agent=agent.ident, alive=agent.ident in self.agents)

    def run(self) -> dict[str, Any]:
        if self.started:
            raise RuntimeError("worlds may only be run once")
        self.started = True
        for a in self.agents.values():
            self.schedule_agent(a)
        while self.queue and self.actions < self.cfg.actions and self.agents:
            when, _, kind, ident, token = heapq.heappop(self.queue)
            if kind == "agent":
                a = self.agents.get(ident)
                if a is None or token != a.token:
                    continue
                self.now = when
                self.act(a)
            elif kind == "ferment":
                if ident in self.corpses:
                    self.now = when
                    self.ferment(ident)
            elif kind == "forecast":
                if ident in self.forecasts:
                    self.now = when
                    self.expire_forecast(ident)
        # Pending forecasts are deliberately not evaluated past the observation horizon.
        return self.summary()

    def summary(self) -> dict[str, Any]:
        opcodes = Counter(x["opcode"] for x in self.log if x["event"] == "execute")
        pop = Counter(a.zone for a in self.agents.values())
        return {
            "config": asdict(self.cfg), "completed_actions": self.actions,
            "model_time": round(self.now, 9), "living_agents": len(self.agents),
            "peak_population": self.high_water, "active_corpses": len(self.corpses),
            "open_prophecies_at_horizon": len(self.forecasts),
            "termination": "extinction" if not self.agents else
                           ("action_limit" if self.actions >= self.cfg.actions else "queue_empty"),
            "event_counts": dict(sorted(self.count.items())),
            "opcode_executions": {op: opcodes[op] for op in OPS},
            "zone_actions": {str(z): self.zone_actions[z] for z in range(10)},
            "population_by_zone": {str(z): pop[z] for z in range(10)},
            "transitions": dict(sorted(self.transitions.items())),
            "observed_directed_edges": len(self.transitions),
            "resource_pools": [round(x, 6) for x in self.resources],
            "final_agents": [{"id": a.ident, "zone": a.zone, "genome": a.genome,
                              "ip": a.ip, "energy": round(a.energy, 6), "heat": round(a.heat, 6),
                              "age": a.age, "lineage": a.lineage} for a in self.agents.values()],
            "final_matrix": self.matrix,
            "entropy_samples_consumed": len(self.entropy.used),
        }


def json_bytes(value: Any) -> bytes:
    return (json.dumps(value, indent=2, sort_keys=True, allow_nan=False) + "\n").encode()


def write_run(world: World, output: Path) -> dict[str, Any]:
    import hashlib
    output.mkdir(parents=True, exist_ok=False)
    summary = world.run()
    event_bytes = b"".join((json.dumps(e, sort_keys=True, separators=(",", ":"),
                                         allow_nan=False) + "\n").encode() for e in world.log)
    (output / "events.jsonl").write_bytes(event_bytes)
    (output / "summary.json").write_bytes(json_bytes(summary))
    entropy_record = {"source": world.entropy.mode, "samples": world.entropy.used}
    if world.entropy.mode == "sensor":
        entropy_record["sensor_path"] = str(world.entropy.sensor_path)
    (output / "entropy.json").write_bytes(json_bytes(entropy_record))
    graph = {str(k): list(v) for k, v in world.graph.items()}
    (output / "graph.json").write_bytes(json_bytes(graph))
    (output / "matrix_initial.json").write_bytes(json_bytes([
        {"address": f"{i:02d}", "zones": list(pair), "opcode": initial_matrix()[i]}
        for i, pair in enumerate(PAIRS)]))
    hashes = {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
              for p in sorted(output.iterdir()) if p.is_file()}
    (output / "sha256.json").write_bytes(json_bytes(hashes))
    return summary
