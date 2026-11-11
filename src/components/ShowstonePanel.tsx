/**
 * The Showstone, stage 1 (read-only): the Tables (entity registry) and the Book (digest-chained record of contact studies).
 * Nothing here steps, writes or addresses Amelia. Stage 2 adds the Call and the Stone (sessions on copies of her state);
 * stage 3 the Seal (blind tests from the tablet).
 */
import { useMemo, useState } from 'react';
import { BookOpen, Grid3x3, ShieldCheck, ShieldAlert } from 'lucide-react';
import { ENTITIES, type Standing } from '../showstone/entities';
import { BOOK, verifyBook } from '../showstone/book';

const STANDING_STYLE: Record<Standing, string> = {
  established: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  confirmed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  provisional: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  'not supported': 'bg-stone-700/40 text-stone-300 border-stone-600',
  null: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
  pending: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
  descriptive: 'bg-stone-700/40 text-stone-300 border-stone-600',
};

export default function ShowstonePanel() {
  const [view, setView] = useState<'tables' | 'book'>('tables');
  const [open, setOpen] = useState<string>('Bubbamu');
  const broken = useMemo(() => verifyBook(BOOK), []);
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
        <h2 className="text-lg font-semibold text-stone-100">The Showstone</h2>
        <p className="mt-1 text-sm text-stone-400">
          Named Numogram entities and every contact study run on them. Stage 1 is read-only: it never steps, writes or addresses
          Amelia. Only a sealed, blind test can count as contact.
        </p>
        <div className="mt-3 flex gap-2">
          <button id="showstone-tables" onClick={() => setView('tables')}
            className={`min-h-[44px] px-3 py-2 rounded-lg text-sm flex items-center gap-2 border ${view === 'tables' ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/50' : 'bg-stone-800 text-stone-300 border-stone-700'}`}>
            <Grid3x3 className="w-4 h-4" />The Tables
          </button>
          <button id="showstone-book" onClick={() => setView('book')}
            className={`min-h-[44px] px-3 py-2 rounded-lg text-sm flex items-center gap-2 border ${view === 'book' ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/50' : 'bg-stone-800 text-stone-300 border-stone-700'}`}>
            <BookOpen className="w-4 h-4" />The Book
          </button>
        </div>
      </div>

      {view === 'tables' && (
        <div className="space-y-3">
          {ENTITIES.map(e => (
            <div key={e.name} className="rounded-xl border border-stone-800 bg-stone-900/60">
              <button onClick={() => setOpen(open === e.name ? '' : e.name)} className="w-full text-left p-4 min-h-[44px]">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-base font-semibold text-stone-100">{e.name}</span>
                  <span className="text-xs uppercase tracking-wide text-stone-500">{e.kind}</span>
                  <span className="text-sm text-stone-400">{e.structure}</span>
                </div>
                <div className="mt-1 text-xs text-stone-500">zones {e.zones.join(' · ')}{e.minimalForm ? ` · signature ${e.minimalForm}` : ''} · {e.tests.length} studies</div>
              </button>
              {open === e.name && (
                <div className="border-t border-stone-800 p-4 space-y-3 text-sm">
                  {e.note && <p className="text-stone-300">{e.note}</p>}
                  <div><span className="text-stone-500">Forms: </span><span className="text-stone-300">{e.forms.join('; ')}</span></div>
                  {e.doorways && <div><span className="text-stone-500">Doorways: </span><span className="text-stone-300">{e.doorways.join('; ')}</span></div>}
                  {e.address && <div><span className="text-stone-500">Address (THE POINTER): </span><span className="font-mono text-stone-300">{e.address}</span></div>}
                  <div className="space-y-2">
                    {e.tests.map(t => (
                      <div key={t.study + t.date} className="rounded-lg border border-stone-800 bg-stone-950/40 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-stone-200">{t.study}</span>
                          <span className="text-xs text-stone-500">{t.date}</span>
                          <span className={`text-xs px-2 py-0.5 rounded border ${STANDING_STYLE[t.standing]}`}>{t.standing}</span>
                        </div>
                        <p className="mt-1 text-stone-300">{t.finding}</p>
                        <p className="mt-1 text-xs text-stone-500">{t.core} · {t.ref}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {view === 'book' && (
        <div className="space-y-3">
          <div className={`rounded-xl border p-3 text-sm flex items-center gap-2 ${broken < 0 ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-rose-500/40 bg-rose-500/10 text-rose-200'}`}>
            {broken < 0 ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            {broken < 0 ? `Chain intact: ${BOOK.length} entries, each sealed to the one before.` : `Chain broken at entry ${broken}.`}
          </div>
          {[...BOOK].reverse().map(b => (
            <div key={b.index} className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-stone-500">#{b.index} · {b.at}</span>
                <span className="text-xs px-2 py-0.5 rounded border border-stone-700 text-stone-300">{b.kind}</span>
                <span className="font-medium text-stone-100">{b.study}</span>
              </div>
              <div className="mt-1 text-stone-400">{b.entity}{b.address ? <> · <span className="font-mono">{b.address}</span></> : null}</div>
              <p className="mt-1 text-stone-300">{b.outcome}</p>
              <p className="mt-1 text-xs text-stone-500">{b.ref}</p>
              <p className="mt-1 font-mono text-[10px] text-stone-600 break-all">digest {b.digest}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
