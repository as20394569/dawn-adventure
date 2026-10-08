// capture a reaction while it plays: env RX=蒸發|爆炸|感電
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => { const save = fs.readFileSync(process.env.SAVE, 'utf8'); const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve('/home/claude/dawn/dist/test.html')); await p.waitForTimeout(400);
  const RX = process.env.RX; const seq = { 蒸發: [['mg_fire', 1], ['mg_frost', 1]], 爆炸: [['mg_fire', 1], ['mg_thunder', 1]], 感電: [['mg_frost', 1], ['mg_thunder', 1]] }[RX];
  await p.evaluate(([s, seq]) => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); const K = KD.state(st); K.catchup = 0; K.cls = 'mg'; K.decks = {}; KD.deck(st);
      st.flags.tutK14 = 1; st.flags.tutIntent14 = 1; st.flags.tutBreak = 1; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; KD.battleRewards = function* () {};
      let n = 0; window.__go = 1; G.Game.autoPlay = b => { for (const u of b.core.side('B')) { if (u.max.hp < 999) { u.max.hp = 999; u.res.hp = 999; } } const q = seq[n]; if (q && window.__go) { n++; window.__n = n; b.energy = 9; b.hand.unshift({ id: q[0], up: 0 }); const f = b.core.alive('B'); return { cmd: b.playK(0, f[Math.min(q[1], f.length - 1)].id) }; } window.__ready = n; return { k: 'hold' }; };
      const ow = G.Game.scene; ow.run(ow.battleScript({ sp: 'curlySheep', lv: 20, kind: 'wild', noCard: 1, extra: [['fieldMice', 20], ['wildBoar', 20]] })); }, [save, seq]);
  for (let i = 0; i < 80; i++) { await p.waitForTimeout(250); if (await p.evaluate(() => window.__n >= 1)) break; }
  const c = await p.evaluate(() => { const r = document.getElementById('screen').getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; });
  await p.evaluate(() => { window.__go = 1; __game.Game.autoPlay = __game.Game.autoPlay; });
  for (let k = 0; k < 30; k++) { await p.waitForTimeout(130); await p.screenshot({ path: path.join(__dirname, 'rx_' + RX + '_' + k + '.png'), clip: { x: c[0], y: c[1] + c[3] * 0.25, width: c[2], height: c[3] * 0.45 } }); }
  console.log('state', await p.evaluate(() => JSON.stringify({ go: window.__go, ready: window.__ready, scene: __game.Game.scene.constructor.name, rx: __game.Game.scene.core && __game.Game.scene.core.data.rxN16 }))); console.log('errors', errs.length, errs.slice(0, 3)); await b.close(); })();
