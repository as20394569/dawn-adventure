// class passives in 技能 and 狀態→技能
module.exports = async (g) => {
  for (const [cls, gear] of [['assassin', 'poisonEdge'], ['swordsman', null], ['monk', null]]) {
    await g.ev(([cls, gear]) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 20; st.map = 'town'; st.x = 12; st.y = 6; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
      const base = CLASSES[cls].from || (CLASSES[cls].tier === 1 ? cls : 'swordsman'); applyStartClass(base); st.cls = cls; for (const n of skillTreeOf(cls)) st.skills[n.id] = 1; st.hp = heroStats().hp; const ow = G.Game.scene; ow.script = null; G.UI.clear(); window.__sc = cls; ow.run((function* () { yield* skillTreeScreen(); })()); }, [cls, gear]);
    await g.ev(() => __game.step(10)); await g.shot('pas_tree_' + cls);
    await g.press('b', 10); await g.ev(() => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run((function* () { yield* summaryScreen(); })()); }); await g.ev(() => __game.step(6));
    await g.press('right', 8); await g.shot('pas_sum_' + cls);
    await g.press('b', 10);
  }
};
