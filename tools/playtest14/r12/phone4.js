// real battles on a tall phone screen: auto card play, page errors, and the screen size before / during / after
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => { const save = fs.readFileSync(process.env.SAVE, 'utf8'); const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL/.test(m.text())) errs.push(m.text()); });
  await p.goto('file://' + path.resolve('/home/claude/dawn/dist/test.html')); await p.waitForTimeout(300);
  await p.evaluate(s => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); const K = KD.state(st); K.catchup = 0; K.eqFix = 1; st.flags.tutK14 = 1; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; KD.battleRewards = function* () {}; }, save);
  await p.waitForTimeout(500);
  const size = () => p.evaluate(() => { const r = document.getElementById('screen').getBoundingClientRect(); return 'H=' + H + ' css ' + Math.round(r.width) + '×' + Math.round(r.height) + ' ar=' + getComputedStyle(document.documentElement).getPropertyValue('--ar'); });
  console.log('before', await size());
  for (const cfg of [{ sp: 'wolf', lv: 20, kind: 'elite', id: 'wolf' }, { sp: 'curlySheep', lv: 20, kind: 'wild', extra: [['fieldMice', 20], ['hornHare', 20]] }, { sp: 'golem', lv: 19, kind: 'boss', id: 'golem', noCard: 1 }]) {
    await p.evaluate(cfg => { const G = __game; window.__out = null; G.Game.autoPlay = bt => { const H0 = bt.core.byId.H; H0.res.hp = Math.max(H0.res.hp, 60); return {}; }; const ow = G.Game.scene; ow.run((function* () { window.__out = yield* ow.battleScript(cfg); })()); }, cfg);
    let mid = null; for (let i = 0; i < 400; i++) { await p.waitForTimeout(150); const s = await p.evaluate(() => { const G = __game; if (G.UI.stack.some(u => u.lines)) G.press('a', 2, 2); return window.__out; }); if (i === 20) mid = await size(); if (s) break; }
    console.log(cfg.sp, 'result', await p.evaluate(() => window.__out), '| during', mid, '| after', await size()); }
  console.log('errors', errs.length, errs.slice(0, 5).join(' / ')); await b.close(); })();
