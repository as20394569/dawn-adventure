const { chromium, devices } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  for (const [name, vp] of [['portrait', { width: 390, height: 844 }], ['landscape', { width: 844, height: 390 }], ['small', { width: 360, height: 640 }], ['tablet', { width: 820, height: 1180 }]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + path.resolve('dist/test.html')); await p.waitForTimeout(500);
    await p.evaluate(() => { const G = __game; G.Game.paused = true; G.newGameState('小晨'); G.Game.st.flags.license = 1; G.Game.st.map = 'town'; G.Game.st.x = 10; G.Game.st.y = 9; G.startOverworld(); G.Game.fade = 0; G.step(5); });
    // tap the dpad right side and A via touch
    const dp = await p.$('#dpad'); const box = await dp.boundingBox();
    await p.touchscreen.tap(box.x + box.width - 12, box.y + box.height / 2);
    await p.evaluate(() => __game.step(3));
    const dir = await p.evaluate(() => __game.Game.scene.p.dir);
    await p.screenshot({ path: 'build/mob_' + name + '.png' });
    const ov = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, sh: document.documentElement.scrollHeight, ch: document.documentElement.clientHeight, canvas: document.getElementById('screen').style.width }));
    console.log(name, JSON.stringify(ov), 'dir after tap:', dir, errs.join(';'));
    await ctx.close();
  }
  await b.close();
})();
