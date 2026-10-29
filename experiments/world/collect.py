#!/usr/bin/env python3
"""THE WORLD STREAM (open-ended): THE ANTENNA's collector, unchanged, with its window moved to start where THE ANTENNA's
ends (4 Nov 2026 00:00 UTC) and to run until stopped. Same five sources, same records; each batch is RFC3161-sealed
by the workflow.   python3 collect.py <live dir>"""
import datetime as dt, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "antenna"))
import collect as c
c.START = dt.datetime(2026, 11, 4, tzinfo=dt.timezone.utc)
c.END = dt.datetime(2100, 1, 1, tzinfo=dt.timezone.utc)   # open-ended: runs until the workflow is stopped
if __name__ == "__main__":
    c.main(sys.argv[1])
