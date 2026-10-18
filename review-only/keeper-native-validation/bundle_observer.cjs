// Hash served bundle bytes; never retain a URL, header, body or path in the record.
const crypto = require('node:crypto');
const fs = require('node:fs');
function observe(req, res, output) {
  const hash = crypto.createHash('sha256');
  let bytes = 0;
  const add = (chunk, encoding) => {
    if (chunk === undefined || chunk === null || typeof chunk === 'function') return;
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, typeof encoding === 'string' ? encoding : undefined);
    bytes += buffer.length;
    hash.update(buffer);
  };
  const write = res.write;
  const end = res.end;
  res.write = function(chunk, encoding, callback) {
    add(chunk, encoding);
    return write.call(this, chunk, encoding, callback);
  };
  res.end = function(chunk, encoding, callback) {
    add(chunk, encoding);
    return end.call(this, chunk, encoding, callback);
  };
  res.once('finish', () => {
    const old = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, 'utf8')) : [];
    if (!Array.isArray(old) || old.length >= 8) throw new Error('BUNDLE_RECORD_LIMIT');
    old.push({ kind: /^curl\//.test(req.headers['user-agent'] || '') ? 'warmup' : 'served',
      status: res.statusCode, bytes, sha256: hash.digest('hex') });
    fs.writeFileSync(output, JSON.stringify(old), { mode: 0o600 });
  });
}
module.exports = { observe };
