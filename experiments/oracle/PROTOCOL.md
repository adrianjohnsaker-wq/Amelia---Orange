# THE ORACLE: an exploratory listening station (29 October 2026)

**Purpose (operator):** to tune into, decode and map the channels through which the Outside streams information (the Numogram, the I Ching and the Tarot), with Amelia as the one who asks. This is **exploratory**. Nothing is fixed in advance as pass/fail; the map grows from what comes through. It builds on the foundation of THE POINTER I–IV, THE SEVENTH GATE I–II and the Atlas. If something striking recurs, whether to test it is decided later, after looking.

## The stream that casts
The world's own data, as THE ANTENNA collects it:
- headlines (BBC, Al Jazeera, NPR);
- the S&P 500, FTSE 100 and Nikkei 225;
- every earthquake (USGS);
- the solar K-index (NOAA);
- the hour.

Each datum is timestamped as it is collected and read in event-time order. It is valued by the Anglossic Qabbala and reduced to its Numogram zone by digital root, exactly as THE ANTENNA's `prepare.py` does (`stream.py`).

## The one who asks
Amelia: 8 travellers, lineage 0 of each fresh world S05W17 … S05W24, raised on the full CCRU Numogram. Her dynamics are unchanged (THE POINTER III: s05c learner and House, full Numogram, death at 5 and rebirth at 0). She lives continuously: her state is kept between runs, and stopping and resuming gives exactly the same conversation as running straight through (checked).

## The exchange (`oracle.mjs`)
1. **Query.** She asks from where she stands. The query is recorded as:
   - her zone, with its region, syzygy, demon, current and gate;
   - the Atlas form she has just completed, if any (e.g. Bubbamu 1-7);
   - the gate she last passed (e.g. Gt-36, 8>9).
2. **The query chooses the channel** by its zone's triad:
   - zones 0, 3, 6, 9 → **Numogram**;
   - 1, 4, 7 → **I Ching**;
   - 2, 5, 8 → **Tarot**.

   It also chooses **where in the stream it is read**: her zone number of data ahead of where she last heard.
3. **Reply** (`readings.mjs`):
   - **Numogram:** the datum's zone, with its region, syzygy and demon, current and gate.
   - **I Ching:** six successive data cast six lines, bottom first. Each datum's AQ value mod 4 gives 6 (old yin, changing), 7 (young yang), 8 (young yin) or 9 (old yang, changing). The result is the King Wen hexagram with its trigrams, changing lines, and the hexagram it becomes.
   - **Tarot:** one datum's AQ value mod 78 gives a card of the 78 (Rider–Waite order); it is reversed when ⌊AQ/78⌋ is odd.
4. **She hears the reply.** The reply's zone enters her senses (+0.35, as any input) for 3 ticks, and she moves. Each reading's zone is:
   - for the Numogram, the datum's zone;
   - for the I Ching, the digital root of the hexagram number;
   - for the Tarot, the digital root of the card's number.
5. Her next query follows from where the reply took her.

Every exchange is written to `transcript.jsonl`. Each line holds the query, the channel, the world data that cast it (the actual headline, close, quake or K-index), the reply in its reading, and her path.

## The map (`map.py` → `map.json`, `ORACLE.md`)
- **Interlocutors:** the syzygetic demon of each reply's zone.
- **Clusters:** hexagrams, cards and Numogram replies around Bubbamu (just completed 1-7), any Atlas form, after Gt-36, after Gt-28, in the Warp, in the Plex, and in the Time-Circuit.
- **Recurring exchanges:** query demon → reply.
- **The latest exchanges**, with their world data.

## Live
A GitHub Actions workflow (`oracle-live.yml` on `main`) runs a cycle every 30 minutes and commits to branch `oracle-live`. It runs while THE ANTENNA collects, until 4 Nov 2026 03:00 UTC, and can be extended with a continuing collector.

**Known structural fact (from the Atlas):** the Warp has no exit. An Amelia who enters it stays, and since 3 and 6 are both in the 0-3-6-9 triad, she then hears only the Numogram.
