// passage markers: screenshots at several passages
module.exports = async (g) => {
  const L = [['town', 10, 3], ['route', 10, 2], ['capital', 13, 26], ['capital', 22, 5], ['frostField', 18, 18], ['capital', 9, 22], ['home', 4, 4], ['ruins', 8, 12]];
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, golem: 1, ch2: 5 }); st.map = 'town'; st.x = 10; st.y = 5; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; G.UI.clear(); });
  let i = 0; for (const [id, x, y] of L) { await g.ev(([id, x, y]) => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); G.Game.sys.length = 0; ow.load(id, x, y, 'down', true); ow.popup = null; G.Game.fade = 0; }, [id, x, y]); await g.ev(() => __game.step(20)); await g.shot('pm_' + (i++)); }
};
