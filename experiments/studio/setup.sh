#!/bin/sh
# Assemble a working studio folder from this archive.
# Usage: sh setup.sh <new studio folder>
# Result: <folder>/ holds the scripts, the hooked runtime as m/, the unmodified runtime as m0/,
# and the archived loop logs in loop/ and loopB/ (scar_assay.py reads loop/loop_log.json).
set -e
A=$(cd "$(dirname "$0")" && pwd)
S="$1"; [ -n "$S" ] || { echo "usage: sh setup.sh <new studio folder>"; exit 1; }
[ -e "$S" ] && { echo "$S already exists; give a new folder"; exit 1; }
mkdir -p "$S"
cp "$A"/code/* "$S"/
cp -r "$A"/runtime_mirror "$S"/m
cp -r "$A"/runtime_unmodified "$S"/m0
cp -r "$A"/outputs/loop "$S"/loop
cp -r "$A"/outputs/loopB "$S"/loopB
echo '{"type":"module"}' > "$S"/package.json
echo "studio folder ready: $S"
