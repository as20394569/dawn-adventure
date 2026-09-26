module.exports = async (g) => {
  await g.step(200); await g.shot('h_title');
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.flags.license = 1; st.flags.woke = 1; st.lv = 8; st.equip.weapon = 'woodSword'; st.bag.woodSword = 1; st.hp = G.heroStats().hp; st.map = 'town'; st.x = 8; st.y = 8; G.startOverworld(); G.Game.fade = 0; });
  await g.step(10); await g.shot('h_town');
  await g.hold('left', 20); await g.shot('h_town_l');
  await g.hold('up', 10); await g.shot('h_town_u');
  await g.press('start', 10); await g.shot('h_menu');
  await g.ev(() => { __game.UI.clear(); });
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp: 'slime', lv: 5, kind: 'wild' })); });
  for (let w = 0; w < 80; w++) { if (await g.ev(() => __game.Game.scene.constructor.name) === 'Battle') break; await g.step(5); }
  for (let i = 0; i < 200; i++) { const u = await g.ui(); if (u.includes('技能/道具')) break; if (u.includes('TextBox')) await g.press('a', 4); else await g.step(4); }
  await g.step(20); await g.shot('h_battle');
};
