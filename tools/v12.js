module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.flags.license = 1; st.flags.woke = 1; st.flags.q1 = 1; st.flags.croc = 1; st.lv = 14; st.hp = 50; st.bag.fangDagger = 1; st.bag.scaleArmor = 1; st.equip.weapon = 'fangDagger'; st.equip.armor = 'scaleArmor'; st.map = 'route'; st.x = 4; st.y = 31; st.dir = 'right'; G.startOverworld(); G.Game.fade = 0; });
  await g.step(30);
  const run = async (code, n = 20) => { await g.ev(code); await g.step(n); };
  await run(() => { const ow = __game.Game.scene; ow.run(__game.summaryScreen()); }); await g.press('left', 6); await g.shot('y_quest'); await run(() => { __game.Game.scene.script = null; __game.UI.clear(); }, 2);
  await run(() => { const ow = __game.Game.scene; ow.run(__game.bagScreen('field')); }); await g.press('right', 6); await g.shot('y_bag'); await run(() => { __game.Game.scene.script = null; __game.UI.clear(); }, 2);
  await run(() => { const ow = __game.Game.scene; ow.run(__game.equipScreen()); }); await run(() => { __game.Game.scene.script = null; __game.UI.clear(); }, 2);
  await g.press('left', 4); for (let i = 0; i < 14; i++) await g.press('a', 25);
  g.log('q1res', await g.ev(() => __game.Game.st.flags.q1res));
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp: 'wolf', lv: 5, kind: 'elite' })); });
  await g.autoBattle(0, async u => { if (u.includes('掉落了')) { await g.step(10); await g.shot('y_drop'); } });
  g.log('bag', JSON.stringify(await g.ev(() => __game.Game.st.bag)));
};
