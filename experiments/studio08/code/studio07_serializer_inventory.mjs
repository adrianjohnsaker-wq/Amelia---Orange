#!/usr/bin/env node
/**
 * Studio 08 Studio07 *source* inventory, bound to ORIGINAL SHA256.
 * Read-only. Does not claim complete semantic taint tracking:
 * field aliases, dynamic keys and imported helpers demand human review.
 * The original module is NEVER imported or executed by this scanner.
 *
 * Usage:
 *   node .../studio07_serializer_inventory.mjs --source <path> --sha256 <64hex>
 *   node .../studio07_serializer_inventory.mjs --self-test
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync, mkdtempSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import ts from 'typescript';

function sha(blob){return createHash('sha256').update(blob).digest('hex')}
const important = /(hash|sha256|sha512|digest|serialize|stringify|cue|input|pfm|house|trace|history|vstar|source)/i;
function lineAt(file,node){return file.getLineAndCharacterOfPosition(node.getStart(file)).line+1}
function auditBytes(bytes, path) {
  const source=bytes.toString('utf8');
  const parsed=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true,
    path.endsWith('.ts')?ts.ScriptKind.TS:ts.ScriptKind.JS);
  const diagnostics=parsed.parseDiagnostics;
  assert.equal(diagnostics.length,0,
    'Original Studio07 source parse failed; do not derive guesses');
  const candidates=[];
  const candidateFunctions=[];
  const reads=new Set();
  const callSites=[];
  function visit(node){
    if(ts.isPropertyAccessExpression(node)){
      const chain=node.getText(parsed);
      reads.add(chain);
    } else if (ts.isElementAccessExpression(node)) {
      reads.add(node.getText(parsed)); // dynamic keys need explicit review
    } else if(ts.isCallExpression(node)){
      const callee=node.expression.getText(parsed);
      if(important.test(callee)){
        callSites.push({line:lineAt(parsed,node),expression:node.getText(parsed).slice(0,420),
          callee,kind:'CALL'});
      }
    } else if(ts.isFunctionDeclaration(node)||ts.isFunctionExpression(node)||
             ts.isArrowFunction(node)||ts.isMethodDeclaration(node)) {
      const name=node.name?.getText(parsed) || '<anonymous>';
      if(important.test(name)){
        candidateFunctions.push({name,line:lineAt(parsed,node),
          excerpt:node.getText(parsed).slice(0,580)});
      }
    } else if (ts.isVariableDeclaration(node)) {
      const name=node.name.getText(parsed);
      if(important.test(name)){
        candidates.push({name,line:lineAt(parsed,node),
          declaration:node.getText(parsed).slice(0,380)});
      }
    }
    ts.forEachChild(node,visit);
  }
  visit(parsed);
  return {
    status:'STUDIO08_ORIGINAL_SOURCE_CANDIDATE_INVENTORY_NOT_FULL_TAINT_PROOF',
    path,sha256:sha(bytes),bytes:bytes.length,
    candidateFunctions, candidateVariables:candidates,
    candidateCallSites:callSites,
    referencedPropertyExpressions:[...reads].sort(),
    conclusion:'Review all call graphs and aliases; inventory is not a certificate of every actual hash input.',
    didNotExecuteOriginalSource:true,
    originalSourceUnchanged:true
  };
}
function run(argv){
  if(argv.includes('--self-test')){
    const sample = String.raw`import {createHash} from 'node:crypto';
const cue = (s) => {
  const q = {zone:s.zones.at(-1),input:s.memory.events.at(-1).inputDigest};
  return createHash('sha256').update(JSON.stringify(q)).digest('hex');
};`;
    const r=auditBytes(Buffer.from(sample),'fixture.mjs');
    assert(r.candidateCallSites.some(x=>x.callee==='createHash'));
    assert(r.candidateCallSites.some(x=>x.callee==='JSON.stringify'));
    assert(r.referencedPropertyExpressions.some(x=>x.includes('inputDigest')));
    assert(r.candidateVariables.some(x=>x.name==='cue'));
    assert(r.sha256===sha(Buffer.from(sample)));
    const missing=argv.includes('--fail-test');
    if(missing)throw new Error('negative fixture');
    console.log(JSON.stringify({status:'STUDIO08_SERIALIZER_SOURCE_INVENTORY_QA_PASS',
      assertions:5,source:'synthetic fixture only',originalSourceImported:false}));
    return;
  }
  const i=argv.indexOf('--source'),j=argv.indexOf('--sha256');
  assert(i!==-1 && j!==-1 && argv[i+1] && argv[j+1],
    '--source and --sha256 required');
  const expected=argv[j+1];
  assert(/^[0-9a-f]{64}$/.test(expected),'expected exact original SHA256 digest');
  const path=resolve(argv[i+1]),bytes=readFileSync(path);
  assert.equal(sha(bytes),expected,'original source SHA256 differs: abort');
  console.log(JSON.stringify(auditBytes(bytes,path),null,2));
}
run(process.argv.slice(2));
