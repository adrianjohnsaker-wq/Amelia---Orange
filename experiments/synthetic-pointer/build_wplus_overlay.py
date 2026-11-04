#!/usr/bin/env python3
"""Build an isolated synthetic-pointer overlay around the supplied INGRESS-1 runner.

The original source must have its registered SHA-256. The generated file is an
experimental derivative: it is not the registered runner and does not prove that
the selected Studio runtime is the historical vt/m runtime.
"""
from __future__ import annotations

import argparse
import hashlib
from pathlib import Path

EXPECTED_SOURCE_SHA256 = "b6036fd6d15a5cb070b86f258e673ba0b5b3e13c99bc710995697656d25e82ed"

SETUP = r'''
// SXI W+ overlay v1: bounded house-to-selector coupling, synthetic input only.
const SXI_EDGES = new Set((A.sxiEdges || '').split(',').filter(Boolean));
const SXI_FACTOR = Number(A.sxiFactor ?? 1);
const SXI_START = Number(A.sxiStart ?? 0), SXI_END = Number(A.sxiEnd ?? 0);
if (A.stream || A.yoke) throw new Error('SXI reference overlay permits synthetic input only');
if (!Number.isFinite(SXI_FACTOR) || SXI_FACTOR < 0 || SXI_FACTOR > 1) throw new Error('Invalid SXI coupling factor');
if ([...SXI_EDGES].some(e => !EDGES.includes(e))) throw new Error('SXI edge is not in the runner topology');
if (SXI_EDGES.size && (!Number.isInteger(SXI_START) || !Number.isInteger(SXI_END) ||
    SXI_START < 1 || SXI_END < SXI_START || SXI_END > T)) throw new Error('Invalid SXI pointer window');
'''

BONUS = r'''
  if (!('exitBonus' in r)) throw new Error('SXI requires the Studio exitBonus hook; no fallback runtime is allowed');
  let sxiTick = 0;
  const sxiActive = () => SXI_EDGES.size > 0 && sxiTick >= SXI_START && sxiTick <= SXI_END;
  r.exitBonus = (x, y) => {
    const e = key(x, y);
    const house = wH * Math.tanh(S[e] + D[e] + E[e]);
    const adjusted = sxiActive() && SXI_EDGES.has(e) ? house * SXI_FACTOR : house;
    return wV * V[e] + adjusted + (y === selfCue ? 0.35 : 0);
  };
'''

INIT = r'''
  // Each trace is create-only. A missing footer represents an incomplete run.
  let sxiFd = null, sxiSeq = 0, sxiHead = null, sxiPfmHead = '0'.repeat(64);
  const sxiHash = x => createHash('sha256').update(typeof x === 'string' ? x : JSON.stringify(x)).digest('hex');
  const sxiWrite = event => {
    const body = { sequence: ++sxiSeq, previousHash: sxiHead, ...event };
    const record = { ...body, recordHash: sxiHash(body) };
    fs.writeFileSync(sxiFd, JSON.stringify(record) + '\n');
    sxiHead = record.recordHash;
  };
  if (A.sxiTrace === '1') {
    const trace = A.out + '/sxi_' + NSW + '_L' + k + '_S' + opt.season + '.jsonl';
    sxiFd = fs.openSync(trace, 'wx');
    const modules = [
      'substrate/ameliaNumogramSubstrateRuntime.ts', 'substrate/IntegratedMemorySystem.ts',
      'substrate/TraitEvolution.ts', 'ai/numogram/AmeliaQabbalaInterface.ts',
      'governance/CognitiveGovernor.ts', 'lib/sha256.ts', 'types/amelia.ts'
    ];
    const runtimeHashes = Object.fromEntries(modules.map(p => [p, sxiHash(fs.readFileSync(A.m + '/' + p).toString('utf8'))]));
    sxiWrite({ kind: 'START', status: 'REFERENCE_ENGINEERING_ONLY', world: NSW, lineage: k,
      season: opt.season, sourceRunnerSha256: 'b6036fd6d15a5cb070b86f258e673ba0b5b3e13c99bc710995697656d25e82ed',
      overlaySha256: sxiHash(fs.readFileSync(process.argv[1]).toString('utf8')),
      runtimeIdentity: 'ARCHIVED_STUDIO_MIRROR_NOT_VERIFIED_AS_INGRESS1_VT_M',
      runtimeHashes, topologyEdgeCount: EDGES.length, expectedTicks: T,
      pointerGovernance: 'SCHEDULED_EXTERNAL_INTERVENTION_NOT_GOVERNOR_GATED', governorRecord: 'AUDIT_ONLY',
      settings: { mode: MODE, infirmation: INF, refrain: RF, horizon: HR, seasonEraseAt: Number(A.erasesat || 10),
        input: 'synthetic-world-lineage-tick', externalStream: false },
      pointer: { edges: [...SXI_EDGES], factor: SXI_FACTOR, start: SXI_START, end: SXI_END },
      nativePfmHeadAvailable: false });
  }
'''

