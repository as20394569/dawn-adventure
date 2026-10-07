// other battle overlays on a tall phone: first-battle tip, draw pile, bag, help, the card pick after winning
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => { const save = fs.readFileSync(process.env.SAVE, 'utf8'); const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.goto('file://' + path.resolve('/home/claude/dawn/dist/test.html')); await p.waitForTimeout(300);
  await p.evaluate(s => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); const K = KD.state(st); K.catchup = 0; K.eqFix = 1; st.flags.tutK14 = 1; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; }, save);
  await p.waitForTimeout(500);
  await p.evaluate(() => { const G = __game; G.Game.autoPlay = null; const ow = G.Game.scene; ow.run(ow.battleScript({ sp: 'curlySheep', lv: 20, kind: 'wild', extra: [['fieldMice', 20]] })); });
  await p.waitForTimeout(3500); await p.screenshot({ path: 'o_tip.png' });
  const tap = async () => { await p.evaluate(() => { __game.press('a', 2, 4); }); await p.waitForTimeout(400); };
  await tap(); await p.waitForTimeout(600);
  await p.evaluate(() => { const b = __game.Game.scene; b.tapK = { k: 'pile', w: 'pile' }; }); await p.waitForTimeout(800); await p.screenshot({ path: 'o_pile.png' });
  await p.evaluate(() => { __game.press('b', 2, 4); }); await p.waitForTimeout(600);
  await p.evaluate(() => { const b = __game.Game.scene; b.tapK = { k: 'item' }; }); await p.waitForTimeout(800); await p.screenshot({ path: 'o_bag.png' });
  await p.evaluate(() => { __game.press('b', 2, 4); }); await p.waitForTimeout(600);
  await p.evaluate(() => { const b = __game.Game.scene; for (const u of b.core.side('B')) u.res.hp = 1; KD.wildRate = () => 1; b.hand.unshift({ id: 'sw_whirl', up: 1 }); b.energy = 9; b.tapK = { k: 'card', i: 0 }; });
  await p.waitForTimeout(200); await p.evaluate(() => { const b = __game.Game.scene; b.tapK = { k: 'card', i: 0 }; });
  for (let i = 0; i < 30; i++) { await p.waitForTimeout(300); const pk = await p.evaluate(() => __game.UI.stack.some(u => u.draw && String(u.draw).includes('跳過'))); if (pk) break; const tb = await p.evaluate(() => __game.UI.stack.some(u => u.lines)); if (tb) await tap(); }
  await p.waitForTimeout(800); await p.screenshot({ path: 'o_pick.png' }); const r1 = await p.evaluate(() => { const b = __game.Game.scene; const R = []; return 'TouchR ' + (typeof TouchR !== 'undefined' ? TouchR.map(t => t.y).slice(0, 6).join(',') : ''); }); console.log(r1); await p.evaluate(() => { const c = document.getElementById('screen'), r = c.getBoundingClientRect(); window.__tapAt = (lx, ly) => { const ev = new PointerEvent('pointerdown', { clientX: r.left + lx / W * r.width, clientY: r.top + ly / H * r.height, bubbles: true }); c.dispatchEvent(ev); }; }); console.log(await p.evaluate(() => { const R = TouchR.map(t => [t.x, t.y, t.w, t.h].join(',')).join(' | '); touchTap(30, 150); return R; })); await p.waitForTimeout(500); await p.screenshot({ path: 'o_pick2.png' });
  console.log(await p.evaluate(() => 'H=' + H + ' scene=' + __game.Game.scene.constructor.name + ' ui=' + __game.UI.stack.length));
  await b.close(); })();
