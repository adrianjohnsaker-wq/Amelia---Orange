// Enochian/Numogram experimental bridge. Historical letter data and actual
// geometrical extraction are distinguished from the new routing operator.
import fs from 'node:fs';
import { createHash } from 'node:crypto';

const here = new URL('../', import.meta.url);
const data = JSON.parse(fs.readFileSync(new URL('dee_1584_table.json', here), 'utf8'));
const demonData = JSON.parse(fs.readFileSync(new URL('ccru_mesh_names.json', here), 'utf8'));
export const SOURCE_ROWS = data.rows;
export const CALL = 'OL SONF VORSG GOHO IAD BALT LANSH CALZ VONPHO';
export const QUARTERS = [
  { id: 'ORO', element: 'Air',   y: 0,  x: 0,  zones: [8, 1] },
  { id: 'MOR', element: 'Fire',  y: 0,  x: 13, zones: [7, 2] },
  { id: 'OIP', element: 'Earth', y: 14, x: 0,  zones: [5, 4] },
  { id: 'MPH', element: 'Water', y: 14, x: 13, zones: [6, 3] },
];
const id = (r, c) => r * 25 + c;
const coord = i => [Math.floor(i / 25) + 1, i % 25 + 1];
const value = c => (c.charCodeAt(0) - 65) / 25 * 2 - 1;
const at = (rows, q, r, c) => rows[q.y + r][q.x + c];
const chars = (rows, coords) => coords.map(i => rows[Math.floor(i / 25)][i % 25]).join('');
const rotate = (arr, n) => arr.slice(n).concat(arr.slice(0, n));

export function classify(r, c) {
  // Both inputs are zero based. Black Cross precedes quadrant classification.
  if (r === 13 || c === 12) return { sector: 'Spirit', role: 'black_cross' };
  const q = QUARTERS.find(t => r >= t.y && r < t.y + 13 && c >= t.x && c < t.x + 12);
  if (!q) throw Error(`bad coordinate ${r},${c}`);
  const y = r - q.y, x = c - q.x;
  if (y === 6 || x === 5 || x === 6) return { sector: q.element, tower: q.id, role: 'great_cross' };
  const ay = y < 6 ? 0 : 7, ax = x < 5 ? 0 : 7;
  const localY = y - ay, localX = x - ax;
  const angle = (ay ? 2 : 0) + (ax ? 1 : 0);
  const role = (localY === 1 || localX === 2) ? 'calvary_cross' :
               localY === 0 ? 'kerubic' : 'servient';
  return { sector: q.element, tower: q.id, angle, role };
}

function towerNames(rows, q) {
  const banner = Array.from({ length: 12 }, (_, c) => id(q.y + 6, q.x + c));
  // Documented clockwise spiral: (7,5) (6,6) (6,7) (7,8) (8,7) (8,6), ending in either centre cell.
  const kingStem = [[6,4],[5,5],[5,6],[6,7],[7,6],[7,5]].map(([r,c]) => id(q.y+r,q.x+c));
  let kingL = [...kingStem, id(q.y+6,q.x+5)], kingR = [...kingStem, id(q.y+6,q.x+6)];
  // OIP's two central cells are both A. The cited 1584 edition distinguishes
  // its two offices by interchanging the second and third spiral positions.
  if (q.id === 'OIP') kingL = [kingL[0], kingL[2], kingL[1], ...kingL.slice(3)];
  const seniors = [
    Array.from({length:7},(_,i)=>id(q.y+6-i,q.x+5)),
    Array.from({length:7},(_,i)=>id(q.y+6-i,q.x+6)),
    Array.from({length:7},(_,i)=>id(q.y+6+i,q.x+5)),
    Array.from({length:7},(_,i)=>id(q.y+6+i,q.x+6)),
    Array.from({length:6},(_,i)=>id(q.y+6,q.x+5-i)),
    Array.from({length:6},(_,i)=>id(q.y+6,q.x+6+i)),
  ];
  const angles = [];
  for (let n=0;n<4;n++) {
    const y = q.y + (n>=2 ? 7 : 0), x = q.x + (n%2 ? 7 : 0);
    const caller = Array.from({length:6},(_,i)=>id(y+i,x+2));
    const commander = Array.from({length:5},(_,i)=>id(y+1,x+i));
    const guardian = [0,1,3,4].map(c=>id(y,x+c));
    const servants = Array.from({length:4},(_,i)=>[0,1,3,4].map(c=>id(y+2+i,x+c)));
    const fiveLetter = Array.from({length:4},(_,i)=>Array.from({length:5},(_,c)=>id(y+2+i,x+c)));
    angles.push({ index:n, origin:[y+1,x+1],
      caller:{path:caller.map(coord),text:chars(rows,caller)},
      commander:{path:commander.map(coord),text:chars(rows,commander)},
      guardian:{path:guardian.map(coord),text:chars(rows,guardian),cycles:[0,1,2,3].map(k=>chars(rows,rotate(guardian,k)))},
      servants:servants.map(p=>({path:p.map(coord),text:chars(rows,p)})),
      extendedServants:fiveLetter.map(p=>({path:p.map(coord),text:chars(rows,p)})),
      callerCells:caller, commanderCells:commander, servantCells:servants.flat() });
  }
  return { id:q.id, element:q.element, zones:q.zones,
    divineNames:[chars(rows,banner.slice(0,3)),chars(rows,banner.slice(3,7)),chars(rows,banner.slice(7))],
    kings:[chars(rows,kingL),chars(rows,kingR)], kingPaths:[kingL.map(coord),kingR.map(coord)],
    seniors:seniors.map(p=>({path:p.map(coord),text:chars(rows,p)})), angles };
}

