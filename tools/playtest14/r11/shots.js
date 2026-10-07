const fs = require('fs');
module.exports = async (g) => { const save = fs.readFileSync(process.env.SAVE, 'utf8'), W = process.env.WHICH;
  await g.ev(s => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); const K = KD.state(st); K.catchup = 0; K.eqFix = 1; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; }, save);
  await g.step(20);
  if (W === 'dex') { for (const [sp, n] of [['wolf', 'r11_dex_wolf'], ['frostQueen', 'r11_dex_fq'], ['slime', 'r11_dex_slime']]) {
      await g.ev(sp => { const ow = __game.Game.scene; ow.run(dexDetail([sp], 0)); }, sp); await g.step(10); await g.shot(n + '1'); await g.press('right'); await g.step(6); await g.shot(n + '2'); await g.press('b'); await g.step(10); } }
  if (W === 'enc') { await g.ev(() => { window.__u = encounterCard('stagLord', 40, 'stagLord', 'elite'); __game.UI.push(window.__u); }); await g.step(4); await g.shot('r11_enc_elite'); await g.ev(() => { __game.UI.remove(window.__u); window.__u = encounterCard('frostQueen', 38, 'frostQueen', 'boss'); __game.UI.push(window.__u); }); await g.step(4); await g.shot('r11_enc_boss'); }
  if (W === 'bag') { await g.ev(() => { const ow = __game.Game.scene; ow.run(bagScreen('field')); }); await g.step(10); await g.press('right'); await g.step(6); await g.shot('r11_bag_mat'); }
  if (W === 'title') { await g.ev(() => { const ow = __game.Game.scene; ow.run(titleScreen()); }); await g.step(10); await g.press('down'); await g.press('down'); await g.press('down'); await g.press('down'); await g.step(6); await g.shot('r11_titles'); }
  g.log('ok ' + W); };
