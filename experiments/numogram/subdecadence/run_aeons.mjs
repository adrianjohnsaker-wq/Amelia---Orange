import fs from 'node:fs';
import crypto from 'node:crypto';
const deckDoc=JSON.parse(fs.readFileSync(new URL('./cards.json',import.meta.url),'utf8'));
const actionDoc=JSON.parse(fs.readFileSync(new URL('./suggested-actions.json',import.meta.url),'utf8'));
const cards=deckDoc.cards,cardBySerial=new Map(cards.map(card=>[card.serial,card]));
const aeonsPerAction=1000,baseSeed=20261032,maxDeals=100;
function digitalZone(value){const n=Math.abs(value);return n===0?0:((n-1)%9)+1;}
function xorshift32(seed){let state=seed>>>0;if(!state)state=1;return()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296;};}
function shuffled(source,seed){const out=source.slice(),random=xorshift32(seed);for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function deal(action,replicate,dealIndex){
 const seed=(baseSeed+action.index*1000003+replicate*101+dealIndex)>>>0||1;
 const draw=shuffled(cards,seed),set1=draw.slice(0,5),set2=draw.slice(5,10),open=set1.map(card=>({card,paired:false})),scissors=[];
 for(const incoming of set2){const candidate=open.find(x=>!x.paired&&x.card.operationalNumber+incoming.operationalNumber===9);if(candidate){candidate.paired=true;scissors.push({set1:candidate.card.cardId,set2:incoming.cardId,score:Math.abs(candidate.card.operationalNumber-incoming.operationalNumber)});}}
 const pairScore=scissors.reduce((s,p)=>s+p.score,0),unmatched=open.filter(x=>!x.paired).map(x=>x.card),penalty=unmatched.reduce((s,c)=>s+c.operationalNumber,0),score=pairScore-penalty;
 return{seed,set1:set1.map(c=>c.cardId),set2:set2.map(c=>c.cardId),scissors,pairedScore:pairScore,unmatchedSet1:unmatched.map(c=>c.cardId),unmatchedPenalty:penalty,score};
}
function runAeon(action,replicate){
 let angelicIndex=0,rounds=[],terminal=null,censored=false;
 for(let d=0;d<maxDeals;d++){
  const outcome=deal(action,replicate,d);angelicIndex+=Math.max(0,outcome.score);
  const row={...outcome,round:d+1,angelicIndexAfter:angelicIndex};
  rounds.push(row);
  if(outcome.score<=0){terminal=row;break;}
 }
 if(!terminal)censored=true;
 const meshSerial=terminal?Math.abs(terminal.score):null,calledCard=meshSerial===null?null:cardBySerial.get(meshSerial);
 if(meshSerial!==null&&(meshSerial<0||meshSerial>44||!calledCard))throw new Error('Invalid terminal Mesh call '+meshSerial);
 const positiveIndexZone=digitalZone(angelicIndex);
 const terminalScoreZone=terminal?digitalZone(terminal.score):null;
 return{actionId:action.id,action:action.phrase,targetZone:action.targetZone,replicate,rounds:rounds.length,roundScores:rounds.map(x=>x.score).join('|'),
   dealTrail:JSON.stringify(rounds),positiveIndex:angelicIndex,positiveIndexZone,positiveIndexMatch:positiveIndexZone===action.targetZone?1:0,
   terminalScore:terminal?.score??'',terminalScoreZone:terminalScoreZone??'',terminalScoreMatch:terminalScoreZone===action.targetZone?1:0,
   meshCall:calledCard?.mesh??'',meshZones:calledCard?.zones.join('|')??'',meshZoneMatch:calledCard?Number(calledCard.zones.includes(action.targetZone)):'',
   censored:censored?1:0};
}
const results=actionDoc.actions.flatMap(action=>Array.from({length:aeonsPerAction},(_,i)=>runAeon(action,i)));
const cols=['actionId','action','targetZone','replicate','rounds','roundScores','positiveIndex','positiveIndexZone','positiveIndexMatch','terminalScore','terminalScoreZone','terminalScoreMatch','meshCall','meshZones','meshZoneMatch','censored','dealTrail'];
const csv=[cols.join(','),...results.map(row=>cols.map(k=>{const v=String(row[k]??'');return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}).join(','))].join('\n')+'\n';
fs.writeFileSync(new URL('./aeon-runs.csv',import.meta.url),csv);
const summary=actionDoc.actions.map(action=>{
 const group=results.filter(x=>x.actionId===action.id),complete=group.filter(x=>!x.censored);
 const byZone=(field,population=group)=>Object.fromEntries(Array.from({length:10},(_,z)=>[z,population.filter(x=>Number(x[field])===z).length]));
 return{actionId:action.id,action:action.phrase,letters:action.a1z26Value,targetZone:action.targetZone,n:group.length,
  meanDeals:Number((group.reduce((s,x)=>s+x.rounds,0)/group.length).toFixed(4)),
  meanPositiveRounds:Number((group.reduce((s,x)=>s+x.roundScores.split('|').filter(v=>Number(v)>0).length,0)/group.length).toFixed(4)),
  censored:group.filter(x=>x.censored).length,
  positiveIndexMatch:complete.filter(x=>x.positiveIndexMatch===1).length,
  positiveIndexMatchRate:Number((complete.filter(x=>x.positiveIndexMatch===1).length/complete.length).toFixed(4)),
  terminalScoreMatch:group.filter(x=>x.terminalScoreMatch===1).length,
  terminalScoreMatchRate:Number((group.filter(x=>x.terminalScoreMatch===1).length/complete.length).toFixed(4)),
  terminalScoreCounts:Object.fromEntries([...new Set(complete.map(x=>String(x.terminalScore)))].sort((a,b)=>Number(a)-Number(b)).map(score=>[score,complete.filter(x=>String(x.terminalScore)===score).length])),
  meshZoneMatches:group.filter(x=>x.meshZoneMatch===1).length,
  meshZoneMatchRate:Number((group.filter(x=>x.meshZoneMatch===1).length/complete.length).toFixed(4)),
  positiveIndexZoneCounts:byZone('positiveIndexZone',complete),
  terminalScoreZoneCounts:byZone('terminalScoreZone',complete)};
});
const overall={schema:'amelia.subdecadence-aeon-results/v1',runAtUTC:'2026-10-31',phase:'full Aeon extension; exploratory project adaptation',aeonsPerAction,actions:actionDoc.actions.length,totalAeons:results.length,totalDeals:results.reduce((s,x)=>s+x.rounds,0),baseSeed,maxDeals,
 summary,interpretation:'Action phrases define target zones only. They do not enter the shuffle or game mechanics; observed matches are post-hoc numeric coincidences, not action-specific effects.'};
fs.writeFileSync(new URL('./aeon-results.json',import.meta.url),JSON.stringify(overall,null,2)+'\n');
const digest=crypto.createHash('sha256').update(csv).digest('hex');
fs.writeFileSync(new URL('./AEON-SHA256SUMS.txt',import.meta.url),digest+'  aeon-runs.csv\n');
console.log(JSON.stringify(overall,null,2));console.log('aeon-runs.csv sha256 '+digest);
