/** Post-registration exploratory probe of native 3/6 and native 2/7 geometry. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {OracleAdapter} from '../oracle-rerun/adapter.mjs';
import {prepare} from '../dynamic/prepare.mjs';
import {fastStep} from './quota.mjs';
const [src,out]=process.argv.slice(2);const states=JSON.parse(readFileSync(src,'utf8')).amelias,rows:any[]=[];
const bit=(key:string)=>parseInt(createHash('sha256').update(key).digest('hex').slice(0,8),16)%2;
for(let j=17;j<=24;j++)for(const strength of [0.054,0.35])for(let seed=0;seed<8;seed++)for(const route of ['warp','native27']){
 const id=`S05W${j}|0`,initial=structuredClone(prepare(states[id]).native),z=route==='warp'?[3,6]:[2,7];initial.runtime.currentZone=z[0];initial.z[initial.z.length-1]=z[0];
 const r=new OracleAdapter({...initial,cueWeight:strength}),path=[],probes=[];let enteredBoth=new Set([z[0]]),firstExit=null,select=0;
 for(let t=0;t<64;t++){
  const b=bit(`native-access-explore:${id}:${seed}:${t}`),cue=z[b];
  if(t<16 && z.includes(r.z.at(-1))){let test=[];const before=r.fullState();for(const c of z){let copy=new OracleAdapter(before);test.push(fastStep(copy,c).to);}probes.push({t,from:r.z.at(-1),targets:test});}
  const q=fastStep(r,cue);path.push({t,from:q.from,to:q.to,cue});select+=Number(q.to===cue);
  if(z.includes(q.to))enteredBoth.add(q.to);else if(firstExit===null)firstExit=t;
 }
 rows.push({id,strength,seed,route,path,probes,firstExit,chosen:select,bothZones:enteredBoth.size===2,deaths:r.deaths-initial.deaths});
}
writeFileSync(out,JSON.stringify({schema:'amelia.native-warp-access-exploration/v1',status:'EXPLORATORY',rows})+'\n');
