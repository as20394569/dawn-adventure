// the frost village well no longer leads to the old sewer; the town well still does
module.exports = async (g) => {
  for (const [map, x, y] of [['frostVillage', 10, 4], ['town', 17, 19]]) {
    await g.ev(([map, x, y]) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, golem: 1, wellCharm: 1, ch2: 6 }); st.bag.rope = 1; st.map = map; st.x = x; st.y = y; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; const ow = G.Game.scene; ow.script = null; G.UI.clear(); window.__t = []; ow.run(G.Events.well(ow)); }, [map, x, y]);
    for (let i = 0; i < 40; i++) { const u = await g.ui(); if (!u) break; await g.press('a', 8); }
    g.log(map, await g.ev(() => { const st = __game.Game.st; return 'now on ' + st.map + ' ice=' + (st.bag.iceCrystal || 0) + ' frostWell=' + (st.flags.frostWell || 0); }));
  }
};
