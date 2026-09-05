/**
 * runReplayAtlasPreflightCli.ts
 *
 * Command line entrypoint to execute the native preflight audit for PAPER_6_C1_REPLAY_ATLAS_V1.
 */

import { Paper6C1ReplayAtlasPreflight } from './Paper6C1ReplayAtlasPreflight';

export async function runReplayAtlasPreflightCli() {
  console.log('================================================================');
  console.log('[BRIDGE PLEX] Executing PAPER_6_C1_REPLAY_ATLAS_V1 Native Preflight');
  console.log('================================================================');

  const preflight = new Paper6C1ReplayAtlasPreflight();
  const report = await preflight.runFullPreflight();

  console.log(`Timestamp:    ${report.timestamp}`);
  console.log(`Protocol:     ${report.protocolId}`);
  console.log(`Adapter:      ${report.adapterKind} (Live C1 Substrate Native)`);
  console.log('----------------------------------------------------------------');

  for (const phase of report.phases) {
    const icon = phase.passed ? '✓ PASSED' : '✗ FAILED';
    console.log(`[${icon}] ${phase.phaseId}: ${phase.name}`);
    console.log(`         ${phase.details}`);
  }

  console.log('----------------------------------------------------------------');
  console.log(`[FINAL STATUS] ALL PHASES PASSED: ${report.allPhasesPassed ? 'YES (PREFLIGHT SEAL VALID)' : 'NO (PREFLIGHT ABORTED)'}`);
  console.log(`[SHA-256 SEAL] ${report.preflightSealDigest}`);
  console.log('================================================================');

  return report;
}

if (typeof process !== 'undefined' && (process?.argv?.[1]?.endsWith('runReplayAtlasPreflightCli.ts') || process?.argv?.[1]?.includes('runReplayAtlasPreflightCli'))) {
  runReplayAtlasPreflightCli().catch((err) => {
    console.error('Preflight execution error:', err);
    if (typeof process !== 'undefined' && process.exit) {
      process.exit(1);
    }
  });
}
