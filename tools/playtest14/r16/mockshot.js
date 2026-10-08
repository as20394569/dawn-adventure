const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve('/home/claude/dawn/dist/test.html')); await p.waitForTimeout(600);
  await p.addScriptTag({ content: fs.readFileSync(process.env.MOCK, 'utf8') });
  const pages = JSON.parse(process.env.PAGES);
  for (let i = 0; i < pages.length; i++) { await p.evaluate(P => { __mockInstall(); const ui = { draw: x => __mockDraw(x, P.rows, P.cards, P.big) }; __game.UI.stack.length = 0; __game.UI.push(ui); }, pages[i]); await p.waitForTimeout(500);
    const c = await p.evaluate(() => { const r = document.getElementById('screen').getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; });
    await p.screenshot({ path: process.env.OUT + '_' + i + '.png', clip: { x: c[0], y: c[1], width: c[2], height: Math.min(c[3], 844) } }); }
  console.log('errors', errs); await b.close(); })();
