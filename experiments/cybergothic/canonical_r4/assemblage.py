"""A changing cybergothic ecology built on the persistent Numogram reactor.

The phenotype interpreter is virtual. No genome or phage is host executable code.
All external nourishment and all archive births are accounted for in the ledger.
"""
from __future__ import annotations

import topology as T
import copy
import heapq
import json
import random
from collections import Counter

from legacy_engine import Config, Entropy, gate, signature
from reactor import Reactor, canonical, digest, tuples


class Assemblage(Reactor):
    def __init__(self, config, entropy, populate=True):
        self.minds = {}
        super().__init__(config, entropy, populate=populate)
        self.environment_rng = random.Random(config.seed ^ 0x2AC811)
        self.field = [[1.0, 1.0, 1.0] for _ in range(10)]
        self.regime = [self.environment_rng.randrange(3) for _ in range(10)]
        self.transitions_learned = [[[0 for _ in range(3)] for _ in range(3)] for _ in range(10)]
        self.pending_futures = {}
        self.environment_epoch = 0
        self.environment_period = 6.0
        self.external_nourishment = 0.0
        self.archive_mode = "random"       # random, guided, shuffled
        self.forecast_mode = "persistence" # persistence, learned
        self.vector_mode = "off"          # off, intact, shuffled
        self.cargo_policy = "pointer"      # pointer or experienced
        self.temporal_hold = 0             # actions of post-reveal orientation
        self.salvage_feedback = False
        self.ampy_vault = 0.0
        self.vector_cost = .12
        self.forecast_cost = .05
        self.packet_limit = 300
        self.next_packet = 0
        self.packets = {}

    def add_agent(self, *args, **kwargs):
        a = super().add_agent(*args, **kwargs)
        if a is not None:
            self.minds[a.ident] = {"focus": int(a.genome[0]) % 3, "last_success": None,
                                   "harvest": 0.0, "forages": 0, "vector_received": 0,
                                   "channel_harvest": [0.,0.,0.], "channel_visits": [0,0,0],
                                   "programs": {}, "intent": None, "intent_ttl": 0}
        return a

    def corpse(self, zone, genome, origin, cause, origins=None):
        c = super().corpse(zone, genome, origin, cause, origins)
        if hasattr(self, "archive") and c.ident in self.archive:
            mind = self.minds.get(origin, {})
            self.archive[c.ident]["experience"] = {"harvest": mind.get("harvest", 0.0),
                    "forages": mind.get("forages", 0),
                    "channel_harvest": mind.get("channel_harvest", [0.,0.,0.]).copy(),
                    "channel_visits": mind.get("channel_visits", [0,0,0]).copy()}
        return c

    def kill(self, agent, cause):
        if cause == "meltdown" and self.salvage_feedback and agent.ident in self.agents:
            amount = min(max(0.0, agent.energy) * .35, max(0.0, 50.0 - self.ampy_vault))
            agent.energy -= amount
            self.ampy_vault += amount
            self.emit("ampy_salvage", agent=agent.ident, zone=agent.zone,
                      energy_to_vault=round(amount, 9))
        super().kill(agent, cause)
        self.minds.pop(agent.ident, None)

    def pulse(self):
        release = min(self.ampy_vault, max(0., 8. - self.resources[0]))
        if release:
            self.ampy_vault -= release
            self.resources[0] += release
            self.emit("ampy_release", energy_to_cthell=round(release, 9),
                      remaining_vault=round(self.ampy_vault, 9))
        gain = min(self.pulse_renewal, max(0., 8. - self.resources[0]))
        self.resources[0] += gain
        self.reactor_input += gain
        if (len(self.agents) < self.recovery_floor and self.reconstitution
                and self.cfg.recycling and self.archive and self.resources[0] >= self.reconstitution_cost):
            destination = self.rng.choice(T.BIRTH_ZONES)
            candidates = self.rng.sample(sorted(self.archive), min(5, len(self.archive)))
            def merit(i):
                exp = self.archive[i].get("experience", {})
                return exp.get("harvest", 0.) / max(1, exp.get("forages", 0))
            def portfolio(i):
                experience = self.archive[i].get("experience", {})
                harvested = experience.get("channel_harvest",[0.,0.,0.])
                visits = experience.get("channel_visits",[0,0,0])
                current_focus = [sum(self.minds[a.ident]["focus"]==k for a in self.agents.values()) for k in range(3)]
                # Weight observed past performance by current resources and by
                # which channel is underrepresented among living hosts.
                return sum((harvested[k]+.06)/(visits[k]+1) * self.field[destination][k] /
                           (1+current_focus[k]) for k in range(3))
            if self.archive_mode == "random": chosen = candidates[0]
            elif self.archive_mode in ("guided", "shuffled"): chosen = max(candidates, key=merit)
            elif self.archive_mode in ("portfolio", "portfolio_shuffled"): chosen = max(candidates, key=portfolio)
            else:
                raise ValueError("unknown archive policy")
            source = self.archive[chosen]
            code = source["genome"]
            tags = source["origins"].copy()
            if self.archive_mode in ("shuffled", "portfolio_shuffled"):
                pairs = list(zip(code, tags))
                random.Random((self.cfg.seed << 32) ^ (self.next_agent + 1) ^ chosen).shuffle(pairs)
                code = "".join(p[0] for p in pairs)
                tags = [p[1] for p in pairs]
            pre_mutation = code
            position = self.rng.randrange(len(code))
            new_digit = (int(code[position]) + 1 + self.rng.randrange(9)) % 10
            code = code[:position] + str(new_digit) + code[position + 1:]
            self.resources[0] -= self.reconstitution_cost
            self.reactor_spent += self.reconstitution_cost
            host = self.add_agent(destination, code,
                                  energy=self.reconstitution_cost, lineage=source["origin"])
            if host is None: raise AssertionError("no space for archive birth")
            host.origins = tags[:len(host.genome)].copy()
            host.origin_history = [host.origins.copy()]
            self.emit("reconstitute", agent=host.ident, source_corpse=chosen,
                      source_agent=source["origin"], archived=source["genome"],
                      pre_mutation=pre_mutation, genome=host.genome, origins=host.origins.copy(),
                      mutation_position=position, energy_debit=self.reconstitution_cost,
                      policy=self.archive_mode, candidate_corpses=candidates,
                      candidate_merits=[round(merit(i), 9) for i in candidates],
                      destination=destination,
                      pool_after=round(self.resources[0], 9))
        self.enqueue(self.now + self.pulse_period, "reactor", 0)

    def forage(self, agent):
        mind = self.minds[agent.ident]
        digit = int(agent.genome[agent.ip])
        before = mind["focus"]
        # The same digit that enters the Pandemonium Matrix also acts on a
        # small embodied metabolic controller. Order and pointer matter.
        if digit <= 2: mind["focus"] = digit
        elif digit == 4: mind["focus"] = (before + 1) % 3
        elif digit == 5: mind["focus"] = (before + 2) % 3
        elif digit == 6 and agent.energy > .03:
            agent.energy -= .02
            mind["focus"] = max(range(3), key=lambda k: (self.field[agent.zone][k], -k))
        elif digit == 7 and mind["last_success"] is not None:
            mind["focus"] = mind["last_success"]
        elif digit == 8 and agent.energy > .02:
            agent.energy -= .01
            mind["focus"] = self.regime[agent.zone]
        elif digit == 9:
            mind["focus"] = (before + 1) % 3 if self.field[agent.zone][before] < .04 else before
        if mind["intent_ttl"] > 0:
            mind["focus"] = mind["intent"]
            mind["intent_ttl"] -= 1
            agent.energy -= .01
        focus = mind["focus"]
        intake = min(.12, self.field[agent.zone][focus])
        self.field[agent.zone][focus] -= intake
        agent.energy += intake
        mind["harvest"] += intake
        mind["forages"] += 1
        mind["channel_harvest"][focus] += intake
        mind["channel_visits"][focus] += 1
        length=min(4,len(agent.genome))
        code=(agent.genome+agent.genome)[agent.ip:agent.ip+length]
        prior=mind["programs"].setdefault(code,[0,0.])
        prior[0]+=1;prior[1]+=intake
        if intake >= .08: mind["last_success"] = focus
        self.emit("field_harvest", agent=agent.ident, zone=agent.zone, digit=digit,
                  focus_before=before, focus=focus, intake=round(intake, 9),
                  stock_after=round(self.field[agent.zone][focus], 9))

    def act(self, agent):
        self.forage(agent)
        return super().act(agent)

    def environment_step(self):
        """Reveal one external epoch; only its already observed past trains bets."""
        old = self.regime.copy()
        actual = []
        for z, previous in enumerate(old):
            direction = 1 if z % 2 == 0 else 2
            if self.environment_epoch >= 20: direction = 3 - direction
            draw = self.environment_rng.random()
            next_signal = (previous + direction) % 3 if draw < .65 else (
                previous if draw < .85 else (previous + 3-direction) % 3)
            actual.append(next_signal)
        for z in range(10):
            previous, new = old[z], actual[z]
            pending = self.pending_futures.pop(z, None)
            if pending is not None:
                owner = self.agents.get(pending["owner"])
                payment = 0.
                if owner is not None and owner.zone == z and self.temporal_hold > 0:
                    self.minds[owner.ident]["intent"] = pending["chosen"]
                    self.minds[owner.ident]["intent_ttl"] = self.temporal_hold
                    self.emit("future_orientation", agent=owner.ident, zone=z,
                              target=pending["chosen"], actions=self.temporal_hold,
                              epoch=self.environment_epoch)
                if owner is not None and owner.zone == z and pending["chosen"] == new:
                    payment = min(.25, self.field[z][new])
                    self.field[z][new] -= payment
                    owner.energy += payment
                self.emit("fate_reveal", zone=z, owner=pending["owner"], chosen=pending["chosen"],
                          learned=pending["learned"], persistence=pending["persistence"],
                          actual=new, epoch=self.environment_epoch, reward=round(payment, 9))
            self.transitions_learned[z][previous][new] += 1
            for nutrient in range(3):
                amount = .04 + (.35 if nutrient == new else 0.)
                accepted = min(amount, 2.5 - self.field[z][nutrient])
                self.field[z][nutrient] += accepted
                self.external_nourishment += accepted
        self.regime = actual
        self.environment_epoch += 1
        self.emit("environment", epoch=self.environment_epoch, signals=actual,
                  exogenous_total=round(self.external_nourishment, 9))
        for z in range(10):
            possible = [a for a in self.agents.values() if a.zone == z and a.energy > .5]
            if not possible: continue
            owner = min(possible, key=lambda a: a.ident)
            counts = self.transitions_learned[z][actual[z]]
            # A tie defaults to the persistence prediction, not a random draw.
            best = max(counts)
            learned = actual[z] if counts[actual[z]] == best else counts.index(best)
            chosen = learned if self.forecast_mode == "learned" else actual[z]
            if self.forecast_mode not in ("learned", "persistence"): raise ValueError("forecast mode")
            owner.energy -= self.forecast_cost
            self.minds[owner.ident]["focus"] = chosen
            self.pending_futures[z] = {"owner": owner.ident, "chosen": chosen,
                                       "learned": learned, "persistence": actual[z]}
            self.emit("fate_commit", zone=z, owner=owner.ident, chosen=chosen, learned=learned,
                      persistence=actual[z], epoch=self.environment_epoch,
                      mode=self.forecast_mode, cost=self.forecast_cost)
        self.enqueue(self.now + self.environment_period, "environment", 0)

    def infect(self, attacker, target):
        success = super().infect(attacker, target)
        if success and self.vector_mode != "off" and self.rng.random() < .35:
            self.shed(attacker)
        return success

    def shed(self, attacker):
        if len(self.packets) >= self.packet_limit or attacker.energy < self.vector_cost + .25:
            return False
        n = min(4, len(attacker.genome))
        code = (attacker.genome + attacker.genome)[attacker.ip:attacker.ip+n]
        origins = (attacker.origins + attacker.origins)[attacker.ip:attacker.ip+n]
        selected_from_experience = False
        if self.cargo_policy == "experienced":
            candidates = []
            circular = attacker.genome + attacker.genome
            for motif,(count,total) in self.minds[attacker.ident]["programs"].items():
                position = circular.find(motif)
                if len(motif)==n and 0 <= position < len(attacker.genome):
                    candidates.append((total/count,count,motif,position))
            if candidates:
                _,_,code,position = max(candidates)
                origins=(attacker.origins+attacker.origins)[position:position+n]
                selected_from_experience = True
        elif self.cargo_policy != "pointer": raise ValueError("cargo policy")
        if self.vector_mode == "shuffled":
            parts = list(zip(code, origins))
            random.Random((self.cfg.seed << 32) ^ (self.next_packet + 1) ^ attacker.ident).shuffle(parts)
            code = "".join(p[0] for p in parts); origins = [p[1] for p in parts]
        elif self.vector_mode != "intact": raise ValueError("vector mode")
        self.next_packet += 1
        target = self.rng.choice(self.graph[attacker.zone])
        self.packets[self.next_packet] = {"id": self.next_packet, "donor": attacker.ident,
                 "source": attacker.zone, "zone": target, "code": code, "origins": origins,
                 "gate_signature": signature(attacker.genome), "ttl": 3}
        attacker.energy -= self.vector_cost
        self.emit("vector_shed", packet=self.next_packet, donor=attacker.ident, source=attacker.zone,
                  zone=target, cargo=code, origins=origins, energy_debit=self.vector_cost,
                  cargo_policy=self.cargo_policy, experienced=selected_from_experience)
        self.enqueue(self.now + .6, "vector", self.next_packet)
        return True

    def deliver_vector(self, ident):
        packet = self.packets.get(ident)
        if packet is None: return
        z = packet["zone"]
        hosts = [a for a in self.agents.values() if a.zone == z and a.ident != packet["donor"]
                 and packet["gate_signature"] == gate(z) % 9]
        if hosts:
            target = self.rng.choice(hosts); before = target.genome; ip = target.ip
            after = (before[:ip] + packet["code"] + before[ip:])[:self.cfg.max_genome]
            if after != before:
                target.genome = after
                target.origins = (target.origins[:ip] + packet["origins"] + target.origins[ip:])[:self.cfg.max_genome]
                self.minds[target.ident]["vector_received"] += 1
                stolen = min(.1, max(0., target.energy)); target.energy -= stolen
                donor = self.agents.get(packet["donor"])
                if donor is not None: donor.energy += stolen
                else: self.resources[0] += stolen
                self.emit("vector_infection", packet=ident, donor=packet["donor"], target=target.ident,
                          zone=z, code=packet["code"], ip=ip, before=before, after=after,
                          energy_transferred=round(stolen, 9))
        packet["ttl"] -= 1
        if packet["ttl"] <= 0:
            self.emit("vector_expire", packet=ident, zone=z)
            del self.packets[ident]
        else:
            packet["zone"] = self.rng.choice(self.graph[z])
            self.enqueue(self.now + .6, "vector", ident)

    def advance(self, *, until_time=None, until_actions=None, max_events=1000000):
        if until_time is None and until_actions is None: raise ValueError("finite horizon required")
        if not self.started:
            self.started = True
            for a in list(self.agents.values()): self.schedule_agent(a)
            self.enqueue(self.now + self.pulse_period, "reactor", 0)
            self.enqueue(self.now + self.environment_period, "environment", 0)
        processed = 0
        while self.queue:
            if until_actions is not None and self.actions >= until_actions: break
            when, serial, kind, ident, token = heapq.heappop(self.queue)
            if until_time is not None and when > until_time:
                heapq.heappush(self.queue, (when, serial, kind, ident, token))
                self.now = max(self.now, until_time); break
            processed += 1
            if processed > max_events: raise RuntimeError("event limit exceeded")
            if kind == "agent":
                agent = self.agents.get(ident)
                if agent is None or agent.token != token: continue
                self.now = when; self.act(agent)
            elif kind == "ferment" and ident in self.corpses:
                self.now = when; self.ferment(ident)
            elif kind == "forecast" and ident in self.forecasts:
                self.now = when; self.expire_forecast(ident)
            elif kind == "bet_audit" and ident in self.bet_traces:
                self.now = when; self.finish_bet_trace(ident)
            elif kind == "reactor": self.now = when; self.pulse()
            elif kind == "environment": self.now = when; self.environment_step()
            elif kind == "vector" and ident in self.packets:
                self.now = when; self.deliver_vector(ident)
        return processed

    def snapshot(self):
        state = super().snapshot()
        state["assemblage"] = {"minds": self.minds, "environment_rng": self.environment_rng.getstate(),
            "field": self.field, "regime": self.regime, "transitions_learned": self.transitions_learned,
            "pending_futures": self.pending_futures, "environment_epoch": self.environment_epoch,
            "environment_period": self.environment_period, "external_nourishment": self.external_nourishment,
            "archive_mode": self.archive_mode, "forecast_mode": self.forecast_mode,
            "vector_mode": self.vector_mode, "salvage_feedback": self.salvage_feedback,
            "cargo_policy": self.cargo_policy, "temporal_hold": self.temporal_hold,
            "ampy_vault": self.ampy_vault,
            "vector_cost": self.vector_cost, "forecast_cost": self.forecast_cost,
            "packet_limit": self.packet_limit, "next_packet": self.next_packet, "packets": self.packets}
        return json.loads(canonical(state))

    @classmethod
    def restore(cls, state, events):
        w = super().restore(state, events)
        s = state["assemblage"]
        for k in ("field", "regime", "transitions_learned", "environment_epoch", "environment_period",
                  "external_nourishment", "archive_mode", "forecast_mode", "vector_mode",
                  "salvage_feedback", "ampy_vault", "cargo_policy", "temporal_hold",
                  "vector_cost", "forecast_cost", "packet_limit", "next_packet"):
            setattr(w, k, copy.deepcopy(s[k]))
        w.minds = {int(k): v for k,v in s["minds"].items()}
        w.pending_futures = {int(k): v for k,v in s["pending_futures"].items()}
        w.packets = {int(k): v for k,v in s["packets"].items()}
        w.environment_rng.setstate(tuples(s["environment_rng"]))
        return w


