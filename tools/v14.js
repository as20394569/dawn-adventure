module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, golem: 1, wellCharm: 1, wolf: 1 }); st.lv = 14; st.hp = 60; Object.assign(st.bag, { herb: 5, gel: 2, feather: 4, rope: 1, foxfire: 1 }); st.money = 3000; st.map = 'town'; st.x = 18; st.y = 18; st.dir = 'left'; G.startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; });
  await g.step(160);
  await g.ev(() => { const ow = __game.Game.scene; ow.run(__game.craftScreen()); }); await g.step(6); await g.press('down', 4); await g.press('down', 4); await g.shot('k_craft'); await g.press('a', 30); for (let i = 0; i < 3; i++) await g.press('a', 30);
  g.log('boots', await g.ev(() => __game.Game.st.bag.featherBoots));
  await g.ev(() => { const ow = __game.Game.scene; ow.script = null; __game.UI.clear(); ow.run(__game.Events.elder(ow)); }); for (let i = 0; i < 4; i++) await g.press('a', 30); await g.shot('k_class');
  for (let i = 0; i < 10; i++) await g.press('a', 30);
  g.log('cls', await g.ev(() => __game.Game.st.cls + ' ' + __game.Game.st.moves.map(m => m.id).join(',')));
  await g.ev(() => { const ow = __game.Game.scene; ow.script = null; __game.UI.clear(); ow.run(__game.Events.well(ow)); }); await g.step(40); await g.press('a', 10); await g.press('a', 80);
  g.log('map', JSON.stringify((await g.state()).st.map)); await g.shot('k_sewer');
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp: 'crystalGolem', lv: 18, kind: 'boss' })); });
  for (let w = 0; w < 80; w++) { if (await g.ev(() => __game.Game.scene.constructor.name) === 'Battle') break; await g.step(5); }
  for (let i = 0; i < 200; i++) { const u = await g.ui(); if (u.includes('技能/道具')) break; if (u.includes('TextBox')) await g.press('a', 4); else await g.step(4); }
  await g.ev(() => { __game.Game.fade = 0; }); await g.shot('k_boss');
};
