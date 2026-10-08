const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => { const save = fs.readFileSync(process.env.SAVE, 'utf8'); const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve('/home/claude/dawn/dist/test.html')); await p.waitForTimeout(400);
  await p.evaluate(s => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); const K = KD.state(st); K.catchup = 0; K.cls = 'mg'; K.decks = {}; K.decks.mg = []; for (let i = 0; i < 10; i++) K.decks.mg.push({ id: 'mg_frost', up: 0, xp: 19 });
      st.flags.tutK14 = 1; st.flags.tutIntent14 = 1; st.flags.tutMk16 = 1; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; KD.battleRewards = function* () {};
      let n = 0; G.Game.autoPlay = b => { for (const u of b.core.side('B')) u.res.hp = 1; if (n++ < 1) { const i = b.hand.findIndex(c => c.src16); return { cmd: b.playK(i, b.core.alive('B')[0].id) }; } b.energy = 9; b.hand.unshift({ id: 'mg_storm', up: 1 }); return { cmd: b.playK(0, null) }; };
      const ow = G.Game.scene; ow.run(ow.battleScript({ sp: 'curlySheep', lv: 20, kind: 'wild', noCard: 1 })); }, save);
  for (let i = 0; i < 120; i++) { await p.waitForTimeout(250); if (await p.evaluate(() => __game.UI.stack.some(u => u.draw && !u.lines && __game.Game.scene.constructor.name === 'Battle' && KD.state(__game.Game.st).decks.mg.some(c => c.aw)))) break; }
  await p.waitForTimeout(900); const c = await p.evaluate(() => { const r = document.getElementById('screen').getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; });
  await p.screenshot({ path: path.join(__dirname, 'awaken.png'), clip: { x: c[0], y: c[1], width: c[2], height: c[3] } });
  console.log('errors', errs.length, errs.slice(0, 3)); await b.close(); })();
