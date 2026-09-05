/**
 * runPaper6C1V6ExecutionCli.ts
 *
 * Direct execution runner for PAPER_6_C1_POTENTIATION_GRAMMAR_V6.
 */

import { Paper6C1PotentiationGrammarV6Engine } from './Paper6C1PotentiationGrammarV6Engine';

async function run() {
  const engine = new Paper6C1PotentiationGrammarV6Engine();
  const preflightSeal = '653d9e830e2f5b61405e3ba93f339cf0b39678ea82d3345d315264b18970e7e1';
  const seeds = [707, 808, 909, 111, 222, 333, 444, 555, 666, 741, 852, 963];

  const result = await engine.executeMatrix(seeds, preflightSeal);
  console.log(JSON.stringify(result, null, 2));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
