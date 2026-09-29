module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 10; st.map = 'town'; st.x = 10; st.y = 12; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); st.money = 3200;
    for (const k of ['stone', 'feather', 'hareFur', 'shroomCap', 'gel', 'wolfFang', 'spiderSilk', 'foxfire', 'leaf']) st.bag[k] = 6; G.Game.scene.script = null; });
  g.log(await g.ev(() => bpList(0).slice(0, 8).map(e => GEAR[e.k].n + ' T' + GEAR[e.k].t + (bpCan(e.k, 0) ? ' ✓' : '')).join(' | ')));
  await g.ev(() => { __game.Game.scene.run(craftScreen()); }); await g.step(30); await g.shot('v112_craft');
  await g.ev(() => { __game.UI.clear(); const ow = __game.Game.scene; ow.script = null; ow.run(talentScreen()); }); await g.step(30); await g.shot('v112_talent');
};
