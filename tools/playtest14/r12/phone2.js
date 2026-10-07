// battle layouts at phone sizes: several situations
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => { const save = fs.readFileSync(process.env.SAVE, 'utf8'); const b = await chromium.launch(); const sizes = JSON.parse(process.env.SIZES || '[[390,844,"ip14"],[360,640,"s169"]]');
  const cases = [['one', { sp: 'wolf', lv: 20, kind: 'elite', id: 'wolf' }, 'sel'], ['three', { sp: 'curlySheep', lv: 20, kind: 'wild', extra: [['fieldMice', 20], ['hornHare', 20]] }, 'tgt'], ['boss', { sp: 'golem', lv: 19, kind: 'boss', id: 'golem', noCard: 1 }, 'sel2'], ['two', { sp: 'mireFly', lv: 20, kind: 'wild', extra: [['rainFrog', 20]] }, 'sel']];
  for (const [w, h, n] of sizes) for (const [cn, cfg, mode] of cases) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await p.goto('file://' + path.resolve('/home/claude/dawn/dist/test.html')); await p.waitForTimeout(300);
    await p.evaluate(s => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); const K = KD.state(st); K.catchup = 0; K.eqFix = 1; st.flags.tutK14 = 1; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; }, save);
    await p.waitForTimeout(500);
    await p.evaluate(([cfg, mode]) => { const G = __game; G.Game.autoPlay = b => { window.__b = b; b.hand = [{ id: 'sw_strike', up: 0 }, { id: 'rg_adren', up: 0 }, { id: 'lg_victor', up: 1 }, { id: 'mg_combust', up: 0 }, { id: 'nt_heal', up: 0 }, { id: 'bk_blood', up: 0 }]; return { k: 'hold' }; }; const ow = G.Game.scene; ow.run(ow.battleScript(cfg)); }, [cfg, mode]);
    await p.waitForTimeout(3200); await p.evaluate(mode => { __game.Game.autoPlay = null; const b = window.__b; if (!b) return; if (mode === 'sel' || mode === 'tgt') b.sel = 0; if (mode === 'sel2') b.sel = 2; if (mode === 'tgt') { b.tgtMode = 1; b.tgtId = b.core.alive('B')[0].id; } }, mode);
    await p.waitForTimeout(900); await p.screenshot({ path: 'c_' + n + '_' + cn + '.png' }); await p.close(); }
  await b.close(); })();
