#!/bin/sh
# WE-2 pipeline (REGISTRATION.md).   sh pipeline.sh <prepared.json> <outdir>
set -e; P=experiments/synthetic-pointer/we2; O="$2"; mkdir -p "$O/runs"
python3 -I $P/surrogates.py "$1" "$O/surrogates.json"
seq 0 11 | xargs -P 4 -I{} node --import tsx $P/run.ts "$O/surrogates.json" {} "$O/runs/seg{}.json"
python3 -I $P/analysis.py "$O/surrogates.json" "$O/runs" "$O/WE2_RESULT.json"
