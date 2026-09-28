// screenshots: long skill descriptions in 技能 (tree) and 狀態→技能一覽
module.exports = async (g) => {
  for (const [cls, id] of [['shadowdancer', 'afterimage'], ['spellblade', 'enchant']]) {
    await g.ev(([cls, id]) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 30; st.map = 'town'; st.x = 12; st.y = 6; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
      applyStartClass(CLASSES[cls].from || 'swordsman'); st.cls = cls; for (const n of skillTreeOf(cls)) st.skills[n.id] = 1; st.skp = 3; const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run((function* () { yield* skillTreeScreen(); })()); }, [cls, id]);
    await g.ev(() => __game.step(6));
    const n = await g.ev((id) => skillTreeOf(Game.st.cls).findIndex(q => q.id === id) + 1, id);
    for (let i = 0; i < n % 3; i++) await g.press('right', 4); for (let i = 0; i < Math.floor(n / 3); i++) await g.press('down', 4);
    await g.ev(() => __game.step(4)); await g.shot('desc_tree_' + id);
  }
};
