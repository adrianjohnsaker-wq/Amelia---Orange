/** Mock-account integration: bootstrap once, then isolate the research cloud history. */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';import {readFile,mkdtemp,rm} from 'node:fs/promises';import path from 'node:path';import os from 'node:os';
const {chromium}=await import(process.env.AMELIA_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(process.env.AMELIA_DIST||'dist');
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname;const f=path.join(root,p==='/'?'index.html':p);if(!f.startsWith(root+'/'))throw Error();const type={'.html':'text/html','.js':'text/javascript','.css':'text/css'}[path.extname(f)]||'application/octet-stream';res.writeHead(200,{'Content-Type':type});res.end(await readFile(f));}catch{res.writeHead(404);res.end('not found')}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const addr=`http://127.0.0.1:${server.address().port}/`,rows=new Map(),mainTable='amelia_memory_records',researchTable='amelia_research_records',profiles=[];let context;const errors=[];
async function launch(p){const c=await chromium.launchPersistentContext(p,{executablePath:process.env.AMELIA_CHROMIUM_PATH||undefined,headless:true,args:JSON.parse(process.env.AMELIA_CHROMIUM_ARGS||'["--no-sandbox"]')});
 await c.route('https://rcgmtdponfljpribggsq.supabase.co/**',async route=>{const req=route.request(),u=new URL(req.url()),table=u.pathname.split('/').at(-1),headers={'Content-Type':'application/json','Access-Control-Allow-Origin':'*'};
 if(u.pathname==='/auth/v1/token')return route.fulfill({status:200,headers,body:JSON.stringify({access_token:'test-token',refresh_token:'test-refresh',expires_in:3600,user:{id:'00000000-0000-0000-0000-000000000001',email:'test@example.invalid'}})});
 if([mainTable,researchTable].includes(table)&&req.method()==='GET')return route.fulfill({status:200,headers,body:JSON.stringify([...rows.entries()].filter(([k])=>k.startsWith(table+'::')).map(([,v])=>v))});
 if([mainTable,researchTable].includes(table)&&req.method()==='POST'){for(const row of req.postDataJSON())rows.set(table+'::'+row.store+'::'+row.record_id,structuredClone(row));return route.fulfill({status:201,headers,body:'{}'});}
 return route.fulfill({status:400,headers,body:JSON.stringify({message:'unexpected mock request'})});});return c;}
