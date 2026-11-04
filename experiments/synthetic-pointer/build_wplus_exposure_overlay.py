#!/usr/bin/env python3
"""Build a W+ engineering overlay with matched realised score perturbation.

An active schedule selects one currently available outgoing gate, then applies
the same fixed score adjustment on each active tick. This is an intentionally
imposed experimental selector, not a discovered pattern or evidence of agency.
"""
import argparse
import hashlib
from pathlib import Path
import tempfile

from build_wplus_overlay import replace_once
from build_wplus_scheduled_overlay import build as build_scheduled

SELECTOR = r'''
  const sxiActive = () => sxiMask().size > 0;
  const sxiScoreDelta = -0.1 * (1 - SXI_FACTOR);
  let sxiSelectedEdge = null;
  const sxiPreparePointer = from => {
    sxiSelectedEdge = null;
    const labels = [...sxiMask()];
    if (!labels.length) return;
    const candidates = q.getGates().filter(g => g.isOpen && g.source === from);
    if (!candidates.length) throw new Error('Active pointer has no available outgoing gate');
    const [source, target] = labels[0].split('>').map(Number);
    const selected = candidates[(10 * source + target) % candidates.length];
    sxiSelectedEdge = key(selected.source, selected.target);
  };
'''


def build(source: Path, destination: Path) -> str:
    with tempfile.TemporaryDirectory(prefix='sxi-exposure-build-') as temp:
        scheduled = Path(temp) / 'scheduled.mjs'
        build_scheduled(source, scheduled)
        text = scheduled.read_text()
    text = replace_once(text, '  const sxiActive = () => sxiMask().size > 0;', SELECTOR.rstrip())
    text = replace_once(text, 'const adjusted = sxiMask().has(e) ? house * SXI_FACTOR : house;',
                        'const adjusted = house + (sxiSelectedEdge === e ? sxiScoreDelta : 0);')
    text = replace_once(text, 'MATCHED_SCHEDULE_ENGINEERING_ONLY', 'MATCHED_EXPOSURE_ENGINEERING_ONLY')
    text = replace_once(text,
        'schedule: SXI_PLAN, scheduleSha256: sxiHash(SXI_RAW) },',
        "schedule: SXI_PLAN, scheduleSha256: sxiHash(SXI_RAW), scoreDelta: sxiScoreDelta, "
        "selector: 'LABEL_MODULO_OPEN_GATE_COUNT_IN_RUNTIME_ORDER' },")
    text = replace_once(text, 'const from = z.at(-1); const sc0 = selfCue;',
                        'const from = z.at(-1); const sc0 = selfCue; sxiPreparePointer(from);')
    text = replace_once(text, 'pointerEdge: sxiMask().has(key(from, g.target)),',
                        'pointerEdge: sxiSelectedEdge === key(from, g.target),')
    text = replace_once(text,
        'pointerDelta: sxiMask().has(key(from,g.target)) ? (SXI_FACTOR - 1) * wH * Math.tanh(S[key(from,g.target)] + D[key(from,g.target)] + E[key(from,g.target)]) : 0, parts,',
        'pointerDelta: sxiSelectedEdge === key(from,g.target) ? sxiScoreDelta : 0, parts,')
    data = text.encode()
    with destination.open('xb') as stream:
        stream.write(data)
    return hashlib.sha256(data).hexdigest()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    print(build(args.source, args.output))
