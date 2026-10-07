// Cut one big classic script into N files that run one after another (2026-10-08: the shared-link viewer showed
// "Couldn't load this Artifact" once game.js passed 5,000,000 bytes; every piece now stays far below that).
// Cuts only between top-level statements: the line before ends with ; or }, the next line starts at column 0 with a
// declaration or a statement, and both halves compile on their own. Top-level const/let/class/function in one file are
// visible to the files after it, so nothing else changes.
// usage: node tools/jscut.js <in.js> <outDir> <maxBytes>   → prints JSON [{file, bytes}]
const fs = require('fs'), path = require('path'), vm = require('vm');
const [, , inp, outDir, maxB] = process.argv;
const src = fs.readFileSync(inp, 'utf8'), MAX = +maxB || 2000000;
const bytes = s => Buffer.byteLength(s, 'utf8');
const total = bytes(src), n = Math.max(1, Math.ceil(total / (MAX * 0.85))), want = Math.ceil(total / n);
const ok = s => { try { new vm.Script(s, { filename: 'cut.js' }); return true; } catch (e) { return false; } };
const START = /^(const |let |var |function |function\* |class |KD\.|\{|if \(|for \(|\(|\/\*|\/\/|[A-Za-z_$][\w$]*(\.[\w$]+)* = )/;
const parts = []; let rest = src;
while (parts.length < n - 1) {
  // the char index where the byte count reaches `want`
  let lo = 0, acc = 0; for (; lo < rest.length && acc < want; lo++) { const c = rest.charCodeAt(lo); acc += c < 0x80 ? 1 : c < 0x800 ? 2 : (c >= 0xd800 && c < 0xdc00) ? (lo++, 4) : 3; }
  let cut = -1;
  for (const dir of [-1, 1]) {
    let i = lo, tries = 0;
    while (tries < 4000 && cut < 0) {
      i = dir < 0 ? rest.lastIndexOf('\n', i - 1) : rest.indexOf('\n', i + 1); if (i <= 0) break; tries++;
      const prev = rest.slice(rest.lastIndexOf('\n', i - 1) + 1, i).trimEnd(), next = rest.slice(i + 1, i + 200);
      if (!/[;}]$/.test(prev) || !START.test(next)) continue;
      const a = rest.slice(0, i + 1), b = rest.slice(i + 1);
      if (bytes(a) > MAX || !ok(a) || !ok(b)) continue;
      cut = i + 1;
    }
    if (cut >= 0) break;
  }
  if (cut < 0) throw new Error('no safe cut found near byte ' + want);
  parts.push(rest.slice(0, cut)); rest = rest.slice(cut);
}
parts.push(rest);
if (parts.join('') !== src) throw new Error('pieces do not add up');
const out = parts.map((p, k) => { const f = 'game' + (k + 1) + '.js'; fs.writeFileSync(path.join(outDir, f), p); return { file: f, bytes: bytes(p) }; });
for (const o of out) if (o.bytes > MAX) throw new Error(o.file + ' is ' + o.bytes + ' bytes');
console.log(JSON.stringify(out));