STEP = r'''
    sxiTick = tick;
    const from = z.at(-1); const sc0 = selfCue;
    const sxiPreMemory = sxiFd !== null ? r.getMemory().readMemoryBias() : null;
    const sxiSnapshot = r.step(input); const to = sxiSnapshot.lastTransition.to; z.push(to);
    if (sxiFd !== null) {
      const applied = sxiActive();
      const options = q.getGates().filter(g => g.isOpen && g.source === from).map(g => {
        const target = sxiSnapshot.zones[g.target];
        const parts = {
          gate: g.flux * (1 - g.resistance),
          memory: (sxiPreMemory.biasVector[g.target] || 0) * 0.4,
          activation: target.activation * 0.2,
          phase: Math.cos(target.phaseAngle) * 0.1,
          input: cueOf(input) === g.target ? 0.35 : 0,
          organHouse: r.exitBonus(from, g.target),
        };
        return { id: g.id, source: g.source, target: g.target,
          pointerEdge: SXI_EDGES.has(key(from, g.target)), parts,
          score: parts.gate + parts.memory + parts.activation + parts.phase + parts.input + parts.organHouse };
      });
      let chosen = from, best = -Infinity;
      for (const option of options) if (option.score > best) { best = option.score; chosen = option.target; }
      if (chosen !== to) throw new Error('SXI score reconstruction disagrees with actual passage');
      const pfm = r.getMemory().getEvents().at(-1);
      if (!pfm || pfm.blockIndex !== tick) throw new Error('Missing per-step PFM event');
      sxiPfmHead = sxiHash(sxiPfmHead + '|' + pfm.eventDigest);
      const sample = tick === 1 || tick === T || tick % 240 === 0 ||
        tick === SXI_START || tick === SXI_END || tick === SXI_END + 1
        ? { organ: W.R, V, S, D, E, organRng: rng, refrainClock: W.omega ?? null, tau: W.tau }
        : null;
      sxiWrite({ kind: 'STEP', tick, from, to, inputDigest: sxiHash(input.trim()), inputZone: cueOf(input),
        selfCue: sc0, pointerActive: applied, studioExitOpen: !!exitGate()?.isOpen,
        governorAudit: sxiSnapshot.governor, options, chosenBy: options.length ? 'GATE' : 'DWELL',
        transitionDigest: sxiSnapshot.lastTransition.digest, pfmEvent: pfm,
        supplementalPfmChain: sxiPfmHead, organDigest: sxiHash(W.R),
        houseDigest: sxiHash({ V, S, D, E }), stateSample: sample });
    }
'''

FINISH = r'''
  if (sxiFd !== null) {
    sxiWrite({ kind: 'FINISH', ticks: tEnd, supplementalPfmChain: sxiPfmHead,
      seasonEndState: { V: { ...V }, S: { ...S }, D: { ...D }, E: { ...E }, W },
      runtimeState: r.exportState(),
      note: 'Season-end native state is recorded for audit; this trace is not a verified mid-season restart snapshot.' });
    fs.fsyncSync(sxiFd);
    fs.closeSync(sxiFd);
  }
'''


def replace_once(text: str, needle: str, replacement: str) -> str:
    count = text.count(needle)
    if count != 1:
        raise ValueError(f"Expected one exact source anchor, found {count}: {needle[:70]}")
    return text.replace(needle, replacement, 1)


def build(source: Path, destination: Path) -> str:
    data = source.read_bytes()
    actual = hashlib.sha256(data).hexdigest()
    if actual != EXPECTED_SOURCE_SHA256:
        raise ValueError(f"Runner SHA-256 mismatch: {actual}")
    text = data.decode("utf-8")
    text = replace_once(text, "const EDGES = [...BASE, ...GATES, EXIT];",
                        "const EDGES = [...BASE, ...GATES, EXIT];\n" + SETUP)
    text = replace_once(text,
        "const b0 = new AmeliaNumogramSubstrateRuntime().getQabbala().getGates(); const mean = f => b0.reduce((x, g) => x + g[f], 0) / b0.length;",
        "const b0 = new AmeliaNumogramSubstrateRuntime().getQabbala().getGates(); const mean = f => b0.reduce((x, g) => x + g[f], 0) / b0.length;\n"
        "if (b0.length !== BASE.length || b0.some(g => !BASE.includes(key(g.source, g.target)))) throw new Error('SXI runtime base topology mismatch');")
    text = replace_once(text,
        "  r.exitBonus = (x, y) => wV * V[key(x, y)] + wH * Math.tanh(S[key(x, y)] + D[key(x, y)] + E[key(x, y)]) + (y === selfCue ? 0.35 : 0);",
        BONUS.rstrip())
    text = replace_once(text, "  for (let tick = 1; tick <= tEnd; tick++) {",
                        INIT + "\n  for (let tick = 1; tick <= tEnd; tick++) {")
    text = replace_once(text,
        "    const from = z.at(-1); const sc0 = selfCue; const to = r.step(input).lastTransition.to; z.push(to);",
        STEP.rstrip())
    text = replace_once(text,
        "  W.rng = rng; W.lastSeen = Object.fromEntries(lastSeen); W.sinceNew = sinceNew; W.clock = t0 + T;",
        "  W.rng = rng; W.lastSeen = Object.fromEntries(lastSeen); W.sinceNew = sinceNew; W.clock = t0 + T;\n" + FINISH)
    out = text.encode("utf-8")
    with destination.open("xb") as stream:
        stream.write(out)
    return hashlib.sha256(out).hexdigest()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    print(build(args.source, args.output))
