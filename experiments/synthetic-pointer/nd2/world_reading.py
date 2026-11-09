#!/usr/bin/env python3
"""ND-2 W1: the ND-1 lag-2 reading of the world's numbers (ND-1's N1 statistic and 6 tests, Holm), and the EXIT reading for
comparison (descriptive). Input: nd1/run.ts output on the world stream with config 0.5:0.6.   python3 world_reading.py <runs>"""
import json, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / 'nd1'))
import subprocess
out = subprocess.run([sys.executable, '-I', str(pathlib.Path(__file__).resolve().parent.parent / 'nd1' / 'analysis.py'), 'stage2', '0.5', '0.6', '2', sys.argv[1]], capture_output=True, text=True, check=True).stdout
r = json.loads(out); print(json.dumps({'W1_ndReading': r['N1_ndReading'], 'descriptive': r['descriptive'], 'ndMinusExitArea': r['N2_ndMinusExit_area']}, indent=1))
