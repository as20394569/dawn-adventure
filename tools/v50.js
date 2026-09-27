// field look of ch2 elites/bosses (chibi-based) + bestiary minis
module.exports = async (g) => {
  const L = [['goldPlains', 16, 19], ['frostField', 18, 17], ['emberPass', 15, 21], ['capSewer', 10, 5], ['iceCave', 9, 5], ['clockTower1', 8, 6], ['northRoad', 8, 16], ['starShrine', 9, 5]];
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, ch2: 9 }); st.lv = 30; st.map = 'town'; st.x = 12; st.y = 6; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); });
  await g.ev(() => __game.step(30));
  for (const [id, x, y] of L) { await g.ev(([id, x, y]) => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); G.Game.sys.length = 0; ow.load(id, x, y, 'up', true); G.Game.fade = 0; }, [id, x, y]); await g.ev(() => __game.step(40)); await g.shot('ch2f_' + id); }
};
