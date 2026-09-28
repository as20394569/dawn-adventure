// foe center vs visible body for big bosses + screenshot of a strike
module.exports = async (g) => {
  for (const sp of ['shadowGeneral', 'lavaGiant', 'hydra', 'slime']) {
    await g.ev((sp) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 30; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); st.hp = heroStats().hp;
      Battle.prototype.foeChoose = function () { return { type: 'move', id: this.F.moves[0].id }; }; G.Game.autoPlay = null;
      const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(ow.battleScript({ sp, lv: 30, kind: SPECIES[sp].boss ? 'boss' : 'wild' })); }, sp);
    for (let i = 0; i < 80; i++) { const u = await g.ui(); if (u.includes('技能/道具')) break; await g.ev(() => { const G = __game; if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 4); else G.step(6); }); }
    g.log(sp, await g.ev(() => { const b = __game.Game.scene; return JSON.stringify(b.center(b.F)) + ' bb ' + JSON.stringify(b.imgF.bb); }));
    await g.ev(() => { const b = __game.Game.scene, C = b.center(b.F); b.spawn({ k: 'ring', x: C.x, y: C.y, r0: 4, r1: 6, c: '#ff00ff', w: 2, life: 999 }); __game.step(2); });
    await g.shot('ctr_' + sp);
  }
};
