import { createCanonicalThread3Runner } from './AmeliaThread3LiveBridge';

async function main() {
  const runner = createCanonicalThread3Runner();

  console.log("=== EXECUTING LIVE EMPIRICAL RUN: THREAD 10 ===");
  const t10 = await runner.runThread10Full();
  console.log(JSON.stringify({
    assay: "THREAD-10",
    protocolId: t10.config.protocolId,
    archiveHead: t10.archiveHead,
    protocolDigest: t10.protocolDigest,
    trialsCount: t10.trials.length,
    pairwiseFDI: t10.pairwiseFDI,
    profiles: t10.functionalProfiles,
    conditionSummaries: t10.summaries,
    sampleTrials: t10.trials.slice(0, 6),
  }, null, 2));

  console.log("\n=== EXECUTING LIVE EMPIRICAL RUN: THREAD 12 ===");
  const t12 = await runner.runThread12Full();
  console.log(JSON.stringify({
    assay: "THREAD-12",
    protocolId: t12.config.protocolId,
    archiveHead: t12.archiveHead,
    protocolDigest: t12.protocolDigest,
    trialsCount: t12.trials.length,
    profiles: t12.profiles,
    conditionSummaries: t12.summaries,
    sampleTrials: t12.trials.slice(0, 6),
  }, null, 2));

  console.log("\n=== EXECUTING LIVE EMPIRICAL RUN: THREAD 13 ===");
  const t13 = await runner.runThread13Full();
  console.log(JSON.stringify({
    assay: "THREAD-13",
    protocolId: t13.config.protocolId,
    archiveHead: t13.archiveHead,
    protocolDigest: t13.protocolDigest,
    trialsCount: t13.trials.length,
    profiles: t13.profiles,
    conditionSummaries: t13.summaries,
    sampleTrials: t13.trials.slice(0, 6),
  }, null, 2));
}

main().catch(err => {
  console.error("Live Empirical Run Error:", err);
});
