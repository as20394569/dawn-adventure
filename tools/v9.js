module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.flags.license = 1; st.flags.woke = 1; st.lv = 8; st.exp = 580; st.equip.weapon = 'ironSword'; st.status = 'psn'; st.hp = 20; st.map = 'route'; st.x = 5; st.y = 20; G.startOverworld(); G.Game.fade = 0; });
  await g.step(30);
  await g.step(30);
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp: 'wolf', lv: 3, kind: 'elite' })); });
  let shotCmd = false;
  await g.autoBattle(0, async u => {
    if (!shotCmd && u.includes('[技能/道具/防禦/逃跑]')) { shotCmd = true; await g.shot('w_cmd'); await g.press('a', 6); await g.press('down', 6); await g.shot('w_moves'); await g.press('b', 6); return 'handled'; }
    if (u.includes('升到了') && !u.includes('Menu')) { await g.step(60); await g.press('a', 8); await g.shot('w_lvup'); await g.press('a', 8); await g.shot('w_lvup2'); await g.press('a', 10); return 'handled'; }
  });
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp: 'golem', lv: 14, kind: 'boss', bg: 'ruins' })); });
  for (let w = 0; w < 80; w++) { if (await g.ev(() => __game.Game.scene.constructor.name) === 'Battle') break; await g.step(5); }
  for (let i = 0; i < 200; i++) { const u = await g.ui(); if (u.includes('技能/道具')) break; if (u.includes('TextBox')) await g.press('a', 4); else await g.step(4); }
  await g.step(10); await g.ev(() => { __game.Game.fade = 0; }); await g.shot('w_boss');
  await g.press('a', 6); await g.press('a', 30); await g.shot('w_bossatk');
};
