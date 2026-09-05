import { createCanonicalThread3Runner } from './AmeliaThread3LiveBridge';

async function main() {
  const runner = createCanonicalThread3Runner();
  
  const t10 = await runner.runThread10Full();
  const t12 = await runner.runThread12Full();
  const t13 = await runner.runThread13Full();

  console.log("=== BEGIN RAW EMPIRICAL EXPORT ===");
  console.log(JSON.stringify({
    thread10: {
      protocolId: t10.config.protocolId,
      protocolDigest: t10.protocolDigest,
      archiveHead: t10.archiveHead,
      trialsCount: t10.trials.length,
      pairwiseFDI: t10.pairwiseFDI,
      conditionProfiles: t10.functionalProfiles,
      conditionSummaries: t10.summaries,
    },
    thread12: {
      protocolId: t12.config.protocolId,
      protocolDigest: t12.protocolDigest,
      archiveHead: t12.archiveHead,
      trialsCount: t12.trials.length,
      doubleDissociationProfiles: t12.profiles,
      conditionSummaries: t12.summaries,
    },
    thread13: {
      protocolId: t13.config.protocolId,
      protocolDigest: t13.protocolDigest,
      archiveHead: t13.archiveHead,
      trialsCount: t13.trials.length,
      autonomyProfiles: t13.profiles,
      conditionSummaries: t13.summaries,
    }
  }, null, 2));
  console.log("=== END RAW EMPIRICAL EXPORT ===");
}

main().catch(console.error);
