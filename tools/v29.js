module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 12; st.map = 'route'; st.x = 10; st.y = 20; G.startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); st.tp = 8; });
  await g.ev(() => { const ow = __game.Game.scene; ow.run(skillTreeScreen()); }); await g.step(4); await g.shot('j_tree0');
  // learn focus (idx2), voltSlash (idx3), raise flameSlash, learn crossSlash? navigate
  await g.press('right', 4); await g.press('right', 4); await g.press('a', 6); // focus
  await g.press('down', 4); await g.press('left', 4); await g.press('left', 4); await g.press('a', 6); // voltSlash
  await g.press('up', 4); await g.press('right', 4); await g.press('a', 6); await g.press('a', 6); // flameSlash lv3
  await g.press('left', 4); await g.press('a', 6); // powerSlash lv2
  await g.step(4); await g.shot('j_tree1');
  g.log('skills', JSON.stringify(await g.ev(() => [__game.Game.st.skills, __game.Game.st.tp, __game.Game.st.mp])));
  await g.press('b', 8);
  await g.ev(() => { const ow = __game.Game.scene; ow.script = null; __game.UI.clear(); __game.Game.autoPlay = null; ow.run(ow.battleScript({ sp: 'thunderBeetle', lv: 10, kind: 'wild' })); });
  for (let i = 0; i < 30; i++) { const u = await g.ui(); if (u.includes('攻擊/技能')) break; await g.press('a', 10); }
  await g.shot('j_cmd'); await g.press('right', 4); await g.press('a', 8); await g.step(4); await g.shot('j_skills');
  await g.press('a', 8); for (let i = 0; i < 12; i++) await g.press('a', 12); await g.shot('j_after');
  g.log('mp', JSON.stringify(await g.ev(() => [__game.Game.st.mp, __game.heroStats().mp, __game.Game.scene.constructor.name])));
  await g.autoBattle('smart', async () => {}); await g.mash('a', 6, 20);
  // summary skills page
  await g.ev(() => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); G.Game.autoPlay = null; ow.run(G.summaryScreen()); }); await g.press('right', 4); await g.shot('j_summary');
};
