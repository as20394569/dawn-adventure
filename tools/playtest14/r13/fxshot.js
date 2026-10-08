// frames of the draw at the start, then a played attack, an exhausting card and a power
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => { const save = fs.readFileSync(process.env.SAVE, 'utf8'); const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve('/home/claude/dawn/dist/test.html')); await p.waitForTimeout(400);
  await p.evaluate(s => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); const K = KD.state(st); K.catchup = 0; K.cls = 'rg'; K.decks = {}; KD.deck(st);
      st.flags.tutK14 = 1; st.flags.tutIntent14 = 1; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; KD.battleRewards = function* () {}; window.__go = 1; let n = 0;
      G.Game.autoPlay = b => { for (const u of b.core.side('B')) if (u.max.hp < 999) { u.max.hp = 999; u.res.hp = 999; } const q = [['rg_stab', 0], ['rg_backstab', 0], ['rg_envenom', 0]][n]; if (q && window.__go) { n++; window.__n = n; b.energy = 9; b.hand.unshift({ id: q[0], up: 0 }); const f = b.core.alive('B'); return { cmd: b.playK(0, f[0].id) }; } return { k: 'hold' }; };
      const ow = G.Game.scene; ow.run(ow.battleScript({ sp: 'curlySheep', lv: 20, kind: 'wild', noCard: 1, extra: [['fieldMice', 20]] })); }, save);
  const c = await (async () => { for (let i = 0; i < 200; i++) { await p.waitForTimeout(40); const ok = await p.evaluate(() => { const b = __game.Game.scene; return b.constructor.name === 'Battle' && b.hand && b.hand.length > 0; }); if (ok) break; } return p.evaluate(() => { const r = document.getElementById('screen').getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }); })();
  const shots = async (tag, n, gap, y0 = 0.3) => { for (let k = 0; k < n; k++) { await p.waitForTimeout(gap); await p.screenshot({ path: path.join(__dirname, 'fx_' + tag + '_' + k + '.png'), clip: { x: c[0], y: c[1] + c[3] * y0, width: c[2], height: c[3] * (1 - y0) } }); } };
  await shots('all', 40, 55, 0.3);
  console.log('errors', errs.length, errs.slice(0, 3)); await b.close(); })();
