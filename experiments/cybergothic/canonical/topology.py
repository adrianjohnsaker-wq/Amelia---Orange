"""Zone sets for the Cybergothic engine.   CG_TOPOLOGY = hybrid (default: the prototype as shipped) | canonical (CCRU).

hybrid    : the developed prototype's own sets. Furnace {7, 8, 9}; recycling / fission / waiting-corpse "time circuit" 1-6;
            archive and reactor births into (1, 2, 4, 5); opcode families by pair: a+b = 9 -> ZINO, b >= 7 -> AMPY, else CHRONO.
canonical : the CCRU Numogram. Furnace = Warp {3, 6}; Time-Circuit {1, 2, 4, 5, 7, 8} for recycling, fission, waiting
            corpses and archive/reactor births; opcode families by the CCRU class of the pair: Chronodemon (both zones in the
            Time-Circuit) -> CHRONO, Xenodemon (both in the Outside {0, 3, 6, 9}) -> ZINO, Amphidemon (one of each) -> AMPY.
In both: the graph is Amelia's 29-edge Numogram graph; the Warp line of flight is {3, 6}; the reactor sits at zone 0, in the
Plex; zone 0's slow clock is kept (canonical: both Plex zones {0, 9} run slow)."""
import os
MODE = os.environ.get('CG_TOPOLOGY', 'hybrid')
if MODE not in ('hybrid', 'canonical'): raise ValueError('CG_TOPOLOGY must be hybrid or canonical')
TIME_CIRCUIT = frozenset({1, 2, 4, 5, 7, 8}); OUTSIDE = frozenset({0, 3, 6, 9})
if MODE == 'canonical':
    FURNACE = frozenset({3, 6}); SLOW = frozenset({0, 9}); RECYCLE_ZONES = TIME_CIRCUIT; BIRTH_ZONES = (1, 2, 4, 5, 7, 8)
else:
    FURNACE = frozenset({7, 8, 9}); SLOW = frozenset({0}); RECYCLE_ZONES = frozenset(range(1, 7)); BIRTH_ZONES = (1, 2, 4, 5)
def family_of(a, b, zino, ampy, chrono):
    if MODE == 'canonical':
        tc = (a in TIME_CIRCUIT) + (b in TIME_CIRCUIT)
        return chrono if tc == 2 else zino if tc == 0 else ampy
    return zino if a + b == 9 else ampy if b >= 7 else chrono
