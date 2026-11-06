// NR-1 harness (REGISTRATION.md). Input numbers go to Amelia directly, one datum per step: datum c is submitted as a
// one-hot observation on zone c, so the attended bonus is BETA * rel(y, c) on each open exit y (the receiver arm) and the
// Warp line of flight goes to c. Her zone path is the output. No body.
//   node --import tsx run.ts <stream.json> <label> <L> <M> <out.json>     (all graph x receiver arms, units 0..M-1)
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { withFullNumogram } from '../../../src/core/fullNumogram';
import { NRRuntime, INGRESS, IDENTITY } from './nrRuntime';
import { graphFor, type GraphArm } from './graphs';
export function walk(zones: number[], graph: GraphArm, receiver: 'IDENTITY' | 'INGRESS', unit: number) {
  const rt = new NRRuntime(); withFullNumogram(rt); rt.setSuppressRelaySteering(true);
  const { gates, perm } = graphFor(graph, unit); rt.getQabbala().setGates(gates);
  rt.rel = receiver === 'IDENTITY' ? IDENTITY : INGRESS;
  const path = [rt.getCurrentZone() as number];
  for (let t = 0; t < zones.length; t++) {
    const v = Array(10).fill(0); v[perm ? perm[zones[t]] : zones[t]] = 1;   // RELABEL arms present datum c as zone perm[c]
    rt.queueSynthetic({ eventId: `nr1:${unit}:${t}`, channel: 'SYNTHETIC_FIELD', sourceDigest: createHash('sha256').update(`nr1|${unit}|${t}|${zones[t]}`).digest('hex'), attentionVector: v } as any);
    rt.step(); path.push(rt.getCurrentZone() as number);
  }
  return { path, perm, flights: rt.flights, gatesEnd: rt.getQabbala().getGates().length };
}
const [STREAM, LABEL, L, M, OUT] = process.argv.slice(2);
if (OUT && /nr1\/run\.ts$/.test(process.argv[1] ?? "")) {   // entry point only when run directly, not when imported
  const all = JSON.parse(readFileSync(STREAM, 'utf8')).zones as number[], len = Number(L), units = Number(M);
  const runs = [];
  for (let u = 0; u < units; u++) {
    const input = all.slice(u * len, (u + 1) * len); if (input.length < len) throw new Error('stream too short');
    for (const graph of ['CANONICAL', 'RELABEL', 'RELABEL_B', 'REWIRED'] as GraphArm[]) for (const receiver of ['IDENTITY', 'INGRESS'] as const)
      runs.push({ unit: u, graph, receiver, input, ...walk(input, graph, receiver, u) });
  }
  writeFileSync(OUT, JSON.stringify({ label: LABEL, L: len, M: units, runs }));
}
