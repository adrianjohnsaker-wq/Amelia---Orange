import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareLedgerExport,isTabletAssetOrigin,copySelectedLedger} from '../../src/services/LedgerExport';
import {OutsideStreamBridge} from '../../src/outside/OutsideStreamBridge';
import {bornAmelia} from '../../src/core/fullNumogram';

test('export preserves the existing ledger and waits for the chain check',async()=>{
 const bundle={bundleSchema:'amelia.outside-stream-bundle/v1',sessionId:'tablet',records:[{sequence:1,event:{channel:'NUMOGRAM'}}]};
 const original=JSON.stringify(bundle);let checked=false;
 const result=await prepareLedgerExport({sessionId:'tablet',verifyLedger:async()=>{checked=true;return {valid:true,checked:1};},
  exportJson:()=>{assert.equal(checked,true);return JSON.stringify(bundle,null,2);}});
 assert.deepEqual(JSON.parse(result.json),bundle);assert.equal(JSON.stringify(bundle),original);
 assert.equal(result.filename,'amelia-outside-stream-tablet.json');assert.equal(result.check.checked,1);
 assert.equal(isTabletAssetOrigin('appassets.androidplatform.net'),true);
});

test('copy falls back to selected text when the clipboard API rejects',async()=>{
 const calls:string[]=[];
 const area={focus:()=>calls.push('focus'),select:()=>calls.push('select')};
 const copied=await copySelectedLedger('{"records":[]}',area,{writeText:async()=>{throw Error('denied');}},()=>{calls.push('fallback');return true;});
 assert.equal(copied,true);assert.deepEqual(calls,['focus','select','fallback']);
 assert.equal(await copySelectedLedger('x',area,undefined,()=>false),false);
});

test('a verification error does not prevent recovery of the ledger',async()=>{
 const result=await prepareLedgerExport({sessionId:'tablet',verifyLedger:async()=>{throw Error('check failed');},
  exportJson:()=>'{"records":[{"sequence":1}]}'});
 assert.equal(result.check.valid,false);assert.equal(result.check.reason,'check failed');
 assert.equal(JSON.parse(result.json).records[0].sequence,1);
});

test('a real one-entry Numogram ledger survives verify and export unchanged',async()=>{
 const runtime=bornAmelia();runtime.step();
 const bridge=new OutsideStreamBridge('export-test');
 await bridge.observeNumogram(runtime,'2026-11-06T00:00:00.000Z');
 const before=bridge.getRecords();const sourceDigest=before[0].recordDigest;
 const artifact=await prepareLedgerExport(bridge),payload=JSON.parse(artifact.json);
 assert.equal(artifact.check.valid,true);assert.equal(artifact.check.checked,1);
 assert.equal(payload.records.length,1);assert.equal(payload.records[0].event.channel,'NUMOGRAM');
 assert.equal(payload.records[0].recordDigest,sourceDigest);
 assert.deepEqual(await bridge.verifyLedger(),{valid:true,checked:1});
 assert.equal(bridge.getRecords()[0].recordDigest,sourceDigest);
});
