module.exports = async (g) => {
  await g.step(20); await g.shot('v_title');
  await g.press('a', 30); await g.press('a', 40); // new game
  await g.step(30); await g.shot('v_black');
  await g.press('a', 60); await g.step(40); await g.shot('v_street');
  await g.step(100); await g.press('a', 20); await g.press('a', 20);
  for (let i = 0; i < 12; i++) { const u = await g.ui(); if (u.includes('腳下')) break; await g.step(10); }
  await g.step(30); await g.shot('v_circle');
  await g.press('a', 70); await g.shot('v_glow');
  for (let i = 0; i < 30; i++) { const sc = await g.ev(() => __game.Game.scene.constructor.name); if (sc === 'Overworld') break; await g.press('a', 20); }
  for (let i = 0; i < 10; i++) { const u = await g.ui(); if (u.includes('還好嗎')) { await g.step(20); await g.shot('v_wake0'); break; } await g.press('a', 20); }
  for (let i = 0; i < 20; i++) { const u = await g.ui(); if (u.includes('小晨/阿勇')) { await g.shot('v_name'); break; } await g.press('a', 24); }
  await g.press('a', 20); await g.press('a', 20);
  for (let i = 0; i < 12; i++) { const u = await g.ui(); if (u.includes('日本')) { await g.step(40); await g.shot('v_japan'); break; } await g.press('a', 24); }
  await g.settle(); await g.step(20); await g.shot('v_room');
  g.log(JSON.stringify((await g.state()).st));
};
