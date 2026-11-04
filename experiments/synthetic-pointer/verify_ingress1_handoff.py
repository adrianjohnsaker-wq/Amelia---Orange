#!/usr/bin/env python3
"""Independently recalculate INGRESS-1 from its operator-supplied exports.

Creates a new output directory; the original handoff is never modified. Requires
NumPy and SciPy. Differences down to floating-point precision are reported,
not hidden as byte-identical reproduction.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
from pathlib import Path, PurePosixPath
import platform
import shutil
import subprocess
import sys
import tarfile

import numpy
import scipy

EXPECTED = {
    'vt_m_runtime.tar.gz': '85dba6de7dc7b178e07d3020d15d8015cc399add62db058f2b092fbb4f9136d0',
    'vt_m_SHA256SUMS.txt': '317d253e008d1287e80cfcb68a31d5be980bfbd77c1d12e163794d19d20a03a3',
    'ingress1_season_outputs.tar.gz': '4b794b10818d37aa694fd74baf243adfb2ae714ca3989d014d24ec282bcd7479',
    'ingress_rows.json': '9bcccf805e48c6b2e352024f0388f5e79f3ee04e7488d1faad34d6b03d62f08a',
    'analysis.json': '2deab7893d301978f86f835674d108c3b8740d3f9995502dbf7e9d21df3038ee',
    'ingress_test.py': '548a904ee47331efbbd308dbc2c5515b962403d1c9c60292d2b5255152bcf7fe',
}


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def extract_files(archive: Path, destination: Path) -> set[str]:
    """Extract ordinary files only, rejecting traversal, duplicate and special entries."""
    paths: set[str] = set()
    with tarfile.open(archive, 'r:gz') as tar:
        for item in tar:
            path = PurePosixPath(item.name)
            if path.is_absolute() or '..' in path.parts or not path.parts:
                raise ValueError(f'Unsafe archive path: {item.name}')
            if item.isdir():
                continue
            if not item.isfile() or str(path) in paths:
                raise ValueError(f'Unexpected archive entry: {item.name}')
            paths.add(str(path))
            target = destination.joinpath(*path.parts)
            target.parent.mkdir(parents=True, exist_ok=True)
            with target.open('xb') as out, tar.extractfile(item) as source:
                if source is None:
                    raise ValueError(f'Cannot read {item.name}')
                shutil.copyfileobj(source, out)
    return paths


def compare(a, b) -> dict:
    differences = {'numeric_differences': 0, 'max_absolute_difference': 0.0,
                   'non_numeric_differences': 0, 'numeric_over_tolerance': 0}

    def walk(x, y):
        if isinstance(x, dict) and isinstance(y, dict):
            if x.keys() != y.keys():
                differences['non_numeric_differences'] += 1
            for key in x.keys() & y.keys():
                walk(x[key], y[key])
        elif isinstance(x, list) and isinstance(y, list):
            if len(x) != len(y):
                differences['non_numeric_differences'] += 1
            for left, right in zip(x, y):
                walk(left, right)
        elif (isinstance(x, (int, float)) and not isinstance(x, bool)
              and isinstance(y, (int, float)) and not isinstance(y, bool)):
            if not math.isfinite(x) or not math.isfinite(y):
                raise ValueError('Non-finite comparison value')
            if x != y:
                delta = abs(x - y)
                differences['numeric_differences'] += 1
                differences['max_absolute_difference'] = max(differences['max_absolute_difference'], delta)
                if delta > 1e-12:
                    differences['numeric_over_tolerance'] += 1
        elif type(x) != type(y) or x != y:
            differences['non_numeric_differences'] += 1

    walk(a, b)
    return differences


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--handoff', type=Path, required=True)
    parser.add_argument('--runtime-mirror', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    handoff, mirror, output = args.handoff.resolve(), args.runtime_mirror.resolve(), args.output.resolve()
    declared = {}
    for line in (handoff / 'HANDOFF_SHA256SUMS.txt').read_text().splitlines():
        sha, name = line.split(maxsplit=1)
        if name in declared:
            raise ValueError(f'Duplicate handoff entry: {name}')
        declared[name] = sha
    if declared != {k: v for k, v in EXPECTED.items() if k != 'ingress_test.py'}:
        raise ValueError('Handoff manifest differs from the recorded source hashes')
    for name, expected in EXPECTED.items():
        if digest(handoff / name) != expected:
            raise ValueError(f'Handoff source hash mismatch: {name}')
    output.mkdir(parents=True, exist_ok=False)

    runtime_paths = extract_files(handoff / 'vt_m_runtime.tar.gz', output)
    manifest = {}
    for line in (handoff / 'vt_m_SHA256SUMS.txt').read_text().splitlines():
        sha, path = line.split(maxsplit=1)
        name = str(PurePosixPath(path.removeprefix('./')))
        if name in manifest:
            raise ValueError(f'Duplicate runtime entry: {name}')
        manifest[name] = sha
    if runtime_paths != {'m/' + name for name in manifest}:
        raise ValueError('Runtime archive and manifest file sets differ')
    mirror_files = {str(p.relative_to(mirror).as_posix()) for p in mirror.rglob('*') if p.is_file()}
    if mirror_files != set(manifest):
        raise ValueError('Repository runtime and manifest file sets differ')
    for name, sha in manifest.items():
        if digest(output / 'm' / name) != sha or digest(mirror / name) != sha:
            raise ValueError(f'Runtime byte mismatch: {name}')

    season_paths = extract_files(handoff / 'ingress1_season_outputs.tar.gz', output)
    expected_seasons = {f'r5/W{world}/{arm}/{filename}'
        for world in range(186, 194) for arm in ('none', 'alt', 'stream', 'shuffled')
        for filename in [*(f's{season}.json' for season in range(6, 12)), 'state_s11.json']}
    if season_paths != expected_seasons:
        raise ValueError('Season archive does not contain the expected 224 files')
    env = dict(os.environ, OPENBLAS_NUM_THREADS='1', OMP_NUM_THREADS='1', PYTHONHASHSEED='0')
    with (output / 'recalculation.log').open('x') as log:
        subprocess.run([sys.executable, str(handoff / 'ingress_test.py'), str(output / 'r5')],
                       check=True, stdout=log, stderr=subprocess.STDOUT, env=env)
    original_rows = json.loads((handoff / 'ingress_rows.json').read_text())
    recalculated_rows = json.loads((output / 'r5' / 'ingress_rows.json').read_text())
    original_analysis = json.loads((handoff / 'analysis.json').read_text())
    recalculated_analysis = json.loads((output / 'r5' / 'analysis.json').read_text())
    identity = [(r['W'], r['k']) for r in original_rows]
    expected_identity = [(world, k) for world in range(186, 194) for k in range(27)]
    if identity != expected_identity or identity != [(r['W'], r['k']) for r in recalculated_rows]:
        raise ValueError('World/lineage row identity mismatch')
    decisions = {}
    for name, control in [('H1', 'alt'), ('H2', 'shuffled')]:
        signs = lambda row: (row['stream_after'] - row[control + '_after']) > 0
        disagreements = sum(signs(a) != signs(b) for a, b in zip(original_rows, recalculated_rows))
        decisions[name] = {'positive': sum(map(signs, recalculated_rows)), 'row_sign_disagreements': disagreements}
    summary = {
        'runtime_files': len(manifest), 'runtime_file_sets_and_bytes_match': True,
        'worlds': 8, 'lineages_per_world': 27, 'arms': 4, 'season_files': len(season_paths),
        'row_comparison': compare(original_rows, recalculated_rows),
        'analysis_comparison': compare(original_analysis, recalculated_analysis),
        'decisions': decisions, 'recalculated_tests': recalculated_analysis['tests'],
        'output_sha256': {name: digest(output / 'r5' / name) for name in ('ingress_rows.json', 'analysis.json')},
        'environment': {'python': platform.python_version(), 'numpy': numpy.__version__, 'scipy': scipy.__version__},
        'interpretation': 'Recalculation from supplied season exports, not an independent rerun of the original simulations.',
    }
    for name in ('row_comparison', 'analysis_comparison'):
        if summary[name]['non_numeric_differences'] or summary[name]['numeric_over_tolerance']:
            raise ValueError(f'Comparison outside tolerance: {name}: {summary[name]}')
    if any(x['row_sign_disagreements'] for x in decisions.values()):
        raise ValueError('Paired decision changed at row level')
    (output / 'verification.json').write_text(json.dumps(summary, indent=2) + '\n')
    print(json.dumps(summary, indent=2))


if __name__ == '__main__':
    main()
