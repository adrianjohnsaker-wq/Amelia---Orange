/**
 * DESIRE-3 calibration read (NOT a test; input data only): how often her recorded Outside returns. Reads the 12 ND-1b
 * rows desire2-cNN-N of amelia_long1_runs (their offer steps and readings are the Outside's sequence as met on her tick;
 * identical in every arm), every call slot-paced by ../../desire2/amend1/slots.ts. For each copy:
 *   - offer gap: steps between successive offers;
 *   - edge return: steps between successive occurrences of the same Outside move (reading a -> reading b, a != b);
 *   - zone return: steps between successive readings of the same zone;
 *   - the share of edge returns that arrive while the trace's mark (0.125 x 2^(-gap/500)) is still >= 0.05, i.e. within
 *     about 661 steps: the returns DESIRE-3's renewal (TMIN 0.05) would bridge.
 * Writes returns/RETURNS.json.
 */
import { writeFileSync } from 'node:fs';
const URL_ = process.env.SUPABASE_URL, KEY = process.env.AMELIA_SUPABASE_SERVICE_KEY;
const q = (a: number[], p: number) => { if (!a.length) return NaN; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const stats = (a: number[]) => ({ n: a.length, p25: q(a, 0.25), median: q(a, 0.5), p75: q(a, 0.75), p90: q(a, 0.9), mean: a.length ? a.reduce((u, v) => u + v, 0) / a.length : NaN });
export const BRIDGE = 500 * Math.log2(0.125 / 0.05);   // ~661 steps: the longest gap over which the mark stays >= 0.05
export function returns(r: any) {
  const st: number[] = r.offerStep, rd: number[] = r.reading, gaps: number[] = [], edge: number[] = [], zone: number[] = [];
  const lastEdge = new Map<number, number>(), lastZone = new Map<number, number>(), edgesSeen = new Set<number>();
  for (let i = 0; i < st.length; i++) { if (i > 0) gaps.push(st[i] - st[i - 1]);
    const z = rd[i]; if (lastZone.has(z)) zone.push(st[i] - lastZone.get(z)!); lastZone.set(z, st[i]);
    if (i > 0 && rd[i - 1] !== z) { const e = rd[i - 1] * 10 + z; edgesSeen.add(e); if (lastEdge.has(e)) edge.push(st[i] - lastEdge.get(e)!); lastEdge.set(e, st[i]); } }
  return { offers: st.length, steps: r.path.length, distinctEdges: edgesSeen.size, offerGap: stats(gaps), edgeReturn: stats(edge), zoneReturn: stats(zone),
    edgeReturnsBridged: edge.length ? edge.filter(g => g <= BRIDGE).length / edge.length : NaN };
}
export async function main() {
  const res = await fetch(`${URL_}/rest/v1/amelia_long1_runs?id=like.desire2-c*-N&select=id,metrics`, { headers: { apikey: KEY!, Authorization: `Bearer ${KEY}` } });
  if (!res.ok) throw new Error(`read: ${res.status}`);
  const rows = (await res.json()).filter((x: any) => /^desire2-c\d\d-N$/.test(x.id));
  const per = Object.fromEntries(rows.map((x: any) => [x.metrics.copy, { rule: x.metrics.info?.rule ?? null, ...returns(x.metrics) }]));
  const all = Object.values(per) as any[], m = (f: (x: any) => number) => all.reduce((u, x) => u + f(x), 0) / all.length;
  const summary = { copies: all.length, bridgeSteps: BRIDGE, offersPerRun: m(x => x.offers), distinctEdges: m(x => x.distinctEdges),
    offerGapMedian: m(x => x.offerGap.median), edgeReturnMedian: m(x => x.edgeReturn.median), edgeReturnP75: m(x => x.edgeReturn.p75), edgeReturnP90: m(x => x.edgeReturn.p90),
    zoneReturnMedian: m(x => x.zoneReturn.median), edgeReturnsBridged: m(x => x.edgeReturnsBridged) };
  writeFileSync(process.env.OUT ?? 'RETURNS.json', JSON.stringify({ schema: 'DESIRE3_RETURNS_V1', registered: false, summary, perCopy: per }, null, 2) + '\n');
  console.log(JSON.stringify(summary));
  for (const [c, v] of Object.entries(per) as any) console.log(`copy ${c} (${v.rule}): offers ${v.offers}, edges ${v.distinctEdges}, offer gap median ${v.offerGap.median}, edge return median ${v.edgeReturn.median} p75 ${v.edgeReturn.p75} p90 ${v.edgeReturn.p90}, bridged ${(100 * v.edgeReturnsBridged).toFixed(0)}%`);
}
if (import.meta.main) main().catch(e => { console.error(String(e)); process.exit(1); });
