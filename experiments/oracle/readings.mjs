// THE ORACLE: the three readings. Numogram (zone, current, gate, region, syzygetic demon), I Ching (King Wen
// hexagram from six lines, changing lines, the hexagram it becomes), Tarot (78 cards, upright or reversed).
const droot = c => (c === 0 ? 0 : 1 + ((c - 1) % 9));
const DEMON = { 0: 'Uttunul', 1: 'Mur Mur', 2: 'Oddubb', 3: 'Djynxx', 4: 'Katak' };
export const region = z => ([0, 9].includes(z) ? 'Plex' : [3, 6].includes(z) ? 'Warp' : 'Time-Circuit');
export function numogram(z) {
  const hi = Math.max(z, 9 - z), lo = Math.min(z, 9 - z), g = (z * (z + 1)) / 2;
  return { zone: z, region: region(z), syzygy: `${hi}::${lo}`, demon: DEMON[lo], current: `${hi}::${lo} -> ${Math.abs(2 * z - 9)}`, gate: `Gt-${g} -> ${droot(g)}` };
}
// trigrams by lines bottom->top (1 = yang)
const TRIGRAM = { '111': 'Qian (Heaven)', '100': 'Zhen (Thunder)', '010': 'Kan (Water)', '001': 'Gen (Mountain)', '000': 'Kun (Earth)', '011': 'Xun (Wind)', '101': 'Li (Fire)', '110': 'Dui (Lake)' };
const ORDER = ['111', '100', '010', '001', '000', '011', '101', '110'];   // Qian Zhen Kan Gen Kun Xun Li Dui
const KING_WEN = [   // [upper][lower] in ORDER
  [1, 25, 6, 33, 12, 44, 13, 10], [34, 51, 40, 62, 16, 32, 55, 54], [5, 3, 29, 39, 8, 48, 63, 60], [26, 27, 4, 52, 23, 18, 22, 41],
  [11, 24, 7, 15, 2, 46, 36, 19], [9, 42, 59, 53, 20, 57, 37, 61], [14, 21, 64, 56, 35, 50, 30, 38], [43, 17, 47, 31, 45, 28, 49, 58]];
const HEX = ['', 'The Creative', 'The Receptive', 'Difficulty at the Beginning', 'Youthful Folly', 'Waiting', 'Conflict', 'The Army', 'Holding Together',
  'Small Taming', 'Treading', 'Peace', 'Standstill', 'Fellowship', 'Great Possession', 'Modesty', 'Enthusiasm', 'Following', 'Work on the Decayed',
  'Approach', 'Contemplation', 'Biting Through', 'Grace', 'Splitting Apart', 'Return', 'Innocence', 'Great Taming', 'Nourishment', 'Great Exceeding',
  'The Abysmal', 'The Clinging', 'Influence', 'Duration', 'Retreat', 'Great Power', 'Progress', 'Darkening of the Light', 'The Family', 'Opposition',
  'Obstruction', 'Deliverance', 'Decrease', 'Increase', 'Breakthrough', 'Coming to Meet', 'Gathering Together', 'Pushing Upward', 'Oppression',
  'The Well', 'Revolution', 'The Cauldron', 'The Arousing', 'Keeping Still', 'Development', 'The Marrying Maiden', 'Abundance', 'The Wanderer',
  'The Gentle', 'The Joyous', 'Dispersion', 'Limitation', 'Inner Truth', 'Small Exceeding', 'After Completion', 'Before Completion'];
const kw = bits => { const lower = bits.slice(0, 3).join(''), upper = bits.slice(3).join(''); return KING_WEN[ORDER.indexOf(upper)][ORDER.indexOf(lower)]; };
// six data -> six lines, bottom first: AQ value mod 4 -> 6 old yin (changing), 7 young yang, 8 young yin, 9 old yang (changing)
export function iching(aqs) {
  const lines = aqs.map(v => [6, 7, 8, 9][v % 4]), bits = lines.map(l => (l === 7 || l === 9 ? 1 : 0));
  const moved = lines.map(l => (l === 6 ? 1 : l === 9 ? 0 : l === 7 ? 1 : 0)), n = kw(bits), m = kw(moved);
  const changing = lines.map((l, i) => (l === 6 || l === 9 ? i + 1 : null)).filter(Boolean);
  return { hexagram: n, name: HEX[n], lower: TRIGRAM[bits.slice(0, 3).join('')], upper: TRIGRAM[bits.slice(3).join('')], lines,
    changing, becomes: changing.length ? { hexagram: m, name: HEX[m] } : null, zone: droot(n) };
}
const MAJOR = ['The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor', 'The Hierophant', 'The Lovers', 'The Chariot', 'Strength',
  'The Hermit', 'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance', 'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun',
  'Judgement', 'The World'];
const RANKS = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'], SUITS = ['Wands', 'Cups', 'Swords', 'Pentacles'];
// one datum -> one card: AQ sum mod 78; reversed when floor(sum / 78) is odd. Its zone is the digital root of its number
export function tarot(v) {
  const c = v % 78, reversed = Math.floor(v / 78) % 2 === 1;
  if (c < 22) return { card: MAJOR[c], arcana: 'major', number: c, reversed, zone: droot(c) };
  const s = Math.floor((c - 22) / 14), r = (c - 22) % 14;
  return { card: `${RANKS[r]} of ${SUITS[s]}`, arcana: 'minor', suit: SUITS[s], number: r + 1, reversed, zone: droot(r + 1) };
}
