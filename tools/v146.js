// v9.2 天賦重做: screen, buy / swap / refund, deep lock, costs, migration notice, stats applied
module.exports = async (g) => {
  const S = () => g.ev(() => { const st = __game.Game.st; return JSON.stringify({ p: st.tc && st.tc.p, spent: tpSpent(st), avail: tpAvail(st) }); });
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 12; st.map = 'town'; st.x = 10; st.y = 10; applyStartClass('swordsman'); startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; G.UI.clear(); const ow = G.Game.scene; ow.script = null; ow.run(talentScreen()); });
  await g.ev(() => __game.step(3));
  g.log('start ' + await S());
  const k = async (key, n = 1) => { for (let i = 0; i < n; i++) { await g.ev(kk => __game.press(kk, 2, 4), key); } };
  await k('a'); g.log('buy T1 A ' + await S());
  await k('right'); await k('a'); g.log('swap T1 → B ' + await S());
  await k('down'); await k('a'); g.log('buy T2 B ' + await S());
  await k('down'); await k('a'); g.log('T3 (cost 3, have ' + await g.ev(() => tpAvail()) + ') ' + await S());
  await k('down'); await k('a'); g.log('T4 locked (no awakening) ' + await S() + ' msg-block=' + await g.ev(() => tierBlock9(0, 3)));
  await k('up'); await k('up'); await k('up'); await k('select'); g.log('refund T1 while T2 held → ' + await g.ev(() => tierRefundBlock9(0, 0)));
  await k('down'); await k('down'); await k('select'); g.log('refund top ' + await S());
  await g.ev(() => __game.step(2)); await g.shot('talent_v92');
  // stats: crit option applies, swapping changes stats
  g.log('crit now ' + await g.ev(() => heroStats().crit) + ' combo tiers: ' + await g.ev(() => { const st = __game.Game.st; st.lv = 30; st.flags.deep = 1; st.tc.p = {}; tcAuto(st, 0); return JSON.stringify(st.tc.p) + ' comboMax=' + talentSum('comboMax') + ' comboKeep=' + talentSum('comboKeep') + ' spent=' + tpSpent(st) + '/' + tpTotal(st); }));
  // other classes: every option's effect text and the screen draws
  g.log(await g.ev(() => V7_CLASSES.map(c => { const st = __game.Game.st; st.cls = c; st.tc = null; tcAuto(st, 1); return c + ':' + tpSpent(st) + ':' + resOn(st).length; }).join(' ')));
  // migration: an old save with tiles
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 20; st.map = 'town'; st.x = 10; st.y = 10; applyStartClass('mage'); st.ct = { 'mage.0.0': 3, 'mage.0.1': 2 }; delete st.talV9; startOverworld(); G.Game.fade = 0; });
  const txt = []; for (let i = 0; i < 30; i++) { const u = await g.ev(() => __game.UI.stack.map(w => (w.lines || []).join('')).join(' ')); if (u) txt.push(u); await g.ev(() => __game.step(4)); if (u) await g.ev(() => __game.press('a', 2, 4)); }
  g.log('migration: ct=' + await g.ev(() => JSON.stringify(__game.Game.st.ct)) + ' ' + [...new Set(txt)].filter(t => t.includes('v9.2')).map(t => t.slice(0, 50)).join(' / '));
};
