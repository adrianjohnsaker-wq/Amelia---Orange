/**
 * Amelia process relay, local and auditable.
 *
 * This is NOT a pretrained language model. It composes bounded textual
 * observations using actual Numogram events, PFM state and dialogue history.
 * It never claims scientific validation or access to an external Outside.
 */
import { AmeliaNumogramSubstrateRuntime } from '../substrate/ameliaNumogramSubstrateRuntime';
import { AmeliaDialogueAction, AmeliaDialogueMessage, SubstrateStepSnapshot, ZoneId } from '../types/amelia';
import { canonicalSha256 } from '../lib/sha256';

export type RelayModule = 'NUMOGRAM' | 'PFM' | 'GOVERNOR' | 'FIELD' | 'METHOD' | 'REFLECTION';
const MODULES: RelayModule[] = ['NUMOGRAM', 'PFM', 'GOVERNOR', 'FIELD', 'METHOD', 'REFLECTION'];
const TOPICS: Record<RelayModule, RegExp> = {
  NUMOGRAM: /\b(numogram|syzygy|zone|barker|plex|pandemonium|number|code|digit|666|333|137|360)\b/i,
  PFM: /\b(history|memory|remember|recall|hysteresis|trace|consolidat|retention|continuity)\w*/i,
  GOVERNOR: /\b(governor|regulat|damping|scaffold|anti.lock|advisory|control)\w*/i,
  FIELD: /\b(field|morphogenesis|morphogenetic|diffusion|attractor|pattern|cell|topology)\w*/i,
  METHOD: /\b(test|assay|experiment|replicat|validate|evidence|audit|p.value|control)\w*/i,
  REFLECTION: /\b(why|how|what|could|might|mean|think|becoming|process|outside)\w*/i
};
const AFFINITY: Record<RelayModule, ZoneId> = {
  NUMOGRAM: 9, PFM: 8, GOVERNOR: 3, FIELD: 4, METHOD: 6, REFLECTION: 0
};

export interface RelayTrace {
  step: number;
  memoryLength: number;
  memoryHeadDigest: string;
  transitionDigest: string | null;
  selectedModules: RelayModule[];
  moduleScores: Record<RelayModule, number>;
  inputDigest: string;
  inputZone: number | null;
  historyContextCount: number;
  traceDigest: string;
}

