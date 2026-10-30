import { canonicalSha256 } from '../lib/sha256';
import type { IChingCastEvent, TarotSpreadEvent } from './types';
import type { OutsideChannel, ZoneId } from '../types/amelia';
export interface OutsideAttentionMap { channel: OutsideChannel; sourceDigest: string; attentionVector: number[]; }
const SYZYGIES: Array<[ZoneId,ZoneId]>=[[0,9],[1,8],[2,7],[3,6],[4,5]];
const zero=()=>new Array(10).fill(0) as number[];
function deposit(v:number[],i:number,side:'FIRST'|'SECOND'|'BOTH',w:number){const p=SYZYGIES[i%5];if(side!=='SECOND')v[p[0]]+=w*(side==='BOTH'?.5:1);if(side!=='FIRST')v[p[1]]+=w*(side==='BOTH'?.5:1);}
function normalize(v:number[]){const n=v.reduce((a,b)=>a+b,0);return n?v.map(x=>Number((x/n).toFixed(8))):v;}
function byte(s:string){return Number.parseInt(canonicalSha256(s).slice(0,2),16);}
export class OutsideAttentionMapper{
 static forIChing(e:IChingCastEvent):OutsideAttentionMap{const v=zero();e.lineValues.forEach((line,i)=>{const side=line===7||line===9?'SECOND':'FIRST';deposit(v,i%5,side,1);if(line===6||line===9)deposit(v,i%5,side==='FIRST'?'SECOND':'FIRST',.65);});return{channel:'ICHING',sourceDigest:canonicalSha256(JSON.stringify(e)),attentionVector:normalize(v)};}
 static forTarot(e:TarotSpreadEvent):OutsideAttentionMap{const v=zero();for(const d of [...e.draws].sort((a,b)=>a.order-b.order)){const side=d.orientation==='UPRIGHT'?'FIRST':d.orientation==='REVERSED'?'SECOND':'BOTH';deposit(v,byte(d.cardId)%5,side,1);deposit(v,byte(d.positionId)%5,'BOTH',.35);}return{channel:'TAROT',sourceDigest:canonicalSha256(JSON.stringify(e)),attentionVector:normalize(v)};}
}
