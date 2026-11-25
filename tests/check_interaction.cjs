// State regression checks against the unchanged browser script.
// A minimal DOM stub supplies rendering targets; this is not a browser/user study.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const elements = new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id, {
    id, value: '', hidden: false, disabled: false, textContent: '', _html: '', handlers: {},
    classList: { add() {}, toggle() {} },
    addEventListener(type, fn) { this.handlers[type] = fn; },
    set innerHTML(html) {
      this._html = html;
      for (const match of html.matchAll(/id="([^"]+)"/g)) element(match[1]);
    },
    get innerHTML() { return this._html; },
    querySelectorAll() {
      return ['title','intro','illustration','meta','registration'].map(id => ({
        dataset:{id}, classList:{add(){}}, addEventListener(){}
      }));
    }
  });
  return elements.get(id);
}
const context = vm.createContext({structuredClone, document:{getElementById:element}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../app/app.js'),'utf8'), context);
function run(code) { return vm.runInContext(code, context); }
function reset() { run('poster=structuredClone(initial);selected="registration";proposal=null;undoStack=[];render();'); }
function click(id) { element(id).handlers.click(); }
const results=[];
function test(name,fn) { reset();fn();results.push({name,result:'PASS'}); }
const json = code => JSON.parse(run('JSON.stringify('+code+')'));
test('Preview leaves poster and confirmed intent unchanged',()=>{
  const before=json('poster');run('setProposal("readability")');assert.deepEqual(json('poster'),before);
  assert.equal(run('proposal.style'),'readability');assert.equal(element('preview-wrap').hidden,false);
});
test('Correction changes pending interpretation only',()=>{
  run('setProposal("readability")');click('correct');assert.equal(run('proposal.style'),'playful');
  assert.equal(run('poster.components.registration.style'),'base');assert.equal(run('proposal.intent.origin'),'User correction');
});
test('Application changes only registration style and confirms intent',()=>{
  const other=json('Object.fromEntries(Object.entries(poster.components).filter(([id])=>id!=="registration"))');
  run('setProposal("playful");applyProposal()');assert.equal(run('poster.components.registration.style'),'playful');
  assert.equal(run('poster.intent.status'),'Confirmed');assert.equal(run('poster.version'),2);
  assert.deepEqual(json('Object.fromEntries(Object.entries(poster.components).filter(([id])=>id!=="registration"))'),other);
});
test('Undo restores component and intent state while increasing revision',()=>{
  const before=json('poster.components');run('setProposal("playful");applyProposal();undo()');
  assert.deepEqual(json('poster.components'),before);assert.equal(run('poster.intent'),null);assert.equal(run('poster.version'),3);
});
test('Discard leaves confirmed state unchanged',()=>{
  const before=json('poster');run('setProposal("readability")');click('discard');
  assert.deepEqual(json('poster'),before);assert.equal(run('proposal'),null);
});
test('Unknown request asks for clarification without a preview',()=>{
  element('request').value='Make it different';click('propose');assert.equal(run('proposal'),null);
  assert.match(element('feedback').textContent,/not sure/);assert.equal(run('poster.version'),1);
});
test('Selecting another component prevents stale application',()=>{
  run('setProposal("readability");selected="title";applyProposal()');assert.equal(run('poster.version'),1);
  assert.equal(run('poster.components.registration.style'),'base');assert.equal(run('proposal'),null);
});
test('Wrong base version is rejected',()=>{
  run('setProposal("readability");proposal.baseVersion=0;applyProposal()');assert.equal(run('poster.version'),1);
  assert.equal(run('proposal'),null);
});
test('Unsupported style is rejected',()=>{
  run('setProposal("readability");proposal.style="arbitrary";applyProposal()');assert.equal(run('poster.version'),1);
  assert.equal(run('proposal'),null);
});
test('A locked target is rejected by the state validator',()=>{
  // This internal fixture checks the guard; no lock toggle is exposed in the UI.
  run('setProposal("readability");poster.components.registration.locked=true;applyProposal()');
  assert.equal(run('poster.components.registration.style'),'base');assert.equal(run('poster.version'),1);
});
test('Direct supported request produces a playful candidate',()=>{
  element('request').value='Use a playful pink accent';click('propose');assert.equal(run('proposal.style'),'playful');
  assert.equal(run('poster.components.registration.style'),'base');
});
console.log(JSON.stringify({method:'Node VM with minimal DOM stub; developer regression checks',checks:results.length,results},null,2));
