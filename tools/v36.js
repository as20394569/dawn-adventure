module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 18; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); });
  await g.ev(() => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(classCardScreen(['swordmaster', 'otherworlder'], { title: '轉職的儀式', cancel: true })); }); await g.step(10); await g.shot('cc1');
  await g.press('right', 6); await g.step(4); await g.shot('cc2');
};
