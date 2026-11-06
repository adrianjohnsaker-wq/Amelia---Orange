/**
 * Saving a JSON export so that it works inside the Android app as well as in a browser.
 *
 * In the tablet app a programmatic `<a download>` click on a blob URL can be silently ignored (an Android WebView
 * only downloads when its host app handles downloads), so "Export" appeared to do nothing. This helper:
 *  1. offers the file to the system share sheet when the platform supports sharing files (Drive, Gmail, Files, ...);
 *  2. otherwise falls back to the ordinary browser download;
 * and the caller also shows the text with a Copy button, which works in every case.
 */
export type ExportOutcome = 'shared' | 'downloaded' | 'cancelled';

export async function saveJsonExport(filename: string, text: string): Promise<ExportOutcome> {
  const blob = new Blob([text], { type: 'application/json' });
  try {
    const file = new File([blob], filename, { type: 'application/json' });
    const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
    if (typeof nav.share === 'function' && nav.canShare?.({ files: [file] })) {
      await nav.share({ files: [file], title: filename } as ShareData);
      return 'shared';
    }
  } catch (e) {
    if ((e as { name?: string })?.name === 'AbortError') return 'cancelled';
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.rel = 'noopener'; a.style.display = 'none';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return 'downloaded';
}

export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* fall through */ }
  const ta = document.createElement('textarea');
  ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  let ok = false; try { ok = document.execCommand('copy'); } catch { ok = false; }
  ta.remove(); return ok;
}