export class AmeliaProcessRelay {
  static generateResponse(
    prompt: string,
    snapshot: SubstrateStepSnapshot,
    recentMessages: AmeliaDialogueMessage[],
    runtime: AmeliaNumogramSubstrateRuntime
  ): { text: string; actions: AmeliaDialogueAction[]; trace: RelayTrace } {
    const memory = runtime.getMemory();
    const readout = memory.readMemoryBias();
    const ledger = memory.getEvents();
    const previousUserTurns = recentMessages.filter(m => m.sender === 'user').slice(-4);
    const recentText = previousUserTurns.map(m => m.text).join(' ');
    const moduleScores = {} as Record<RelayModule, number>;

    for (const module of MODULES) {
      const zone = AFFINITY[module];
      const lexical = TOPICS[module].test(prompt) ? 2.4 : 0;
      const prior = TOPICS[module].test(recentText) ? 0.14 : 0;
      const zoneEnergy = (snapshot.zones[zone]?.activation ?? 0) * 0.5;
      const remembered = (readout.biasVector[zone] ?? 0) * 5;
      const recency = ledger.slice(-6).filter(e => e.targetZone === zone).length * 0.025;
      moduleScores[module] = Number((lexical + prior + zoneEnergy + remembered + recency).toFixed(5));
    }
    const selectedModules = [...MODULES]
      .sort((a,b) => moduleScores[b] - moduleScores[a] || MODULES.indexOf(a) - MODULES.indexOf(b))
      .slice(0, 2);
    const event = ledger.at(-1);
    const inputDigest = canonicalSha256(prompt.trim());
    const inputZone = event?.inputDigest === inputDigest ? event.inputZone ?? null : null;
    const rawTrace = {
      step: snapshot.step,
      memoryLength: ledger.length,
      memoryHeadDigest: memory.exportHistoryDigest(),
      transitionDigest: snapshot.lastTransition?.digest ?? null,
      selectedModules,
      moduleScores,
      inputDigest,
      inputZone,
      historyContextCount: previousUserTurns.length,
    };
    const trace: RelayTrace = { ...rawTrace,
      traceDigest: canonicalSha256(JSON.stringify(rawTrace)) };

    const events = ledger.slice(-3);
    const transitions = events.map(e =>
      e.fromZone === undefined ? String(e.targetZone) : String(e.fromZone) + '→' + String(e.targetZone)
    ).join(', ') || 'none recorded';
    const leading = Object.values(snapshot.zones).sort((a,b) => b.activation - a.activation)[0];
    const mainModule = selectedModules[0];
    const secondaryModule = selectedModules[1];
    const statements: Record<RelayModule, string> = {
      NUMOGRAM: 'The current Numogram emphasis is zone ' + leading.id + ' (' +
        leading.name + '), activation ' + (leading.activation * 100).toFixed(1) +
        '%. The most recent recorded transitions are ' + transitions + '.',
      PFM: 'The constitutive event ledger contains ' + ledger.length +
        ' locally recorded events. The dominant remembered zone is ' +
        readout.dominantDeformedZone + ', with hysteresis tension ' +
        readout.hysteresisTension.toFixed(4) + '. Recent transition history changes subsequent step biases.',
      GOVERNOR: 'The Governor reports ' + snapshot.governor.governorStatus +
        ', advisory ' + snapshot.governor.advisoryWeight.toFixed(3) +
        ', momentum damping ' + snapshot.governor.momentumDampingFactor.toFixed(3) +
        ', and scaffold stage ' + snapshot.governor.scaffoldSheddingStage + '.',
      FIELD: 'The Numogram exposes a ten-zone deformation vector. The live field panel uses this same runtime and PFM ledger to modulate its reaction-diffusion field; the field is presently a downstream projection, not an independent confirmed organism.',
      METHOD: 'The three-arm and Paper 6 display panels contain formula-based demonstrations. They are not research results. Executed assays must be distinguished by a captured run, parameter manifest and independently checked digest.',
      REFLECTION: 'A developmental claim requires more than a fluent reply: it requires changed future transitions under controlled changes to prior history, together with an explicit comparator.'
    };
    const continuation = previousUserTurns.length > 0
      ? 'Conversation context: ' + previousUserTurns.length +
        ' earlier user turns are available to the module selector; this is local dialogue context, not a substitute for PFM.'
      : 'This is the first user turn in the current local context.';
    const codeMatch = prompt.match(/\b\d{2,8}\b/);
    const codeLine = codeMatch
      ? ' Numeric input ' + codeMatch[0] +
        ' is interpreted as a bounded routing perturbation, not evidence of access to a transcendent source.'
      : '';
    const text = [
      'Process relay · Step #' + snapshot.step,
      '',
      'Input: "' + prompt.trim().slice(0, 240) + '"',
      '',
      statements[mainModule],
      '',
      statements[secondaryModule],
      '',
      continuation + codeLine,
      '',
      'Relay trace: modules ' + selectedModules.join(' + ') +
        '; PFM head ' + trace.memoryHeadDigest.slice(0, 12) +
        '; trace ' + trace.traceDigest.slice(0, 12) + '.',
      '',
      'Interpretive boundary: this is a local, rule-composed explanation grounded in observed substrate state; it does not establish understanding, consciousness or experimental significance.'
    ].join('\n');
    const actions: AmeliaDialogueAction[] = [
      { id: 'live-step', label: 'Advance one Numogram transition', actionType: 'step' },
      { id: 'open-numogram', label: 'Inspect Numogram Map', actionType: 'openTab', payload: 'numogram' }
    ];
    if (selectedModules.includes('PFM')) {
      actions.push({ id: 'consolidate', label: 'Consolidate PFM', actionType: 'consolidate' });
    }
    if (selectedModules.includes('GOVERNOR')) {
      actions.push({ id: 'governor', label: 'Open Governor Controls', actionType: 'openTab', payload: 'governor' });
    }
    if (selectedModules.includes('FIELD')) {
      actions.push({ id: 'field', label: 'Open Live Field', actionType: 'openTab', payload: 'morphogenetic' });
    }
    if (selectedModules.includes('METHOD')) {
      actions.push({ id: 'method', label: 'Open Audit Console', actionType: 'openTab', payload: 'audit' });
    }
    return { text, trace, actions };
  }
}
