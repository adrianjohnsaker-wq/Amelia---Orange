// src/outside/OutsideInbox.ts
var OUTSIDE_INBOX_SCHEMA = "amelia.outside-inbox/v1";
var OUTSIDE_INBOX_URL = "https://raw.githubusercontent.com/adrianjohnsaker-wq/Amelia---Orange/outside-live-ledger/outside-inbox.json";
var OUTSIDE_INBOX_SIZE = 500;
function buildOutsideInbox(records, cycle, updatedAt) {
  const entries = [];
  for (const r of records) {
    const own = r.snapshotAfter?.encounterDecisions?.find((d) => d.eventId === r.event.eventId);
    if (!own || !Array.isArray(own.attentionVector) || typeof own.sourceDigest !== "string")
      continue;
    entries.push({
      sequence: r.sequence,
      eventId: r.event.eventId,
      channel: own.channel ?? r.event.channel,
      sourceDigest: own.sourceDigest,
      attentionVector: [...own.attentionVector],
      occurredAt: r.event.occurredAt ?? "",
      capturedAt: r.event.capturedAt ?? ""
    });
  }
  return { schema: OUTSIDE_INBOX_SCHEMA, updatedAt, cycle, entries: entries.slice(-OUTSIDE_INBOX_SIZE) };
}
function validEntry(e) {
  const v = e?.attentionVector;
  const total = Array.isArray(v) ? v.reduce((a, b) => a + b, 0) : 0;
  return !!e && Number.isSafeInteger(e.sequence) && typeof e.eventId === "string" && /^[\w:.-]{1,160}$/.test(e.eventId) && typeof e.channel === "string" && /^[a-f0-9]{64}$/i.test(String(e.sourceDigest)) && Array.isArray(v) && v.length === 10 && v.every((x) => typeof x === "number" && Number.isFinite(x) && x >= 0 && x <= 1) && total > 0.99 && total < 1.01 && !Number.isNaN(Date.parse(e.capturedAt));
}
function parseOutsideInbox(value) {
  const inbox = value;
  if (!inbox || inbox.schema !== OUTSIDE_INBOX_SCHEMA || !Array.isArray(inbox.entries))
    throw new Error("Not an Amelia Outside inbox");
  return inbox.entries.filter(validEntry);
}
function seenEncounterIds(state) {
  const seen = new Set;
  for (const ev of state.memoryState?.events ?? [])
    for (const x of ev.encounters ?? [])
      if (x.eventId)
        seen.add(x.eventId);
  for (const x of state.deferredEncounters ?? [])
    if (x.eventId)
      seen.add(x.eventId);
  return seen;
}
function pendingOutside(entries, seen, since) {
  const t0 = Date.parse(since);
  return entries.filter((e) => !seen.has(e.eventId) && Date.parse(e.capturedAt) >= t0).sort((a, b) => a.sequence - b.sequence);
}
function toEncounter(e) {
  return {
    eventId: e.eventId,
    channel: e.channel,
    sourceDigest: e.sourceDigest,
    attentionVector: [...e.attentionVector]
  };
}
function readOutsideLink(value) {
  const v = value;
  if (!v || v.schema !== "amelia.outside-link/v1" || typeof v.enabled !== "boolean" || Number.isNaN(Date.parse(String(v.since))))
    return null;
  return { schema: "amelia.outside-link/v1", enabled: v.enabled, since: String(v.since) };
}
export {
  OUTSIDE_INBOX_SCHEMA,
  OUTSIDE_INBOX_SIZE,
  OUTSIDE_INBOX_URL,
  buildOutsideInbox,
  parseOutsideInbox,
  pendingOutside,
  readOutsideLink,
  seenEncounterIds,
  toEncounter
};
