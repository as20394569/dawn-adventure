// v9.3 growth by points: 3 屬性點 per level, cap 10+Lv, reset needs 重生之水 / 遺忘之書, talents fixed after leaving the screen
module.exports = async (g) => {
  g.log(await g.ev(() => { const G = __game; Game.st = newGameState('小晨'); G.Game.st = Game.st; const st = Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.map = 'town'; st.x = 10; st.y = 10; applyStartClass('swordsman'); st.lv = 20;
    const out = ['bag attrReset=' + st.bag.attrReset + ' talentReset=' + (st.bag.talentReset || 0), 'points Lv20=' + attrAvail(st) + ' cap=' + attrMax(st)];
    st.attr = {}; for (let i = 0; i < 60; i++) { const k = 'str', cur = ATTR_BASE[k] + (st.attr[k] || 0); if (attrCost(cur) <= attrAvail(st) && cur < attrMax(st)) st.attr[k] = (st.attr[k] || 0) + 1; }
    out.push('dump str → ' + (ATTR_BASE.str + st.attr.str) + ' left=' + attrAvail(st)); st.attr = {}; attrAuto(st); const s = heroStats(st); out.push('auto: ' + JSON.stringify(st.attr) + ' hp/atk/def=' + s.hp + '/' + s.atk + '/' + s.def);
    startOverworld(); G.Game.fade = 0; G.UI.clear(); return out.join('\n'); }));
  await g.ev(() => { const ow = __game.Game.scene; ow.script = null; ow.run(attrScreen()); }); await g.ev(() => __game.step(3)); await g.shot('attr_v93');
  // talents: learn, leave, come back → locked; reset with the book
  const T = async () => g.ev(() => JSON.stringify(tcOf(Game.st)));
  await g.ev(() => { __game.press('b', 2, 4); __game.UI.clear(); const ow = __game.Game.scene; ow.script = null; ow.run(talentScreen()); }); await g.ev(() => __game.step(3));
  await g.ev(() => __game.press('a', 2, 4)); g.log('learned ' + await T());
  await g.ev(() => __game.press('right', 2, 4)); await g.ev(() => __game.press('a', 2, 4)); g.log('swap same visit ' + await T());
  await g.ev(() => __game.press('b', 2, 4)); await g.ev(() => { __game.UI.clear(); const ow = __game.Game.scene; ow.script = null; ow.run(talentScreen()); }); await g.ev(() => __game.step(3));
  await g.ev(() => __game.press('left', 2, 4)); await g.ev(() => __game.press('a', 2, 4)); g.log('swap after leaving ' + await T());
  await g.ev(() => __game.press('start', 2, 4)); for (let i = 0; i < 6; i++) await g.ev(() => __game.step(4));
  g.log('reset prompt: ' + await g.ev(() => __game.UI.stack.map(w => (w.lines || []).join('')).join(' ').slice(0, 60)));
  await g.ev(() => { Game.st.bag.talentReset = 1; }); for (let i = 0; i < 8; i++) await g.ev(() => __game.press('a', 2, 6));
  await g.ev(() => __game.press('start', 2, 4)); for (let i = 0; i < 4; i++) await g.ev(() => __game.step(4));
  await g.ev(() => __game.press('a', 2, 6)); for (let i = 0; i < 4; i++) await g.ev(() => __game.step(4));
  g.log('after reset ' + await T() + ' books=' + await g.ev(() => Game.st.bag.talentReset));
  // class change keeps picks
  g.log(await g.ev(() => { const st = Game.st; tcOf(st)['0.0'] = 1; st.cls = 'mage'; const m = JSON.stringify(tcOf(st)); st.cls = 'swordsman'; return 'mage=' + m + ' back to swordsman=' + JSON.stringify(tcOf(st)); }));
};
