import { createHash } from 'node:crypto';
import type { OutsideStreamRecord } from './types';
import type { RecoveryAction } from './OutsideRecoveryRuntime';
import type { SubstrateEncounterInput } from './encounterTypes';

const SCHEMA = 'amelia.outside-recovery-journal/v1';
const sha = (s:string) => createHash('sha256').update(s, 'utf8').digest('hex');
function canonical(value:unknown):string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  const obj=value as Record<string,unknown>;
  return '{'+Object.keys(obj).filter(k=>obj[k]!==undefined).sort().map(k=>JSON.stringify(k)+':'+canonical(obj[k])).join(',')+'}';
}
type JournalLine = { schema:string; sequence:number; previousDigest:string|null; event:Record<string,unknown>; digest:string };
function lineDigest(line:Omit<JournalLine,'digest'>) { return sha(canonical(line)); }

export function verifyRecoveryJournal(raw:string): {count:number; head:string|null; lastEvent:Record<string,unknown>|null} {
  let previous:string|null=null, count=0, lastEvent:Record<string,unknown>|null=null;
  for (const text of raw.split('\n')) {
    if (!text) continue;
    const line=JSON.parse(text) as JournalLine;
    const unsigned={schema:line.schema,sequence:line.sequence,previousDigest:line.previousDigest,event:line.event};
    if (line.schema!==SCHEMA || line.sequence!==count+1 || line.previousDigest!==previous || line.digest!==lineDigest(unsigned))
      throw new Error(`Recovery journal chain invalid at record ${count+1}.`);
    previous=line.digest;lastEvent=line.event;count++;
  }
  return {count,head:previous,lastEvent};
}

export function appendRecoveryJournal(raw:string, events:Record<string,unknown>[]):string {
  const start=verifyRecoveryJournal(raw);let previous=start.head,count=start.count;
  let out=raw && !raw.endsWith('\n') ? raw+'\n' : raw;
  for (const event of events) {
    const unsigned={schema:SCHEMA,sequence:++count,previousDigest:previous,event};
    const digest=lineDigest(unsigned);out+=JSON.stringify({...unsigned,digest})+'\n';previous=digest;
  }
  return out;
}

/** Bind an admission to the originally captured ledger record, not the retry. */
export function originalOffer(records:OutsideStreamRecord[], input:Pick<SubstrateEncounterInput,'eventId'|'sourceDigest'>) {
  const matches=records.filter(r=>r.event.eventId===input.eventId && r.runtimeSignalDigest===input.sourceDigest);
  if (matches.length!==1) throw new Error(`Expected one original offer for ${input.eventId}; found ${matches.length}.`);
  const record=matches[0];
  const decision=record.snapshotAfter?.encounterDecisions?.find(d=>d.eventId===input.eventId && d.sourceDigest===input.sourceDigest);
  if (!decision || !record.event.capturedAt || !record.snapshotAfter?.step)
    throw new Error(`Original offer is incomplete for ${input.eventId}.`);
  return {eventId:input.eventId,sourceDigest:input.sourceDigest,recordDigest:record.recordDigest,
    sequence:record.sequence,channel:record.event.channel,occurredAt:record.event.occurredAt,
    capturedAt:record.event.capturedAt,offerStep:record.snapshotAfter.step,initialDisposition:decision.disposition};
}

export function enrichRecoveryActions(actions:RecoveryAction[], records:OutsideStreamRecord[]):Record<string,unknown>[] {
  return actions.map(action=>{
    if (action.kind==='CONSOLIDATION') return {...action};
    const offer=originalOffer(records,action);
    if (action.kind==='OFFER' && (offer.offerStep!==action.step || offer.initialDisposition!==action.disposition))
      throw new Error(`Offer receipt does not match the ledger for ${action.eventId}.`);
    if (action.kind==='ADMISSION' && (action.wasDeferred ? offer.offerStep>=action.step : offer.offerStep!==action.step))
      throw new Error(`Admission is not aligned to the original offer for ${action.eventId}.`);
    return {...action,originalOffer:offer};
  });
}
