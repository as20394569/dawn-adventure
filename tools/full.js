module.exports = async (g) => {
  await g.step(10); await g.press('a', 30); await g.press('a', 40);
  for (let i = 0; i < 80; i++) { const st = await g.state(); if (st.scene === 'Overworld' && st.st && st.st.flags.woke && !st.script) break; await g.press('a', 20); }
  let s = await g.state(); g.log('after wake', JSON.stringify(s.st));
  // go out: mat (4,7)
  await g.walkTo(4, 7); await g.hold('down', 40); await g.step(30);
  g.log('town?', (await g.state()).st.map);
  // try leaving -> blocked
  await g.walkTo(10, 2); await g.hold('up', 20); await g.settle(); g.log('blocked at', JSON.stringify((await g.state()).st.y));
  // elder
  await g.walkTo(15, 7); await g.hold('up', 40); await g.step(30); g.log('map', (await g.state()).st.map);
  await g.walkTo(4, 4); await g.face('up'); await g.press('a', 10);
  for (let i = 0; i < 60; i++) { const u = await g.ui(); if (i === 12) await g.shot('f_elder'); if (!u && !(await g.state()).script) break; await g.press('a', 24); }
  s = await g.state(); g.log('after elder', JSON.stringify(s.st), await g.ev(() => JSON.stringify(__game.Game.st.equip)));
  await g.walkTo(4, 7); await g.hold('down', 40); await g.step(30);
  await g.walkTo(10, 0); await g.hold('up', 40); await g.step(40); await g.shot('f_route');
  g.log('route', JSON.stringify((await g.state()).st));
  // walk into grass until a battle
  await g.walkTo(3, 38);
  let fought = false;
  for (let i = 0; i < 60 && !fought; i++) { await g.hold(i % 2 ? 'up' : 'down', 17); if (await g.ev(() => __game.Game.scene.constructor.name === 'Battle' || !!__game.Game.scene.script)) fought = true; }
  g.log('encounter', fought);
  await g.autoBattle(0);
  await g.settle(); g.log('after battle', JSON.stringify((await g.state()).st));
  await g.press('start', 10); await g.press('down', 4); await g.press('down', 4); await g.press('down', 4); await g.press('right', 4); await g.press('a', 30); await g.press('a', 60); await g.settle();
  g.log('saved', await g.ev(() => !!localStorage.getItem('dawnlight_save_v2')));
};
