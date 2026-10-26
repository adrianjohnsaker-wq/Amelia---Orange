import {createHash} from 'node:crypto';
const hash=s=>createHash('sha256').update(s).digest('hex');
export function encounterSequence(seed,condition){
 if(!/^[0-9a-f]{64}$/.test(seed))throw Error('invalid seed');
 if(!['structured','scrambled','neutral'].includes(condition))throw Error('invalid condition');
 const motif=Array.from({length:256},(_,i)=>'ENCOUNTER1|'+seed+'|'+(i%16===15?'X':i%16<8?'A':'B')+'|'+String(i).padStart(3,'0'));
 if(condition==='structured')return motif;
 if(condition==='neutral')return Array.from({length:256},(_,i)=>'ENCOUNTER1|'+seed+'|N|'+String(i).padStart(3,'0'));
 const a=[...motif];
 for(let i=255;i>0;i--){const d=hash('ENCOUNTER1-PERM|'+seed+'|'+i);const j=Number(BigInt('0x'+d.slice(0,13))%BigInt(i+1));[a[i],a[j]]=[a[j],a[i]];}
 return a;
}
export function commonInput(seed,epoch,t){
 if(!/^[0-9a-f]{64}$/.test(seed)||!['washout','challenge'].includes(epoch)||!Number.isInteger(t)||t<0)throw Error('invalid common input');
 return 'ENCOUNTER1-COMMON|'+epoch+'|'+hash(seed+'|'+epoch+'|'+t);
}
export const sha256=hash;
