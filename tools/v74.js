// empirical poison rate in real battles: hero physical actions vs '中毒了' messages
module.exports = async (g) => {
  for (const [cls, sp] of [['ranger', 'wolf'], ['swordsman', 'wolf'], ['ranger', 'golem'], ['assassin', 'skeleton']]) {
    await g.ev(([cls, sp]) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 40; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass(CLASSES[cls].from || (CLASSES[cls].tier === 1 ? cls : 'swordsman')); st.cls = cls; st.hp = heroStats().hp;
      window.__acts = 0; window.__psn = 0; G.Game.autoPlay = b => { window.__acts++; b.F.status = null; b.F.hp = b.F.maxhp; st.hp = b.H.hp = b.H.maxhp; return { type: 'move', id: 'attack' }; };
      Battle.prototype.foeChoose = function () { return { type: 'move', id: this.F.moves[0].id }; };
      if (!Battle.prototype.__l4) { Battle.prototype.__l4 = 1; const _m = Battle.prototype.msg; Battle.prototype.msg = function* (t, o) { if (/中毒了！$/.test(t) && !/小晨/.test(t)) window.__psn++; yield* _m.call(this, t, o); }; }
      const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(ow.battleScript({ sp, lv: 20, kind: 'wild' })); }, [cls, sp]);
    for (let i = 0; i < 3000; i++) { const a = await g.ev(() => window.__acts); if (a >= 60) break; await g.ev(() => { const G = __game; if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 3); else G.step(3); }); }
    g.log(cls, 'vs', sp, await g.ev(() => 'actions ' + window.__acts + ' poisoned ' + window.__psn + ' fam=' + SPECIES[__game.Game.scene.F.sp].fam));
  }
};
