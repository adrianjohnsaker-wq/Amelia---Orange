import assert from 'node:assert/strict';
const { chromium } = await import(process.env.AMELIA_PLAYWRIGHT_MODULE || 'playwright');
import { createServer } from 'node:http';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
const root = path.resolve(process.env.AMELIA_DIST || 'dist');
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const f=path.join(root,pathname==='/'?'index.html':pathname);if(!f.startsWith(root+'/'))throw Error();const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'}[path.extname(f)]||'application/octet-stream';res.writeHead(200,{'Content-Type':type});res.end(await readFile(f));}catch{res.writeHead(404);res.end('not found')}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const addr=`http://127.0.0.1:${server.address().port}/`, rows=new Map(), requests=[];
const profiles=[]; let context;
async function newContext(profile) {
 const c=await chromium.launchPersistentContext(profile,{executablePath:process.env.AMELIA_CHROMIUM_PATH || undefined,headless:true,args:JSON.parse(process.env.AMELIA_CHROMIUM_ARGS || '["--no-sandbox"]')});
 await c.route('https://rcgmtdponfljpribggsq.supabase.co/**', async route=>{
   const req=route.request(),url=new URL(req.url());requests.push(req.method()+' '+url.pathname);
   const headers={'Content-Type':'application/json','Access-Control-Allow-Origin':'*'};
   if(url.pathname==='/auth/v1/token') return route.fulfill({status:200,headers,body:JSON.stringify({access_token:'isolated-test-token',refresh_token:'isolated-test-refresh',expires_in:3600,user:{id:'00000000-0000-0000-0000-000000000001',email:'test@example.invalid'}})});
   if(url.pathname==='/rest/v1/amelia_memory_records' && req.method()==='GET') return route.fulfill({status:200,headers,body:JSON.stringify([...rows.values()])});
   if(url.pathname==='/rest/v1/amelia_memory_records' && req.method()==='POST') {for(const row of req.postDataJSON()){rows.set(row.store+'::'+row.record_id,structuredClone(row));}return route.fulfill({status:201,headers,body:'{}'});}
   return route.fulfill({status:400,headers,body:JSON.stringify({message:'unexpected test request '+req.method()+' '+url.pathname})});
 });return c;
}
async function checkpoint(page){return page.evaluate(()=>new Promise((resolve,reject)=>{const open=indexedDB.open('amelia-orange-memory');open.onerror=()=>reject(open.error);open.onsuccess=()=>{const q=open.result.transaction('runtime','readonly').objectStore('runtime').get('live-checkpoint');q.onerror=()=>reject(q.error);q.onsuccess=()=>resolve(q.result||null);};}));}
function view(r){return {fieldStep:r?.fieldCheckpoint?JSON.parse(r.fieldCheckpoint.payload).body.stepCount:null,fieldChecksum:r?.fieldCheckpoint?.checksum,events:r?.state?.memoryState?.events?.map(e=>e.eventDigest),zone:r?.state?.currentZone,governor:r?.state?.governorState,writerId:r?.writerId,revision:r?.revision};}
async function waitUntil(f,ms=30000){let value;const end=Date.now()+ms;while(Date.now()<end){value=await f();if(value)return value;await new Promise(r=>setTimeout(r,250));}throw Error('Timed out: '+JSON.stringify(value));}
async function signIn(page){await page.locator('#tab-firebase').click();await page.locator('input[type=email]').fill('test@example.invalid');await page.locator('input[type=password]').fill('test-password');await page.getByRole('button',{name:'Sign in',exact:true}).click();}
let errors=[];try{
 const p1=await mkdtemp(path.join(os.tmpdir(),'amelia-p1-'));profiles.push(p1);context=await newContext(p1);let page=context.pages()[0]||await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(addr,{waitUntil:'domcontentloaded'});
 await page.locator('#tab-morphogenetic').click();await page.getByText('Awaiting a field step').waitFor({timeout:30000});await page.getByRole('button',{name:'Step 1x',exact:true}).last().click();
 const saved=await waitUntil(async()=>{let r=await checkpoint(page);return view(r).fieldStep===1&&r});const before=view(saved);
 await context.close();context=await newContext(p1);page=context.pages()[0]||await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(addr,{waitUntil:'domcontentloaded'});await page.locator('#tab-morphogenetic').click();
 await page.getByRole('button',{name:'Step 1x',exact:true}).last().click();const restarted=await waitUntil(async()=>{let r=await checkpoint(page);return view(r).fieldStep===2&&r});
 assert.deepEqual(view(restarted).events.slice(0,before.events.length),before.events,'session restart lost the PFM prefix');
 await signIn(page);await page.getByText('SUPABASE SYNCED').waitFor({timeout:30000});const remote=await waitUntil(()=>rows.get('runtime::live-checkpoint'));
 assert.equal(view(remote.payload).fieldStep,2);assert.deepEqual(view(remote.payload).events,view(restarted).events);
 await context.close();const p2=await mkdtemp(path.join(os.tmpdir(),'amelia-p2-'));profiles.push(p2);context=await newContext(p2);page=context.pages()[0]||await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(addr,{waitUntil:'domcontentloaded'});await signIn(page);
 await page.getByText('SUPABASE SYNCED').waitFor({timeout:30000});const imported=await waitUntil(async()=>{let r=await checkpoint(page);return view(r).fieldStep===2&&r});
 assert.deepEqual(view(imported).events,view(restarted).events,'restored memory history differs');assert.equal(view(imported).fieldChecksum,view(restarted).fieldChecksum);
 await page.locator('#tab-morphogenetic').click();await page.getByRole('button',{name:'Step 1x',exact:true}).last().click();const resumed=await waitUntil(async()=>{let r=await checkpoint(page);return view(r).fieldStep===3&&r});
 assert.deepEqual(view(resumed).events.slice(0,view(imported).events.length),view(imported).events,'new device did not continue memory');
 await waitUntil(()=>view(rows.get('runtime::live-checkpoint')?.payload).fieldStep===3);
 await context.close();
 const p3=await mkdtemp(path.join(os.tmpdir(),'amelia-p3-'));profiles.push(p3);context=await newContext(p3);page=context.pages()[0]||await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(addr,{waitUntil:'domcontentloaded'});
 await page.locator('#tab-morphogenetic').click();await page.getByText('Awaiting a field step').waitFor({timeout:30000});
 await page.getByRole('button',{name:'Step 1x',exact:true}).last().click();await waitUntil(async()=>view(await checkpoint(page)).fieldStep===1);
 await page.getByRole('button',{name:'+A Pulse (Zone 0)',exact:true}).click();await page.getByRole('button',{name:'Step 1x',exact:true}).last().click();
 const divergent=await waitUntil(async()=>{let r=await checkpoint(page);return view(r).fieldStep===2&&r});const remoteBefore=structuredClone(rows.get('runtime::live-checkpoint').payload);
 await signIn(page);await page.getByText('Local and cloud Amelia histories differ; automatic replacement was stopped.').first().waitFor({timeout:30000});
 assert.deepEqual(view((await checkpoint(page))).events,view(divergent).events,'a conflict replaced local history');
 assert.deepEqual(rows.get('runtime::live-checkpoint').payload,remoteBefore,'a conflict replaced cloud history');
 assert.equal(errors.length,0,'browser errors: '+JSON.stringify(errors));console.log(JSON.stringify({status:'PASS',sessionBefore:before,sessionRestart:view(restarted),mockCloudTransfer:view(imported),continued:view(resumed),conflictProtected:true,requestCount:requests.length},null,2));
}catch(err){console.error('TEST ERROR',err);if(context){const page=context.pages()[0];if(page)console.error('SCREEN', (await page.locator('body').innerText()).slice(0,8000));}console.error('REQUESTS',requests);process.exitCode=1;}finally{if(context)await context.close();await new Promise(r=>server.close(r));for(const p of profiles)await rm(p,{recursive:true,force:true});}