function pageOf(c){const p=c.pages()[0];p.on('pageerror',e=>errors.push(e.message));return p;}
async function checkpoint(page){return page.evaluate(()=>new Promise((resolve,reject)=>{const o=indexedDB.open('amelia-orange-memory');o.onerror=()=>reject(o.error);o.onsuccess=()=>{const q=o.result.transaction('runtime','readonly').objectStore('runtime').get('live-checkpoint');q.onerror=()=>reject(q.error);q.onsuccess=()=>resolve(q.result||null);};}));}
function view(r){const b=r?.fieldCheckpoint?JSON.parse(r.fieldCheckpoint.payload).body:null;return {fieldStep:b?.stepCount??null,source:b?.syntheticSourceSession??null,events:r?.state?.memoryState?.events?.map(e=>e.eventDigest)};}
async function waitFor(fn){const end=Date.now()+30000;while(Date.now()<end){const x=await fn();if(x)return x;await new Promise(r=>setTimeout(r,250));}throw Error('Timed out waiting for test state');}
async function profile(){const p=await mkdtemp(path.join(os.tmpdir(),'amelia-namespace-'));profiles.push(p);return p;}
async function signIn(page){await page.locator('#tab-firebase').click();await page.locator('input[type=email]').fill('test@example.invalid');await page.locator('input[type=password]').fill('test-password');await page.getByRole('button',{name:'Sign in',exact:true}).click();}
try{
 // Prepare a synthetic, pre-existing main checkpoint in the mock, never real Supabase.
 context=await launch(await profile());let page=pageOf(context);await page.goto(addr,{waitUntil:'domcontentloaded'});await page.locator('#tab-morphogenetic').click();await page.getByText('Awaiting a field step').waitFor({timeout:30000});
 await page.getByRole('button',{name:'Step 1x',exact:true}).last().click();await waitFor(async()=>view(await checkpoint(page)).fieldStep===1);
 await page.getByRole('button',{name:'Step 1x',exact:true}).last().click();const original=await waitFor(async()=>{const r=await checkpoint(page);return view(r).fieldStep===2&&r});
 const main={store:'runtime',record_id:'live-checkpoint',payload:structuredClone(original),updated_at:'2026-11-05T00:00:00Z'};
 rows.set(mainTable+'::runtime::live-checkpoint',structuredClone(main));
 rows.set(mainTable+'::snapshots::preexisting',{store:'snapshots',record_id:'preexisting',payload:{id:'preexisting',marker:'main'},updated_at:'2026-11-05T00:00:00Z'});
 rows.set(researchTable+'::snapshots::preexisting',{store:'snapshots',record_id:'preexisting',payload:{id:'preexisting',marker:'partial-research'},updated_at:'2026-11-05T00:00:01Z'});
 await context.close();
 // First research sign-in resumes a partial copy and clones the main runtime.
 context=await launch(await profile());page=pageOf(context);await page.goto(addr,{waitUntil:'domcontentloaded'});await signIn(page);
 await page.getByText('SUPABASE SYNCED').waitFor({timeout:30000});await page.getByText(/Research copy: on first sync/).waitFor();
 const imported=await waitFor(async()=>{const r=await checkpoint(page);return view(r).fieldStep===2&&r});
 assert.deepEqual(view(imported).events,view(original).events);assert.deepEqual(rows.get(mainTable+'::runtime::live-checkpoint'),main);
 assert.equal(rows.get(researchTable+'::snapshots::preexisting').payload.marker,'partial-research');
 const own=await waitFor(()=>rows.get(researchTable+'::runtime::live-checkpoint'));assert.equal(own.payload.id,'live-checkpoint');
 await page.locator('#tab-morphogenetic').click();await page.locator('#btn-toggle-synthetic-source').click();await page.getByRole('button',{name:'Step 1x',exact:true}).last().click();
 const continued=await waitFor(async()=>{const r=await checkpoint(page);return view(r).fieldStep===3&&view(r).source?.sourceState.step===1&&r});
 await waitFor(()=>view(rows.get(researchTable+'::runtime::live-checkpoint')?.payload).fieldStep===3);
 assert.deepEqual(rows.get(mainTable+'::runtime::live-checkpoint'),main,'research activity changed the main cloud checkpoint');
 await context.close();
 // A later, newer main record must not replace the already-created research history.
 const newerMain=structuredClone(main);newerMain.payload.marker='later-main-change';newerMain.updated_at='2099-01-01T00:00:00Z';rows.set(mainTable+'::runtime::live-checkpoint',newerMain);
 context=await launch(await profile());page=pageOf(context);await page.goto(addr,{waitUntil:'domcontentloaded'});await signIn(page);await page.getByText('SUPABASE SYNCED').waitFor({timeout:30000});
 const restored=await waitFor(async()=>{const r=await checkpoint(page);return view(r).fieldStep===3&&r});assert.deepEqual(view(restored).events,view(continued).events);
 await page.locator('#tab-morphogenetic').click();assert.equal(await page.locator('#btn-toggle-synthetic-source').innerText(),'Stop new source offers');
 await page.getByRole('button',{name:'Step 1x',exact:true}).last().click();await waitFor(async()=>{const r=await checkpoint(page);return view(r).fieldStep===4&&view(r).source?.sourceState.step===2});
 await waitFor(()=>view(rows.get(researchTable+'::runtime::live-checkpoint')?.payload).fieldStep===4);assert.deepEqual(rows.get(mainTable+'::runtime::live-checkpoint'),newerMain);
 await context.close();
 // A divergent local research history is stopped before any remote write.
 const beforeConflict=structuredClone([...rows.entries()]);context=await launch(await profile());page=pageOf(context);await page.goto(addr,{waitUntil:'domcontentloaded'});
 await page.locator('#tab-morphogenetic').click();await page.getByRole('button',{name:'+A Pulse (Zone 0)',exact:true}).click();await page.getByRole('button',{name:'Step 1x',exact:true}).last().click();
 await waitFor(async()=>view(await checkpoint(page)).fieldStep===1);await signIn(page);
 await page.getByText('Local and cloud Amelia histories differ; automatic replacement was stopped.').first().waitFor({timeout:30000});
 assert.deepEqual([...rows.entries()],beforeConflict,'conflict wrote to a cloud namespace');assert.deepEqual(errors,[]);
 console.log(JSON.stringify({status:'PASS',mainCheckpointPreserved:true,partialBootstrapResumed:true,researchSourceTransferred:true,
  researchIgnoredLaterMainChange:true,divergentHistoryProtected:true,separateTablesProtected:true}));
}catch(e){console.error('TEST ERROR',e);if(context){const p=context.pages()[0];if(p)console.error('SCREEN',(await p.locator('body').innerText()).slice(0,7000));}process.exitCode=1;}
finally{if(context)await context.close();await new Promise(r=>server.close(r));for(const p of profiles)await rm(p,{recursive:true,force:true});}
