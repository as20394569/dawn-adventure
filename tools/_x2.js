module.exports = async (g) => { g.log(await g.ev(() => Object.keys(ITEMS).filter(k => ITEMS[k].use === 'full').join(','))); 
  for (const [id, x, y, nm] of [['lake', 27, 12, 'ext_lake'], ['canyon', 27, 13, 'ext_canyon'], ['town', 11, 28, 'ext_town'], ['frostVillage', 23, 8, 'ext_frost']]) {
    await g.ev(([id, x, y]) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, orbStart: 1 }); st.lv = 20; st.map = id; st.x = x; st.y = y; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; }, [id, x, y]);
    await g.step(200); await g.shot(nm); }
};
