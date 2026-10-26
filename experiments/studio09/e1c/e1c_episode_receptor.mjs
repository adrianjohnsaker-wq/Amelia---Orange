/** Studio09 E1C receptor: ONE structural reward per NONOVERLAPPING life episode.
 * Frozen META1 sensor choice remains independent and unchanged (per-decision
 * UCB credits still overlap). E1B original is not modified.
 */
import {SENSOR_IDS} from '../../studio08/code/closed_circuit_sensors.mjs';
import {e1StructuralVariants} from '../code/e1_receptor_plasticity.mjs';
const copy=x=>JSON.parse(JSON.stringify(x));
const must=(ok,m)=>{if(!ok)throw Error('E1C_EPISODE_CONTRACT: '+m)};
export const E1C_EPISODE_WINDOW=24;

export class E1CEpisodeReceptor {
  constructor(mode='feedback'){
    must(mode==='feedback'||mode==='fixed','invalid mode');
    this.mode=mode;
    this.wiring=Object.fromEntries(SENSOR_IDS.map(s=>[s,0]));
    this.switches=Object.fromEntries(SENSOR_IDS.map(s=>[s,0]));
    this.window=Object.fromEntries(SENSOR_IDS.map(s=>[s,{values:[],sum:0,n:0}]));
    this.sinceFlip=Object.fromEntries(SENSOR_IDS.map(s=>[s,24]));
    this.episodesBySensor=Object.fromEntries(SENSOR_IDS.map(s=>[s,0]));
    this.events=[];
    this.pendingEpisode=null;
    this.lastEndTick=0;
    this.nextEpisode=0;
    this.completedEpisodes=0;
    this.fatalEpisodes=0;
    this.frozen=false;
    this.censoredEpisodes=0;
  }
  propose(history){
    return Object.freeze(e1StructuralVariants(history).map(v=>Object.freeze({
      id:v.id,target:this.wiring[v.id]===0?v.baseTarget:v.alternateTarget
    })));
  }
  beginEpisode({tick,sensor}){
    must(this.pendingEpisode===null,'attempted overlapping episode');
    must(Number.isInteger(tick)&&tick>0&&tick===this.lastEndTick+1,
         'episode must start on next unexposed transition');
    must(sensor===null||SENSOR_IDS.includes(sensor),'unregistered episode witness');
    const id='E1C-E'+(++this.nextEpisode);
    this.pendingEpisode={id,startTick:tick,sensor,encoding:sensor===null?null:this.wiring[sensor],
      edges:[],age:0};
    return Object.freeze({id,startTick:tick,sensor});
  }
  completeTransition({tick,from,to,death}){
    const p=this.pendingEpisode;
    must(p!==null,'transition outside an episode');
    must(Number.isInteger(tick)&&tick===p.startTick+p.age,
         'nonconsecutive event time');
    must(Number.isInteger(from)&&Number.isInteger(to)&&
         from>=0&&from<=9&&to>=0&&to<=9,'non-Numogram zone');
    must(typeof death==='boolean','invalid death flag');
    const edge=from+'>'+to;
    if(!p.edges.includes(edge))p.edges.push(edge);
    p.age++;
    if(!death&&p.age<E1C_EPISODE_WINDOW)return null;
    must(p.age<=E1C_EPISODE_WINDOW,'episode exceeded fixed window');
    const reward=death?-1:Math.max(0,Math.min(1,(p.edges.length-4)/7));
    const credit={id:p.id,startTick:p.startTick,endTick:tick,
      episodeTransitions:p.age,sensor:p.sensor,initialEncoding:p.encoding,
      distinctEdges:p.edges.length,death,reward};
    let structuralChange=null;
    if(death)this.fatalEpisodes++;
    this.completedEpisodes++;
    if(p.sensor!==null){
      const sensor=p.sensor;
      this.episodesBySensor[sensor]++;
      if(!this.frozen&&this.mode==='feedback'&&p.encoding===this.wiring[sensor]){
        const w=this.window[sensor];
        w.values.push(reward);if(w.values.length>8)w.values.shift();
        w.sum=w.values.reduce((a,b)=>a+b,0);w.n=w.values.length;
        this.sinceFlip[sensor]++;
        if(w.n>=8&&w.sum/w.n < -0.25&&this.switches[sensor]<4&&
          this.sinceFlip[sensor]>=24){
          const old=this.wiring[sensor],settledMean=w.sum/w.n;
          this.wiring[sensor]=1-old;
          this.switches[sensor]++;
          this.sinceFlip[sensor]=0;
          this.window[sensor]={values:[],sum:0,n:0};
          structuralChange=Object.freeze({
            sequence:this.events.length+1,sensor,from:old,to:1-old,
            triggeringEpisode:p.id,settledMean,deathEpisodesInWindow:
              w.values.filter(x=>x===-1).length
          });
          this.events.push(structuralChange);
        }
      }
    }
    this.lastEndTick=tick;
    this.pendingEpisode=null;
    return Object.freeze({credit:Object.freeze(credit),structuralChange});
  }
  /** Engineering boundary: pending <24-step episode is censored, never paid.
   * Next transfer tick must be lastEnd+1, so advance continuity to boundary.
   */
  freezeAtBoundary(boundaryTick){
    must(Number.isInteger(boundaryTick)&&boundaryTick>=this.lastEndTick,
         'boundary precedes completed episode');
    let censored=null;
    if(this.pendingEpisode){
      must(this.pendingEpisode.startTick+this.pendingEpisode.age-1===boundaryTick,
           'boundary contradicts open episode');
      censored={id:this.pendingEpisode.id,age:this.pendingEpisode.age,
        startTick:this.pendingEpisode.startTick};
      this.censoredEpisodes++;
      this.pendingEpisode=null;
    }else{
      must(this.lastEndTick===boundaryTick,'missing episode exposure at boundary');
    }
    this.lastEndTick=boundaryTick;
    this.frozen=true;
    return censored;
  }
  resetWiring(){
    must(this.frozen,'wiring reset requires exact frozen transfer');
    const before={...this.wiring};
    for(const id of SENSOR_IDS)this.wiring[id]=0;
    return Object.freeze({before,after:{...this.wiring}});
  }
  exportState(){
    return copy({
      schema:'STUDIO09_E1C_EPISODE_RECEPTOR_V1',mode:this.mode,
      wiring:this.wiring,switches:this.switches,window:this.window,
      sinceFlip:this.sinceFlip,episodesBySensor:this.episodesBySensor,
      events:this.events,pendingEpisode:this.pendingEpisode,
      lastEndTick:this.lastEndTick,nextEpisode:this.nextEpisode,
      completedEpisodes:this.completedEpisodes,fatalEpisodes:this.fatalEpisodes,
      frozen:this.frozen,censoredEpisodes:this.censoredEpisodes
    });
  }
  importState(state){
    must(state&&state.schema==='STUDIO09_E1C_EPISODE_RECEPTOR_V1'&&
      state.mode===this.mode,'schema/mode mismatch');
    const keys=Object.keys(this.exportState()).sort();
    must(keys.join(',')===Object.keys(state).sort().join(','),
      'incomplete or unexpected receptor fields');
    for(const id of SENSOR_IDS){
      must(state.wiring[id]===0||state.wiring[id]===1,'invalid wiring');
      must(Number.isInteger(state.switches[id])&&
        state.switches[id]>=0&&state.switches[id]<=4,'invalid switch count');
      const w=state.window[id];
      must(w&&Array.isArray(w.values)&&w.values.length<=8&&
        w.values.every(x=>typeof x==='number'&&x>=-1&&x<=1)&&
        w.n===w.values.length&&Math.abs(w.sum-w.values.reduce((a,b)=>a+b,0))<1e-12,
        'invalid episode history');
      must(Number.isInteger(state.sinceFlip[id])&&state.sinceFlip[id]>=0,
           'invalid refractory');
    }
    for(const name of ['nextEpisode','completedEpisodes','fatalEpisodes','lastEndTick','censoredEpisodes'])
      must(Number.isInteger(state[name])&&state[name]>=0,'invalid episode accounting');
    must(state.pendingEpisode===null || typeof state.pendingEpisode==='object',
         'invalid pending episode');
    must(typeof state.frozen==='boolean'&&Array.isArray(state.events),
         'invalid frozen receiver');
    Object.assign(this,copy(state));
    return this;
  }
}
