import type { OutsideStreamBundle } from '../outside/types';
const DB='amelia-outside-stream-ledger-v1', STORE='records', ACTIVE='active-session';
type SessionRow={id:string;sessionId:string};
type BundleRow={id:string;bundle:OutsideStreamBundle};
function openDb():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{if(!indexedDB)return reject(new Error('IndexedDB unavailable'));const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:'id'});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function req<T>(r:IDBRequest<T>):Promise<T>{return new Promise((resolve,reject)=>{r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function done(tx:IDBTransaction):Promise<void>{return new Promise((resolve,reject)=>{tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
export class OutsideStreamStorage{
 static async loadActive():Promise<{sessionId:string;bundle:OutsideStreamBundle|null}>{const db=await openDb();try{let active=await req(db.transaction(STORE,'readonly').objectStore(STORE).get(ACTIVE)) as SessionRow|undefined; if(!active){const sessionId=crypto.randomUUID?.()??('outside-'+Date.now());const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put({id:ACTIVE,sessionId} satisfies SessionRow);await done(tx);active={id:ACTIVE,sessionId};}const row=await req(db.transaction(STORE,'readonly').objectStore(STORE).get('bundle:'+active.sessionId)) as BundleRow|undefined;return {sessionId:active.sessionId,bundle:row?.bundle??null};}finally{db.close();}}
 static async save(bundle:OutsideStreamBundle):Promise<void>{const db=await openDb();try{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put({id:ACTIVE,sessionId:bundle.sessionId} satisfies SessionRow);tx.objectStore(STORE).put({id:'bundle:'+bundle.sessionId,bundle} satisfies BundleRow);await done(tx);}finally{db.close();}}
}
