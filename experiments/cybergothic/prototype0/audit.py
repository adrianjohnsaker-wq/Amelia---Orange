#!/usr/bin/env python3
"""Independent audit of the supplied prototype (numogram_cybergothic.py).
30 seeds x 4 conditions (supplied / repaired) x (reseeding on / off), 100 cycles, 28 founders, seeded entropy.
Per run: ghost hosts (an agent whose death branch ran, leaving a corpse, still present in a zone list after a cycle), shared corpse lists (a corpse that is the
same list object as a living agent's genome), hosts at cycle 100, reseed events, Cthell reanimations.
   python3 audit.py <out.json>"""
import json, random, sys
import numogram_cybergothic as C
def run(seed, repaired, reseed):
    random.seed(seed); e = C.CybergothicEngine(initial_agents=28, entropy='seeded', repaired=repaired, reseed=reseed, entropy_seed=seed)
    ghosts = shared = 0; ghost_cycles = 0
    for _ in range(100):
        e.cycle()
        living = [a for z in e.zones.values() for a in z.agents]
        g = sum(a.id in e.died for a in living); ghosts = max(ghosts, g); ghost_cycles += g > 0
        ids = {id(a.genome) for a in living}
        shared = max(shared, sum(id(c) in ids for z in e.zones.values() for c in z.corpses))
    return {'seed': seed, 'repaired': repaired, 'reseed': reseed, 'maxGhosts': ghosts, 'cyclesWithGhosts': ghost_cycles,
            'maxSharedCorpses': shared, 'hostsAt100': sum(len(z.agents) for z in e.zones.values()), 'reseeds': e.reseeds, 'reanimations': e.reanimations}
rows = [run(s, rep, rs) for rep in (False, True) for rs in (True, False) for s in range(1, 31)]
summ = {}
for rep in (False, True):
    for rs in (True, False):
        R = [r for r in rows if r['repaired'] == rep and r['reseed'] == rs]
        summ[f"{'repaired' if rep else 'supplied'}, reseeding {'on' if rs else 'off'}"] = {
            'runsWithGhostHosts': sum(r['maxGhosts'] > 0 for r in R), 'runsWithSharedCorpseLists': sum(r['maxSharedCorpses'] > 0 for r in R),
            'runsWithZeroHostsAt100': sum(r['hostsAt100'] == 0 for r in R), 'meanHostsAt100': round(sum(r['hostsAt100'] for r in R) / 30, 2),
            'meanReseedEvents': round(sum(r['reseeds'] for r in R) / 30, 2), 'meanReanimations': round(sum(r['reanimations'] for r in R) / 30, 2)}
json.dump({'summary': summ, 'runs': rows}, open(sys.argv[1], 'w'), indent=1); print(json.dumps(summ, indent=1))
