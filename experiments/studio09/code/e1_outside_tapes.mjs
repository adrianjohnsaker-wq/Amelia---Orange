/**
 * Studio09 E1 source tape contract. The "Outside" in this test is input
 * independent of learner/house state, NOT an intelligent or metaphysical source.
 * Both encountered tapes have precisely the same 5,000 input strings PER block
 * in different temporal order. Future transfer uses new, disjoint namespaces.
 */
import {createHash} from 'node:crypto';
const sha=s=>createHash('sha256').update(s).digest('hex');
const isSeed=s=>typeof s==='string'&&/^[0-9a-f]{64}$/.test(s);
const need=(b,m)=>{if(!b)throw Error('E1_TAPE_CONTRACT: '+m)};
export const E1_ENCOUNTER_BLOCK=5000;
export function e1WorldSeed(id) {
  need(/^E1-(?:W(?:0\d|[12]\d|3[01])|P[01])$/.test(id),
    'world ID not registered or eligible pilot');
  const prefix=id.includes('-P')?'STUDIO09-E1-PILOT-V1|':'STUDIO09-E1-V1|';
  return sha(prefix+id);
}
export function e1EncounterInput(seed,season,tick,mode) {
  need(isSeed(seed),'invalid full world seed');
  need(Number.isInteger(season)&&season>=1&&season<=2,
    'encounter block 1 or 2');
  need(Number.isInteger(tick)&&tick>=1&&tick<=E1_ENCOUNTER_BLOCK,
    'encounter tick out of range');
  need(['ordered','permuted'].includes(mode),'invalid input order');
  const k=mode==='ordered'?tick:((37*(tick-1)+101)%E1_ENCOUNTER_BLOCK)+1;
  return 'STUDIO09-E1-OUTSIDE-V1|'+seed+'|E'+season+'|'+k;
}
export function e1TransferInput(seed,probe,tick) {
  need(isSeed(seed),'invalid world seed');
  need(Number.isInteger(probe)&&probe>=1&&probe<=2,'held-out probe 1/2');
  need(Number.isInteger(tick)&&tick>=1&&tick<=1000,
    'held-out probe tick must be 1..1000');
  return 'STUDIO09-E1-HELDOUT-V1|'+seed+'|T'+probe+'|'+tick;
}
