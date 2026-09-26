module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.flags.license = 1; st.flags.woke = 1; st.lv = 13; st.exp = Math.floor(0.8 * 13 ** 3); st.equip.weapon = 'woodSword'; st.moves = [{ id: 'leafBlade', pp: 20 }, { id: 'aquaBlade', pp: 25 }, { id: 'thunder', pp: 20 }, { id: 'focus', pp: 20 }]; st.hp = G.heroStats().hp; st.map = 'ruins'; st.x = 7; st.y = 8; st.dir = 'up'; st.time = 60 * 60 * 41; st.wins = 21; G.startOverworld(); G.Game.fade = 0; });
  await g.step(10); await g.shot('z_ruins'); await g.hold('up', 20);
  for (let i = 0; i < 20; i++) { const u = await g.ui(); if (u.includes('異界之人')) { await g.step(20); await g.shot('z_cut'); break; } await g.press('a', 20); }
  for (let w = 0; w < 80; w++) { if (await g.ev(() => __game.Game.scene.constructor.name) === 'Battle') break; await g.ev(() => { if (__game.UI.stack.some(x => x.lines)) __game.press('a', 2, 4); else __game.step(5); }); }
  await g.ev(() => { __game.Game.scene.F.hp = 3; __game.Game.scene.disp.F = 3; });
  await g.autoBattle(1);
  for (let i = 0; i < 60; i++) { const sc = await g.ev(() => __game.Game.scene.constructor.name); if (sc === 'EndingScene') break; const u = await g.ui(); if (u.includes('緩緩打開')) { await g.step(10); await g.shot('z_gate'); } if (u.includes('熟悉的街道')) { await g.step(20); await g.shot('z_vision'); } if (u.includes('黯淡')) { await g.step(20); await g.shot('z_vision2'); } await g.press('a', 20); }
  await g.step(200); await g.shot('z_end1'); await g.hold('a', 400); await g.shot('z_end2'); await g.hold('a', 400); await g.shot('z_end3');
  await g.press('a', 80); await g.step(60); await g.shot('z_after');
  await g.walkTo(7, 2); await g.face('up'); await g.press('a', 40); await g.shot('z_door');
  g.log(JSON.stringify((await g.state()).st));
};
