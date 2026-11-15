#!/usr/bin/env python3
"""The Cybergothic Numogram ALife Engine: the supplied prototype, restored to runnable Python (standard library only).

Restored from the operator's text (14-15 Nov 2026), where it was flattened onto a few lines. Every rule is the supplied one.
Two additions are switches only, and the defaults reproduce the supplied behaviour:
  - entropy: 'clock' (supplied: time.perf_counter_ns() % 10) or 'seeded' (a seeded RNG draw, for replayable runs);
  - repaired: False (supplied) or True (the death fix: remove a dead agent from the zone it is actually in, and leave a copy
    of its genome as the corpse, not the same list).
The supplied model's own topology is kept as written (TIME_CIRCUIT {1..6}, WARP {7, 8, 9}, CTHELL 0, movement
(zone + current) mod 10). It is not the CCRU Numogram's (Time-Circuit {1,2,4,5,7,8}, Warp {3,6}, Plex {0,9}); see AUDIT.md."""
import os, random, time

SYZYGIES = {9: 0, 0: 9, 8: 1, 1: 8, 7: 2, 2: 7, 6: 3, 3: 6, 5: 4, 4: 5}
CURRENTS = {9: 9, 0: 9, 8: 7, 1: 7, 7: 5, 2: 5, 6: 3, 3: 3, 5: 1, 4: 1}
TIME_CIRCUIT = {1, 2, 3, 4, 5, 6}
WARP_ZONES = {7, 8, 9}
CTHELL = 0

def digital_root(n: int) -> int:
    if n == 0: return 0
    res = n % 9
    return 9 if res == 0 else res

def triangular_gate(z: int) -> int:
    return digital_root(sum(range(1, z + 1)))

class Agent:
    def __init__(self, agent_id, zone, genome=None, energy=50.0):
        self.id = agent_id; self.zone = zone
        self.genome = genome if genome else [random.randint(0, 9) for _ in range(6)]
        self.energy = energy; self.pointer = 0; self.frozen_ticks = 0
        self.prophecy_target = None; self.prophecy_timer = 0
    @property
    def signature(self): return digital_root(sum(self.genome))
    def read_opcode(self):
        if len(self.genome) < 2: return 0
        d1 = self.genome[self.pointer % len(self.genome)]; d2 = self.genome[(self.pointer + 1) % len(self.genome)]
        self.pointer = (self.pointer + 1) % len(self.genome)
        return ((d1 * 10) + d2) % 45
    def mutate(self, intensity=1):
        for _ in range(intensity):
            if not self.genome: break
            idx = random.randint(0, len(self.genome) - 1)
            self.genome[idx] = random.randint(0, 9)
            if random.random() < 0.2 and len(self.genome) < 16: self.genome.insert(idx, random.randint(0, 9))
            elif random.random() < 0.15 and len(self.genome) > 3: self.genome.pop(idx)

class Zone:
    def __init__(self, index):
        self.index = index; self.agents = []; self.corpses = []
        self.tick_accumulator = 0.0; self.local_clock_speed = 1.0; self.gravity_inverted = False
    def update_clock_speed(self):
        crowd_drag = max(0.2, 1.0 - (len(self.agents) * 0.08))
        if self.index in WARP_ZONES: self.local_clock_speed = random.uniform(1.5, 3.0) * crowd_drag
        elif self.index == CTHELL: self.local_clock_speed = 0.5
        else: self.local_clock_speed = 1.0 * crowd_drag

