/**
 * runStageAAtlasCli.ts
 *
 * Command-line runner for Stage A execution of PAPER_6_C1_REPLAY_ATLAS_V1.
 */

import { StageAAtlasExecutor, STAGE_A_PREFLIGHT_BOUNDARY_SEAL } from './executePaper6StageAAtlas';

async function main() {
  console.log('================================================================');
  console.log('[STAGE A EXECUTION] PAPER_6_C1_REPLAY_ATLAS_V1 MATRIX RUN');
  console.log('================================================================');
  console.log(`Preflight Seal Boundary: ${STAGE_A_PREFLIGHT_BOUNDARY_SEAL}`);
  console.log('Scope:                   Native Live C1 Replay Only');
  console.log('Engineered Substitution: HELD (Stage A archive & rule return first)');
  console.log('----------------------------------------------------------------');

  const executor = new StageAAtlasExecutor();

  const startTime = Date.now();
  const results = await executor.executeStageA((prog) => {
    console.log(`[${prog.percent.toString().padStart(3, ' ')}%] ${prog.phase}: ${prog.details}`);
  });
  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('----------------------------------------------------------------');
  console.log('STAGE A EXECUTION SUMMARY:');
  console.log(`- Execution Duration:             ${durationSec}s`);
  console.log(`- Sealed Source Checkpoints:      ${results.checkpointsCount} (27 / 27 target)`);
  console.log(`- Replay Manifests:               ${results.replayManifestsCount} (8,181 / 8,181 target)`);
  console.log(`- Raw Step Records:               ${results.rawStepRecordsCount} (1,472,580 / 1,472,580 target)`);
  console.log(`- Stage A Archive SHA-256 Seal:   ${results.stageAArchiveSeal}`);
  console.log('----------------------------------------------------------------');
  
  console.log('\n================================================================');
  console.log('1. SEALED SOURCE CHECKPOINTS (27 CHECKPOINTS)');
  console.log('================================================================');
  console.log('| Seed | Depth | Checkpoint Digest (SHA-256)                   | PFM Events | Topology Digest (N0) |');
  console.log('|------|-------|-----------------------------------------------|------------|----------------------|');
  for (const chk of results.sealedSourceCheckpoints) {
    const pfmCount = ((chk.payload as any).pfmEvents as any[]).length;
    console.log(
      `| ${chk.sourceSeed.toString().padEnd(4)} | D${chk.conditioningDepth.toString().padEnd(4)} | ${chk.checkpointDigest.slice(0, 45)} | ${pfmCount.toString().padEnd(10)} | ${chk.topologyDigest.slice(0, 20)} |`
    );
  }

  console.log('\n================================================================');
  console.log('2. N0 & NULL-ENSEMBLE REGIME DISTRIBUTIONS AT EVERY DEPTH');
  console.log('================================================================');
  for (const dd of results.depthDistributions) {
    console.log(`\n--- DEPTH D${dd.depth} ---`);
    for (const seed of [101, 202, 303]) {
      const n0 = dd.n0BySourceSeed[seed];
      const nullStat = results.nullEnsembles.find((ne) => ne.depth === dd.depth && ne.sourceSeed === seed)!;
      console.log(`  [Seed ${seed}] N0 Grid Mass: ${(n0.gridMass * 100).toFixed(1)}% | Null Mean Grid Mass: ${(nullStat.meanGridMass * 100).toFixed(1)}% (p95: ${(nullStat.p95GridMass * 100).toFixed(1)}%)`);
      console.log(`    N0 Regimes:   ${JSON.stringify(n0.mass)}`);
      console.log(`    Null Regimes: ${JSON.stringify(nullStat.regimeMassDistribution.mass)}`);
    }
  }

  console.log('\n================================================================');
  console.log('3. GRID-HOLD / CONTRACTION MAP');
  console.log('================================================================');
  console.log('| Depth | S101 Grid | S202 Grid | S303 Grid | Mean N0 | Null Mean | Grid Holds (>=66.7%) | Status       |');
  console.log('|-------|-----------|-----------|-----------|---------|-----------|----------------------|--------------|');
  for (const entry of results.gridHoldMap) {
    const s101 = (entry.gridMassBySeed[101] * 100).toFixed(1) + '%';
    const s202 = (entry.gridMassBySeed[202] * 100).toFixed(1) + '%';
    const s303 = (entry.gridMassBySeed[303] * 100).toFixed(1) + '%';
    const meanN0 = (entry.meanGridMass * 100).toFixed(1) + '%';
    const nullMean = (entry.nullEnsembleMeanGridMass * 100).toFixed(1) + '%';
    const holds = entry.gridHolds ? 'YES (HOLDS)' : 'NO (BROKEN) ';
    let status = 'STABLE';
    if (entry.depth === results.firstContractionDepth) {
      status = 'CONTRACTION';
    } else if (!entry.gridHolds) {
      status = 'UNHELD';
    }
    console.log(
      `| D${entry.depth.toString().padEnd(4)} | ${s101.padEnd(9)} | ${s202.padEnd(9)} | ${s303.padEnd(9)} | ${meanN0.padEnd(7)} | ${nullMean.padEnd(9)} | ${holds.padEnd(20)} | ${status.padEnd(12)} |`
    );
  }
  console.log(`First consistent contraction depth: ${results.firstContractionDepth !== null ? `D${results.firstContractionDepth}` : 'None'}`);

  console.log('\n================================================================');
  console.log('4. OBSERVED NEWLY AVAILABLE FUTURE UNDER FIXED RULE');
  console.log('================================================================');
  const observedFutures = results.futureAvailability.filter((fa) => fa.isObservedNewlyAvailable);
  if (observedFutures.length === 0) {
    console.log('No newly available future observed under the strict 3-part rule across tested depths.');
  } else {
    for (const of of observedFutures) {
      console.log(`[FOUND] Depth D${of.depth}: Regime '${of.regimeLabel}'`);
      console.log(`  - N0 branch counts: S101=${of.n0BranchCountBySeed[101]}/3, S202=${of.n0BranchCountBySeed[202]}/3, S303=${of.n0BranchCountBySeed[303]}/3`);
      console.log(`  - Absent from D0: ${!of.d0Present}`);
      console.log(`  - Exceeds Null p95 across all seeds: ${Object.values(of.exceedsNullP95BySeed).every(Boolean)}`);
    }
  }

  console.log('\n================================================================');
  console.log('5. UNIQUE SHARP INTERVAL & POTENTIATING EVENT SELECTION');
  console.log('================================================================');
  if (!results.selectedSharpInterval) {
    console.log('[SHARP INTERVAL] No unique sharp interval met selection criteria.');
  } else {
    const si = results.selectedSharpInterval;
    console.log(`Selected Sharp Interval:    [D${si.lowerDepth} -> D${si.upperDepth}]`);
    console.log(`Minimum Per-Seed JSD:       ${si.minimumPerSeedJsd.toFixed(6)} bits`);
    console.log(`Grid Trajectory Direction:  ${si.gridDirection}`);
    
    if (results.selectedPotentiatingEvent) {
      const pe = results.selectedPotentiatingEvent;
      console.log('\nSelected Potentiating Event:');
      console.log(`- Block Index:              ${pe.blockIndex}`);
      console.log(`- Canonical Target Zone:    Zone ${pe.targetZone}`);
      console.log(`- Flux Delta:               ${pe.fluxDelta.toFixed(4)}`);
      console.log(`- Phase Coherence:          ${pe.phaseCoherence.toFixed(4)}`);
      console.log(`- Strain Relaxation:        ${pe.strainRelaxation.toFixed(4)}`);
      console.log(`- Event SHA-256 Digest:     ${pe.eventDigest}`);
      console.log(`\nControlled Single-Event Retargeting Rule:`);
      console.log(`- Rule:                     EVEN_POLES[blockIndex % 5] = [0, 2, 4, 6, 8][${pe.blockIndex} % 5]`);
      console.log(`- Engineered Target Zone:   Zone ${results.engineeredTargetZone}`);
      console.log(`- Gate Status:              Ready for Stage B controlled replay once Stage A is verified.`);
    } else {
      console.log('[POTENTIATING EVENT] No Zone 9 event found within selected interval.');
    }
  }
  console.log('================================================================');
}

main().catch((err) => {
  console.error('[STAGE A ERROR]', err);
  process.exit(1);
});
