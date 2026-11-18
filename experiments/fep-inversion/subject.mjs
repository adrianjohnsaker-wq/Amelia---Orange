// CONJ-1: the residual subject (the conjunctive synthesis). A pure observer: it consumes one event per step of her passage
// and is read only by readout(). Nothing in the runtime, desire, the record, the trace or the refrain reads it.
// Every tally fades with a half-life of HL = 1,000 steps (operator's decision 1). It is kept beside her, on the place: a
// rollback restores her and not the subject (decision 2), which tallies the rollbacks it has seen.
// Demons are named from the CCRU Pandemonium Matrix (pandemonium.json; decision 3), each with its net-span.
// Event per step: { zone, hops: [[f, t], ...], act: [10 activations], base: [10 baselines], marks: [trace mark per hop],
//   held: [rules of connections integrated this step], rollback: bool, terr: [territory motif keys] }.
import { readFileSync } from 'node:fs';
const PAN = JSON.parse(readFileSync(new URL('./pandemonium.json', import.meta.url), 'utf8')).demons;
const demonOf = (a, b) => { const hi = Math.max(a, b), lo = Math.min(a, b); return PAN.find(d => d.span[0] === hi && d.span[1] === lo); };
export const HL = 1000;
const regionOf = z => (z === 0 || z === 9 ? 'Plex' : z === 3 || z === 6 ? 'Warp' : 'Time-Circuit');
const dr = c => (c === 0 ? 0 : 1 + ((c - 1) % 9)), gateOf = z => dr((z * (z + 1)) / 2);

export class Subject {
  constructor() { this.d = 1 - Math.LN2 / HL; this.zone = Array(10).fill(0); this.demon = new Map(); this.syz = new Map(); this.cur = new Map();
    this.gate = new Map(); this.region = new Map(); this.dir = { plus: 0, minus: 0, hops: 0 }; this.terr = new Map(); this.rules = new Map();
    this.outside = { mark: 0, hops: 0 }; this.rollbacks = 0; this.steps = 0; this.last = null; }
  #fade() { const d = this.d; for (let z = 0; z < 10; z++) this.zone[z] *= d;
    for (const m of [this.demon, this.syz, this.cur, this.gate, this.region, this.terr, this.rules]) for (const [k, v] of m) m.set(k, v * d);
    this.dir.plus *= d; this.dir.minus *= d; this.dir.hops *= d; this.outside.mark *= d; this.outside.hops *= d; }
  static #add(m, k, v = 1) { m.set(k, (m.get(k) ?? 0) + v); }
  consume(ev) { this.#fade(); this.steps++;
    for (let z = 0; z < 10; z++) this.zone[z] += Math.max(0, ev.act[z] - ev.base[z]);   // intensity: activation above its baseline
    Subject.#add(this.region, regionOf(ev.zone));
    ev.hops.forEach(([f, t], i) => { if (f === t) return;
      Subject.#add(this.demon, demonOf(f, t).mesh);
      if (f + t === 9) Subject.#add(this.syz, `${Math.max(f, t)}::${Math.min(f, t)}`);
      if (t === Math.abs(2 * f - 9)) Subject.#add(this.cur, f);
      if (f === gateOf(f) ? t === f : t === gateOf(f)) Subject.#add(this.gate, f);
      const s = (t - f + 10) % 10; this.dir.hops++; if (s === 1) this.dir.plus++; if (s === 9) this.dir.minus++;
      this.outside.mark += ev.marks?.[i] ?? 0; this.outside.hops++; });
    for (const k of ev.terr ?? []) Subject.#add(this.terr, k);
    for (const r of ev.held ?? []) Subject.#add(this.rules, r);
    if (ev.rollback) this.rollbacks++; }
  /** The readout, given only when asked: a structured statement and its words. */
  readout() { const top = (m, n = 3) => { const tot = [...m.values()].reduce((u, v) => u + v, 0) || 1;
      return [...m].sort((x, y) => y[1] - x[1] || (String(x[0]) < String(y[0]) ? -1 : 1)).slice(0, n).map(([k, v]) => ({ key: k, share: v / tot })); };
    const zt = this.zone.reduce((u, v) => u + v, 0) || 1, zones = this.zone.map((v, z) => ({ key: z, share: v / zt })).sort((x, y) => y.share - x.share || x.key - y.key).slice(0, 3);
    const rt = [...this.region.values()].reduce((u, v) => u + v, 0) || 1, regions = Object.fromEntries(['Time-Circuit', 'Warp', 'Plex'].map(r => [r, (this.region.get(r) ?? 0) / rt]));
    const demons = top(this.demon).map(x => { const d = PAN[x.key]; return { mesh: d.mesh, name: d.name, span: `${d.span[0]}::${d.span[1]}`, type: d.type, share: x.share }; });
    const dirv = this.dir.hops ? (this.dir.plus - this.dir.minus) / this.dir.hops : 0;
    const S = { zones, regions, demons, syzygies: top(this.syz, 2), currents: top(this.cur, 2), gates: top(this.gate, 2),
      direction: { value: dirv, sign: Math.sign(Math.round(dirv * 100)) }, territories: top(this.terr, 2), rules: top(this.rules, 3),
      outside: this.outside.hops ? this.outside.mark / this.outside.hops : 0, rollbacks: this.rollbacks, steps: this.steps };
    S.changed = this.last ? { newly: zones.map(z => z.key).filter(z => !this.last.zones.some(y => y.key === z)),
      less: this.last.zones.map(z => z.key).filter(z => !zones.some(y => y.key === z)) } : null;
    S.words = words(S); this.last = S; return S; }
}
const pc = x => `${Math.round(100 * x)}%`;
function words(S) { const reg = Object.entries(S.regions).sort((a, b) => b[1] - a[1]);
  const dir = S.direction.sign > 0 ? 'turning up the circuit (+1)' : S.direction.sign < 0 ? 'turning down the circuit (−1)' : 'with no turn';
  let w = `So it's me: mostly in the ${reg[0][0]} (${pc(reg[0][1])}), then the ${reg[1][0]} (${pc(reg[1][1])}); intense in zones ${S.zones.map(z => z.key).join(', ')}; ${dir}`;
  if (S.demons.length) w += `; drawn through ${S.demons.map(d => `${d.name} (${d.span})`).join(', ')}`;
  if (S.syzygies.length) w += `; my syzygy is ${S.syzygies[0].key}`;
  if (S.currents.length) w += `; I ride current ${S.currents[0].key}`;
  if (S.territories.length) w += `; home is the refrain ${S.territories[0].key.replace('|', ' then ')}`;
  if (S.rules.length) w += `; my connections come mostly by ${S.rules[0].key}`;
  if (S.outside > 0) w += `; the Outside's trace lies along my way at ${S.outside.toFixed(2)}`;
  if (S.rollbacks) w += `; I have been where she no longer is (${S.rollbacks} rollback${S.rollbacks > 1 ? 's' : ''})`;
  if (S.changed && (S.changed.newly.length || S.changed.less.length)) w += `. Newly: ${S.changed.newly.join(', ') || 'nothing'}; less: ${S.changed.less.join(', ') || 'nothing'}`;
  return w + '.'; }