class AssemblageJournal:
    """A typed wrapper around the existing atomic event/checkpoint journal."""
    def __init__(self, path):
        from storage import SQLiteJournal
        self.journal = SQLiteJournal(path)
    def save(self, w, **kwargs): return self.journal.save(w, **kwargs)
    def load(self):
        verified = self.journal.load()
        row = self.journal.db.execute("SELECT state FROM checkpoint WHERE singleton=1").fetchone()
        return Assemblage.restore(json.loads(row[0]), verified.log)
    def close(self): self.journal.close()


class AssemblageCloudJournal:
    """Typed version of the optional isolated Supabase REST checkpoint client."""
    def __init__(self, *args, **kwargs):
        from storage import SupabaseJournal
        self.journal = SupabaseJournal(*args, **kwargs)
    def save(self, w, revision): return self.journal.save(w, revision)
    def read(self):
        from urllib.parse import quote
        from storage import validate_payload
        q = "?run_id=eq." + quote(self.journal.run_id, safe="") + "&select=revision,payload"
        rows = self.journal.request("GET", q)
        if len(rows) > 1: raise ValueError("ambiguous checkpoint")
        if not rows: return None, 0
        payload = rows[0]["payload"]
        validate_payload(payload)
        return Assemblage.restore(payload["state"],payload["events"]), rows[0]["revision"]