class CybergothicEngine:
    def __init__(self, initial_agents=24, entropy='clock', repaired=False, reseed=True, entropy_seed=0):
        self.zones = {i: Zone(i) for i in range(10)}
        self.next_agent_id = 1; self.global_cycles = 0; self.event_log = []
        self.entropy = entropy; self.repaired = repaired; self.reseed = reseed
        self._erng = random.Random(entropy_seed); self.reseeds = 0; self.reanimations = 0
        self.died = set()   # observation only: ids of agents whose death branch ran (no effect on the dynamics)
        for _ in range(initial_agents): self.spawn_agent(random.choice(list(TIME_CIRCUIT)))
    def log(self, msg):
        self.event_log.append(msg)
        if len(self.event_log) > 8: self.event_log.pop(0)
    def spawn_agent(self, zone_idx, genome=None, energy=50.0):
        agent = Agent(self.next_agent_id, zone_idx, genome, energy); self.next_agent_id += 1
        self.zones[zone_idx].agents.append(agent); return agent
    def harvest_entropy(self):
        return int(time.perf_counter_ns() % 10) if self.entropy == 'clock' else self._erng.randint(0, 9)
    def execute_pandemonium_opcode(self, agent, zone, opcode):
        if opcode < 15:                                              # CHRONO
            sub = opcode % 3
            if sub == 0 and len(zone.agents) > 1:
                target = random.choice([a for a in zone.agents if a.id != agent.id]); target.frozen_ticks += 2
                self.log(f"[CHRONO] A#{agent.id} froze A#{target.id} in Z{zone.index}")
            elif sub == 1 and agent.prophecy_target is None and agent.energy > 20:
                agent.energy -= 10; agent.prophecy_target = random.randint(0, 9); agent.prophecy_timer = 3
                self.log(f"[CHRONO] A#{agent.id} bet on Z{zone.index} hitting [{agent.prophecy_target}]")
            else:
                self.move_agent(agent, triangular_gate(zone.index))
        elif opcode < 30:                                            # ZINO
            sub = opcode % 3
            if sub == 0 and len(zone.agents) > 1:
                host = random.choice([a for a in zone.agents if a.id != agent.id])
                if agent.signature == triangular_gate(host.zone) or random.random() < 0.35:
                    splice = agent.genome[:3]; host.genome = splice + host.genome[len(splice):]
                    agent.energy += 12; host.energy -= 12
                    self.log(f"[ZINO] A#{agent.id} virally overwrote A#{host.id} in Z{zone.index}")
            elif sub == 1 and zone.corpses:
                corpse = zone.corpses.pop(0); agent.genome.extend(corpse[:4])
                if len(agent.genome) > 18: agent.genome = agent.genome[-18:]
                agent.energy += 18; self.log(f"[ZINO] A#{agent.id} scavenged a data-corpse in Z{zone.index}")
            elif sub == 2 and agent.energy > 65:
                agent.energy /= 2; child_genome = list(agent.genome); random.shuffle(child_genome)
                self.spawn_agent(zone.index, child_genome, agent.energy)
                self.log(f"[ZINO] A#{agent.id} split into swarm-clone in Z{zone.index}")
        else:                                                        # AMPY
            sub = opcode % 3
            if sub == 0:
                agent.mutate(intensity=3); agent.energy += 20
                if random.random() < 0.3:
                    agent.energy = 0; self.log(f"[AMPY] A#{agent.id} suffered runaway meltdown in Z{zone.index}")
            elif sub == 1:
                zone.gravity_inverted = not zone.gravity_inverted; self.log(f"[AMPY] Z{zone.index} gravity current INVERTED")
            else:
                twin_zone = self.zones[SYZYGIES[zone.index]]
                if twin_zone.agents:
                    victim = random.choice(twin_zone.agents); self.move_agent(victim, zone.index)
                    self.log(f"[AMPY] A#{agent.id} yanked A#{victim.id} across syzygy {SYZYGIES[zone.index]}::{zone.index}")
    def move_agent(self, agent, dest_idx):
        if agent in self.zones[agent.zone].agents: self.zones[agent.zone].agents.remove(agent)
        agent.zone = dest_idx; self.zones[dest_idx].agents.append(agent)
    def step_zone(self, zone):
        if zone.index == CTHELL and zone.corpses and random.random() < 0.4:
            corpse = zone.corpses.pop(0); corpse.append(self.harvest_entropy())
            target_z = random.choice(list(TIME_CIRCUIT)); r = self.spawn_agent(target_z, corpse, energy=35.0); self.reanimations += 1
            self.log(f"[CTHELL] Necrotic parasite A#{r.id} erupted into Z{target_z}")
        zone_sum = digital_root(sum(a.signature for a in zone.agents))
        for agent in list(zone.agents):
            if agent.prophecy_target is not None:
                agent.prophecy_timer -= 1
                if zone_sum == agent.prophecy_target:
                    harvest = 0.0
                    for other in zone.agents:
                        if other.id != agent.id:
                            drain = min(other.energy, 10.0); other.energy -= drain; harvest += drain
                    agent.energy += harvest + 15; agent.prophecy_target = None
                    self.log(f"[RETRO] A#{agent.id} fulfilled prophecy [{zone_sum}] in Z{zone.index}!")
                elif agent.prophecy_timer <= 0:
                    agent.energy = 0; self.log(f"[RETRO] A#{agent.id} failed prophecy and dissolved into Cthell")
        for agent in list(zone.agents):
            if agent.frozen_ticks > 0:
                agent.frozen_ticks -= 1; continue
            agent.energy -= 4.0 if zone.index in WARP_ZONES else 1.5
            if zone.index in WARP_ZONES: agent.mutate(intensity=2)
            elif random.random() < 0.15: agent.mutate(intensity=1)
            self.execute_pandemonium_opcode(agent, zone, agent.read_opcode())
            if random.random() < 0.35:
                direction = -1 if zone.gravity_inverted else 1
                self.move_agent(agent, (zone.index + (CURRENTS[zone.index] * direction)) % 10)
            if agent.energy <= 0:
                self.died.add(agent.id)
                if self.repaired:
                    where = self.zones[agent.zone]
                    if agent in where.agents: where.agents.remove(agent)
                    body = list(agent.genome)
                else:
                    if agent in zone.agents: zone.agents.remove(agent)
                    body = agent.genome
                if len(zone.corpses) < 10: zone.corpses.append(body)
                else: self.zones[CTHELL].corpses.append(body)
        twin = self.zones[SYZYGIES[zone.index]]
        if len(zone.agents) < len(twin.agents):
            for a in zone.agents: a.energy += 2.5
    def cycle(self):
        self.global_cycles += 1
        for z in self.zones.values():
            z.update_clock_speed(); z.tick_accumulator += z.local_clock_speed
            while z.tick_accumulator >= 1.0:
                z.tick_accumulator -= 1.0; self.step_zone(z)
        total_pop = sum(len(z.agents) for z in self.zones.values())
        if self.reseed and total_pop < 4:
            for _ in range(6): self.spawn_agent(random.randint(1, 9))
            self.reseeds += 1; self.log("[HYPERSTITION] External entropy surge spawned new viral hosts")
        return total_pop
    def run(self, max_cycles=60, delay=0.25, show=True):
        for _ in range(max_cycles):
            total_pop = self.cycle()
            if show: self.render(total_pop); time.sleep(delay)
    def render(self, total_pop):
        os.system("cls" if os.name == "nt" else "clear")
        print(f"=== CYBERGOTHIC NUMOGRAM SUBSTRATE | CYCLE {self.global_cycles} | TOTAL HOSTS: {total_pop} ===")
        print("SYZYGY TOPOLOGY (9::0 Cthell | 8::1, 7::2 Warp | 6::3, 5::4 Time-Circuit)\n")
        for a, b in [(9, 0), (8, 1), (7, 2), (6, 3), (5, 4)]:
            za, zb = self.zones[a], self.zones[b]
            print(f"Z{a}{'!' if za.gravity_inverted else ' '} (clk:{za.local_clock_speed:.1f}x | corpses:{len(za.corpses):02d}) [{'#' * len(za.agents):<12}] <-- Curr"
                  f" {CURRENTS[a]} --> [{'#' * len(zb.agents):<12}] Z{b}{'!' if zb.gravity_inverted else ' '} (clk:{zb.local_clock_speed:.1f}x | corpses:{len(zb.corpses):02d})")
        print("\n--- PANDEMONIUM TELEMETRY LOG ---")
        for entry in self.event_log: print(f" > {entry}")

if __name__ == "__main__":
    CybergothicEngine(initial_agents=28).run(max_cycles=100, delay=0.2)
