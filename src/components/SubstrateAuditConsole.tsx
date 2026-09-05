import React from 'react';
import { SubstrateStepSnapshot } from '../types/amelia';
import { Terminal, Download, Copy, Trash2, CheckCircle2 } from 'lucide-react';

interface SubstrateAuditConsoleProps {
  logs: string[];
  currentSnapshot: SubstrateStepSnapshot;
}

export const SubstrateAuditConsole: React.FC<SubstrateAuditConsoleProps> = ({
  logs,
  currentSnapshot
}) => {
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentSnapshot, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `amelia-audit-step-${currentSnapshot.step}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-center text-amber-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-200 font-mono">
                Substrate Governor Audit Stream
              </h3>
              <p className="text-xs text-stone-400 font-mono">
                Experimentally auditable sequence traces & invariant state transitions
              </p>
            </div>
          </div>

          <button
            onClick={handleExportJson}
            className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono font-semibold flex items-center gap-1.5 border border-stone-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            Export Step JSON
          </button>
        </div>

        {/* Console Log Terminal */}
        <div className="p-4 rounded-xl bg-stone-950 border border-stone-800/90 font-mono text-xs text-stone-300 h-80 overflow-y-auto space-y-1.5 shadow-inner">
          {logs.map((log, index) => {
            const isGovernor = log.includes('[GOVERNOR]');
            const isCanalization = log.includes('[CANALIZATION]');
            const isP6 = log.includes('[PAPER6]');
            const isFirebase = log.includes('[FIREBASE]');

            return (
              <div
                key={index}
                className={`py-0.5 leading-relaxed ${
                  isGovernor
                    ? 'text-emerald-400'
                    : isCanalization
                    ? 'text-cyan-400'
                    : isP6
                    ? 'text-rose-400'
                    : isFirebase
                    ? 'text-amber-400'
                    : 'text-stone-400'
                }`}
              >
                <span className="text-stone-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                {log}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
