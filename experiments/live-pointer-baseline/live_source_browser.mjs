/** Isolated browser-session test: no real Supabase requests or user data. */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile,mkdtemp,rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
const {chromium}=await import(process.env.AMELIA_PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve(process.env.AMELIA_DIST || 'dist');
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const file=path.join(root,pathname==='/'?'index.html':pathname);if(!file.startsWith(root+'/'))throw Error();const type={'.html':'text/html','.js':'text/javascript','.css':'text/css'}[path.extname(file)]||'application/octet-stream';res.writeHead(200,{'Content-Type':type});res.end(await readFile(file));}catch{res.writeHead(404);res.end('not found')}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}/`;
const profile=await mkdtemp(path.join(os.tmpdir(),'amelia-live-source-'));let context;const errors=[];
async function launch(){const c=await chromium.launchPersistentContext(profile,{executablePath:process.env.AMELIA_CHROMIUM_PATH||undefined,
 headless:true,args:JSON.parse(process.env.AMELIA_CHROMIUM_ARGS||'["--no-sandbox"]')});
 await c.route('https://rcgmtdponfljpribggsq.supabase.co/**',route=>route.fulfill({status:503,body:'offline-test'}));return c;}
async function checkpoint(page){return page.evaluate(()=>new Promise((resolve,reject)=>{const open=indexedDB.open('amelia-orange-memory');open.onerror=()=>reject(open.error);open.onsuccess=()=>{const q=open.result.transaction('runtime','readonly').objectStore('runtime').get('live-checkpoint');q.onerror=()=>reject(q.error);q.onsuccess=()=>resolve(q.result||null);};}));}
function state(r){const body=r?.fieldCheckpoint?.payload?JSON.parse(r.fieldCheckpoint.payload).body:null;return {fieldStep:body?.stepCount,fieldRunning:r?.fieldCheckpoint?.running,source:body?.syntheticSourceSession,
 events:r?.state?.memoryState?.events||[]};}
async function waitFor(page,predicate){const end=Date.now()+30000;while(Date.now()<end){const r=await checkpoint(page);if(predicate(state(r)))return r;await new Promise(r=>setTimeout(r,250));}throw Error('Checkpoint condition not reached');}
function openPage(c){const page=c.pages()[0];page.on('pageerror',e=>errors.push(e.message));return page;}
try{
 context=await launch();let page=openPage(context);await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.locator('#tab-morphogenetic').click();const toggle=page.locator('#btn-toggle-synthetic-source');await toggle.waitFor();
 await toggle.click();await page.getByRole('button',{name:'Step 1x',exact:true}).last().click();
 const first=await waitFor(page,x=>x.fieldStep===1&&x.source?.enabled&&x.source.sourceState.step===1);
 const firstState=state(first),event=firstState.events.at(-1);const offered=event.encounters.find(e=>e.sourceContext?.sourceStep===1);
 assert.equal(offered.sourceContext.schema,'amelia.live-source-context/v1');assert.equal(offered.sourceContext.pointerVector.length,10);
 await page.locator('#tab-dialogue').click();await page.locator('#tab-morphogenetic').click();
 assert.equal(await page.locator('#btn-toggle-synthetic-source').innerText(),'Stop new source offers');
 await context.close();context=await launch();page=openPage(context);await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.locator('#tab-morphogenetic').click();assert.equal(await page.locator('#btn-toggle-synthetic-source').innerText(),'Stop new source offers');
 await page.getByRole('button',{name:'Step 1x',exact:true}).last().click();
 const second=await waitFor(page,x=>x.fieldStep===2&&x.source?.enabled&&x.source.sourceState.step===2);
 const secondState=state(second);assert.deepEqual(secondState.events.slice(0,firstState.events.length).map(e=>e.eventDigest),firstState.events.map(e=>e.eventDigest));
 assert.ok(secondState.events.at(-1).encounters.some(e=>e.sourceContext?.sourceStep===2));
 await page.getByRole('button',{name:'Evolve Field',exact:true}).click();
 const running=await waitFor(page,x=>x.fieldRunning===true&&x.source?.sourceState.step>=4);
 const runningStep=state(running).source.sourceState.step;await page.locator('#tab-dialogue').click();
 const hidden=await waitFor(page,x=>x.fieldRunning===true&&x.source?.sourceState.step>=runningStep+3);
 await page.locator('#tab-morphogenetic').click();await page.getByRole('button',{name:'Pause Field',exact:true}).click();
 const stopped=await waitFor(page,x=>x.fieldRunning===false&&x.source?.sourceState.step>=state(hidden).source.sourceState.step);
 const stoppedState=state(stopped);await page.locator('#btn-toggle-synthetic-source').click();await page.getByRole('button',{name:'Step 1x',exact:true}).last().click();
 const paused=await waitFor(page,x=>x.fieldStep===stoppedState.fieldStep+1&&x.source?.enabled===false&&x.source.sourceState.step===stoppedState.source.sourceState.step);
 const p=state(paused);assert.ok(p.events.at(-1).encounters.some(e=>e.eventId.startsWith('field:')&&!e.sourceContext));
 await context.close();context=await launch();page=openPage(context);await page.goto(url,{waitUntil:'domcontentloaded'});await page.locator('#tab-morphogenetic').click();
 assert.equal(await page.locator('#btn-toggle-synthetic-source').innerText(),'Connect synthetic source');
 const again=await checkpoint(page);assert.equal(state(again).source.sourceState.step,stoppedState.source.sourceState.step);assert.equal(state(again).source.enabled,false);
 assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'PASS',firstSourceStep:1,restoredSourceStep:2,hiddenSourceStep:state(hidden).source.sourceState.step,pausedAt:state(again).source.sourceState.step,
  historyContinued:true,pointerRecordedInPFM:true,hiddenFieldContinued:true,pauseSurvivedRestart:true}));
}catch(e){console.error('TEST ERROR',e);if(context){const p=context.pages()[0];if(p)console.error('SCREEN',(await p.locator('body').innerText()).slice(0,6000));}process.exitCode=1;}
finally{if(context)await context.close();await new Promise(r=>server.close(r));await rm(profile,{recursive:true,force:true});}
