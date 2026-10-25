/** Fail-closed byte provenance for the isolated Studio 08 runtime mirror.
 *
 * The ONLY accepted modified source is the direct-cue guarded variant of
 * ameliaNumogramSubstrateRuntime.ts. Every other mirror byte must equal
 * its frozen Studio parent. This checks instrumented source, not science.
 */
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,statSync} from 'node:fs';
import {join,relative,resolve} from 'node:path';
const parent=resolve('experiments/studio/runtime_mirror');
const mirror=resolve('experiments/studio08/runtime_mirror');
const target='substrate/ameliaNumogramSubstrateRuntime.ts';
function files(dir) {
  const out=[];
  function walk(path) {
    for(const name of readdirSync(path)) {
      const p=join(path,name);
      if(statSync(p).isDirectory()) walk(p);
      else out.push(relative(dir,p).replaceAll('\\','/'));
    }
  }
  walk(dir);
  return out.sort();
}
const names=files(parent);
assert.deepEqual(files(mirror),names,'Studio 08 copy changed source inventory');
const anchor='  public exitBonus: ((from: ZoneId, to: ZoneId) => number) | null = null;';
const scorer='+ (inputZone === target ? 0.35 : 0)';
let copied=0, patched=0;
for(const name of names) {
  const orig=readFileSync(join(parent,name));
  const ours=readFileSync(join(mirror,name));
  if(name!==target) {
    assert.deepEqual(ours,orig,'source-copy byte mismatch: '+name);
    copied++;
    continue;
  }
  const source=orig.toString('utf8');
  assert(source.includes(anchor) && source.includes(scorer));
  assert.equal(source.split(anchor).length,2,'ambiguous anchor');
  assert.equal(source.split(scorer).length,2,'ambiguous score term');
  const expected=source.replace(anchor,
      anchor+'\n  /** Studio08 mirror-only intervention. Default true preserves original scoring exactly. */\n  public inputCueEnabled = true;')
      .replace(scorer,
      '+ (this.inputCueEnabled && inputZone === target ? 0.35 : 0)');
  assert.equal(ours.toString('utf8'),expected,
      'Studio 08 runtime patch includes unregistered differences');
  patched++;
}
console.log(JSON.stringify({
 status:'STUDIO08_SOURCE_DIFF_EXACT_PATCH_PASS_NOT_SCIENCE',
 copiedUnmodifiedSources:copied, modifiedSources:patched,
 modifiedPath:target, allowedOnlyChange:'default-true direct input cue guard',
 originalImmutable:true, noScientificResults:true
}));
