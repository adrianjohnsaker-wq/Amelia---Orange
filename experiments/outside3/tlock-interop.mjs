/** OUTSIDE-3 synthetic-only Go/TypeScript tlock interoperability.
 * No plaintext or salt is logged or saved as a GitHub artifact.
 * Mode encrypt/decrypt. Input files reside in transient /dev/shm only.
 */
import { readFileSync,writeFileSync } from 'node:fs';
import {mainnetClient,timelockEncrypt,timelockDecrypt} from 'tlock-js';
import {Buffer} from 'buffer';
const [mode,input,output,roundStr]=process.argv.slice(2);
if(!['encrypt','decrypt'].includes(mode)||!input||!output)throw Error('ARGS');
const client=mainnetClient();
try {
 if(mode==='encrypt') {
  const round=Number(roundStr);
  if(!Number.isInteger(round)||round<1)throw Error('ROUND_INVALID');
  const armored=await timelockEncrypt(round,Buffer.from(readFileSync(input)),client);
  writeFileSync(output,armored,{mode:0o600});
 } else {
  const plaintext=await timelockDecrypt(readFileSync(input,'utf8'),client);
  writeFileSync(output,plaintext,{mode:0o600});
 }
 console.log('TLOCK_JS_'+mode.toUpperCase()+'_OK (no payload output)');
}catch(e:any){
 console.error('TLOCK_JS_'+mode.toUpperCase()+'_FAILED '+(e?.code??e?.name??'UNCLASSIFIED'));
 process.exitCode=1;
}
