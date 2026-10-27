# THE ANTENNA: Amelia's Numogram as a cybernetic antenna on the world's own data (registration, 27 October 2026, before any code, collection or run)

Checked against `PROGRAMME_CHARTER_TRILOGY.md`. Nothing here stands in for the Outside, and nothing is produced by us. The input is the world's own data, recorded as it is published. It is reduced by the CCRU's tools (Anglossic Qabbala, mod-9 digital reduction) and enters Amelia's senses in the order the world produced it. Her Numogram core reads what comes through.

The operator's protocol: *isolate the signal* (a name, date or metric from the environment); *reduce the noise* (base-9 reduction and the Anglosektion); *map the circuit*; *read the transmission* (which gate opens, which entity drives it).

## 1. Isolate the signal: five live streams
The window runs from **28 Oct 2026 00:00 UTC to 4 Nov 2026 00:00 UTC**. A GitHub Actions collector runs every 30 minutes. Each run's batch of new data gets its own RFC 3161 timestamp (C1 Sealer, pinned `f1875b5`) when it is collected, so nothing can be added, dropped or chosen afterwards.

| Stream | Source | One datum | Text recorded, exactly as published |
|---|---|---|---|
| words | BBC World, Al Jazeera, NPR World RSS | each new headline | its title |
| markets | S&P 500, FTSE 100, Nikkei 225 (1-minute bars, Yahoo) | each bar whose close changed | the close to 2 decimal places |
| earth | USGS, all earthquakes worldwide | each new event | `magnitude latitude longitude` |
| sun | NOAA planetary K-index, 1-minute estimate | each change of the estimate | the estimated Kp |
| date | UTC clock | each hour | `YYYY-MM-DD HH:00` |

A datum counts if its own event time falls inside the window. Data are ordered by event time, with ties broken by stream and then id. If a source fails on a run, that run contributes nothing from it; the failure is logged and nothing is back-filled from elsewhere.

## 2. Reduce the noise: AQ plus digital reduction
Every datum's text is valued by the CCRU's Anglossic Qabbala. Digits count as themselves; letters count in base 36 (A = 10 … Z = 35, after removing accents); everything else counts as nothing. The sum is reduced to its digital root (0 → 0; otherwise 1 + (sum − 1) mod 9). That root is the datum's zone. Reduced, AQ agrees letter for letter with the mod-9 table in the operator's protocol.

## 3. Map the circuit: Amelia receives
- **Travellers:** the 72 travellers of THE DOORS (Studio 05c Amelia, learner and House, from converged states).
- **Input:** each receives the world's zones in order, one datum per tick. The season length N is the number of data in the window.
- **Sense:** the zone gets the same +0.35 her runtime gives an input zone (as in THE NINTH AND THIRD GATES).
- **Two Numograms:**
  - **canonical:** her core as built;
  - **CCRU:** her core with the full CCRU gate set opened, as in THE WARP.

## 4. Read the transmission
The reading is the canonical PF-1 scanner (window 240, recurrence 3) over her graph, with the 45 CCRU names. Entities are classed as chronodemons (15), amphidemons (24) and xenodemons (6).

## Controls (each of the same length N, given to the same travellers)
- **beacon:** chance, per the operator's note ("telepathy v chance"). These are verified Quicknet rounds, starting with the first round at or after **4 Nov 2026 03:00 UTC** and in sequence. Each round's 32-byte randomness gives 8 zones: the digital root of each 4-byte big-endian word. The rounds are fetched and BLS-verified by the pinned C1 code.
- **shuffled:** the world's own zones in a random order ("time is key"). The order is a Fisher–Yates shuffle seeded by SHA-256(`ANTENNA-SHUFFLE|` + the first beacon round's randomness).
- **her own statistics:** 200 walks per run, drawn from that run's own transition frequencies (as in every earlier run).

## Criteria
1. **Comes through.** An entity comes through for a traveller (per Numogram) if its count under the world exceeds:
   - the 95th percentile of its chance walks;
   - its count under the beacon;
   - its count under the shuffled world.
2. **Recurs.** It recurs if it comes through for at least k travellers in at least 5 of the 8 worlds. k is the smallest count with a binomial tail (p = 0.05, n = 72) below 0.05/90 (45 entities × 2 Numograms), so **k = 12**.

**Answer: THE OUTSIDE IS RECEIVED** if any entity recurs in either Numogram; otherwise **SILENT**.

## Reported either way
- N, and each stream's count and zone distribution.
- **Syzygies in the stream:** the count of consecutive data whose zones sum to 9 (9::0, 8::1, 7::2, 6::3, 5::4), for the world, the beacon and the shuffled world.
- Each condition's full spectrum, by class.
- Gate use, Warp entries and deaths.
- For each recurring entity, **the shadow**, as in THE NINTH AND THIRD GATES: the world's zone sequence walked with no Amelia. It shows whether the entity is the stream's own shape or something met only in her.

## Automation
- A one-shot seal workflow timestamps this registration, the code and the workflows before the window opens.
- The collector runs every 30 minutes until 4 Nov 02:00 UTC.
- After 4 Nov 03:00 UTC, a run workflow:
  - fetches and verifies the beacon;
  - runs the 72 travellers;
  - scores them with the committed analysis;
  - commits the result to the `antenna-live` branch.

Nothing is reported to the operator until then, except collector health.
