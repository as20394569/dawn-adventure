// weapon sprites: battle hero, loot showcase, equipment pick list
module.exports = async (g) => {
  const W = (process.env.WPN || 'moldBlade,harvestScythe,starStaff,lichTome,cometDagger,grenAxe').split(',');
  for (const k of W) {
    await g.ev((k) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 30; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman');
      const gg = makeGear(k, 3); st.equip.weapon = gg.u; st.hp = heroStats().hp; const ow = G.Game.scene; ow.script = null; G.UI.clear();
      Battle.prototype.foeChoose = function () { return { type: 'move', id: this.F.moves[0].id }; };
      ow.run(ow.battleScript({ sp: 'slime', lv: 3, kind: 'wild' })); }, k);
    for (let i = 0; i < 60; i++) { const u = await g.ui(); if (u.includes('技能/道具')) break; await g.ev(() => { const G = __game; if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 4); else G.step(6); }); }
    await g.shot('wpn_b_' + k);
    await g.ev((k) => { const G = __game, b = G.Game.scene; G.UI.clear(); b.script = (function* () { const gg = makeGear(k, 4); yield* b.lootShow(gg); })(); }, k);
    for (let i = 0; i < 20; i++) await g.ev(() => __game.step(2)); await g.shot('wpn_l_' + k);
  }
};
