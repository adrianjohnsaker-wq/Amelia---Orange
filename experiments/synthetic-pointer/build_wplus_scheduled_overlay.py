#!/usr/bin/env python3
"""Build the matched-schedule W+ instrumentation from the registered runner.

This is an exploratory engineering derivative. It verifies the runtime bytes
on every invocation, accepts only synthetic input, and requires a full trace.
The original runner and the earlier SXI-0 overlay are left unchanged.
"""
import argparse
import hashlib
from pathlib import Path
import tempfile

from build_wplus_overlay import build as build_reference, replace_once

CONFIG = r'''
if (!A.sxiSchedule || A.sxiTrace !== '1') throw new Error('A schedule and full trace are required');
if (A.sxiEdges || A.sxiFactor || A.sxiStart || A.sxiEnd) throw new Error('Do not mix scheduled and static pointer arguments');
const SXI_RAW = fs.readFileSync(A.sxiSchedule, 'utf8');
const SXI_PLAN = JSON.parse(SXI_RAW);
if (SXI_PLAN.version !== 1 || !['sham','patterned','shuffled','unpatterned'].includes(SXI_PLAN.arm) ||
    SXI_PLAN.factor !== 0.5 || !Array.isArray(SXI_PLAN.windows)) throw new Error('Invalid schedule identity');
let previousEnd = 0;
for (const w of SXI_PLAN.windows) {
  if (!Number.isInteger(w.start) || !Number.isInteger(w.end) || w.start <= previousEnd ||
      w.start < 1 || w.end < w.start || w.end > T || !EDGES.includes(w.edge)) throw new Error('Invalid or overlapping pointer window');
  previousEnd = w.end;
}
if ((SXI_PLAN.arm === 'sham') !== (SXI_PLAN.windows.length === 0)) throw new Error('Unexpected sham schedule');
const SXI_EDGES = new Set(SXI_PLAN.windows.map(w => w.edge));
const SXI_FACTOR = SXI_PLAN.factor;
const SXI_START = SXI_PLAN.windows[0]?.start ?? 0, SXI_END = SXI_PLAN.windows.at(-1)?.end ?? 0;
const SXI_BOUNDARIES = new Set(SXI_PLAN.windows.flatMap(w => [w.start,w.end,w.end+1]));
const SXI_RUNTIME_EXPECTED = {
  'ai/numogram/AmeliaQabbalaInterface.ts':'03a8bb827d31eaf730d2becea49306a863ede783de1f07fb9a8c50926621c275',
  'governance/CognitiveGovernor.ts':'50d2806b089e1f1d367b4e8d6404537bd2cf3733b58f21fa66595f731a4be782',
  'lib/sha256.ts':'2f71b68b88525347ba3f53d270d3c07cc36c5610802e08636812bc85c53c3b5f',
  'package.json':'1239d4d885dcad42201a27ed9324f8f0f760b78700d8db9ced39a511cffe7eae',
  'substrate/IntegratedMemorySystem.ts':'b75db5ef8723bed0dd15003dee11d39a3b575ec4a2cb40edb22749ea2a485bab',
  'substrate/TraitEvolution.ts':'8f83108cacd2fe19c5862aabf2d9d355d6755d72b4e2d7e9d130dd391e289d31',
  'substrate/ameliaNumogramSubstrateRuntime.ts':'c357f380e645224ed2fc0a1521ae971691a67b2f34768dabe2946dbfbeb8e21f',
  'types/amelia.ts':'91df2ad3749dc55be8e0617d417034345b56d817ac2f8be0125d1946e4fe804a'
};
for (const [name,sha] of Object.entries(SXI_RUNTIME_EXPECTED)) {
  const actual = createHash('sha256').update(fs.readFileSync(A.m + '/' + name)).digest('hex');
  if (actual !== sha) throw new Error('Incorrect INGRESS-1 runtime: ' + name);
}
'''

MASK = r'''
  let sxiWindowIndex = 0;
  const sxiEmpty = new Set();
  const sxiMasks = SXI_PLAN.windows.map(w => new Set([w.edge]));
  const sxiMask = () => {
    while (sxiWindowIndex < SXI_PLAN.windows.length && sxiTick > SXI_PLAN.windows[sxiWindowIndex].end) sxiWindowIndex++;
    const w = SXI_PLAN.windows[sxiWindowIndex];
    return w && sxiTick >= w.start && sxiTick <= w.end ? sxiMasks[sxiWindowIndex] : sxiEmpty;
  };
  const sxiActive = () => sxiMask().size > 0;
'''


def build(source: Path, destination: Path) -> str:
    with tempfile.TemporaryDirectory(prefix='sxi-scheduled-build-') as temp:
        reference = Path(temp) / 'reference.mjs'
        build_reference(source, reference)
        text = reference.read_text()
    text = replace_once(text,
        "const SXI_EDGES = new Set((A.sxiEdges || '').split(',').filter(Boolean));\n"
        "const SXI_FACTOR = Number(A.sxiFactor ?? 1);\n"
        "const SXI_START = Number(A.sxiStart ?? 0), SXI_END = Number(A.sxiEnd ?? 0);",
        CONFIG.rstrip())
    text = replace_once(text,
        '  const sxiActive = () => SXI_EDGES.size > 0 && sxiTick >= SXI_START && sxiTick <= SXI_END;',
        MASK.rstrip())
    text = replace_once(text,
        'const adjusted = sxiActive() && SXI_EDGES.has(e) ? house * SXI_FACTOR : house;',
        'const adjusted = sxiMask().has(e) ? house * SXI_FACTOR : house;')
    text = replace_once(text, 'ARCHIVED_STUDIO_MIRROR_NOT_VERIFIED_AS_INGRESS1_VT_M',
                        'INGRESS1_VT_M_HASHES_CHECKED_ON_START')
    text = replace_once(text, "kind: 'START', status: 'REFERENCE_ENGINEERING_ONLY'",
                        "kind: 'START', status: 'MATCHED_SCHEDULE_ENGINEERING_ONLY'")
    text = replace_once(text,
        'pointer: { edges: [...SXI_EDGES], factor: SXI_FACTOR, start: SXI_START, end: SXI_END },',
        "pointer: { edges: [...SXI_EDGES], factor: SXI_FACTOR, start: SXI_START, end: SXI_END, "
        "schedule: SXI_PLAN, scheduleSha256: sxiHash(SXI_RAW) },")
    text = replace_once(text,
        'pointerEdge: SXI_EDGES.has(key(from, g.target)), parts,',
        "pointerEdge: sxiMask().has(key(from, g.target)),\n"
        "          unscaledHouse: wH * Math.tanh(S[key(from,g.target)] + D[key(from,g.target)] + E[key(from,g.target)]),\n"
        "          pointerDelta: sxiMask().has(key(from,g.target)) ? (SXI_FACTOR - 1) * wH * Math.tanh(S[key(from,g.target)] + D[key(from,g.target)] + E[key(from,g.target)]) : 0, parts,")
    text = replace_once(text,
        'tick === SXI_START || tick === SXI_END || tick === SXI_END + 1',
        'SXI_BOUNDARIES.has(tick)')
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