export function catalog(rows=SOURCE_ROWS) {
  if (rows.length !== 27 || rows.some(r=>r.length !== 25)) throw Error('Great Table must be 27x25');
  const towers = QUARTERS.map(q=>towerNames(rows,q));
  const counts = {};
  for(let r=0;r<27;r++)for(let c=0;c<25;c++){
    const k=classify(r,c); counts[k.role]=(counts[k.role]||0)+1;
  }
  const cross = [];
  for(let r=0;r<13;r++)if(rows[r][12]!=='.')cross.push(id(r,12));
  for(let c=13;c<25;c++)if(rows[13][c]!=='.')cross.push(id(13,c));
  return { witness:data.witness, towers, counts,
    union:{ text:chars(rows,cross), path:cross.map(coord),
            names:['EXARP','HCOMA','NANTA','BITOM'],
            blankCells:rows.reduce((n,r)=>n+[...r].filter(x=>x==='.').length,0) } };
}

export function meshId(a,b) {
  if (a === b) b = 9-a; // dwell uses its syzygy register, an explicit engineering rule
  const hi=Math.max(a,b), lo=Math.min(a,b);
  return hi*(hi-1)/2+lo;
}

function pairForMesh(m) {
  for(let hi=1;hi<=9;hi++)for(let lo=0;lo<hi;lo++)
    if(meshId(hi,lo)===m)return [hi,lo];
  throw Error('unknown mesh');
}

export function meshMap(rows=SOURCE_ROWS) {
  const towers = catalog(rows).towers;
  // Four non-Plex syzygies are anchored to the user's sector assignments.
  // All 45 instruction markers still occupy actual servient squares; 9::0
  // additionally uses the separate Black Cross / Union signal path.
  const slots = Array.from({length:45},(_,m)=>{
    const towerIndex=Math.floor((m%16)/4), angleIndex=m%4, slot=Math.floor(m/16);
    const angle=towers[towerIndex].angles[angleIndex];
    const cell=angle.servantCells[(slot*5)%16];
    return {towerIndex,angleIndex,cell};
  });
  const anchors = new Map([[14,'OIP'],[18,'MPH'],[23,'MOR'],[29,'ORO']]);
  for (const [m,wanted] of anchors) {
    if(towers[slots[m].towerIndex].id===wanted)continue;
    const other=slots.findIndex((s,j)=>!anchors.has(j) && towers[s.towerIndex].id===wanted);
    if(other<0)throw Error('cannot place syzygy');
    [slots[m],slots[other]]=[slots[other],slots[m]];
  }
  return slots.map(({towerIndex,angleIndex,cell},m)=>{
    const angle=towers[towerIndex].angles[angleIndex];
    const [r,c]=coord(cell);
    return {mesh:m,name:demonData.names[m],pair:pairForMesh(m),tower:towers[towerIndex].id,
      sector:towers[towerIndex].element,angle:angleIndex,coordinate:[r,c],
      letter:rows[r-1][c-1],cell,caller:angle.caller.text,commander:angle.commander.text,
      callerCells:angle.callerCells,commanderCells:angle.commanderCells};
  });
}

