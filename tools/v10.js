module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.flags.license = 1; st.flags.woke = 1; st.lv = 12; st.equip.weapon = 'ironSword'; st.map = 'ruins'; st.x = 10; st.y = 20; st.hp = 40; G.startOverworld(); G.Game.fade = 0; });
  await g.step(20);
  await g.ev(() => { const ow = __game.Game.scene; ow.map.d.battleBg = 'ruins'; ow.run(ow.battleScript({ sp: 'croc', lv: 12, kind: 'elite' })); });
  for (let w = 0; w < 80; w++) { if (await g.ev(() => __game.Game.scene.constructor.name) === 'Battle') break; await g.step(5); }
  for (let i = 0; i < 200; i++) { const u = await g.ui(); if (u.includes('技能/道具')) break; if (u.includes('TextBox')) await g.press('a', 4); else await g.step(4); }
  await g.ev(() => { __game.Game.fade = 0; }); await g.shot('r_ruins');
  await g.ev(() => { const G = __game; G.UI.clear(); G.Game.st.map = 'route'; G.Game.st.x = 5; G.Game.st.y = 20; G.startOverworld(); G.Game.fade = 0; }); await g.step(10);
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp: 'fox', lv: 8, kind: 'wild' })); });
  for (let w = 0; w < 80; w++) { if (await g.ev(() => __game.Game.scene.constructor.name) === 'Battle') break; await g.step(5); }
  for (let i = 0; i < 200; i++) { const u = await g.ui(); if (u.includes('技能/道具')) break; if (u.includes('TextBox')) await g.press('a', 4); else await g.step(4); }
  await g.ev(() => { __game.Game.fade = 0; }); await g.shot('r_meadow');
};
