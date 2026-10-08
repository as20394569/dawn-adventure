// screenshots of a menu screen: env SAVE, CLS, EXPR (a generator to run on the map), STEPS = [[keys...], ...] one shot after each group, OUT, PRE (js run on st first)
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => { const save = fs.readFileSync(process.env.SAVE, 'utf8'); const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve('/home/claude/dawn/dist/test.html')); await p.waitForTimeout(500);
  await p.evaluate(([s, cls, expr, pre]) => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; const K = KD.state(st); K.catchup = 0; if (cls) K.cls = cls; st.flags.tutK14 = 1; st.flags.tutSmith16 = 1;
    if (pre) (new Function('st', 'G', pre))(st, G); startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; const ow = G.Game.scene; if (st.k14) delete st.k14.g16msg; ow.run(eval(expr)); }, [save, process.env.CLS || '', process.env.EXPR, process.env.PRE || '']);
  await p.waitForTimeout(600); const STEPS = JSON.parse(process.env.STEPS || '[[]]');
  for (let i = 0; i < STEPS.length; i++) { for (const k of STEPS[i]) { if (k.startsWith('tap:')) { const [, tx, ty] = k.split(':').map(Number); await p.evaluate(([tx, ty]) => { const c = document.getElementById('screen'), r = c.getBoundingClientRect(), sx = r.width / 176, sy = sx;
            const o = { clientX: r.x + tx * sx, clientY: r.y + ty * sy, bubbles: true, cancelable: true }; c.dispatchEvent(new PointerEvent('pointerdown', o)); c.dispatchEvent(new PointerEvent('pointerup', o)); }, [tx, ty]); await p.waitForTimeout(250); }
        else { await p.evaluate(k => __game.press(k, 2, 6), k); await p.waitForTimeout(150); } }
    await p.waitForTimeout(400); const c = await p.evaluate(() => { const r = document.getElementById('screen').getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; });
    await p.screenshot({ path: process.env.OUT + '_' + i + '.png', clip: { x: c[0], y: c[1], width: c[2], height: Math.min(c[3], 844 - c[1]) } }); }
  console.log('errors', errs.slice(0, 3)); await b.close(); })();
