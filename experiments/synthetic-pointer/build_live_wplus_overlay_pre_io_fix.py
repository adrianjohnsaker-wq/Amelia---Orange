#!/usr/bin/env python3
"""Build a live, endogenous-pointer W+ overlay from the registered runner.

The body's evolving W.R selects the address each tick. During exposure the
addressed, engineered synthetic source receives Amelia's current state and
modulates one available Numogram gate score. The original runtime is unchanged.
"""
import argparse
import hashlib
from pathlib import Path
import tempfile

from build_wplus_overlay import build as build_reference, replace_once

CONFIG = r'''
const SXI_EDGES = new Set(), SXI_FACTOR = 0.5, SXI_START = 501, SXI_END = 5300;
const SXI_MODE = A.sxiMode, SXI_POINTER_MODE = A.sxiPointer, SXI_MUTATION = A.sxiMutation;
if (!['live','replay','shuffled','sham'].includes(SXI_MODE) ||
    !['dynamic','frozen'].includes(SXI_POINTER_MODE) ||
    !['none','targeted','orthogonal'].includes(SXI_MUTATION)) throw new Error('Explicit live-loop modes are required');
if (SXI_POINTER_MODE === 'frozen' && SXI_MUTATION !== 'targeted') throw new Error('Frozen control requires the same targeted mutation');
if (A.sxiTrace !== '1' || !A.sxiModule || A.sxiEdges || A.sxiFactor || A.sxiStart || A.sxiEnd ||
    A.seasons !== '1' || A.lineages !== '1' || A.mode !== 'plus' || A.inf !== 'I' || A.refrain !== 'evo' ||
    A.erase || A.erasecode || A.outb || A.alt || A.nudge) throw new Error('Live-loop fixture settings must be explicit and fixed');
const SXI_MODULE_EXPECTED = '__MODULE_HASH__';
const sxiFileHash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
if (sxiFileHash(A.sxiModule) !== SXI_MODULE_EXPECTED) throw new Error('Live source module hash mismatch');
const { pointerReading, mutateOrgan, feedbackFromBody, initialBank, advanceBank,
        counterfactualFeedback, shuffledIndices } = await import(A.sxiModule);
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
  if (sxiFileHash(A.m + '/' + name) !== sha) throw new Error('Incorrect INGRESS-1 runtime: ' + name);
}
const SXI_DONOR = ['replay','shuffled'].includes(SXI_MODE) ? (() => {
  if (!A.sxiDonor) throw new Error('Replay control requires a verified donor feedback file');
  const value = JSON.parse(fs.readFileSync(A.sxiDonor, 'utf8'));
  if (value.version !== 1 || !value.donor || value.donor.mode !== 'live' ||
      !Array.isArray(value.sensors) || value.sensors.length !== SXI_END - SXI_START + 1) throw new Error('Invalid donor feedback');
  for (const feedback of value.sensors) advanceBank(initialBank(), 'A', feedback);
  return value;
})() : null;
if (!SXI_DONOR && A.sxiDonor) throw new Error('Donor file is only valid for replay controls');
const SXI_DONOR_SHA = SXI_DONOR ? sxiFileHash(A.sxiDonor) : null;
const SXI_ORDER = SXI_MODE === 'shuffled' ? shuffledIndices(SXI_DONOR.sensors.length, 20261105) : null;
'''

LOOP = r'''
  const sxiActive = () => SXI_MODE !== 'sham' && sxiTick >= SXI_START && sxiTick <= SXI_END;
  let sxiBank = initialBank(), sxiPreviousAddress = null, sxiFrozenAddress = null;
  let sxiSelectedEdge = null, sxiLoopEvent = null;
  const sxiPrepare = (tick, from) => {
    const pre = pointerReading(W.R, sxiPreviousAddress);
    let mutation = null;
    if (tick === 700 && SXI_MUTATION !== 'none') {
      const preOrgan = JSON.parse(JSON.stringify(W.R));
      const changed = mutateOrgan(W.R, sxiPreviousAddress, SXI_MUTATION);
      W.R = changed.organ;
      mutation = { ...changed.event, preOrgan, preOrganDigest: sxiHash(preOrgan) };
      if (SXI_POINTER_MODE === 'frozen') sxiFrozenAddress = pre.address;
    }
    const derived = pointerReading(W.R, sxiPreviousAddress);
    const previousAddress = sxiPreviousAddress;
    sxiPreviousAddress = derived.address;
    const address = sxiFrozenAddress ?? derived.address;
    const active = sxiActive();
    const body = { zone: from, w0: W.R.w[0], w1: W.R.w[1], theta1: W.R.th[1], theta2: W.R.th[2],
      houseS: S['1>8'], houseD: D['1>8'], houseE: E['1>8'] };
    const actualFeedback = feedbackFromBody(from, W.R, body.houseS, body.houseD, body.houseE);
    let donorIndex = null, deliveredFeedback = null;
    if (active && SXI_MODE === 'live') deliveredFeedback = actualFeedback;
    if (active && SXI_DONOR) {
      const ordinal = tick - SXI_START;
      donorIndex = SXI_MODE === 'shuffled' ? SXI_ORDER[ordinal] : ordinal;
      deliveredFeedback = SXI_DONOR.sensors[donorIndex];
    }
    const bankBefore = sxiBank;
    const result = advanceBank(bankBefore, address, deliveredFeedback);
    const alternative = active ? advanceBank(bankBefore, address, counterfactualFeedback(deliveredFeedback)) : null;
    sxiBank = result.bank;
    sxiSelectedEdge = null;
    if (active) {
      const candidates = q.getGates().filter(g => g.isOpen && g.source === from);
      if (!candidates.length) throw new Error('No open gate for live pointer');
      const gate = candidates[result.symbol % candidates.length];
      sxiSelectedEdge = key(gate.source, gate.target);
    }
    sxiLoopEvent = { body, previousAddress, derived, address, frozenAddress: sxiFrozenAddress, mutation,
      active, actualFeedback, deliveredFeedback, donorIndex, bankBefore, bankAfter: sxiBank,
      emittedSymbol: result.symbol, counterfactualSymbol: alternative?.symbol ?? null,
      counterfactualBank: alternative?.bank ?? null, selectedEdge: sxiSelectedEdge };
  };
'''


