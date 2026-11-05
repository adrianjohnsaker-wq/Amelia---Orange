import test from 'node:test';import assert from 'node:assert/strict';
import { MAIN_MEMORY_TABLE,RESEARCH_MEMORY_TABLE,cloudMemoryTable,selectCloudArchive } from '../../src/services/cloudRecordNamespace';
const row=(store:any,id:string,marker:string)=>({store,record_id:id,payload:{id,marker},updated_at:'2026-11-05T00:00:00Z'});
test('the first research sync selects main records but writes to a separate table',()=>{
 const main=[row('runtime','live-checkpoint','main'),row('dialogue','welcome-0','hello')];
 const selected=selectCloudArchive(main,[],true);assert.equal(selected.bootstrapping,true);assert.deepEqual(selected.rows,main);
 assert.equal(cloudMemoryTable(true),RESEARCH_MEMORY_TABLE);assert.equal(cloudMemoryTable(false),MAIN_MEMORY_TABLE);
 assert.notEqual(cloudMemoryTable(true),cloudMemoryTable(false));
});
test('a completed research table never falls back to changed main records',()=>{
 const main=row('runtime','live-checkpoint','main-new'),own=row('runtime','live-checkpoint','research');
 const selected=selectCloudArchive([main],[own],true);assert.equal(selected.bootstrapping,false);
 assert.equal(selected.rows.length,1);assert.equal(selected.rows[0].payload.marker,'research');
 assert.deepEqual(selectCloudArchive([main],[own],false).rows,[main]);
});
test('a partial research bootstrap resumes without replacing already-copied records',()=>{
 const main=[row('runtime','live-checkpoint','main'),row('dialogue','welcome-0','old')],own=row('dialogue','welcome-0','copied');
 const selected=selectCloudArchive(main,[own],true);assert.equal(selected.bootstrapping,true);
 assert.equal(selected.rows.find(x=>x.store==='dialogue')?.payload.marker,'copied');
});
