// battle screenshots on an iPhone-sized screen. env: SAVE CLS SP=sp,sp2 LV OUT=prefix PLAY=json [[cardId,targetIndex]...] AT=ms list KIND
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/home/claude/.npm-global/lib/node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
(async () => { const save = fs.readFileSync(process.env.SAVE, 'utf8'); const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: +(process.env.VW || 390), height: +(process.env.VH || 844) }, deviceScaleFactor: 2, isMobile: !process.env.DESK, hasTouch: !process.env.DESK }); p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve((process.env.ROOT || require('path').resolve(__dirname, '../../..')) + '/dist/test.html')); await p.waitForTimeout(400);
  const SP = (process.env.SP || 'curlySheep').split(','), LV = +(process.env.LV || 20), PLAY = JSON.parse(process.env.PLAY || '[]');
  await p.evaluate(([s, cls, SP, LV, PLAY, kind, pre]) => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); const K = KD.state(st); K.catchup = 0; K.eqFix = 1; K.cls = cls; K.decks = {}; KD.deck(st);
      st.flags.tutK14 = 1; st.flags.tutIntent14 = 1; for (const k in st.bag) if (ITEMS[k] && /重生/.test(ITEMS[k].n)) delete st.bag[k]; startOverworld(); if (st.k14) { delete st.k14.g16msg; delete st.k14.newG16; } G.Game.fade = 0; G.Game.noEnc = 1; KD.battleRewards = function* () {};
      let n = 0; window.__shotReady = 0; G.Game.autoPlay = b => { if (pre && !b.__pre) { b.__pre = 1; try { (new Function('b', 'core', pre))(b, b.core); } catch (e) { console.error(e); } }
        const q = PLAY[n]; if (q) { n++; if (q[0] === 'end') { KD.block(b.core, b.Hu(), 999); return { k: 'end' }; } b.energy = 9; b.hand.unshift({ id: q[0], up: q[2] || 0, aw: q[3] || 0 }); const f = b.core.alive('B'); const t = f[Math.min(q[1] || 0, f.length - 1)]; return { cmd: b.playK(0, t ? t.id : null) }; }
        window.__shotReady = 1; return { k: 'hold' }; };
      const ow = G.Game.scene; ow.run(ow.battleScript({ sp: SP[0], lv: LV, kind: kind || 'wild', noCard: 1, extra: SP.slice(1).map(x => [x, LV]) })); }, [save, process.env.CLS || 'mg', SP, LV, PLAY, process.env.KIND, process.env.PRE || '']);
  for (let i = 0; i < 80; i++) { await p.waitForTimeout(250); if (await p.evaluate(() => window.__shotReady)) break; }
  if (process.env.POST) await p.evaluate(src => { const b = __game.Game.scene; (new Function('b', 'core', src))(b, b.core); }, process.env.POST);
  if (process.env.GEST) { await p.evaluate(() => { __game.Game.autoPlay = null; const b = __game.Game.scene; b.idle = true; }); await p.waitForTimeout(300);
    const g2c = async (gx, gy) => p.evaluate(([gx, gy]) => { const c = document.getElementById('screen'), r = c.getBoundingClientRect(); return [r.x + gx * r.width / W, r.y + gy * r.height / H]; }, [gx, gy]);
    const st = async () => p.evaluate(() => { const b = __game.Game.scene; return { sel: b.sel, n: b.hand.length, tgt: b.tgtMode, hp: b.hand.map(c => c.id).join(',') }; });
    const LB = await p.evaluate(() => { const L = KD.BL(), b = __game.Game.scene; return { hy: L.handY + 20, xs: b.hand.map((c, i) => b.handPos(i, b.hand.length).x + L.cw / 2) }; });
    const drag = async (a, b, steps = 8) => { const A = await g2c(...a), B = await g2c(...b); await p.mouse.move(...A); await p.mouse.down(); for (let k = 1; k <= steps; k++) { await p.mouse.move(A[0] + (B[0] - A[0]) * k / steps, A[1] + (B[1] - A[1]) * k / steps); await p.waitForTimeout(16); } await p.mouse.up(); await p.waitForTimeout(400); };
    const tap = async a => { const A = await g2c(...a); await p.mouse.click(...A); await p.waitForTimeout(300); };
    console.log('start', JSON.stringify(await st()));
    await tap([LB.xs[1], LB.hy]); console.log('tap card 1 ->', JSON.stringify(await st()));
    await drag([LB.xs[0], LB.hy], [LB.xs[3], LB.hy]); console.log('scrub 0->3 ->', JSON.stringify(await st()));
    const R = await p.evaluate(() => __game.Game.scene.pop28); const cy = R.y + R.h / 2, cx = R.x + R.w / 2;
    await drag([cx + 10, cy], [cx - 20, cy]); console.log('swipe left on big card ->', JSON.stringify(await st()));
    const R1 = await p.evaluate(() => __game.Game.scene.pop28); await drag([R1.x + R1.w / 2 - 10, R1.y + R1.h / 2], [R1.x + R1.w / 2 + 20, R1.y + R1.h / 2]); const R2 = await p.evaluate(() => __game.Game.scene.pop28); console.log('swipe right ->', JSON.stringify(await st())); await drag([R2.x + R2.w / 2 - 10, R2.y + R2.h / 2], [R2.x + R2.w / 2 + 20, R2.y + R2.h / 2], 4); const R3 = await p.evaluate(() => __game.Game.scene.pop28); console.log('swipe right again ->', JSON.stringify(await st())); await p.screenshot({ path: process.env.OUT + '_mid.png' });
    await drag([R3.x + R3.w / 2 - 3, R3.y + R3.h / 2], [R3.x + R3.w / 2 + 3, R3.y + R3.h / 2]); console.log('tiny move (not a swipe) ->', JSON.stringify(await st()));
    await tap([R3.x + R3.w / 2, R3.y + R3.h / 2]); console.log('tap big card (play) ->', JSON.stringify(await st()));
  }
  if (process.env.SEL) await p.evaluate(n => { __game.Game.autoPlay = null; const b = __game.Game.scene; b.sel = n; b.idle = true; }, +process.env.SEL);
  const AT = (process.env.AT || '600').split(',').map(Number); let k = 0;
  for (const ms of AT) { await p.waitForTimeout(ms); const c = await p.evaluate(() => { const r = document.getElementById('screen').getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; });
    await p.screenshot({ path: (process.env.OUT || path.join(__dirname, 'shot')) + '_' + (k++) + '.png', clip: { x: c[0], y: c[1], width: c[2], height: c[3] } }); }
  console.log('errors', errs.length, errs.slice(0, 3)); await b.close(); })();
