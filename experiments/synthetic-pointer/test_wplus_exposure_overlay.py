#!/usr/bin/env python3
"""Exercise the exposure overlay's source, runtime and schedule guards."""
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

from build_wplus_exposure_overlay import build
from make_wplus_control_schedules import build as make_schedules


def main():
    if len(sys.argv) != 3:
        raise SystemExit('usage: python test_wplus_exposure_overlay.py REGISTERED_RUNNER RUNTIME_MIRROR')
    source, runtime = map(Path, sys.argv[1:])
    with tempfile.TemporaryDirectory(prefix='sxi-exposure-test-') as temp:
        root = Path(temp)
        overlay = root / 'overlay.mjs'
        build(source, overlay)
        try:
            build(source, overlay)
            raise AssertionError('Existing output was overwritten')
        except FileExistsError:
            pass
        plan = root / 'plan.json'
        plan.write_text(json.dumps(make_schedules()['sham']))

        def run(runtime_path, trace='1'):
            return subprocess.run(['node', '--experimental-strip-types', '--no-warnings', str(overlay),
                f'm={runtime_path}', 'world=1', 'seasons=1', 'lineages=1', f'out={root / "out"}',
                f'sxiTrace={trace}', f'sxiSchedule={plan}'], capture_output=True, text=True)

        bad_runtime = root / 'bad-runtime'
        shutil.copytree(runtime, bad_runtime)
        with (bad_runtime / 'types' / 'amelia.ts').open('a') as stream:
            stream.write('\n// deliberately changed in a test copy\n')
        result = run(bad_runtime)
        assert result.returncode and 'Incorrect INGRESS-1 runtime' in result.stderr
        assert not (root / 'out').exists()
        result = run(runtime, trace='0')
        assert result.returncode and 'full trace are required' in result.stderr
        malformed = make_schedules()['patterned']
        malformed['windows'][1]['start'] = malformed['windows'][0]['end']
        plan.write_text(json.dumps(malformed))
        result = run(runtime)
        assert result.returncode and 'Invalid or overlapping pointer window' in result.stderr
        assert not (root / 'out').exists()
    print('PASS: create-only builder, exact runtime, mandatory trace and non-overlapping schedule guards')


if __name__ == '__main__':
    main()
