#!/usr/bin/env node
// Extract predeclared passage windows and the same-state feedback counterfactual.
import fs from 'node:fs';
import readline from 'node:readline';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export function motifs(zones) {
  const out = {};
  for (let i = 2; i < zones.length; i++) {
    const key = `${zones[i-2]}${zones[i-1]}${zones[i]}`;
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}
export function counterfactualWinner(options, symbol) {
  if (!options.length) throw new Error('No gate alternatives');
  const selected = symbol % options.length;
  let best = -Infinity, winner;
  options.forEach((option, i) => {
    const score = option.score - option.pointerDelta - (i === selected ? 0.05 : 0);
    if (score > best) { best = score; winner = option.target; }
  });
  return winner;
}

async function main() {
  const [trace, modulePath, output, donorPath] = process.argv.slice(2);
  if (!output) throw new Error('usage: node sxi2_extract.mjs TRACE MODULE OUTPUT [DONOR]');
  const { advanceBank } = await import(pathToFileURL(modulePath).href);
  const donor = donorPath ? JSON.parse(fs.readFileSync(donorPath, 'utf8')) : null;
  if (donor && donor.sensors.length !== 4800) throw new Error('Incorrect donor length');
  const zones = { baseline: [], exposure: [], post: [] }, transitions = [];
  const counterfactual = { ticks: 0, stateChanged: 0, symbolChanged: 0,
    gateChanged: 0, eligibleChoices: 0, winnerChanged: 0 };
  const prefix = createHash('sha256');
  let header, footer, steps = 0, tick700 = null;
  for await (const line of readline.createInterface({ input: fs.createReadStream(trace), crlfDelay: Infinity })) {
    const r = JSON.parse(line);
    if (r.kind === 'START') { header = r; continue; }
    if (r.kind === 'FINISH') { footer = r; continue; }
    if (r.kind !== 'STEP' || r.tick !== ++steps) throw new Error('Unexpected step sequence');
    if (r.tick <= 500) prefix.update(JSON.stringify([r.tick,r.from,r.to,r.inputDigest,r.organDigest,r.houseDigest])+'\n');
    if (r.tick <= 500) zones.baseline.push(r.to);
    if (r.tick >= 4801 && r.tick <= 5300) zones.exposure.push(r.to);
    if (r.tick >= 8001 && r.tick <= 8500) zones.post.push(r.to);
    if (r.tick >= 700 && r.tick <= 1000) transitions.push(r.to);
    if (r.tick === 700) tick700 = { organDigest: r.organDigest, houseDigest: r.houseDigest,
      actualFeedback: r.liveLoop.actualFeedback, bankBefore: r.liveLoop.bankBefore,
      address: r.liveLoop.address, selectedEdge: r.liveLoop.selectedEdge,
      emittedSymbol: r.liveLoop.emittedSymbol, mutation: r.liveLoop.mutation };
    if (donor && r.tick >= 501 && r.tick <= 5300) {
      if (!r.liveLoop.active || JSON.stringify(r.liveLoop.actualFeedback)!==JSON.stringify(r.liveLoop.deliveredFeedback))
        throw new Error('Counterfactual applies only to genuine live-feedback traces');
      const alternative = advanceBank(r.liveLoop.bankBefore, r.liveLoop.address, donor.sensors[r.tick-501]);
      const c = counterfactual; c.ticks++;
      if (JSON.stringify(alternative.bank)!==JSON.stringify(r.liveLoop.bankAfter)) c.stateChanged++;
      if (alternative.symbol!==r.liveLoop.emittedSymbol) c.symbolChanged++;
      if (alternative.symbol % r.options.length !== r.liveLoop.emittedSymbol % r.options.length) c.gateChanged++;
      if (counterfactualWinner(r.options, r.liveLoop.emittedSymbol)!==r.to) throw new Error('Observed score reconstruction mismatch');
      if (r.options.length > 1) {
        c.eligibleChoices++;
        if (counterfactualWinner(r.options, alternative.symbol)!==r.to) c.winnerChanged++;
      }
    }
  }
  if (!header || !footer || steps !== 20160 || Object.values(zones).some(x=>x.length!==500)) throw new Error('Incomplete trace');
  if (donor && counterfactual.ticks !== 4800) throw new Error('Incomplete counterfactual');
  const result = { world: header.world, mode: header.source.mode, pointerMode: header.pointer.mode,
    mutationMode: header.pointer.mutation, donorWorld: header.source.donor?.world ?? null,
    traceHead: footer.recordHash, prefix500Digest: prefix.digest('hex'), tick700, transitions700to1000: transitions,
    windowTicks: { baseline:[1,500], exposure:[4801,5300], post:[8001,8500] },
    triplets: Object.fromEntries(Object.entries(zones).map(([k,v])=>[k,motifs(v)])),
    counterfactual: donor ? counterfactual : null };
  fs.writeFileSync(output, JSON.stringify(result,null,2)+'\n', {flag:'wx'});
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
