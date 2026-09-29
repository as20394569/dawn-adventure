module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, hillsQ: 2, creekQ: 1 }); st.lv = 10; st.map = 'town'; st.x = 10; st.y = 12; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); st.money = 3200; G.Game.scene.script = null; G.Game.scene.run(summaryScreen()); });
  await g.step(20); await g.press('right', 20); await g.shot('v113_p2'); await g.press('right', 20); await g.shot('v113_p3');
};
