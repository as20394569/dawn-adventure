// frames of monster status / area moves reaching the hero
module.exports = async (g) => {
  for (const id of ['m_sleepPollen', 'm_lullaby', 'm_sandstorm', 'm_blizzard', 'm_screech', 'm_rumble']) {
    await g.ev((id) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 30; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); st.hp = heroStats().hp;
      window.__id = id; Battle.prototype.foeChoose = function () { return { type: 'move', id: window.__id }; }; G.Game.autoPlay = b => ({ type: 'defend' });
      const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(ow.battleScript({ sp: 'wolf', lv: 30, kind: 'wild' })); }, id);
    for (let i = 0; i < 40; i++) { if (await g.ev(() => __game.Game.scene.constructor.name) === 'Battle') break; await g.step(5); }
    await g.ev(() => { __game.Game.scene.F.stats.spe = 999; });
    let shots = 0, seen = 0;
    for (let i = 0; i < 400 && shots < 4; i++) {
      const n = await g.ev(() => { const b = __game.Game.scene; return (b.fx || []).filter(p => p.k && p.k[0] === 'm').length; });
      if (n > 0) { seen++; if (seen % 6 === 3) { await g.shot('mfx_' + id + '_' + shots); shots++; } }
      await g.ev(() => { const G = __game; if (G.UI.stack.some(x => x.lines)) G.press('a', 1, 1); else G.step(2); });
    }
  }
};
