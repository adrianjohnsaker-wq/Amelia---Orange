# The Enochian-Numogrammatic Matrix: a standalone model

**What it is.** `matrix.py` and `route.py` model the operator's design (14 Nov 2026) on its own. They import nothing from the
app, its runtime or main. `matrix.json` is the full model as data. Run `python3 matrix.py` (self-test) and
`python3 route.py demo`.

## What is modelled exactly
**The Numogram (CCRU):**
- **Syzygies.** z::9−z.
- **Currents.** |2z−9|, so 8::1 → 7, 7::2 → 5, 5::4 → 1, 6::3 → 3, 9::0 → 9.
- **Gates.** Gt-n(n+1)/2 reduced: 0→0, 1→1, 2→3, 3→6, 4→1, 5→6, 6→3, 7→1, 8→9, 9→9.
- **Regions.** Time-Circuit {1, 2, 4, 5, 7, 8}, Warp {3, 6}, Plex {0, 9}.
- **Demons.** The 45 Pandemonium demons, with the CCRU's names and classes: Chronodemons have both zones in the
  Time-Circuit, Xenodemons both outside, Amphidemons one of each. The self-test checks this.

**Dee's Great Table, as the Golden Dawn arranges it:**
- **The table.** Four Watchtowers of 12 × 13 (Air upper left, Water upper right, Earth lower left, Fire lower right), 24 × 26
  in all.
- **The Great Cross.** It takes 36 squares. Its Linea Spiritus Sancti reads the three Holy Names.
- **The sub-angles.** Four per Watchtower, of 30 squares each: a 10-square Calvary Cross, 4 Kerubic squares and 16 servient
  squares.
- **The Tablet of Union.** EXARP, HCOMA, NANTA, BITOM; its columns are Spirit, Air, Water, Earth and Fire.
- **The Kings.** BATAIVAH, RAAGIOSL, ICZHIHAL, EDLPRNAA.

**The bridge, the operator's assignment:** 9::0 Union, 8::1 Air, 7::2 Fire, 6::3 Water, 5::4 Earth.

**Demon addresses.** A pair is placed in the sub-angle "Y of X" of Watchtower X, where X holds its higher zone. A syzygetic pair
sits in "X of X". A pair touching the Plex sits in the Union word of the other zone's element, and 0::9 in the whole Union.
That fills all 16 sub-angles: 2 demons in each mixed one and 1 in each pure one.

## What the model is not
**The letters.** Only certain letters are included: the Tablet of Union, the Holy Names row and the Kings. The other squares are
an empty slot, `letters/WATCHTOWERS.json`. No verified transcription of all 624 letters was available to this session. Name
extraction by Dee's geometric paths needs that transcription; addresses, roles and routing do not.

## Where the outline and the canonical Numogram differ (the model follows the canonical one)
1. **The Time-Circuit is zones 1, 2, 4, 5, 7, 8, not 2–7.**
   - Its currents form the closed loop 5::4 → 1 → (8::1) → 7 → (7::2) → 5.
   - Under the bridge, the homeostatic circulation runs **Air → Fire → Earth → Air**.
   - 8::1 is inside it, not outside.
2. **The Outside is the Warp (6::3, Water) and the Plex (9::0, Union).**
   - Water is not part of the Time-Circuit. It is the Warp, whose current (6−3 = 3) feeds itself: a vortex, not circulation.
   - 3 + 6 = 9 is the syzygy's sum, not a routing step.
3. **Demon classes follow the regions.**
   - Homeostatic Chronodemons have both zones in Air, Fire and Earth.
   - Xenodemons are wholly in Water and the Union.
   - Amphidemons bridge the two.
   - The outline's split (pairs within 2–7 against pairs with 0, 1, 8, 9) is not the CCRU's.
4. **Air's door to Spirit is the gate Gt-36 (8 → 9).** The doors into Water are Gt-3 (2 → 3, from Fire) and Gt-15
   (5 → 6, from Earth).
   - The outline's example, 4 → 5 → 6 (Earth → its partner → up into Water), is canonical: syzygy, then Gt-15.
5. **The Outside is one-way.** No syzygy, current or gate leads from the Warp or the Plex back into the Time-Circuit.
   - A jump "from 0 to 4/5" is not a canonical route.
   - Reading from the Union back into Earth (step 4) is possible only as a reverse reading of the route by which form
     reached Spirit, for example 4 → 1 → 8 → 9.
   - This is the same fact WT-1 found in Amelia: the Warp is exit-less without a line of flight.
6. **The Call's entry matters.** Air has two zones.
   - Entering at 1, the opening of the First Call circulates in the Time-Circuit (1 → 7 → 5 → 1).
   - Entering at 8, its first word (OL = 27 → 9) opens Gt-36 into the Union, and the lattice cannot bring it back.
