module.exports = async (g) => {
  for (const sp of ['golem', 'crystalGolem']) {
    await g.ev(sp => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 30; st.map = 'route'; st.x = 10; st.y = 20; G.startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; st.hp = G.heroStats().hp; st.moves = [{ id: 'aquaBlade', pp: 99 }]; const ow = G.Game.scene; ow.run(ow.battleScript({ sp, lv: 14, kind: 'boss' })); }, sp);
    const seen = new Set(); for (let k = 0; k < 3; k++) await g.autoBattle(0, async u => { const m = u.match(/使用了([^！]+)！/); if (m) seen.add(m[1]); });
    g.log(sp, [...seen].join(','), await g.ev(() => __game.Game.scene.constructor.name));
  }
};
