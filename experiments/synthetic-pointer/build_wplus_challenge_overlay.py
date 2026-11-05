#!/usr/bin/env python3
"""Add a fixed, auditable W+ perturbation and planted positive control.

The positive controller is a deliberately engineered reference. It retains the
pre-injury S vector and restores it after injury; it is not a discovered agency.
"""
import argparse
import hashlib
from pathlib import Path
import tempfile

from build_wplus_exposure_overlay import build as build_exposure
from build_wplus_overlay import replace_once

CONFIG = r'''
const SXI_CHALLENGE = A.sxiChallenge;
if (!['none','injured','positive'].includes(SXI_CHALLENGE)) throw new Error('Explicit challenge arm required');
if (A.seasons !== '1' || A.lineages !== '1' || A.mode !== 'plus' || A.inf !== 'I' || A.refrain !== 'evo' ||
    A.erase || A.erasecode || A.outb || A.alt || A.nudge) throw new Error('Challenge fixture parameters must be explicit and fixed');
const SXI_INJURY_AT = 12000, SXI_READ_AT = 12100, SXI_DAMAGE = 0.1, SXI_REPAIR_GAIN = 0.55;
'''

CHALLENGE = r'''
  let sxiChallengeReference = null;
  const sxiPrepareChallenge = tick => {
    if (tick === SXI_INJURY_AT) {
      sxiChallengeReference = { ...S };
      const delta = Object.fromEntries(EDGES.map(e => [e, SXI_CHALLENGE === 'none' ? 0 : SXI_DAMAGE]));
      if (SXI_CHALLENGE !== 'none') for (const e of EDGES) S[e] += SXI_DAMAGE;
      return { kind: 'INJURY', mode: SXI_CHALLENGE, reference: sxiChallengeReference, delta };
    }
    if (SXI_CHALLENGE === 'positive' && tick > SXI_INJURY_AT && tick <= SXI_READ_AT) {
      const before = { ...S }, delta = {};
      for (const e of EDGES) { delta[e] = SXI_REPAIR_GAIN * (sxiChallengeReference[e] - S[e]); S[e] += delta[e]; }
      return { kind: 'PLANTED_REPAIR', mode: SXI_CHALLENGE, before, delta };
    }
    return null;
  };
'''


def build(source: Path, destination: Path) -> str:
    with tempfile.TemporaryDirectory(prefix='sxi-challenge-build-') as temp:
        exposure = Path(temp) / 'exposure.mjs'
        build_exposure(source, exposure)
        text = exposure.read_text()
    text = replace_once(text, 'let previousEnd = 0;', CONFIG + '\nlet previousEnd = 0;')
    text = replace_once(text, '  let sxiSelectedEdge = null;', CHALLENGE + '\n  let sxiSelectedEdge = null;')
    text = replace_once(text, 'MATCHED_EXPOSURE_ENGINEERING_ONLY', 'SYNTHETIC_SOURCE_CHALLENGE')
    text = replace_once(text,
        "selector: 'LABEL_MODULO_OPEN_GATE_COUNT_IN_RUNTIME_ORDER' },",
        "selector: 'LABEL_MODULO_OPEN_GATE_COUNT_IN_RUNTIME_ORDER' },\n"
        "      challenge: { mode: SXI_CHALLENGE, at: SXI_INJURY_AT, readAt: SXI_READ_AT, "
        "component: 'S', additionPerEdge: SXI_DAMAGE, plantedGain: SXI_REPAIR_GAIN },")
    text = replace_once(text,
        'const from = z.at(-1); const sc0 = selfCue; sxiPreparePointer(from);',
        'const from = z.at(-1); const sc0 = selfCue; const sxiChallengeEvent = sxiPrepareChallenge(tick); sxiPreparePointer(from);')
    text = replace_once(text, 'SXI_BOUNDARIES.has(tick)',
                        'SXI_BOUNDARIES.has(tick) || tick === SXI_INJURY_AT || tick === SXI_READ_AT')
    text = replace_once(text,
        "governorAudit: sxiSnapshot.governor, options, chosenBy: options.length ? 'GATE' : 'DWELL',",
        "governorAudit: sxiSnapshot.governor, options, challenge: sxiChallengeEvent, "
        "chosenBy: options.length ? 'GATE' : 'DWELL',")
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