function seeded(seed) {
  return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;
    return ((t^(t>>>14))>>>0)/4294967296; };
}

export function permutedRows(rows=SOURCE_ROWS, seed=1584001) {
  // Shuffle only within the same tower and structural role; central cross is fixed.
  const result=rows.map(r=>[...r]), groups=new Map(), rand=seeded(seed);
  for(let r=0;r<27;r++)for(let c=0;c<25;c++){
    const k=classify(r,c); if(k.sector==='Spirit')continue;
    const key=`${k.tower}|${k.role}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push([r,c]);
  }
  for(const positions of groups.values()){
    const letters=positions.map(([r,c])=>rows[r][c]);
    for(let i=letters.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[letters[i],letters[j]]=[letters[j],letters[i]];}
    positions.forEach(([r,c],i)=>result[r][c]=letters[i]);
  }
  return result.map(r=>r.join(''));
}

export function callPath(rows=SOURCE_ROWS, text=CALL) {
  const tower=QUARTERS[0], letters=[...text.toUpperCase()].filter(ch=>/[A-Z]/.test(ch));
  let y=tower.y+6,x=tower.x+5;
  return letters.map(letter=>{
    const matches=[];
    for(let r=tower.y;r<tower.y+13;r++)for(let c=tower.x;c<tower.x+12;c++)
      if(rows[r][c]===letter)matches.push({r,c,d:Math.abs(r-y)+Math.abs(c-x)});
    if(!matches.length)throw Error(`Call letter ${letter} absent from Air tablet`);
    matches.sort((a,b)=>a.d-b.d||a.r-b.r||a.c-b.c); ({r:y,c:x}=matches[0]);
    return { letter, coordinate:[y+1,x+1], cell:id(y,x) };
  });
}

export class DeeSystem {
  constructor({ mode, state=null, gain=0.08, shuffleSeed=1584001 }) {
    this.mode=mode;
    this.rows=mode==='shuffled' ? permutedRows(SOURCE_ROWS, shuffleSeed) : SOURCE_ROWS;
    this.map=meshMap(this.rows);
    this.path=callPath(this.rows);
    this.unionPath=catalog(this.rows).union.path;
    this.gain=gain;
    this.state=state || { version:1, cells:Array(675).fill(0), transitions:0,
      byMesh:Array(45).fill(0), callLetters:0, crossEvents:0 };
    if(this.state.cells.length!==675 || this.state.byMesh.length!==45)throw Error('invalid Dee memory');
  }
  score(from,to,tick) {
    const entry=this.map[meshId(from,to)];
    const call=this.path[(tick-1)%this.path.length];
    const related=entry.caller[(from+to)%entry.caller.length];
    const command=entry.commander[(2*from+to)%entry.commander.length];
    const affinity=1-Math.abs(entry.letter.charCodeAt(0)-call.letter.charCodeAt(0))/25;
    const geometry=1-(Math.abs(entry.coordinate[0]-call.coordinate[0])+Math.abs(entry.coordinate[1]-call.coordinate[1]))/50;
    const staticScore=0.45*(2*affinity-1)+0.25*value(related)+0.20*value(command)+0.10*(2*geometry-1);
    const memory=this.mode==='no_memory' ? 0 : Math.tanh(Math.log1p(this.state.cells[entry.cell])/5);
    return this.gain*(0.8*staticScore+0.2*memory);
  }
  record(from,to,tick) {
    const entry=this.map[meshId(from,to)], st=this.state;
    st.cells[entry.cell]++;st.byMesh[entry.mesh]++;st.transitions++;
    st.cells[entry.callerCells[(tick-1)%6]]++;
    st.cells[entry.commanderCells[(tick-1)%5]]++;
    const call=this.path[(tick-1)%this.path.length];
    st.cells[call.cell]++;st.callLetters++;
    if(from===0||from===9||to===0||to===9){
      const cp=this.unionPath[(tick-1)%20]; st.cells[id(cp[0]-1,cp[1]-1)]++;st.crossEvents++;
    }
  }
  exportState(){return this.state;}
  provenance(){return {mode:this.mode,gain:this.gain,call:CALL,callPath:this.path.map(({letter,coordinate})=>({letter,coordinate})),
    table_sha256:createHash('sha256').update(this.rows.join('\n')).digest('hex')};}
}
