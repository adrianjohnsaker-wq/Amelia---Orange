import fs from 'node:fs';
import crypto from 'node:crypto';

const deckDoc=JSON.parse(fs.readFileSync(new URL('./cards.json',import.meta.url),'utf8'));
const actionDoc=JSON.parse(fs.readFileSync(new URL('./suggested-actions.json',import.meta.url),'utf8'));
const cards=deckDoc.cards;
const actionCount=actionDoc.actions.length;
const rounds=1000;
const baseSeed=20261031;
const cardBySerial=new Map(cards.map(card=>[card.serial,card]));

function digitalZone(value){const n=Math.abs(value);return n===0?0:((n-1)%9)+1;}
function xorshift32(seed){let state=seed>>>0;if(state===0)state=1;return()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296;};}
function shuffled(source,seed){const result=source.slice();const random=xorshift32(seed);for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
function play(action,replicate){
 const seed=(baseSeed+action.index*1000003+replicate)>>>0||1;
 const draw=shuffled(cards,seed);
 const set1=draw.slice(0,5),set2=draw.slice(5,10);
 const open=set1.map(card=>({card,paired:false}));
 const scissors=[];
 for(const incoming of set2){
   const candidate=open.find(item=>!item.paired&&item.card.operationalNumber+incoming.operationalNumber===9);
   if(candidate){candidate.paired=true;scissors.push({set1: candidate.card.cardId,set2:incoming.cardId,values:[candidate.card.operationalNumber,incoming.operationalNumber],score:Math.abs(candidate.card.operationalNumber-incoming.operationalNumber)});}
 }
 const pairedScore=scissors.reduce((sum,pair)=>sum+pair.score,0);
 const unmatched=open.filter(item=>!item.paired).map(item=>item.card);
 const unmatchedPenalty=unmatched.reduce((sum,card)=>sum+card.operationalNumber,0);
 const score=pairedScore-unmatchedPenalty;
 const scoreZone=digitalZone(score);
 const meshSerial=score<=0?Math.abs(score):null;
 if(meshSerial!==null&&(meshSerial<0||meshSerial>44))throw new Error('Mesh call outside 00–44: '+meshSerial);
 const calledCard=meshSerial===null?null:cardBySerial.get(meshSerial);
 if(meshSerial!==null&&!calledCard)throw new Error('No Matrix card for Mesh-'+String(meshSerial).padStart(2,'0'));
 const numericMatch=scoreZone===action.targetZone;
 const meshZoneMatch=calledCard?calledCard.zones.includes(action.targetZone):null;
 return {actionId:action.id,action:action.phrase,targetZone:action.targetZone,replicate,seed,
   set1:set1.map(c=>c.cardId).join('|'),set2:set2.map(c=>c.cardId).join('|'),
   scissors:scissors.map(p=>p.set1+'+'+p.set2+'='+p.score).join('|'),
   pairedScore,unmatchedSet1:unmatched.map(c=>c.cardId).join('|'),unmatchedPenalty,score,
   scoreZone,meshCall:calledCard?calledCard.mesh:'',meshZones:calledCard?calledCard.zones.join('|'):'',
   numericMatch:numericMatch?1:0,meshZoneMatch:meshZoneMatch===null?'':meshZoneMatch?1:0};
}
const runs=actionDoc.actions.flatMap(action=>Array.from({length:rounds},(_,i)=>play(action,i)));
const columns=['actionId','action','targetZone','replicate','seed','set1','set2','scissors','pairedScore','unmatchedSet1','unmatchedPenalty','score','scoreZone','meshCall','meshZones','numericMatch','meshZoneMatch'];
const csv=[columns.join(','),...runs.map(row=>columns.map(col=>{const value=String(row[col]??'');return /[",\n]/.test(value)?'"'+value.replace(/"/g,'""')+'"':value;}).join(','))].join('\n')+'\n';
fs.writeFileSync(new URL('./runs.csv',import.meta.url),csv);
const overallZones=Object.fromEntries(Array.from({length:10},(_,z)=>[z,runs.filter(r=>r.scoreZone===z).length]));
const results=actionDoc.actions.map(action=>{
 const group=runs.filter(r=>r.actionId===action.id);
 const scores=group.map(r=>r.score).sort((a,b)=>a-b);
 const negatives=group.filter(r=>r.score<0);
 const zeros=group.filter(r=>r.score===0);
 const positives=group.filter(r=>r.score>0);
 const numericHits=group.filter(r=>r.numericMatch===1).length;
 const meshCalls=group.filter(r=>r.meshCall);
 const meshHits=meshCalls.filter(r=>r.meshZoneMatch===1).length;
 return {actionId:action.id,action:action.phrase,letters:action.a1z26Value,targetZone:action.targetZone,n:group.length,
   scoreMean:Number((group.reduce((a,r)=>a+r.score,0)/group.length).toFixed(4)),
   scoreMedian:scores[Math.floor(scores.length/2)],
   outcomeCounts:{positive:positives.length,zero:zeros.length,negative:negatives.length},
   mostCommonMeshCall:Object.entries(Object.fromEntries([...new Set(negatives.map(r=>r.meshCall))].map(mesh=>[mesh,negatives.filter(r=>r.meshCall===mesh).length]))).sort((a,b)=>b[1]-a[1]).slice(0,5),
   digitalZoneCounts:Object.fromEntries(Array.from({length:10},(_,z)=>[z,group.filter(r=>r.scoreZone===z).length])),
   numericMatches:numericHits,numericMatchRate:Number((numericHits/group.length).toFixed(4)),
   pooledDigitalZoneBaseRate:Number((overallZones[action.targetZone]/runs.length).toFixed(4)),
   meshCalls:meshCalls.length,meshZoneMatches:meshHits,
   meshZoneMatchRate:meshCalls.length?Number((meshHits/meshCalls.length).toFixed(4)):null,
 };
});
const summary={schema:'amelia.subdecadence-action-match-results/v1',runAtUTC:'2026-10-31',method:'45-card project adaptation; one deal per replicate',roundsPerAction:rounds,actions:actionCount,totalDeals:runs.length,baseSeed,scoreZoneCounts:overallZones,actions:results,
  allActionPhraseTargetsDistinct:new Set(actionDoc.actions.map(a=>a.targetZone)).size===actionDoc.actions.length,
  caveat:'Action phrases do not alter the shuffles. Numeric matches are post-hoc correspondences, not evidence of action-specific causal influence.'};
fs.writeFileSync(new URL('./results.json',import.meta.url),JSON.stringify(summary,null,2)+'\n');
const digest=crypto.createHash('sha256').update(csv).digest('hex');
fs.writeFileSync(new URL('./SHA256SUMS.txt',import.meta.url),digest+'  runs.csv\n');
console.log(JSON.stringify(summary,null,2));
console.log('runs.csv sha256 '+digest);
