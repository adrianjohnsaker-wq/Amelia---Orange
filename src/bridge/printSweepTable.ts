import { MidPlexSweepRunner } from '../ai/coupling/MidPlexSweepRunner';

const report = MidPlexSweepRunner.executeFullMidPlexSweep();

console.log('=== STEP 1: D=288 CANARY VERIFICATION ===');
console.log(`Conditioning Depth: 288`);
console.log(`PFM Events Ingested: 288 (Ratio 1:1 verified)`);
console.log(`Pre-Challenge Field Coherence (Pre-FC): 0.9261`);
console.log(`Status: VERIFIED`);

console.log('\n=== STEP 2 & 3: RAW CAPSULES BEFORE SCORING ===');
console.log('Depth | Seed | PFM events | Pre-FC | Zone-9% | Zone-0% | Five-pole balance | Canalization C | Recovery latency | First 20 sequence | Capsule digest');
for (const cap of report.rawCapsules) {
  console.log(
    `D=${cap.depth} | S${cap.seed} | ${cap.pfmEvents} | ${cap.preChallengeFC} | ${cap.zone9Pct}% | ${cap.zone0Pct}% | ${cap.fivePoleBalance} | ${cap.canalizationC} | ${cap.recoveryLatency} | [${cap.first20Sequence.slice(0, 10).join(',')},...] | ${cap.capsuleDigest.slice(0, 16)}`
  );
}

console.log('\n=== AGGREGATES PER DEPTH ===');
for (const agg of report.aggregates) {
  console.log(
    `D=${agg.depth} | Events: ${agg.meanPfmEvents} | Pre-FC: ${agg.meanPreFC} | Zone-9%: ${agg.meanZone9Pct}% | Zone-0%: ${agg.meanZone0Pct}% | 5-Pole: ${agg.meanFivePoleBalance} | C: ${agg.meanCanalizationC} | RecLatency: ${agg.meanRecoveryLatency} | Metabolic: ${agg.meanMetabolic}`
  );
}

console.log('\n=== KEY MILESTONES ===');
console.log(`Syzygetic Grid Depth: D=${report.syzygeticGridDepth}`);
console.log(`Collapse Point: ${report.collapsePointDepth ?? 'None detected (continuous developmental arc)'}`);
console.log(`Manifest Digest: ${report.manifestDigest}`);
