module.exports = async (g) => {
  // migration from an old-style save
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; delete st.gear; st.equip = { weapon: 'fangDagger', armor: 'scaleArmor', acc: 'moonCharm' }; Object.assign(st.bag, { fangDagger: 1, scaleArmor: 1, moonCharm: 1, ironSword: 1, boots: 1 }); Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 12; st.map = 'town'; st.x = 8; st.y = 9; G.startOverworld(); G.Game.fade = 0; });
  g.log('migrated', JSON.stringify(await g.ev(() => ({ eq: __game.Game.st.equip, n: __game.Game.st.gear.length, bag: Object.keys(__game.Game.st.bag) }))));
  await g.ev(() => { const st = __game.Game.st; for (let i = 0; i < 4; i++) { st.gid++; st.gear.push({ u: st.gid, b: ['knightHelm', 'mistBoots', 'wolfNecklace', 'oakStaff'][i], q: [2, 4, 3, 1][i], r: 0.8 + i * 0.05, a: i === 0 ? [['crit', 4]] : i === 1 ? [['vs', '火', 12], ['hp', 6]] : [] }); } });
  await g.step(100);
  await g.ev(() => { const ow = __game.Game.scene; ow.run(__game.bagScreen('field')); }); await g.step(5); await g.press('right', 5); await g.press('down', 5); await g.shot('q_bag');
  await g.ev(() => { const ow = __game.Game.scene; ow.script = null; __game.UI.clear(); ow.run(__game.equipScreen()); }); await g.step(5); await g.press('down', 4); await g.shot('q_equip'); await g.press('a', 6); await g.press('down', 4); await g.shot('q_pick'); await g.press('a', 10);
  g.log('head', JSON.stringify(await g.ev(() => __game.Game.st.equip)));
  await g.ev(() => { const ow = __game.Game.scene; ow.script = null; __game.UI.clear(); ow.run(__game.shopFlow()); }); await g.step(60); await g.press('a', 10); for (let i = 0; i < 9; i++) await g.press('down', 3); await g.shot('q_shop');
};
