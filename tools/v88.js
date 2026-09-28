// dragoon trial: whelp beaten before the trial / broken saves / normal order
module.exports = async (g) => {
  for (const [label, flags] of [['beaten before accepting', { youngDragon: 1 }], ['old broken save', { youngDragon: 1, dragoonQ: 1 }], ['normal: accepted, not beaten', {}]]) {
    await g.ev((flags) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, golem: 1, ch2: 7 }, flags); st.map = 'emberPass'; st.x = 10; st.y = 10; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(G.Events.dragonElder(ow)); }, flags);
    for (let i = 0; i < 40; i++) { const u = await g.ui(); if (!u) break; await g.press('a', 8); }
    g.log(label, await g.ev(() => { const st = __game.Game.st; return 'dragoonQ=' + st.flags.dragoonQ + ' flame=' + (st.bag.dragonFlame || 0) + ' clsDragoon=' + (st.flags.clsDragoon || 0); }));
  }
};
