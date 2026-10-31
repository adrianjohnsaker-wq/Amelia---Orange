import React, { useEffect, useMemo, useState } from 'react';
import { Download, RefreshCw, ShieldCheck, ShieldAlert, Eye } from 'lucide-react';
import { WatchtowerEncounterRecord, WatchtowerEncounterService } from '../services/WatchtowerEncounterService';

export function WatchtowerEncounterAtlas() {
  const [records, setRecords] = useState<WatchtowerEncounterRecord[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [verification, setVerification] = useState<{ valid: boolean; checked: number; error?: string } | null>(null);

  const refresh = async () => {
    const next = await WatchtowerEncounterService.list(2000);
    setRecords(next);
    setVerification(await WatchtowerEncounterService.verify(next));
  };
  useEffect(() => {
    void refresh();
    return WatchtowerEncounterService.subscribe(() => { void refresh(); });
  }, []);

  const patterns = useMemo(() => {
    const byRoute = new Map<string, WatchtowerEncounterRecord[]>();
    for (const record of records) {
      const key = `${record.lineageId} · ${record.state.route}`;
      byRoute.set(key, [...(byRoute.get(key) ?? []), record]);
    }
    return [...byRoute.entries()].filter(([, hits]) => hits.length > 1)
      .map(([route, hits]) => ({ route, hits }))
      .sort((a, b) => b.hits.length - a.hits.length);
  }, [records]);

  const exportJsonl = () => {
    const contents = records.map(record => JSON.stringify(record)).join('\n');
    const url = URL.createObjectURL(new Blob([contents], { type: 'application/x-ndjson' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'amelia-watchtower-encounters.jsonl';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const focused = records.find(record => record.id === selected);
  return (
    <div className="p-4 md:p-6 space-y-5 text-stone-200">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-amber-300 flex items-center gap-2"><Eye className="w-5 h-5" /> Watchtower Encounter Atlas</h2>
          <p className="text-sm text-stone-400 mt-1">The Watchtower steers dialogue attention; this atlas describes recurrence in the resulting recorded traces.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void refresh()} className="px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-xs flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5" /> Verify archive</button>
          <button onClick={exportJsonl} disabled={!records.length} className="px-3 py-2 rounded-lg bg-amber-600/20 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2 disabled:opacity-40"><Download className="w-3.5 h-3.5" /> Export JSONL</button>
        </div>
      </header>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-stone-900 border border-stone-800"><div className="text-xs text-stone-500">Recorded encounters</div><div className="text-2xl font-mono">{records.length}</div></div>
        <div className="p-3 rounded-lg bg-stone-900 border border-stone-800"><div className="text-xs text-stone-500">Recurring exact routes</div><div className="text-2xl font-mono">{patterns.length}</div></div>
        <div className="p-3 rounded-lg bg-stone-900 border border-stone-800"><div className="text-xs text-stone-500">Trace chain</div><div className="text-sm mt-1 flex items-center gap-2">{verification?.valid ? <><ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified · {verification.checked}</> : verification ? <><ShieldAlert className="w-4 h-4 text-rose-400" /> {verification.error}</> : 'Checking…'}</div></div>
      </div>

      <section className="rounded-xl border border-stone-800 bg-stone-950/60 p-4">
        <h3 className="font-semibold text-amber-200">Recurring passage patterns</h3>
        <p className="text-xs text-stone-500 mt-1">Exact route recurrence within a local lineage. This is descriptive pattern matching and does not classify or establish an agent.</p>
        {patterns.length ? <div className="mt-3 space-y-2">{patterns.map(pattern => (
          <div key={pattern.route} className="rounded-lg border border-stone-800 p-3">
            <div className="font-mono text-sm">{pattern.route}</div>
            <div className="text-xs text-stone-500 mt-1">{pattern.hits.length} encounters · steps {pattern.hits.map(hit => hit.state.after.step).join(', ')}</div>
            <div className="flex flex-wrap gap-1 mt-2">{pattern.hits.map(hit => <button key={hit.id} onClick={() => setSelected(hit.id)} className="text-[10px] font-mono text-cyan-300 underline">#{hit.sequence} · {hit.id.slice(-8)}</button>)}</div>
          </div>
        ))}</div> : <p className="text-sm text-stone-500 mt-3">No exact route has recurred in the saved encounters yet.</p>}
      </section>

      <section className="rounded-xl border border-stone-800 bg-stone-950/60 p-4">
        <h3 className="font-semibold">Encounter traces <span className="text-xs text-stone-500 font-normal">· source lineage and digests retained</span></h3>
        <div className="mt-3 max-h-80 overflow-auto divide-y divide-stone-800">{[...records].reverse().map(record => (
          <button key={record.id} onClick={() => setSelected(record.id)} className={`w-full text-left py-3 px-2 ${selected === record.id ? 'bg-stone-800/70' : 'hover:bg-stone-900'}`}>
            <div className="flex justify-between gap-3 text-sm"><span>#{record.sequence} · {record.aperture.focusLabel}</span><span className="text-xs text-stone-500">step {String(record.state.after.step)} · {new Date(record.timestamp).toLocaleString()}</span></div>
            <div className="font-mono text-xs text-cyan-300 mt-1">{record.state.route} · input zone {record.state.inputZone ?? 'unavailable'}</div>
            <div className="text-[10px] text-stone-500 mt-1">{record.id} · {record.recordDigest.slice(0, 24)}…</div>
          </button>
        ))}{!records.length && <p className="text-sm text-stone-500 py-4">Each new dialogue encounter will appear here with its raw exchange and state trace.</p>}</div>
      </section>

      {focused && <section className="rounded-xl border border-amber-700/40 bg-stone-950/70 p-4 space-y-3">
        <div className="flex justify-between"><h3 className="font-semibold text-amber-200">Encounter #{focused.sequence} source record</h3><button onClick={() => setSelected(null)} className="text-xs text-stone-500">Close</button></div>
        <div className="text-xs text-stone-400">{focused.aperture.rowLabel} · {focused.aperture.rowSignature} · {focused.aperture.focusDescription}</div>
        <div className="rounded bg-stone-900 p-3 text-sm"><div className="text-xs text-amber-300 mb-1">Observed focus</div>{focused.aperture.observed}</div>
        <div className="rounded bg-stone-900 p-3"><div className="text-xs text-stone-500">Raw user signal · SHA-256 {focused.raw.userSha256}</div><p className="text-sm whitespace-pre-wrap mt-2">{focused.raw.userText}</p></div>
        <div className="rounded bg-stone-900 p-3"><div className="text-xs text-stone-500">Raw reply · {focused.raw.replySource} · SHA-256 {focused.raw.replySha256}</div><p className="text-sm whitespace-pre-wrap mt-2">{focused.raw.replyText}</p></div>
        <details className="text-xs"><summary className="cursor-pointer text-cyan-300">Full state, PFM path, and provenance</summary><pre className="whitespace-pre-wrap break-all overflow-auto max-h-96 mt-2 p-3 rounded bg-black/50">{JSON.stringify({ lineageId: focused.lineageId, messageIds: focused.messageIds, state: focused.state, recurrence: focused.recurrence, previousRecordDigest: focused.previousRecordDigest, recordDigest: focused.recordDigest, rawUtf8Base64: { user: focused.raw.userUtf8Base64, reply: focused.raw.replyUtf8Base64 } }, null, 2)}</pre></details>
      </section>}
    </div>
  );
}
