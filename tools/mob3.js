const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.resolve('dist/test.html')); await p.waitForTimeout(500);
  await p.evaluate(() => { const G = __game; G.Game.paused = true; G.newGameState('小晨'); G.Game.st.flags.license = 1; G.Game.st.map = 'town'; G.Game.st.x = 10; G.Game.st.y = 9; G.startOverworld(); G.Game.fade = 0; G.step(5); });
  const data = await p.evaluate(() => document.getElementById('screen').toDataURL());
  require('fs').writeFileSync('build/raw.png', Buffer.from(data.split(',')[1], 'base64'));
  const info = await p.evaluate(() => { const c = document.getElementById('screen'); const r = c.getBoundingClientRect(); const w = document.getElementById('screenWrap').getBoundingClientRect(); return { canvas: [r.x, r.y, r.width, r.height], wrap: [w.x, w.y, w.width, w.height], cw: c.width, ch: c.height }; });
  console.log(JSON.stringify(info), errs.join('|'));
  await b.close();
})();
