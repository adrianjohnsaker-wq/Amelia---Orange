/** Opt-in, persistent synthetic source for the shared live morphogenetic field. */
import type { MorphogeneticState } from '../substrate/AmeliaMorphogeneticSubstrate';
import { advanceLiveField,observeLiveField,syntheticSourceOfferDigest } from './LiveFieldLoop';
import { respondToBody,startSource,type SourceState } from './AdaptiveSyntheticSource';

export interface LiveSyntheticSourceSession {
  schema: 'amelia.live-synthetic-source/v1';
  enabled: boolean;
  sourceState: SourceState;
}
type FieldWithSource=MorphogeneticState & { syntheticSourceSession?: LiveSyntheticSourceSession };

export function getLiveSourceSession(field:MorphogeneticState):LiveSyntheticSourceSession|null {
  const s=(field as FieldWithSource).syntheticSourceSession;
  if(!s) return null;
  if(s.schema!=='amelia.live-synthetic-source/v1' || typeof s.enabled!=='boolean' || !s.sourceState ||
    !Number.isSafeInteger(s.sourceState.step) || s.sourceState.step<0 || !Number.isFinite(s.sourceState.smoothedCentroid) ||
    s.sourceState.smoothedCentroid<0 || s.sourceState.smoothedCentroid>1 ||
    ![0,1].includes(s.sourceState.address)) throw Error('Invalid saved synthetic source session');
  return s;
}

/** Existing source memory is retained when new offers are paused or resumed. */
export function setLiveSourceEnabled(field:MorphogeneticState,enabled:boolean):MorphogeneticState {
  const previous=getLiveSourceSession(field);
  const session:LiveSyntheticSourceSession={schema:'amelia.live-synthetic-source/v1',enabled,
    sourceState:previous ? {...previous.sourceState} : startSource()};
  return {...field,syntheticSourceSession:session} as FieldWithSource;
}

/** The ordinary application path remains unchanged while the source is off. */
export function advanceWithLiveSource(field:MorphogeneticState) {
  const session=getLiveSourceSession(field);
  if(!session?.enabled) return {...advanceLiveField(field),sourceReading:null,currentSourceDecision:null};
  const reading=respondToBody(observeLiveField(field),session.sourceState,'live');
  const offer={...reading.offer,recordContext:true};
  const result=advanceLiveField(field,{source:offer});
  const currentSourceDecision=result.snapshot.encounterDecisions?.find(x=>x.sourceDigest===syntheticSourceOfferDigest(offer))??null;
  if(!currentSourceDecision) throw Error('The Governor did not record the current source offer');
  const next={...result.state,syntheticSourceSession:{...session,sourceState:reading.after}} as FieldWithSource;
  return {...result,state:next,sourceReading:reading,currentSourceDecision};
}
