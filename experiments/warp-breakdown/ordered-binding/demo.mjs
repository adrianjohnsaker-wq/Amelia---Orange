/** Operator demonstration; this example is not part of the sealed evaluation. */
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {prepare} from '../dynamic/prepare.mjs';
import {setup,inputEvent,shock,probe} from './pipeline.mjs';
const [checkpoint='oracle_wbd4_data/prospective.json',id='S05W17|0',oldText='0,1,2',newText='0,2,1',zoneText='1']=process.argv.slice(2);
const parse=s=>s.split(',').map(Number),old=parse(oldText),next=parse(newText),zone=Number(zoneText);assert.equal(old.length,3);assert.equal(next.length,3);assert.deepEqual([...old].sort(),[0,1,2]);assert.deepEqual([...next].sort(),[0,1,2]);assert.equal(old[0],next[0]);assert.ok([1,4,8].includes(zone));
const db=JSON.parse(readFileSync(checkpoint)),entry=db.amelias[id];assert.ok(entry,`Unknown lineage: ${id}`);const r=setup(prepare(entry).native,'warp');for(const token of old)inputEvent(r,'warp',token);const changed=shock(r.fullState(),'warp',zone,[0,0,0,0,0,0]);for(const token of next)inputEvent(changed.r,'warp',token);const host=changed.r.fullState(),left=old[1],right=old[2],oldProbe=probe(host,'warp','old',left,right),newProbe=probe(host,'warp','new',left,right),brief=q=>({context:q.context,candidates:[q.left,q.right],earlierChoice:q.action===0?q.left:q.right,decoded:q.readout.action,gateTransitions:q.path.map(x=>[x.from,x.to])});console.log(JSON.stringify({status:'DEMONSTRATION_NOT_EVALUATION',lineage:id,originalSequence:old,secondSequence:next,forcedDisplacement:zone,oldProbe:brief(oldProbe),newProbe:brief(newProbe)},null,2));
