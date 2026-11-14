#!/usr/bin/env python3
"""The Enochian-Numogrammatic Matrix: a standalone model (no import from the app, its runtime or main).

Numogram (CCRU, canonical):
  zones 0-9; syzygy z::9-z; current of a syzygy = the difference of its zones, which feeds the zone of that number;
  regions: Plex {0, 9}, Warp {3, 6}, Time-Circuit {1, 2, 4, 5, 7, 8};
  gates: Gt-n runs from zone n to the digital root of its cumulation n(n+1)/2;
  Pandemonium: the 45 pairs of distinct zones, names and classes from the CCRU Pandemonium Matrix (pandemonium-45.json).
Dee's Great Table (Golden Dawn arrangement):
  four Watchtowers of 12 columns x 13 rows (Air upper left, Water upper right, Earth lower left, Fire lower right) = 24 x 26,
  and the Tablet of Union (4 x 5: EXARP, HCOMA, NANTA, BITOM; columns Spirit, Air, Water, Earth, Fire);
  in each Watchtower the Great Cross (columns 6-7 and row 7, 36 squares; row 7 reads the three Holy Names) divides four
  sub-angles of 5 x 6 (Air upper left, Water upper right, Earth lower left, Fire lower right); in each sub-angle the
  Calvary Cross (middle column + second row, 10 squares), 4 Kerubic squares (top row) and 16 servient squares.
Bridge (the operator's design): syzygy -> sector
  9::0 Tablet of Union (Spirit) | 8::1 Air | 7::2 Fire | 6::3 Water | 5::4 Earth.
Demon placement (stated rule): a pair whose zones lie in syzygies X (the higher zone's) and Y lives in the sub-angle "Y of X"
of Watchtower X; a syzygetic pair in "X of X"; a pair with one Plex zone in the Union word of the other zone's sector; 0::9 in
the Tablet of Union as a whole.
Letters: only those certain are included (the Tablet of Union, each Watchtower's three Holy Names on its Linea Spiritus
Sancti, and its King). The rest of the grid is an empty slot for a verified transcription (letters/WATCHTOWERS.json)."""
import json, pathlib
H = pathlib.Path(__file__).resolve().parent
ZONES = list(range(10))
def droot(n): return 0 if n == 0 else 1 + (n - 1) % 9
def partner(z): return 9 - z
def current_of(z): a, b = sorted((z, 9 - z)); return b - a                   # the syzygy's current (a number = a zone)
def gate_of(z): return droot(z * (z + 1) // 2)
REGION = {z: ('Plex' if z in (0, 9) else 'Warp' if z in (3, 6) else 'Time-Circuit') for z in ZONES}
SECTOR = {0: 'Union', 9: 'Union', 1: 'Air', 8: 'Air', 2: 'Fire', 7: 'Fire', 3: 'Water', 6: 'Water', 4: 'Earth', 5: 'Earth'}
ELEMENTS = ['Air', 'Water', 'Earth', 'Fire']
WT_ORIGIN = {'Air': (0, 0), 'Water': (0, 12), 'Earth': (13, 0), 'Fire': (13, 12)}     # (row, col) in the 24 x 26 table
SUB_ORIGIN = {'Air': (0, 0), 'Water': (0, 7), 'Earth': (7, 0), 'Fire': (7, 7)}        # inside a Watchtower
HOLY_NAMES = {'Air': ('ORO', 'IBAH', 'AOZPI'), 'Water': ('MPH', 'ARSL', 'GAIOL'), 'Earth': ('MOR', 'DIAL', 'HCTGA'), 'Fire': ('OIP', 'TEAA', 'PDOCE')}
KINGS = {'Air': 'BATAIVAH', 'Water': 'RAAGIOSL', 'Earth': 'ICZHIHAL', 'Fire': 'EDLPRNAA'}
UNION = {'Air': 'EXARP', 'Water': 'HCOMA', 'Earth': 'NANTA', 'Fire': 'BITOM'}
UNION_COLUMNS = ['Spirit', 'Air', 'Water', 'Earth', 'Fire']

def square_role(r, c):
    """Role of local square (r 0-12, c 0-11) in a Watchtower, and its sub-angle element where it has one."""
    if r == 6: return 'Linea Spiritus Sancti (Great Cross)', None
    if c in (5, 6): return 'Linea Dei Patris Filiique (Great Cross)', None
    sub = ('Air' if c < 5 else 'Water') if r < 6 else ('Earth' if c < 5 else 'Fire')
    lr, lc = (r if r < 6 else r - 7), (c if c < 5 else c - 7)
    if lc == 2 or lr == 1: return 'Calvary Cross', sub
    if lr == 0: return 'Kerubic', sub
    return 'Servient', sub

def build():
    E = json.load(open(H / 'pandemonium-45.json'))['entries']
    letters = {}
    p = H / 'letters' / 'WATCHTOWERS.json'
    if p.exists(): letters = json.load(open(p))      # {element: [13 strings of 12 letters]} once a verified transcription is added
    towers = {}
    for el in ELEMENTS:
        names = ''.join(HOLY_NAMES[el]); sq = []
        for r in range(13):
            for c in range(12):
                role, sub = square_role(r, c)
                L = letters.get(el, [None] * 13)[r][c] if letters.get(el) else (names[c] if r == 6 else None)
                sq.append({'r': r, 'c': c, 'R': WT_ORIGIN[el][0] + r, 'C': WT_ORIGIN[el][1] + c, 'role': role, 'subAngle': sub, 'letter': L})
        towers[el] = {'holyNames': HOLY_NAMES[el], 'king': KINGS[el], 'squares': sq}
    demons = []
    for e in E:
        a, b = sorted(e['zones'], reverse=True)          # a = the higher zone
        if {a, b} == {0, 9}: addr = {'table': 'Union', 'scope': 'the whole Tablet of Union (Spirit of Spirit)'}
        elif a in (0, 9) or b in (0, 9):
            other = b if a in (0, 9) else a
            addr = {'table': 'Union', 'scope': f"the Union word {UNION[SECTOR[other]]} ({SECTOR[other]})", 'row': SECTOR[other]}
        else:
            X, Y = SECTOR[a], SECTOR[b]
            addr = {'table': 'Watchtower', 'watchtower': X, 'subAngle': Y, 'scope': f'{Y} of {X}' + (' (syzygetic)' if X == Y else '')}
        demons.append({**e, 'regions': [REGION[a], REGION[b]], 'sectors': [SECTOR[a], SECTOR[b]], 'dee': addr})
    zones = [{'zone': z, 'syzygy': f'{max(z, 9 - z)}::{min(z, 9 - z)}', 'partner': partner(z), 'current': current_of(z),
              'gate': gate_of(z), 'gateName': f'Gt-{z * (z + 1) // 2}', 'region': REGION[z], 'sector': SECTOR[z]} for z in ZONES]
    return {'schema': 'ENM_V1', 'bridge': {'9::0': 'Union', '8::1': 'Air', '7::2': 'Fire', '6::3': 'Water', '5::4': 'Earth'},
            'zones': zones, 'demons': demons, 'watchtowers': towers,
            'union': {'rows': UNION, 'columns': UNION_COLUMNS}, 'lettersLoaded': bool(letters)}

def selftest(M):
    Z = {z['zone']: z for z in M['zones']}
    assert [Z[z]['gate'] for z in ZONES] == [0, 1, 3, 6, 1, 6, 3, 1, 9, 9]
    assert {z: Z[z]['current'] for z in ZONES} == {0: 9, 9: 9, 1: 7, 8: 7, 2: 5, 7: 5, 3: 3, 6: 3, 4: 1, 5: 1}
    # the Time-Circuit's currents form the closed loop 4::5 -> 1 (1::8) -> 7 (2::7) -> 5 (4::5); Warp and Plex feed themselves
    assert [Z[1]['current'], Z[7]['current'], Z[5]['current']] == [7, 5, 1] and Z[3]['current'] == 3 and Z[9]['current'] == 9
    assert len(M['demons']) == 45 and len({d['key'] for d in M['demons']}) == 45
    for d in M['demons']:   # CCRU classes follow the regions: Chrono = both Time-Circuit, Xeno = both outside, Amphi = one of each
        tc = sum(r == 'Time-Circuit' for r in d['regions'])
        assert ('Chronodemon' in d['classification']) == (tc == 2) and ('Xenodemon' in d['classification']) == (tc == 0) and ((d['classification'] == 'Amphidemon') == (tc == 1)), d
    for el, t in M['watchtowers'].items():
        roles = [s['role'] for s in t['squares']]
        assert len(t['squares']) == 156 and sum('Great Cross' in r for r in roles) == 36
        for sub in ELEMENTS:
            S = [s['role'] for s in t['squares'] if s['subAngle'] == sub]
            assert len(S) == 30 and S.count('Calvary Cross') == 10 and S.count('Kerubic') == 4 and S.count('Servient') == 16
        assert ''.join(s['letter'] for s in t['squares'] if s['r'] == 6) == ''.join(t['holyNames'])
    cells = {}
    for d in M['demons']:
        k = (d['dee'].get('watchtower'), d['dee'].get('subAngle'), d['dee'].get('row'))
        cells[k] = cells.get(k, 0) + 1
    assert sum(v for k, v in cells.items() if k[0]) == 28 and all(v == (1 if k[0] == k[1] else 2) for k, v in cells.items() if k[0])
    return 'ENM_SELFTEST_PASS'

if __name__ == '__main__':
    M = build(); print(selftest(M)); json.dump(M, open(H / 'matrix.json', 'w'), indent=1); print('wrote matrix.json')
