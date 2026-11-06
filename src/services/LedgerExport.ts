/** Prepare a copy of the existing ledger without changing its records. */
export interface ExportableLedger {
  sessionId: string;
  verifyLedger(): Promise<{ valid: boolean; checked: number; reason?: string }>;
  exportJson(): string;
}

export async function prepareLedgerExport(bridge: ExportableLedger) {
  let check: { valid: boolean; checked: number; reason?: string };
  try { check = await bridge.verifyLedger(); }
  catch (error) {
    check = { valid: false, checked: 0, reason: error instanceof Error ? error.message : 'verification unavailable' };
  }
  const json = bridge.exportJson();
  const filename = 'amelia-outside-stream-' + bridge.sessionId.replace(/[^a-zA-Z0-9._-]/g, '_') + '.json';
  return { check, json, filename };
}

/** Android's bundled WebView does not implement ordinary blob downloads. */
export function isTabletAssetOrigin(hostname: string): boolean {
  return hostname === 'appassets.androidplatform.net';
}

/** Try the clipboard, then the selected-text fallback; the text stays visible if both fail. */
export async function copySelectedLedger(
  text: string,
  area: Pick<HTMLTextAreaElement, 'focus' | 'select'>,
  clipboard: Pick<Clipboard, 'writeText'> | undefined,
  copySelected: () => boolean,
): Promise<boolean> {
  area.focus();
  area.select();
  if (clipboard?.writeText) {
    try { await clipboard.writeText(text); return true; }
    catch { /* Some Android WebViews expose but reject the clipboard API. */ }
  }
  try { return copySelected(); }
  catch { return false; }
}
