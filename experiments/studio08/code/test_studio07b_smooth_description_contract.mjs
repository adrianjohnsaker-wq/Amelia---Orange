/** Engineering QA only: do not infer the historical Studio07b source's tie rule. */
import assert from 'node:assert/strict';
import {EDGES} from './endogenous_cues.mjs';
import {operatorDescribedSurfaceDecline24 as read} from './studio07b_smooth_description_contract.mjs';
const empty=()=>Object.fromEntries(EDGES.map(e=>[e,0]));
function snapshots(start,finish){
 const h=Array.from({length:25},()=>({...start}));
 h[24]={...finish};return h;
}
const a=empty(),b={...a};
assert.equal(read(snapshots(a,b)).status,'NO_DECLINE');
b['1>2']=-0.21;
let out=read(snapshots(a,b));
assert.equal(out.status,'SINGLE_DECLINING_EDGE');
assert.equal(out.edge,'1>2');
assert.equal(out.target,2);
b['4>5']=-0.31;
out=read(snapshots(a,b));
assert.equal(out.edge,'4>5');
assert.equal(out.target,5);
b['1>2']=-0.31;
out=read(snapshots(a,b));
assert.equal(out.status,'AMBIGUOUS_TIE');
assert.equal(out.target,null);
assert.throws(()=>read(snapshots(a,b).slice(0,24)),/25 pre-choice/);
assert.throws(()=>read(snapshots({},{})),/missing surface/);
assert.equal(a['1>2'],0,'reader must not mutate input');
console.log(JSON.stringify({status:'STUDIO08_OPERATOR_DESCRIBED_07B_SMOOTH_CROSSWALK_QA_PASS',
 assertions:11,notOriginalStudio07bImplementation:true,notScientificReplay:true,
 ambiguityPolicy:'reject original tie semantics until source obtained'}));
