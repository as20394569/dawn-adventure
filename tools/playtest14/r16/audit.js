// battle screenshots on an iPhone-sized screen. env: SAVE CLS SP=sp,sp2 LV OUT=prefix PLAY=json [[cardId,targetIndex]...] AT=ms list KIND
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/home/claude/.npm-global/lib/node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
(async () => { const save = fs.readFileSync(process.env.SAVE, 'utf8'); const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: +(process.env.VW || 390), height: +(process.env.VH || 844) }, deviceScaleFactor: 2, isMobile: !process.env.DESK, hasTouch: !process.env.DESK }); p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve((process.env.ROOT || require('path').resolve(__dirname, '../../..')) + '/dist/test.html')); await p.waitForTimeout(400);
  if (process.env.BLX) await p.evaluate(src => (new Function(src))(), process.env.BLX);
  const SP = (process.env.SP || 'curlySheep').split(','), LV = +(process.env.LV || 20), PLAY = JSON.parse(process.env.PLAY || '[]');
  await p.evaluate(([s, cls, SP, LV, PLAY, kind, pre]) => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); const K = KD.state(st); K.catchup = 0; K.eqFix = 1; K.cls = cls; K.decks = {}; KD.deck(st);
      st.flags.tutK14 = 1; st.flags.tutIntent14 = 1; for (const k in st.bag) if (ITEMS[k] && /重生/.test(ITEMS[k].n)) delete st.bag[k]; startOverworld(); if (st.k14) { delete st.k14.g16msg; delete st.k14.newG16; } G.Game.fade = 0; G.Game.noEnc = 1; KD.battleRewards = function* () {};
      let n = 0; window.__shotReady = 0; G.Game.autoPlay = b => { if (pre && !b.__pre) { b.__pre = 1; try { (new Function('b', 'core', pre))(b, b.core); } catch (e) { console.error(e); } }
        const q = PLAY[n]; if (q) { n++; if (q[0] === 'end') { KD.block(b.core, b.Hu(), 999); return { k: 'end' }; } b.energy = 9; b.hand.unshift({ id: q[0], up: q[2] || 0, aw: q[3] || 0 }); const f = b.core.alive('B'); const t = f[Math.min(q[1] || 0, f.length - 1)]; return { cmd: b.playK(0, t ? t.id : null) }; }
        window.__shotReady = 1; return { k: 'hold' }; };
      const ow = G.Game.scene; ow.run(ow.battleScript({ sp: SP[0], lv: LV, kind: kind || 'wild', noCard: 1, extra: SP.slice(1).map(x => [x, LV]) })); }, [save, process.env.CLS || 'mg', SP, LV, PLAY, process.env.KIND, process.env.PRE || '']);
  for (let i = 0; i < 80; i++) { await p.waitForTimeout(250); if (await p.evaluate(() => window.__shotReady)) break; }
  if (process.env.POST) await p.evaluate(src => { const b = __game.Game.scene; (new Function('b', 'core', src))(b, b.core); }, process.env.POST);
  if (process.env.SEL) await p.evaluate(n => { __game.Game.autoPlay = null; const b = __game.Game.scene; b.sel = n; b.idle = true; }, +process.env.SEL);
  await p.waitForTimeout(+(process.env.WAIT || 900));
  const rec = await p.evaluate(() => { const R = []; const F = Font, od = F.draw; const T0 = performance.now();
    F.draw = function (ctx, str, x, y, col, sh, size) { const r = od.apply(this, arguments); try { const t = ctx.getTransform(); R.push({ s: String(str), x: +(x).toFixed(1), y: +(y + 8).toFixed(1), z: size || 12, w: +(F.width(str, size || 12)).toFixed(1), c: col, sh: sh || '', a: +ctx.globalAlpha.toFixed(2), tx: t.e, ty: t.f, sc: t.a }); } catch (e) {} return r; };
    return new Promise(res => requestAnimationFrame(() => requestAnimationFrame(() => { F.draw = od; res(R); }))); });
  fs.writeFileSync(process.env.OUT + '.json', JSON.stringify(rec));
  const AT = (process.env.AT || '600').split(',').map(Number); let k = 0;
  for (const ms of AT) { await p.waitForTimeout(ms); const c = await p.evaluate(() => { const r = document.getElementById('screen').getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; });
    await p.screenshot({ path: (process.env.OUT || path.join(__dirname, 'shot')) + '_' + (k++) + '.png', clip: { x: c[0], y: c[1], width: c[2], height: c[3] } }); }
  console.log('errors', errs.length, errs.slice(0, 3)); await b.close(); })();
