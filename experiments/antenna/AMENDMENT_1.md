# THE ANTENNA, amendment 1: continuous collection (27 October 2026, before the window opens; no in-window data exist)

**Defect.** GitHub fires this repository's scheduled workflows only every 3–5 hours. PF-2's 15-minute schedule runs at that rate, and the collector's 30-minute schedule had not fired once by 10:25 UTC. Some sources roll over faster than that (the Al Jazeera feed, NOAA's 1-minute K-index), so data would be lost unevenly.

**Correction (engineering only; nothing in the science changes):**
- The collector is one long job that collects every 15 minutes for up to 5 h 40 min. It then starts its successor by `workflow_dispatch`, so collection is continuous until 4 Nov 02:00 UTC. The 30-minute schedule stays as a backup. A single concurrency group means only one collector runs at a time.
- Look-backs are widened so that a gap loses nothing that a source still holds: markets use 1-minute bars over 5 days instead of 1 day, and earthquakes use the past week instead of the past day.

The registration, criteria, reduction, controls, analysis and run are unchanged. The code moves from `a321e0f` to the commit carrying this file. This amendment, the new code and the workflows get their own RFC 3161 token before 28 Oct 2026 00:00 UTC.
