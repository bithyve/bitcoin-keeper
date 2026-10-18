const assert = require('node:assert/strict');
const { test } = require('node:test');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { EventEmitter } = require('node:events');
const { observe } = require('./bundle_observer.cjs');
test('records exact streamed bytes without private URL, headers, body or path', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'keeper-observer-test-'));
  t.after(() => fs.rmSync(root, {recursive:true,force:true}));
  const file = path.join(root, 'served.json');
  for (const agent of ['curl/8.0', 'PRIVATE_USER_AGENT']) {
    const response = new EventEmitter();
    response.statusCode = 200;
    response.write = () => true;
    response.end = () => response.emit('finish');
    observe({url:'/index.bundle?PRIVATE_QUERY',headers:{'user-agent':agent}},response,file);
    response.write(Buffer.from('PRIVATE_BODY'));
    response.write('é','utf8');
    response.end('END');
  }
  const output=fs.readFileSync(file,'utf8');
  const rows=JSON.parse(output);
  const content=Buffer.from('PRIVATE_BODYéEND');
  assert.deepEqual(rows.map(r=>r.kind),['warmup','served']);
  assert.ok(rows.every(r=>r.bytes===content.length));
  assert.ok(rows.every(r=>r.sha256===crypto.createHash('sha256').update(content).digest('hex')));
  assert.equal(output.includes('PRIVATE'),false);
  assert.equal(output.includes(root),false);
});
test('refuses additional bundle records after bounded limit', t => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'keeper-observer-limit-'));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  const file=path.join(root,'served.json');fs.writeFileSync(file,JSON.stringify(Array(8).fill({})));
  const response=new EventEmitter();response.write=()=>true;response.end=()=>response.emit('finish');
  observe({headers:{}},response,file);
  assert.throws(()=>response.end('body'),/BUNDLE_RECORD_LIMIT/);
});
test('a streamed response may end with only a completion callback', t => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'keeper-observer-callback-'));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  const file=path.join(root,'served.json');
  const response=new EventEmitter();response.statusCode=200;
  response.write=()=>true;response.end=callback=>{callback();response.emit('finish');};
  observe({headers:{}},response,file);
  response.write('test');let completed=false;response.end(()=>{completed=true;});
  assert.equal(completed,true);
  assert.equal(JSON.parse(fs.readFileSync(file))[0].bytes,4);
});
