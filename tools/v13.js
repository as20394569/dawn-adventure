module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.flags.license = 1; st.flags.woke = 1; st.lv = 10; st.hp = 40; st.map = 'route'; st.x = 1; st.y = 26; st.dir = 'left'; G.startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; });
  await g.step(20); await g.hold('left', 40); await g.step(60);
  g.log('map', JSON.stringify((await g.state()).st.map), 'tp', await g.ev(() => __game.Game.st.tp));
  await g.walkTo(2, 5); await g.walkTo(2, 3); await g.walkTo(1, 2); await g.face('up'); await g.press('a', 60); await g.press('a', 30); await g.press('a', 30);
  g.log('secret', await g.ev(() => __game.Game.st.bag.dawnSword)); await g.shot('z_forest');
  await g.ev(() => { const ow = __game.Game.scene; ow.script = null; __game.UI.clear(); ow.run(__game.talentScreen()); }); await g.step(5);
  await g.press('a', 6); await g.press('a', 6); await g.press('down', 4); await g.press('down', 4); await g.press('a', 6); await g.press('right', 4); await g.shot('z_talent');
  g.log('tal', JSON.stringify(await g.ev(() => [__game.Game.st.tal, __game.Game.st.tp, __game.Game.st.moves.map(m => m.id)])));
  await g.ev(() => { const ow = __game.Game.scene; ow.script = null; __game.UI.clear(); ow.run(ow.battleScript({ sp: 'leafFox', lv: 10, kind: 'wild' })); });
  for (let w = 0; w < 80; w++) { if (await g.ev(() => __game.Game.scene.constructor.name) === 'Battle') break; await g.step(5); }
  for (let i = 0; i < 200; i++) { const u = await g.ui(); if (u.includes('技能/道具')) break; if (u.includes('TextBox')) await g.press('a', 4); else await g.step(4); }
  await g.ev(() => { __game.Game.fade = 0; }); await g.shot('z_battle');
};
