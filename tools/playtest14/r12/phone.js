// full-page screenshots at phone sizes: overworld and battle
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => { const save = fs.readFileSync(process.env.SAVE, 'utf8'); const b = await chromium.launch();
  for (const [w, h, n] of [[390, 844, 'iphone14'], [360, 640, 'old169']]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await p.goto('file://' + path.resolve('/home/claude/dawn/dist/test.html')); await p.waitForTimeout(400);
    await p.evaluate(s => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); const K = KD.state(st); K.catchup = 0; K.eqFix = 1; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; }, save);
    await p.waitForTimeout(800); await p.screenshot({ path: 'ow_' + n + '.png' });
    const info = await p.evaluate(() => { const c = document.getElementById('screen').getBoundingClientRect(); const pad = document.getElementById('pad'); const pr = pad ? pad.getBoundingClientRect() : null; return { canvas: [c.x, c.y, c.width, c.height], pad: pr && [pr.x, pr.y, pr.width, pr.height], win: [innerWidth, innerHeight] }; });
    console.log(n, JSON.stringify(info));
    await p.evaluate(() => { const G = __game; G.Game.autoPlay = b => ({ k: 'hold' }); const ow = G.Game.scene; ow.run(ow.battleScript({ sp: 'curlySheep', lv: 20, kind: 'wild', extra: [['fieldMice', 20]] })); });
    await p.waitForTimeout(2500); await p.evaluate(() => { __game.Game.autoPlay = null; }); await p.waitForTimeout(1500); await p.screenshot({ path: 'bt_' + n + '.png' });
    const info2 = await p.evaluate(() => { const c = document.getElementById('screen').getBoundingClientRect(); return [c.x, c.y, c.width, c.height]; }); console.log(n, 'battle canvas', JSON.stringify(info2));
    await p.close(); }
  await b.close(); })();
