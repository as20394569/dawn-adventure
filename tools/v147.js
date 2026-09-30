// v9.2.4 talent cap: 30 points max (two branches), books blocked and hidden from shops at the cap, old saves trimmed
module.exports = async (g) => {
  g.log(await g.ev(() => { const G = __game, out = []; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, deep: 1, golem: 1 }); st.map = 'town'; st.x = 10; st.y = 10; applyStartClass('swordsman');
    for (const lv of [13, 23, 40, 44, 70]) { st.lv = lv; st.tpRead = Math.floor(lv / 8); out.push('Lv' + lv + ' raw=' + tpRaw(st) + ' total=' + tpTotal(st)); }
    st.tcAll = {}; tcAuto(st, 0); out.push('auto spent=' + tpSpent(st) + ' branches=' + [0, 1, 2].map(b => brPts9(b, st)).join('/'));
    st.bag.tpBook = 1; out.push('book block: ' + (itemBlockMsg('tpBook', st) || 'none').split('\n')[0]);
    // over-cap save (e.g. from before the cap): fill all 45 by hand
    for (let b = 0; b < 3; b++) for (let t = 0; t < 5; t++) tcOf(st)[b + '.' + t] = 0; out.push('forced spent=' + tpSpent(st) + ' trimmed=' + tcFitCap(st) + ' → ' + tpSpent(st) + ' branches=' + [0, 1, 2].map(b => brPts9(b, st)).join('/'));
    return out.join('\n'); }));
  // shop list at the cap
  await g.ev(() => { const G = __game; const ow = G.Game.scene; startOverworld(); G.Game.fade = 0; G.UI.clear(); const o2 = G.Game.scene; o2.script = null; o2.run(shopFlow(['potion', 'tpBook', 'elixir'])); });
  for (let i = 0; i < 6; i++) await g.ev(() => __game.step(3));
  g.log('shop shows: ' + await g.ev(() => __game.UI.stack.map(w => (w.items || []).map(i => i.t).join('/')).filter(Boolean).join(' | ')));
};