def build(source: Path, module: Path, destination: Path) -> str:
    module_hash = hashlib.sha256(module.read_bytes()).hexdigest()
    with tempfile.TemporaryDirectory(prefix='sxi-live-build-') as temp:
        reference = Path(temp) / 'reference.mjs'
        build_reference(source, reference)
        text = reference.read_text()
    text = replace_once(text,
        "const SXI_EDGES = new Set((A.sxiEdges || '').split(',').filter(Boolean));\n"
        "const SXI_FACTOR = Number(A.sxiFactor ?? 1);\n"
        "const SXI_START = Number(A.sxiStart ?? 0), SXI_END = Number(A.sxiEnd ?? 0);",
        CONFIG.replace('__MODULE_HASH__', module_hash).rstrip())
    text = replace_once(text,
        '  const sxiActive = () => SXI_EDGES.size > 0 && sxiTick >= SXI_START && sxiTick <= SXI_END;',
        LOOP.rstrip())
    text = replace_once(text,
        'const adjusted = sxiActive() && SXI_EDGES.has(e) ? house * SXI_FACTOR : house;',
        'const adjusted = house + (sxiSelectedEdge === e ? -0.05 : 0);')
    text = replace_once(text, 'REFERENCE_ENGINEERING_ONLY', 'ENDOGENOUS_LIVE_LOOP_ENGINEERING')
    text = replace_once(text, 'ARCHIVED_STUDIO_MIRROR_NOT_VERIFIED_AS_INGRESS1_VT_M',
                        'INGRESS1_VT_M_HASHES_CHECKED_ON_START')
    text = replace_once(text,
        'pointer: { edges: [...SXI_EDGES], factor: SXI_FACTOR, start: SXI_START, end: SXI_END },',
        "pointer: { start: SXI_START, end: SXI_END, scoreDelta: -0.05, mode: SXI_POINTER_MODE, "
        "mutation: SXI_MUTATION, mutationAt: 700 },\n"
        "      source: { mode: SXI_MODE, moduleSha256: SXI_MODULE_EXPECTED, donorSha256: SXI_DONOR_SHA, "
        "donor: SXI_DONOR?.donor ?? null, shuffleSeed: SXI_MODE === 'shuffled' ? 20261105 : null, "
        "timing: 'PRE_STEP_BODY_STATE', withdrawal: 'NO_FEEDBACK_OR_SCORE_AFTER_WINDOW' },")
    text = replace_once(text, 'const from = z.at(-1); const sc0 = selfCue;',
                        'const from = z.at(-1); const sc0 = selfCue; sxiPrepare(tick, from);')
    text = replace_once(text, 'pointerEdge: SXI_EDGES.has(key(from, g.target)), parts,',
        "pointerEdge: sxiSelectedEdge === key(from,g.target),\n"
        "          unscaledHouse: wH * Math.tanh(S[key(from,g.target)] + D[key(from,g.target)] + E[key(from,g.target)]),\n"
        "          pointerDelta: sxiSelectedEdge === key(from,g.target) ? -0.05 : 0, parts,")
    text = replace_once(text,
        "governorAudit: sxiSnapshot.governor, options, chosenBy: options.length ? 'GATE' : 'DWELL',",
        "governorAudit: sxiSnapshot.governor, options, liveLoop: sxiLoopEvent, "
        "chosenBy: options.length ? 'GATE' : 'DWELL',")
    text = replace_once(text, 'tick === SXI_START || tick === SXI_END || tick === SXI_END + 1',
                        'tick === SXI_START || tick === SXI_END || tick === SXI_END + 1 || tick === 699 || tick === 700')
    data = text.encode()
    with destination.open('xb') as stream:
        stream.write(data)
    return hashlib.sha256(data).hexdigest()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', required=True, type=Path)
    parser.add_argument('--module', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    print(build(args.source, args.module, args.output))
