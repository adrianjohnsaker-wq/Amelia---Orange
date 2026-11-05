#!/usr/bin/env python3
"""Run the committed SXI-1 synthetic-source challenge in a new directory.

All arms are isolated from live services. A full source-bound W+ trace is
verified before compression, and one complete retry is permitted only for an
execution or trace-verification failure. Failed attempts are retained.
"""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
import hashlib
import json
import os
import platform
from pathlib import Path
import re
import shutil
import subprocess
import sys
import threading

import zstandard

from analyse_wplus_challenge import trace as extract_trace
from build_wplus_challenge_overlay import build
from sxi1_analysis import ARMS, analyse

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
PRINT_LOCK = threading.Lock()


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for part in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(part)
    return h.hexdigest()


def write_json(path: Path, value) -> None:
    with path.open('x') as stream:
        json.dump(value, stream, indent=2)
        stream.write('\n')


def compress_verified(path: Path) -> dict:
    original = digest(path)
    packed = path.with_suffix(path.suffix + '.zst')
    with path.open('rb') as source, packed.open('xb') as target:
        with zstandard.ZstdCompressor(level=5).stream_writer(target, closefd=False) as writer:
            shutil.copyfileobj(source, writer, length=1024 * 1024)
    h = hashlib.sha256()
    with packed.open('rb') as source, zstandard.ZstdDecompressor().stream_reader(source) as reader:
        for part in iter(lambda: reader.read(1024 * 1024), b''):
            h.update(part)
    if h.hexdigest() != original:
        raise ValueError('Trace compression failed content verification')
    compressed = digest(packed)
    path.unlink()
    return {'trace_sha256': original, 'compressed_trace_sha256': compressed,
            'compressed_trace': packed.name, 'compressed_bytes': packed.stat().st_size}


def run_one(root: Path, overlay: Path, runtime: Path, world: int, arm: str, mode: str) -> dict:
    final = root / 'runs' / f'W{world}' / arm / mode
    final.mkdir(parents=True, exist_ok=False)
    source_plan = root / 'bank' / f'{arm}.json'
    failures = []
    for attempt in (1, 2):
        directory = final / f'attempt_{attempt}'
        directory.mkdir()
        trace_path = directory / f'sxi_S05W{world}_L0_S0.jsonl'
        run_cmd = ['node', '--experimental-strip-types', '--no-warnings', str(overlay), f'm={runtime}',
            f'world={world}', 'seasons=1', 'lineages=1', 'mode=plus', 'inf=I', 'refrain=evo',
            f'out={directory}', 'sxiTrace=1', f'sxiChallenge={mode}', f'sxiSchedule={source_plan}']
        try:
            with (directory / 'simulation.log').open('x') as log:
                subprocess.run(run_cmd, stdout=log, stderr=subprocess.STDOUT, check=True, timeout=600)
            verify_cmd = ['node', str(HERE / 'verify_wplus_challenge_trace.mjs'), str(trace_path),
                str(directory / 's0.json'), str(directory / 'state_s0.json'), str(overlay),
                str(runtime), str(source_plan)]
            with (directory / 'verification.json').open('x') as log, (directory / 'verification-errors.log').open('x') as err:
                subprocess.run(verify_cmd, stdout=log, stderr=err, check=True, timeout=600)
            verification = json.loads((directory / 'verification.json').read_text())
            if verification['status'] != 'PASS':
                raise ValueError('Verifier did not return PASS')
            extracted = extract_trace(trace_path)
            extracted['finish'] = {'kind': 'FINISH'}
            write_json(final / 'challenge_extract.json', extracted)
            archived = compress_verified(trace_path)
            receipt = {'world': world, 'arm': arm, 'challenge': mode, 'attempt': attempt,
                       'failures': failures, 'verification': verification, 'archive': archived,
                       'challenge_extract_sha256': digest(final / 'challenge_extract.json')}
            write_json(final / 'run_receipt.json', receipt)
            return receipt
        except (OSError, ValueError, KeyError, json.JSONDecodeError, subprocess.SubprocessError) as error:
            failures.append({'attempt': attempt, 'error': str(error)})
            # A trace may be scientifically incomplete even when the runner exits 0.
            # Retain all failed files and retry the whole deterministic fixture once.
            if (final / 'challenge_extract.json').exists():
                raise RuntimeError(f'Failure after extraction for W{world}/{arm}/{mode}: {error}') from error
    write_json(final / 'FAILED.json', {'world': world, 'arm': arm, 'challenge': mode, 'failures': failures})
    raise RuntimeError(f'Both attempts failed for W{world}/{arm}/{mode}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--registration', required=True, type=Path)
    parser.add_argument('--source', required=True, type=Path)
    parser.add_argument('--runtime', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--precommit', required=True, help='Published full GitHub precommit SHA')
    args = parser.parse_args()
    if not re.fullmatch(r'[0-9a-f]{40}', args.precommit):
        raise ValueError('A full published precommit SHA is required')
    registration = json.loads(args.registration.read_text())
    if registration['study'] != 'SXI-1-SYNTHETIC-SOURCE-RECOVERY' or registration['worlds'] != list(range(9501, 9509)):
        raise ValueError('Unexpected study identity or holdout')
    if digest(args.source) != registration['registered_runner_sha256']:
        raise ValueError('Original runner mismatch')
    for name, expected in registration['files'].items():
        if digest(ROOT / name) != expected:
            raise ValueError('Committed study file mismatch: ' + name)
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=False)
    shutil.copytree(HERE / 'sxi1' / 'bank', output / 'bank')
    overlay = output / 'sxi1-overlay.mjs'
    if build(args.source.resolve(), overlay) != registration['generated_overlay_sha256']:
        raise ValueError('Generated overlay does not match registration')
    write_json(output / 'launch.json', {'study': registration['study'], 'precommit': args.precommit,
        'registration_sha256': digest(args.registration), 'generated_overlay_sha256': digest(overlay),
        'registered_runner_sha256': digest(args.source), 'worlds': registration['worlds'],
        'local_launch_time_utc': datetime.now(timezone.utc).isoformat(),
        'environment': {'python': platform.python_version(), 'zstandard': zstandard.__version__,
                        'node': subprocess.check_output(['node', '--version'], text=True).strip()},
        'note': 'The referenced precommit must be checked on GitHub separately.'})

    jobs = [(world, arm, mode) for world in registration['worlds'] for arm in ARMS
            for mode in ('none', 'injured')]
    jobs += [(world, 'source_a', 'positive') for world in registration['worlds']]
    errors = []
    with ThreadPoolExecutor(max_workers=4) as executor:
        pending = {executor.submit(run_one, output, overlay, args.runtime.resolve(), *job): job for job in jobs}
        completed = 0
        for future in as_completed(pending):
            job = pending[future]
            try:
                future.result()
                outcome = 'verified'
            except Exception as error:
                errors.append({'world': job[0], 'arm': job[1], 'challenge': job[2], 'error': str(error)})
                outcome = 'FAILED'
            completed += 1
            with PRINT_LOCK:
                print(f'{completed}/{len(jobs)} W{job[0]} {job[1]} {job[2]} {outcome}', flush=True)
    write_json(output / 'execution.json', {'planned': len(jobs), 'completed': len(jobs) - len(errors), 'errors': errors,
        'local_completion_time_utc': datetime.now(timezone.utc).isoformat()})
    result = analyse(output, registration)
    write_json(output / 'analysis.json', result)
    print(json.dumps({'status': result['status'], 'valid_worlds': result['valid_worlds'],
                      'execution_errors': len(errors)}, indent=2), flush=True)


if __name__ == '__main__':
    main()
