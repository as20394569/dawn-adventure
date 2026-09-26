// usage: node shot.js <html> <out.png> [w] [h] [evalScript]
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
(async () => {
  const [,, html, out, w = '960', h = '640', ev] = process.argv;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: +h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' || m.type()==='warning') errs.push(m.text()); });
  await p.goto('file://' + require('path').resolve(html)); await p.waitForTimeout(400);
  if (ev) { await p.evaluate(ev); await p.waitForTimeout(200); }
  await p.screenshot({ path: out }); if (errs.length) console.log('ERRORS:\n' + errs.join('\n')); await b.close();
})();
